from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        ORGANIZER = "organizer", "Organizer"
        PARTICIPANT = "participant", "Participant"

    class Department(models.TextChoices):
        CSE = "CSE", "CSE"
        FMRT = "FMRT", "FMRT"
        FES = "FES", "FES"
        MGT = "MGT", "MGT"
        THM = "THM", "THM"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PARTICIPANT,
    )
    requested_role = models.CharField(
        max_length=20,
        choices=Role.choices,
        blank=True,
        null=True,
    )
    full_name = models.CharField(max_length=150, blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    batch = models.CharField(max_length=50, blank=True, default="")
    department = models.CharField(
        max_length=20,
        choices=Department.choices,
        blank=True,
        default="",
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
