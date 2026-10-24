from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "role",
            "requested_role",
            "full_name",
            "phone",
            "batch",
            "department",
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    role = serializers.CharField(required=False, default="participant")
    requested_role = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    full_name = serializers.CharField(required=False, allow_blank=True, default="")
    phone = serializers.CharField(required=False, allow_blank=True, default="")
    batch = serializers.CharField(required=False, allow_blank=True, default="")
    department = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "role",
            "requested_role",
            "full_name",
            "phone",
            "batch",
            "department",
        )

    def create(self, validated_data):
        requested = validated_data.get("requested_role") or validated_data.get("role")
        # Keep new organizer applicants as participants until Admin approves them
        actual_role = "participant" if requested == "organizer" else (validated_data.get("role") or "participant")
        req_role = "organizer" if requested == "organizer" else None

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role=actual_role,
            requested_role=req_role,
            full_name=validated_data.get("full_name", ""),
            phone=validated_data.get("phone", ""),
            batch=validated_data.get("batch", ""),
            department=validated_data.get("department", ""),
        )
        return user
