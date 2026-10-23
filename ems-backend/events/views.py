from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, Registration, Venue
from .permissions import IsOrganizerOrAdminForWrite
from .serializers import EventSerializer, RegistrationSerializer, VenueSerializer


class VenueListCreateView(generics.ListCreateAPIView):
    queryset = Venue.objects.all().order_by("name")
    serializer_class = VenueSerializer
    permission_classes = [permissions.IsAuthenticated]


class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsOrganizerOrAdminForWrite]

    def get_queryset(self):
        queryset = Event.objects.select_related("venue", "organizer").annotate(
            registered_count=Count(
                "registrations",
                filter=Q(registrations__status=Registration.Status.REGISTERED),
            )
        )
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        if category:
            queryset = queryset.filter(category__iexact=category)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(venue__name__icontains=search)
            )
        return queryset.order_by("date", "time", "title")

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.select_related("venue", "organizer").annotate(
        registered_count=Count(
            "registrations",
            filter=Q(registrations__status=Registration.Status.REGISTERED),
        )
    )
    serializer_class = EventSerializer
    permission_classes = [IsOrganizerOrAdminForWrite]


class RegistrationListCreateView(generics.ListCreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(participant=self.request.user).select_related(
            "event", "event__venue", "participant"
        ).order_by("-registered_at")

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]
        with transaction.atomic():
            event = Event.objects.select_for_update().get(pk=event.pk)
            existing = Registration.objects.filter(
                event=event, participant=self.request.user
            ).first()
            if existing and existing.status == Registration.Status.REGISTERED:
                raise ValidationError({"event": "You are already registered for this event."})
            if event.registration_deadline < timezone.localdate():
                raise ValidationError({"event": "The registration deadline has passed."})
            registered_count = Registration.objects.filter(
                event=event, status=Registration.Status.REGISTERED
            ).count()
            if registered_count >= event.capacity:
                raise ValidationError({"event": "This event is fully booked."})

            if existing:
                existing.status = Registration.Status.REGISTERED
                existing.save(update_fields=["status"])
                self._reactivated_registration = existing
            else:
                serializer.save(participant=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        registration = getattr(self, "_reactivated_registration", None)
        if registration is not None:
            serializer = self.get_serializer(registration)
        return Response(serializer.data, status=201)


class MyRegistrationListView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(
            participant=self.request.user, status=Registration.Status.REGISTERED
        ).select_related("event", "event__venue", "participant").order_by("-registered_at")


class CancelRegistrationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        registration = get_object_or_404(
            Registration,
            event_id=pk,
            participant=request.user,
            status=Registration.Status.REGISTERED,
        )
        registration.status = Registration.Status.CANCELLED
        registration.save(update_fields=["status"])
        return Response(RegistrationSerializer(registration).data)
