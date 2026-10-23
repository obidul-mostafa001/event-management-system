# EventHub Backend — Django REST API

This is the real backend for the Event Management System: authentication, database, and
business-rule enforcement, replacing the localStorage used by the frontend prototype.

## Stack
- Django + Django REST Framework
- SimpleJWT for authentication (access + refresh tokens)
- SQLite for now (zero setup) — swap to MySQL later by changing `DATABASES` in `config/settings.py`

## Setup (first time)

```bash
cd ems-backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # creates your first admin account, for /admin/ and testing >> wldt1234
python manage.py runserver
```

The API is now running at `http://127.0.0.1:8000/`.

## Every time after that

```bash
source venv/bin/activate   # or venv\Scripts\activate on Windows
python manage.py runserver
```

## Endpoints

### Auth (`/api/auth/`)
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/register/` | Anyone | Create a participant/organizer account, returns JWT tokens |
| POST | `/api/auth/login/` | Anyone | Log in with username + password, returns JWT tokens |
| POST | `/api/auth/login/refresh/` | Anyone with a refresh token | Get a new access token |
| GET | `/api/auth/me/` | Logged in | Returns your own account info |
| GET | `/api/auth/users/` | Admin only | List all users (Manage Users screen) |
| DELETE | `/api/auth/users/<id>/` | Admin only | Remove a user |

### Events (`/api/`)
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/api/venues/` | Logged in | List venues |
| POST | `/api/venues/` | Logged in | Create a venue |
| GET | `/api/events/` | Logged in | List/browse events (supports `?category=` and `?search=`) |
| POST | `/api/events/` | Organizer/Admin | Create an event — rejected if the venue is already booked at that date+time |
| GET/PUT/DELETE | `/api/events/<id>/` | Organizer (own)/Admin | View, edit, or delete a specific event |
| POST | `/api/registrations/` | Logged in | Register for an event (body: `{"event": <id>}`) — enforces capacity, deadline, no double-registration |
| POST | `/api/events/<id>/cancel/` | Logged in | Cancel your registration for that event |
| GET | `/api/registrations/mine/` | Logged in | List your own active registrations |

## Business rules enforced server-side
- A participant cannot register twice for the same event
- A participant cannot register after the registration deadline
- A participant cannot register if the event is full
- An organizer can only edit/delete their own events; admins can manage all events
- Two events cannot occupy the same venue at the same date and time
- Only admins can list/remove user accounts; the public register endpoint cannot create an admin account

Event responses include the venue name, organizer username, active registration count, and active participant list.

## Running backend tests

```bash
python manage.py test events
```

## Authenticating requests
Every protected endpoint needs the JWT access token in the header:
```
Authorization: Bearer <access_token>
```
Tokens come from the `register` or `login` response.

## React frontend
The frontend calls this API at `http://127.0.0.1:8000/api`; CORS is configured for Vite at
`http://localhost:5173` and `http://127.0.0.1:5173`.

## Admin panel
Django's built-in admin is available at `http://127.0.0.1:8000/admin/` — log in with the
superuser account you created, and you can inspect/edit all data directly (handy for demos and debugging).
