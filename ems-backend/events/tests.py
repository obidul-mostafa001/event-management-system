from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Event, Registration, Venue

User = get_user_model()


class EventApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organizer = User.objects.create_user(
            username="organizer", email="organizer@example.com", password="test-password"
        )
        self.organizer.role = User.Role.ORGANIZER
        self.organizer.save(update_fields=["role"])
        self.participant = User.objects.create_user(
            username="participant", email="participant@example.com", password="test-password"
        )
        self.other_participant = User.objects.create_user(
            username="other", email="other@example.com", password="test-password"
        )
        self.venue = Venue.objects.create(name="Main Hall", location="Campus", capacity=100)
        self.event = self.create_event(capacity=1)

    def create_event(self, **overrides):
        event_date = timezone.localdate() + timedelta(days=10)
        fields = {
            "title": "Tech Talk",
            "description": "A technical event",
            "category": "Workshop",
            "date": event_date,
            "time": "14:00",
            "venue": self.venue,
            "capacity": 25,
            "registration_deadline": event_date - timedelta(days=1),
            "organizer": self.organizer,
        }
        fields.update(overrides)
        return Event.objects.create(**fields)

    def test_participant_can_browse_but_cannot_create_event(self):
        self.client.force_authenticate(self.participant)

        response = self.client.get("/api/events/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["registered_count"], 0)

        response = self.client.post(
            "/api/events/",
            {"title": "Unauthorized", "venue": self.venue.pk},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_organizer_creates_event_and_conflicting_booking_is_rejected(self):
        self.client.force_authenticate(self.organizer)
        event_date = timezone.localdate() + timedelta(days=12)
        payload = {
            "title": "Another Talk",
            "description": "Description",
            "category": "Talk",
            "date": event_date.isoformat(),
            "time": "15:00",
            "venue": self.venue.pk,
            "capacity": 20,
            "registration_deadline": (event_date - timedelta(days=1)).isoformat(),
        }

        response = self.client.post("/api/events/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["organizer"], self.organizer.pk)

        payload["title"] = "Conflicting Talk"
        response = self.client.post("/api/events/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("venue", response.data)

    def test_registration_enforces_capacity_and_cancellation_releases_seat(self):
        self.client.force_authenticate(self.participant)
        response = self.client.post(
            "/api/registrations/", {"event": self.event.pk}, format="json"
        )
        self.assertEqual(response.status_code, 201)

        response = self.client.post(
            "/api/registrations/", {"event": self.event.pk}, format="json"
        )
        self.assertEqual(response.status_code, 400)

        self.client.force_authenticate(self.other_participant)
        response = self.client.post(
            "/api/registrations/", {"event": self.event.pk}, format="json"
        )
        self.assertEqual(response.status_code, 400)

        self.client.force_authenticate(self.participant)
        response = self.client.post(f"/api/events/{self.event.pk}/cancel/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], Registration.Status.CANCELLED)

        self.client.force_authenticate(self.other_participant)
        response = self.client.post(
            "/api/registrations/", {"event": self.event.pk}, format="json"
        )
        self.assertEqual(response.status_code, 201)

    def test_registration_deadline_is_enforced(self):
        self.event.registration_deadline = timezone.localdate() - timedelta(days=1)
        self.event.save(update_fields=["registration_deadline"])
        self.client.force_authenticate(self.participant)

        response = self.client.post(
            "/api/registrations/", {"event": self.event.pk}, format="json"
        )
        self.assertEqual(response.status_code, 400)
