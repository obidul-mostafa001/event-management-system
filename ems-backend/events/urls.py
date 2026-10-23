from django.urls import path

from .views import (
    CancelRegistrationView,
    EventDetailView,
    EventListCreateView,
    MyRegistrationListView,
    RegistrationListCreateView,
    VenueListCreateView,
)

urlpatterns = [
    path("venues/", VenueListCreateView.as_view(), name="venue-list"),
    path("events/", EventListCreateView.as_view(), name="event-list"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("events/<int:pk>/cancel/", CancelRegistrationView.as_view(), name="event-cancel"),
    path("registrations/", RegistrationListCreateView.as_view(), name="registration-list"),
    path("registrations/mine/", MyRegistrationListView.as_view(), name="my-registrations"),
]
