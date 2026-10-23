from rest_framework import permissions


class IsOrganizerOrAdminForWrite(permissions.BasePermission):
    """
    Anyone authenticated can read (list/browse events).
    Only organizers and admins can create/update/delete events.
    An organizer can only modify their own events; admins can modify any event.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role in ("organizer", "admin")

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == "admin":
            return True
        return obj.organizer_id == request.user.id
