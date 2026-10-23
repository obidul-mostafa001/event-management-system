from django.contrib import admin

from .models import Event, Registration, Venue

admin.site.register(Venue)
admin.site.register(Event)
admin.site.register(Registration)
