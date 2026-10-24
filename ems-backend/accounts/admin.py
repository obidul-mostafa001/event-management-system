from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "username",
        "full_name",
        "email",
        "phone",
        "batch",
        "department",
        "role",
        "requested_role",
        "is_staff",
    )
    list_filter = ("role", "department", "batch", "is_staff")
    search_fields = ("username", "full_name", "email", "phone", "batch")

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Student & Role Profile",
            {
                "fields": (
                    "full_name",
                    "phone",
                    "batch",
                    "department",
                    "role",
                    "requested_role",
                )
            },
        ),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            "Student & Role Profile",
            {
                "fields": (
                    "full_name",
                    "email",
                    "phone",
                    "batch",
                    "department",
                    "role",
                    "requested_role",
                )
            },
        ),
    )
