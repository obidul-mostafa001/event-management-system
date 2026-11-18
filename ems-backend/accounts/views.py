from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserRoleUpdateSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class RegisterView(generics.CreateAPIView):
    """Public signup. Anyone can create a participant or organizer account."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=201)


class MeView(APIView):
    """Returns the currently authenticated user, based on the JWT sent in the request."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserListView(generics.ListAPIView):
    """Admin-only: list all users, for the Manage Users screen."""
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != User.Role.ADMIN:
            return User.objects.none()
        return super().get_queryset()


class UserDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Admin-only: view, approve/decline organizer requests (PATCH) or remove a user."""
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        return UserRoleUpdateSerializer if self.request.method == "PATCH" else UserSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.role != User.Role.ADMIN:
            raise PermissionDenied("Only admins can manage users.")

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise ValidationError({"detail": "You cannot remove your own account."})
        instance.delete()
