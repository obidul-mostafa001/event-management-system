from django.utils import timezone
from rest_framework import serializers

from .models import Event, Registration, Venue


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ["id", "name", "location", "capacity"]


class EventSerializer(serializers.ModelSerializer):
    venue_name = serializers.CharField(source="venue.name", read_only=True)
    organizer_username = serializers.CharField(source="organizer.username", read_only=True)
    registered_count = serializers.IntegerField(read_only=True)
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "category",
            "date",
            "time",
            "venue",
            "venue_name",
            "capacity",
            "registration_deadline",
            "organizer",
            "organizer_username",
            "registered_count",
            "participants",
            "created_at",
        ]
        read_only_fields = ["organizer", "created_at"]

    def validate(self, attrs):
        venue = attrs.get("venue", getattr(self.instance, "venue", None))
        event_date = attrs.get("date", getattr(self.instance, "date", None))
        event_time = attrs.get("time", getattr(self.instance, "time", None))
        if venue and event_date and event_time:
            conflicts = Event.objects.filter(venue=venue, date=event_date, time=event_time)
            if self.instance:
                conflicts = conflicts.exclude(pk=self.instance.pk)
            if conflicts.exists():
                raise serializers.ValidationError(
                    {"venue": "This venue is already booked at that date and time."}
                )

        deadline = attrs.get(
            "registration_deadline",
            getattr(self.instance, "registration_deadline", None),
        )
        if deadline and event_date and deadline > event_date:
            raise serializers.ValidationError(
                {"registration_deadline": "The registration deadline cannot be after the event date."}
            )
        return attrs

    def get_participants(self, event):
        registrations = event.registrations.filter(
            status=Registration.Status.REGISTERED
        ).select_related("participant")
        return [
            {
                "id": registration.participant_id,
                "username": registration.participant.username,
                "email": registration.participant.email,
                "registered_at": timezone.localtime(registration.registered_at).date().isoformat(),
            }
            for registration in registrations
        ]


class RegistrationSerializer(serializers.ModelSerializer):
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all())
    participant = serializers.PrimaryKeyRelatedField(read_only=True)
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = Registration
        fields = [
            "id",
            "event",
            "event_title",
            "participant",
            "status",
            "registered_at",
        ]
        read_only_fields = ["status", "registered_at"]
