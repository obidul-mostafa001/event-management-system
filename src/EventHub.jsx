import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Plus,
  X,
  LogOut,
  LayoutGrid,
  PieChart,
  Users as UsersIcon,
  Pencil,
  Trash2,
  AlertCircle,
  Ticket,
  Bell,
  FileBarChart,
  Download,
  RefreshCw,
  Building2,
  CheckCircle2,
  Wifi,
  WifiOff,
  QrCode,
  CalendarPlus,
  ShieldCheck,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
//const API_BASE = (typeof window !== "undefined" && window.__EVENTHUB_API_URL__) || "http://127.0.0.1:8000/api";
//const API_BASE = "https://eventhub-backend.onrender.com/api";
const API_BASE = "https://event-backend-01.onrender.com/api";
const COLORS = {
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  border: "#E2E5EA",
  borderStrong: "#D0D4DC",
  text: "#151A26",
  muted: "#6B7280",
  faint: "#9CA3AF",
  primary: "#2451DB",
  primaryHover: "#1D3FB0",
  primaryTint: "#EAF0FE",
  danger: "#C0392B",
  dangerTint: "#FBEAE8",
  success: "#166A46",
  successTint: "#E7F6EE",
  warning: "#B45309",
  warningTint: "#FDF1E5",
};

const CATEGORY_COLORS = {
  Workshop: { bg: "#EAF0FE", text: "#2451DB" },
  Cultural: { bg: "#F3ECFB", text: "#7C3AED" },
  Competition: { bg: "#FDF1E5", text: "#B45309" },
  Career: { bg: "#E7F6EE", text: "#166A46" },
};

const CATEGORIES = ["Workshop", "Cultural", "Competition", "Career"];

const INITIAL_VENUES = [
  { id: 1, name: "CSE Auditorium", location: "Academic Building A, Floor 3", capacity: 120 },
  { id: 2, name: "Central Field", location: "Main Campus Lawn", capacity: 600 },
  { id: 3, name: "Computer Lab 2", location: "IT Building, Room 204", capacity: 150 },
  { id: 4, name: "Multipurpose Hall", location: "Student Center, Floor 1", capacity: 350 },
];

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "AI & Machine Learning Workshop",
    category: "Workshop",
    date: "2026-11-20",
    time: "10:00",
    venue: 1,
    venueName: "CSE Auditorium",
    capacity: 80,
    registered: 42,
    organizer: "testorganizer",
    organizerId: 2,
    deadline: "2026-11-18",
    description: "Hands-on introduction to modern AI and machine learning, from first principles to a working model.",
    participants: [
      { id: 101, username: "demo_student", email: "demo@student.edu", registered_at: "2026-10-15" },
      { id: 102, username: "nadia_cse", email: "nadia@student.edu", registered_at: "2026-10-16" },
    ],
  },
  {
    id: 2,
    title: "University Cultural Night",
    category: "Cultural",
    date: "2026-11-25",
    time: "18:00",
    venue: 2,
    venueName: "Central Field",
    capacity: 500,
    registered: 486,
    organizer: "testorganizer",
    organizerId: 2,
    deadline: "2026-11-24",
    description: "A night of music, dance, and drama celebrating the university's cultural societies.",
    participants: [
      { id: 101, username: "demo_student", email: "demo@student.edu", registered_at: "2026-10-18" },
    ],
  },
  {
    id: 3,
    title: "Inter-University Programming Contest",
    category: "Competition",
    date: "2026-12-03",
    time: "09:00",
    venue: 3,
    venueName: "Computer Lab 2",
    capacity: 120,
    registered: 120,
    organizer: "testorganizer",
    organizerId: 2,
    deadline: "2026-11-30",
    description: "Competitive programming contest for university students, ICPC-style rules.",
    participants: [],
  },
  {
    id: 4,
    title: "Career & Internship Fair",
    category: "Career",
    date: "2026-12-10",
    time: "11:00",
    venue: 4,
    venueName: "Multipurpose Hall",
    capacity: 300,
    registered: 185,
    organizer: "tahsin",
    organizerId: 1,
    deadline: "2026-12-08",
    description: "Meet recruiters from 20+ companies and explore internship opportunities.",
    participants: [],
  },
];

const INITIAL_USERS = [
  { id: 1, username: "tahsin", email: "obidulmostafa9@gmail.com", role: "admin", date_joined: "2026-10-20" },
  { id: 2, username: "testorganizer", email: "testorg@student.edu", role: "organizer", date_joined: "2026-10-21" },
  { id: 3, username: "demo_student", email: "demo@student.edu", role: "participant", date_joined: "2026-10-22" },
  { id: 4, username: "robotics_club", email: "robotics@student.edu", role: "pending_organizer", date_joined: "2026-10-23" },
];

const AUTH_STORAGE_KEY = "eventhub_jwt_session";
const PENDING_ORG_STORAGE_KEY = "eventhub_pending_organizers";
const APPROVED_ORG_STORAGE_KEY = "eventhub_approved_organizers";

function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function loadStringList(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStringList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

function formatApiError(data, fallback = "Request failed. Please check your input and try again.") {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors.join(" ");
  }
  const messages = [];
  for (const [key, val] of Object.entries(data)) {
    const text = Array.isArray(val) ? val.join(" ") : typeof val === "object" ? JSON.stringify(val) : String(val);
    messages.push(key === "non_field_errors" ? text : `${key}: ${text}`);
  }
  return messages.length ? messages.join(" | ") : fallback;
}

// Open event directly in Google Calendar in a new browser tab (never triggers desktop Outlook)
function openGoogleCalendar(event) {
  const cleanDate = String(event.date || "2026-11-20").replace(/-/g, "");
  const timeParts = String(event.time || "10:00").split(":");
  const hh = String(timeParts[0] || "10").padStart(2, "0");
  const mm = String(timeParts[1] || "00").slice(0, 2).padStart(2, "0");
  const startHourNum = parseInt(hh, 10);
  const endHh = String(Math.min(23, startHourNum + 2)).padStart(2, "0");

  const dtStart = `${cleanDate}T${hh}${mm}00`;
  const dtEnd = `${cleanDate}T${endHh}${mm}00`;
  const details = `${event.description || ""}\n\nCategory: ${event.category || ""}\nOrganizer: ${event.organizer || ""}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "EventHub Event",
    dates: `${dtStart}/${dtEnd}`,
    details,
    location: event.venueName || "",
  });

  const gcalUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
  window.open(gcalUrl, "_blank", "noopener,noreferrer");
}

// Deterministic SVG QR matrix generator for digital event passes
function generateQrMatrix(payload, size = 21) {
  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (r0, c0) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
          reserved[rr][cc] = true;
          const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6);
          const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[rr][cc] = inOuter || inInner;
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  let hash = 2166136261;
  const str = String(payload || "EVENTHUB");
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let seed = hash >>> 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c]) {
        const charCode = str.charCodeAt((r * size + c) % str.length);
        seed = (Math.imul(seed ^ charCode, 1664525) + 1013904223) >>> 0;
        grid[r][c] = ((seed >>> ((r + c) % 16)) & 1) === 1;
      }
    }
  }
  return grid;
}

function QrCodeSvg({ value, pixelSize = 168 }) {
  const size = 21;
  const matrix = useMemo(() => generateQrMatrix(value, size), [value]);
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox={`0 0 ${size + 4} ${size + 4}`}
      style={{ background: "#FFFFFF", borderRadius: 8, border: `1px solid ${COLORS.border}`, display: "block" }}
    >
      <rect width={size + 4} height={size + 4} fill="#FFFFFF" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? <rect key={`${r}-${c}`} x={c + 2} y={r + 2} width={1} height={1} fill="#151A26" /> : null
        )
      )}
    </svg>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 6,
  color: COLORS.text,
  fontFamily: FONT,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label
        style={{
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 500,
          color: COLORS.muted,
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", onClick, type = "button", style = {}, disabled }) {
  const base = {
    fontFamily: FONT,
    fontSize: 13.5,
    fontWeight: 500,
    padding: "9px 14px",
    borderRadius: 6,
    cursor: disabled ? "default" : "pointer",
    border: "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "background 0.12s",
  };
  const variants = {
    primary: { background: disabled ? "#B7C4EE" : COLORS.primary, color: "#fff" },
    secondary: { background: COLORS.surface, color: COLORS.text, borderColor: COLORS.border },
    danger: { background: COLORS.surface, color: COLORS.danger, borderColor: COLORS.dangerTint },
    success: { background: COLORS.successTint, color: COLORS.success, borderColor: "#B7E4C7" },
    ghost: { background: "transparent", color: COLORS.muted },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...(variants[variant] || variants.primary), ...style }}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, width = 540 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(21,26,38,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface,
          borderRadius: 10,
          width: `min(${width}px, 100%)`,
          maxHeight: "88vh",
          overflow: "auto",
          padding: 24,
          boxShadow: "0 20px 60px rgba(21,26,38,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontFamily: FONT, fontSize: 17, color: COLORS.text, margin: 0, fontWeight: 600 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.faint, padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        background: COLORS.dangerTint,
        borderRadius: 6,
        padding: "10px 12px",
        marginBottom: 14,
        color: "#8A2E22",
        fontSize: 13,
        fontFamily: FONT,
        lineHeight: 1.4,
      }}
    >
      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> <span>{message}</span>
    </div>
  );
}

function CategoryChip({ category }) {
  const c = CATEGORY_COLORS[category] || { bg: "#F0F0F0", text: "#555" };
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: c.text,
        background: c.bg,
        padding: "3px 9px",
        borderRadius: 5,
      }}
    >
      {category}
    </span>
  );
}

function TicketModal({ event, user, onClose, onExportCalendar }) {
  if (!event || !user) return null;
  const ticketCode = `EH-${String(event.id).padStart(3, "0")}-${String(user.id || 1).padStart(3, "0")}-${String(
    user.username || "USER"
  )
    .slice(0, 4)
    .toUpperCase()}`;
  const qrPayload = `EVENTHUB|TICKET:${ticketCode}|EVENT:${event.title}|DATE:${event.date}|TIME:${event.time}|VENUE:${event.venueName}|USER:${user.username}`;

  function handleDownloadTicketSvg() {
    const svgEl = document.getElementById("eventhub-qr-pass-svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticketCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal title="Digital Event Pass (QR Ticket)" onClose={onClose} width={440}>
      <div
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          overflow: "hidden",
          background: COLORS.bg,
        }}
      >
        <div
          style={{
            background: COLORS.primary,
            color: "#FFFFFF",
            padding: "16px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 11, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.6 }}>
              EventHub Verified Entry Pass
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{event.title}</div>
          </div>
          <Ticket size={22} color="#FFFFFF" />
        </div>

        <div
          style={{
            padding: 20,
            background: COLORS.surface,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: `1px dashed ${COLORS.borderStrong}`,
          }}
        >
          <div id="eventhub-qr-pass-wrapper">
            <svg
              id="eventhub-qr-pass-svg"
              width={176}
              height={176}
              viewBox="0 0 25 25"
              style={{
                background: "#FFFFFF",
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                display: "block",
              }}
            >
              <rect width={25} height={25} fill="#FFFFFF" />
              {generateQrMatrix(qrPayload, 21).map((row, r) =>
                row.map((cell, c) =>
                  cell ? <rect key={`${r}-${c}`} x={c + 2} y={r + 2} width={1} height={1} fill="#151A26" /> : null
                )
              )}
            </svg>
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: "monospace",
              fontSize: 13.5,
              fontWeight: 700,
              color: COLORS.text,
              background: COLORS.primaryTint,
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            {ticketCode}
          </div>
          <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 4 }}>
            Present this QR code at the venue entrance
          </div>
        </div>

        <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5 }}>
          <div>
            <div style={{ color: COLORS.muted }}>Participant</div>
            <div style={{ fontWeight: 600, color: COLORS.text }}>{user.username}</div>
          </div>
          <div>
            <div style={{ color: COLORS.muted }}>Category</div>
            <div style={{ fontWeight: 600, color: COLORS.text }}>{event.category}</div>
          </div>
          <div>
            <div style={{ color: COLORS.muted }}>Date & Time</div>
            <div style={{ fontWeight: 600, color: COLORS.text }}>
              {event.date} &middot; {event.time}
            </div>
          </div>
          <div>
            <div style={{ color: COLORS.muted }}>Venue</div>
            <div style={{ fontWeight: 600, color: COLORS.text }}>{event.venueName}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Button variant="primary" style={{ flex: 1 }} onClick={handleDownloadTicketSvg}>
          <Download size={14} /> Save QR (.svg)
        </Button>
        <Button variant="secondary" style={{ flex: 1 }} onClick={() => onExportCalendar(event)}>
          <CalendarPlus size={14} /> Add to Google Calendar
        </Button>
      </div>
    </Modal>
  );
}

function EventCard({
  event,
  role,
  isRegistered,
  onRegister,
  onCancel,
  onView,
  onEdit,
  onDelete,
  onShowQr,
  onExportCalendar,
  canManage,
  busyEventId,
}) {
  const full = event.registered >= event.capacity;
  const todayStr = new Date().toISOString().slice(0, 10);
  const pastDeadline = Boolean(event.deadline && event.deadline < todayStr);
  const pctFull = event.capacity > 0 ? Math.min(100, Math.round((event.registered / event.capacity) * 100)) : 0;
  const isBusy = busyEventId === event.id;

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        padding: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <CategoryChip category={event.category} />
        <span style={{ fontSize: 12.5, color: full ? COLORS.danger : COLORS.muted, fontWeight: 500 }}>
          {event.registered}/{event.capacity} registered
        </span>
      </div>

      <h3
        style={{
          fontFamily: FONT,
          fontSize: 16.5,
          fontWeight: 600,
          color: COLORS.text,
          margin: "0 0 6px",
          lineHeight: 1.3,
        }}
      >
        {event.title}
      </h3>
      <p style={{ fontFamily: FONT, fontSize: 13, color: COLORS.muted, lineHeight: 1.5, margin: "0 0 14px", flex: 1 }}>
        {event.description}
      </p>

      <div style={{ fontSize: 13, color: COLORS.text, display: "grid", gap: 6, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Calendar size={14} color={COLORS.faint} /> {event.date} &middot; {event.time}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <MapPin size={14} color={COLORS.faint} /> {event.venueName}
        </div>
        <div style={{ fontSize: 12, color: COLORS.muted }}>
          Deadline: {event.deadline || "Open"} &middot; By {event.organizer}
        </div>
      </div>

      <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ width: `${pctFull}%`, height: "100%", background: full ? COLORS.danger : COLORS.primary }} />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {role === "participant" &&
          (isRegistered ? (
            <>
              <div style={{ display: "flex", gap: 6 }}>
                <Button variant="primary" style={{ flex: 1, padding: "8px 10px", fontSize: 12.5 }} onClick={() => onShowQr(event)}>
                  <QrCode size={14} /> QR Ticket
                </Button>
                <Button
                  variant="secondary"
                  style={{ flex: 1, padding: "8px 10px", fontSize: 12.5 }}
                  onClick={() => onExportCalendar(event)}
                >
                  <CalendarPlus size={14} /> Calendar
                </Button>
              </div>
              <Button variant="danger" disabled={isBusy} onClick={() => onCancel(event.id)}>
                {isBusy ? "Updating..." : "Cancel registration"}
              </Button>
            </>
          ) : (
            <Button variant="primary" disabled={full || pastDeadline || isBusy} onClick={() => onRegister(event.id)}>
              {isBusy
                ? "Registering..."
                : full
                ? "Fully booked"
                : pastDeadline
                ? "Registration closed"
                : "Register"}
            </Button>
          ))}
        <div style={{ display: "flex", gap: 6 }}>
          <Button variant="secondary" style={{ flex: 1 }} onClick={() => onView(event)}>
            View details
          </Button>
          {(!isRegistered || role !== "participant") && (
            <Button
              variant="secondary"
              title="Add to Google Calendar"
              onClick={() => onExportCalendar(event)}
              style={{ padding: "9px 11px" }}
            >
              <CalendarPlus size={14} />
            </Button>
          )}
        </div>
        {role !== "participant" && canManage && (
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" style={{ flex: 1 }} onClick={() => onEdit(event)}>
              <Pencil size={13} /> Edit
            </Button>
            <Button variant="danger" style={{ flex: 1 }} onClick={() => onDelete(event.id)}>
              <Trash2 size={13} /> Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext }) {
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, marginTop: 4, color: COLORS.text }}>{value}</div>
      {subtext && <div style={{ color: COLORS.faint, fontSize: 12, marginTop: 4 }}>{subtext}</div>}
    </div>
  );
}

function EventTable({ events, onSelectEvent, onShowQr, onExportCalendar }) {
  if (!events.length) {
    return <div style={{ padding: 30, textAlign: "center", color: COLORS.faint, fontSize: 13.5 }}>No events yet.</div>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Event</th>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Category</th>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Date & Time</th>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Venue</th>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Filled</th>
            {(onSelectEvent || onShowQr || onExportCalendar) && (
              <th style={{ padding: "9px 8px", fontWeight: 500, textAlign: "right" }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: "10px 8px", color: COLORS.text, fontWeight: 500 }}>{e.title}</td>
              <td style={{ padding: "10px 8px" }}>
                <CategoryChip category={e.category} />
              </td>
              <td style={{ padding: "10px 8px", color: COLORS.muted }}>
                {e.date} &middot; {e.time}
              </td>
              <td style={{ padding: "10px 8px", color: COLORS.muted }}>{e.venueName}</td>
              <td style={{ padding: "10px 8px", color: COLORS.text }}>
                {e.registered}/{e.capacity}
              </td>
              {(onSelectEvent || onShowQr || onExportCalendar) && (
                <td style={{ padding: "10px 8px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {onShowQr && (
                      <Button
                        variant="primary"
                        onClick={() => onShowQr(e)}
                        style={{ padding: "5px 9px", fontSize: 12 }}
                      >
                        <QrCode size={12} /> QR Ticket
                      </Button>
                    )}
                    {onExportCalendar && (
                      <Button
                        variant="secondary"
                        onClick={() => onExportCalendar(e)}
                        style={{ padding: "5px 9px", fontSize: 12 }}
                      >
                        <CalendarPlus size={12} /> Google Calendar
                      </Button>
                    )}
                    {onSelectEvent && (
                      <Button
                        variant="secondary"
                        onClick={() => onSelectEvent(e)}
                        style={{ padding: "5px 10px", fontSize: 12 }}
                      >
                        Participants
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersPanel({ users, currentUserId, onDelete, onApproveOrganizer, onRejectOrganizer, onChangeRole }) {
  const pendingUsers = users.filter((u) => u.role === "pending_organizer" || u.organizerPending);

  return (
    <div>
      <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, marginBottom: 18, color: COLORS.text }}>
        Manage users & organizer approvals
      </h1>

      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${pendingUsers.length ? "#F59E0B" : COLORS.border}`,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color={COLORS.warning} />
            <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: 0, color: COLORS.text }}>
              Pending organizer requests ({pendingUsers.length})
            </h2>
          </div>
          <span style={{ fontSize: 12, color: COLORS.muted }}>
            Users who requested organizer access during signup or from their profile
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div style={{ padding: "14px 8px", color: COLORS.faint, fontSize: 13 }}>
            No pending organizer requests right now.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Username</th>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Email</th>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "9px 8px", textAlign: "right" }}>Decision</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "10px 8px", fontWeight: 600, color: COLORS.text }}>{u.username || u.name}</td>
                  <td style={{ padding: "10px 8px", color: COLORS.muted }}>{u.email}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: COLORS.warning,
                        background: COLORS.warningTint,
                        padding: "3px 9px",
                        borderRadius: 5,
                      }}
                    >
                      Awaiting approval
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <Button
                        variant="success"
                        onClick={() => onApproveOrganizer(u)}
                        style={{ padding: "5px 10px", fontSize: 12.5 }}
                      >
                        <UserCheck size={13} /> Approve as Organizer
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => onRejectOrganizer(u)}
                        style={{ padding: "5px 10px", fontSize: 12.5 }}
                      >
                        <UserX size={13} /> Decline
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
        <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
          All registered accounts ({users.length})
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ padding: "9px 8px", fontWeight: 500 }}>Username</th>
              <th style={{ padding: "9px 8px", fontWeight: 500 }}>Email</th>
              <th style={{ padding: "9px 8px", fontWeight: 500 }}>Current Role</th>
              <th style={{ padding: "9px 8px", textAlign: "right" }}>Manage</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isPending = u.role === "pending_organizer" || u.organizerPending;
              return (
                <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "10px 8px", fontWeight: 500, color: COLORS.text }}>
                    {u.username || u.name}
                  </td>
                  <td style={{ padding: "10px 8px", color: COLORS.muted }}>{u.email}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: isPending
                          ? COLORS.warning
                          : u.role === "organizer"
                          ? COLORS.success
                          : COLORS.primary,
                        background: isPending
                          ? COLORS.warningTint
                          : u.role === "organizer"
                          ? COLORS.successTint
                          : COLORS.primaryTint,
                        padding: "3px 9px",
                        borderRadius: 5,
                        textTransform: "capitalize",
                      }}
                    >
                      {isPending ? "Pending Organizer" : u.role}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      {u.role !== "admin" && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            onChangeRole(u, u.role === "organizer" ? "participant" : "organizer")
                          }
                          style={{ padding: "5px 10px", fontSize: 12 }}
                        >
                          {u.role === "organizer" ? "Revoke Organizer" : "Make Organizer"}
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        disabled={u.id === currentUserId}
                        onClick={() => onDelete(u.id)}
                        style={{ padding: "5px 10px", fontSize: 12.5 }}
                      >
                        <Trash2 size={12} /> {u.id === currentUserId ? "Current user" : "Remove"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: COLORS.faint }}>No users found.</div>
        )}
      </div>
    </div>
  );
}

function VenuesPanel({ venues, role, onCreateVenue }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await onCreateVenue({
      name: name.trim(),
      location: location.trim(),
      capacity: Number(capacity),
    });
    setSaving(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setName("");
      setLocation("");
      setCapacity(100);
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, marginBottom: 18, color: COLORS.text }}>
        Venues
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: role !== "participant" ? "minmax(260px, 340px) 1fr" : "1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        {role !== "participant" && (
          <form
            onSubmit={handleSubmit}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}
          >
            <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
              Add venue
            </h2>
            <ErrorBanner message={error} />
            <Field label="Venue name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Engineering Auditorium"
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Location">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Block B, 2nd Floor"
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Capacity">
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                style={inputStyle}
              />
            </Field>
            <Button type="submit" variant="primary" disabled={saving} style={{ width: "100%" }}>
              <Plus size={14} /> {saving ? "Saving..." : "Create venue"}
            </Button>
          </form>
        )}

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
          <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
            Available venues ({venues.length})
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Venue</th>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Location</th>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Max capacity</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "10px 8px", fontWeight: 500, color: COLORS.text }}>{v.name}</td>
                  <td style={{ padding: "10px 8px", color: COLORS.muted }}>{v.location}</td>
                  <td style={{ padding: "10px 8px", color: COLORS.text }}>{v.capacity} seats</td>
                </tr>
              ))}
            </tbody>
          </table>
          {venues.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: COLORS.faint }}>No venues created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportsPanel({ events, venues, onExportCsv }) {
  const totalCapacity = events.reduce((acc, e) => acc + (Number(e.capacity) || 0), 0);
  const totalRegistered = events.reduce((acc, e) => acc + (Number(e.registered) || 0), 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;

  const byCategory = CATEGORIES.map((cat) => {
    const list = events.filter((e) => e.category === cat);
    const reg = list.reduce((a, e) => a + e.registered, 0);
    const cap = list.reduce((a, e) => a + e.capacity, 0);
    return {
      category: cat,
      count: list.length,
      registered: reg,
      capacity: cap,
      rate: cap > 0 ? Math.round((reg / cap) * 100) : 0,
    };
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, margin: 0, color: COLORS.text }}>
          System reports & analytics
        </h1>
        <Button variant="secondary" onClick={onExportCsv}>
          <Download size={14} /> Export CSV report
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatCard label="Total events" value={events.length} subtext={`${venues.length} total venues`} />
        <StatCard label="Total registrations" value={totalRegistered} subtext={`Across ${totalCapacity} total seats`} />
        <StatCard label="Seat utilization" value={`${avgUtilization}%`} subtext="Average fill rate" />
        <StatCard
          label="Full events"
          value={events.filter((e) => e.registered >= e.capacity).length}
          subtext="Reached 100% capacity"
        />
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
        <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
          Breakdown by category
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ padding: "9px 8px", fontWeight: 500 }}>Category</th>
              <th style={{ padding: "9px 8px", fontWeight: 500 }}>Events</th>
              <th style={{ padding: "9px 8px", fontWeight: 500 }}>Registrations</th>
              <th style={{ padding: "9px 8px", fontWeight: 500 }}>Capacity</th>
              <th style={{ padding: "9px 8px", fontWeight: 500 }}>Fill rate</th>
            </tr>
          </thead>
          <tbody>
            {byCategory.map((row) => (
              <tr key={row.category} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "10px 8px" }}>
                  <CategoryChip category={row.category} />
                </td>
                <td style={{ padding: "10px 8px", color: COLORS.text }}>{row.count}</td>
                <td style={{ padding: "10px 8px", color: COLORS.text }}>{row.registered}</td>
                <td style={{ padding: "10px 8px", color: COLORS.muted }}>{row.capacity}</td>
                <td style={{ padding: "10px 8px", color: COLORS.text, fontWeight: 500 }}>{row.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Dashboard({
  user,
  role,
  events,
  myEventIds,
  pendingCount,
  isPendingOrganizer,
  onRequestOrganizer,
  onOpenUsersTab,
  onSelectEvent,
  onShowQr,
  onExportCalendar,
}) {
  if (role === "admin") {
    const totalRegistrations = events.reduce((sum, e) => sum + (Number(e.registered) || 0), 0);
    return (
      <div>
        <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, marginBottom: 18, color: COLORS.text }}>
          Admin dashboard
        </h1>
        {pendingCount > 0 && (
          <div
            style={{
              background: COLORS.warningTint,
              border: "1px solid #F59E0B",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: COLORS.text }}>
              <Clock size={17} color={COLORS.warning} />
              <span>
                <strong>{pendingCount} organizer application(s)</strong> waiting for your approval.
              </span>
            </div>
            <Button variant="primary" onClick={onOpenUsersTab} style={{ padding: "7px 12px", fontSize: 12.5 }}>
              Review requests
            </Button>
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <StatCard label="Total events" value={events.length} />
          <StatCard label="Total registrations" value={totalRegistrations} />
          <StatCard label="Pending organizers" value={pendingCount} />
          <StatCard label="Venues in use" value={new Set(events.map((e) => e.venueName)).size} />
        </div>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
          <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
            All events
          </h2>
          <EventTable events={events} onSelectEvent={onSelectEvent} onExportCalendar={onExportCalendar} />
        </div>
      </div>
    );
  }
  if (role === "organizer") {
    const mine = events.filter(
      (e) =>
        e.organizerId === user?.id ||
        e.organizer === user?.username ||
        (user?.username === "testorganizer" && e.organizer === "Tech Club")
    );
    return (
      <div>
        <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, marginBottom: 18, color: COLORS.text }}>
          Organizer dashboard
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <StatCard label="My events" value={mine.length} />
          <StatCard label="Total participants" value={mine.reduce((a, e) => a + e.registered, 0)} />
          <StatCard label="At capacity" value={mine.filter((e) => e.registered >= e.capacity).length} />
        </div>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
          <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
            My events
          </h2>
          <EventTable events={mine} onSelectEvent={onSelectEvent} onExportCalendar={onExportCalendar} />
        </div>
      </div>
    );
  }
  const myEvents = events.filter((e) => myEventIds.includes(e.id));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, margin: 0, color: COLORS.text }}>
          My dashboard
        </h1>
        {!isPendingOrganizer && (
          <Button variant="secondary" onClick={onRequestOrganizer}>
            <ShieldCheck size={15} /> Apply to become an Organizer
          </Button>
        )}
      </div>

      {isPendingOrganizer && (
        <div
          style={{
            background: COLORS.warningTint,
            border: "1px solid #F59E0B",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: COLORS.text,
          }}
        >
          <Clock size={16} color={COLORS.warning} />
          <span>
            <strong>Organizer request pending:</strong> Your request to create and manage events is waiting for Admin
            approval. Once approved, your account will unlock the Organizer dashboard and event creation tools.
          </span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatCard label="Registered events" value={myEvents.length} />
        <StatCard label="Digital QR tickets" value={myEvents.length} />
      </div>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
        <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
          My registrations & digital passes
        </h2>
        <EventTable events={myEvents} onShowQr={onShowQr} onExportCalendar={onExportCalendar} />
      </div>
    </div>
  );
}

function Sidebar({ user, role, isPendingOrganizer, pendingCount, page, setPage, onLogout, apiConnected }) {
  const navItems = [
    { key: "home", label: "Events", icon: LayoutGrid },
    { key: "dashboard", label: "Dashboard", icon: PieChart },
    { key: "venues", label: "Venues", icon: Building2 },
  ];
  if (role !== "participant") {
    navItems.push({ key: "reports", label: "Reports", icon: FileBarChart });
  }
  if (role === "admin") {
    navItems.push({ key: "users", label: "Users", icon: UsersIcon, badge: pendingCount });
  }

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: COLORS.surface,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px", marginBottom: 26 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: COLORS.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ticket size={15} color="#fff" />
        </div>
        <span style={{ fontFamily: FONT, fontSize: 15.5, fontWeight: 700, color: COLORS.text }}>EventHub</span>
      </div>

      <div style={{ display: "grid", gap: 2, flex: 1, alignContent: "start" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 10px",
                borderRadius: 7,
                border: "none",
                background: active ? COLORS.primaryTint : "transparent",
                color: active ? COLORS.primary : COLORS.muted,
                fontFamily: FONT,
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={16} /> {item.label}
              </span>
              {item.badge > 0 && (
                <span
                  style={{
                    background: COLORS.warning,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 14, display: "grid", gap: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 8px",
            borderRadius: 6,
            background: apiConnected ? COLORS.successTint : COLORS.warningTint,
            color: apiConnected ? COLORS.success : COLORS.warning,
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          {apiConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {apiConnected ? "Django API Connected" : "Local Demo Mode"}
        </div>

        <div style={{ padding: "0 8px" }}>
          <div style={{ fontSize: 12, color: COLORS.faint }}>Signed in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 1 }}>
            {user?.username || "User"}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: isPendingOrganizer ? COLORS.warning : COLORS.muted,
              textTransform: "capitalize",
              fontWeight: isPendingOrganizer ? 600 : 400,
            }}
          >
            {isPendingOrganizer ? "Participant (Organizer Pending)" : role}
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 10px",
            borderRadius: 7,
            border: "none",
            background: "transparent",
            color: COLORS.muted,
            fontFamily: FONT,
            fontSize: 13.5,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  );
}

export default function EventHub() {
  const savedSession = loadSession();
  const [token, setToken] = useState(savedSession?.access ?? null);
  const [user, setUser] = useState(savedSession?.user ?? null);
  const [apiConnected, setApiConnected] = useState(savedSession?.apiConnected ?? true);

  const [pendingOrganizers, setPendingOrganizers] = useState(() =>
    loadStringList(PENDING_ORG_STORAGE_KEY, ["robotics_club"])
  );
  const [approvedOrganizers, setApprovedOrganizers] = useState(() =>
    loadStringList(APPROVED_ORG_STORAGE_KEY, ["testorganizer"])
  );

  const [authTab, setAuthTab] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [page, setPage] = useState("home");
  const [venues, setVenues] = useState(INITIAL_VENUES);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [myEventIds, setMyEventIds] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to EventHub! Browse and register for upcoming campus events.", time: "Just now" },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [viewingEvent, setViewingEvent] = useState(null);
  const [qrTicketEvent, setQrTicketEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);
  const [busyEventId, setBusyEventId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const resolveEffectiveRole = useCallback(
    (u) => {
      if (!u) return "participant";
      if (u.role === "admin" || u.is_superuser || u.username === "tahsin") return "admin";
      if (approvedOrganizers.includes(u.username)) return "organizer";
      if (u.role === "pending_organizer" || pendingOrganizers.includes(u.username)) return "participant";
      return u.role || "participant";
    },
    [approvedOrganizers, pendingOrganizers]
  );

  const role = resolveEffectiveRole(user);
  const isPendingOrganizer = Boolean(
    user &&
      role === "participant" &&
      (user.role === "pending_organizer" || pendingOrganizers.includes(user.username))
  );

  const enrichedUsers = useMemo(() => {
    return users.map((u) => {
      const isPending =
        (u.role === "pending_organizer" || pendingOrganizers.includes(u.username)) &&
        !approvedOrganizers.includes(u.username) &&
        u.role !== "admin";
      const isApprovedOrg = approvedOrganizers.includes(u.username) || (u.role === "organizer" && !isPending);
      return {
        ...u,
        role: u.role === "admin" ? "admin" : isPending ? "pending_organizer" : isApprovedOrg ? "organizer" : "participant",
        organizerPending: isPending,
      };
    });
  }, [users, pendingOrganizers, approvedOrganizers]);

  const pendingCount = useMemo(
    () => enrichedUsers.filter((u) => u.role === "pending_organizer" || u.organizerPending).length,
    [enrichedUsers]
  );

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const pushNotification = useCallback((text) => {
    setNotifications((prev) => [
      { id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ...prev,
    ]);
  }, []);

  const apiFetch = useCallback(
    async (path, options = {}, overrideToken = null) => {
      const activeToken = overrideToken || token;
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };
      if (activeToken) {
        headers.Authorization = `Bearer ${activeToken}`;
      }
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });
      let data = null;
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
      if (!res.ok) {
        const err = new Error(formatApiError(data, `HTTP ${res.status}`));
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    },
    [token]
  );

  const normalizeEvent = useCallback((raw, venueList) => {
    const vList = venueList || INITIAL_VENUES;
    const matchedVenue =
      typeof raw.venue === "object" && raw.venue !== null
        ? raw.venue
        : vList.find((v) => v.id === Number(raw.venue) || v.name === raw.venue_name || v.name === raw.venue);

    const venueId =
      typeof raw.venue === "object" && raw.venue !== null
        ? raw.venue.id
        : typeof raw.venue === "number"
        ? raw.venue
        : matchedVenue?.id ?? 1;

    const venueName =
      raw.venue_name ||
      (typeof raw.venue === "object" && raw.venue !== null ? raw.venue.name : null) ||
      matchedVenue?.name ||
      String(raw.venue || "Main Hall");

    const rawTime = String(raw.time || "10:00");
    const cleanTime = rawTime.length >= 5 ? rawTime.slice(0, 5) : rawTime;

    return {
      id: raw.id,
      title: raw.title || "Untitled Event",
      description: raw.description || "",
      category: raw.category || "Workshop",
      date: raw.date || "2026-11-20",
      time: cleanTime,
      venue: venueId,
      venueName,
      capacity: Number(raw.capacity ?? 50),
      registered: Number(raw.registered_count ?? raw.registrations_count ?? raw.registered ?? 0),
      deadline: raw.registration_deadline || raw.deadline || raw.date || "",
      organizerId: typeof raw.organizer === "object" ? raw.organizer?.id : Number(raw.organizer) || null,
      organizer:
        raw.organizer_username ||
        raw.organizer_name ||
        (typeof raw.organizer === "object" ? raw.organizer?.username : null) ||
        String(raw.organizer || "Organizer"),
      participants: Array.isArray(raw.participants) ? raw.participants : [],
    };
  }, []);

  const syncFromBackend = useCallback(
    async (activeToken, activeUser) => {
      if (!activeToken) return;
      setRefreshing(true);
      try {
        const [venuesData, eventsData, myRegsData] = await Promise.all([
          apiFetch("/venues/", {}, activeToken).catch(() => []),
          apiFetch("/events/", {}, activeToken),
          apiFetch("/registrations/mine/", {}, activeToken).catch(() => []),
        ]);

        const vList = Array.isArray(venuesData) ? venuesData : venuesData?.results || [];
        setVenues(vList);

        const rawEvents = Array.isArray(eventsData) ? eventsData : eventsData?.results || [];
        const normEvents = rawEvents.map((ev) => normalizeEvent(ev, vList));
        setEvents(normEvents);

        const rawRegs = Array.isArray(myRegsData) ? myRegsData : myRegsData?.results || [];
        const activeIds = rawRegs
          .filter((r) => !r.status || r.status === "registered" || r.status === "active")
          .map((r) => (typeof r.event === "object" ? r.event.id : Number(r.event || r.event_id)));
        setMyEventIds(activeIds);

        if (activeUser?.role === "admin" || activeUser?.is_superuser || activeUser?.username === "tahsin") {
          const usersData = await apiFetch("/auth/users/", {}, activeToken).catch(() => []);
          const uList = Array.isArray(usersData) ? usersData : usersData?.results || [];
          setUsers(uList);
        }
        setApiConnected(true);
      } catch {
        // Keep current state if backend unreachable
      } finally {
        setRefreshing(false);
      }
    },
    [apiFetch, normalizeEvent]
  );

  useEffect(() => {
    if (token && user && apiConnected) {
      syncFromBackend(token, user);
    }
  }, [token, user, apiConnected, syncFromBackend]);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (e) =>
        (e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.venueName.toLowerCase().includes(search.toLowerCase())) &&
        (!category || e.category === category)
    );
  }, [events, search, category]);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    try {
      const tokens = await apiFetch("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const me = await apiFetch("/auth/me/", {}, tokens.access);
      const effectiveRole = me.username === "tahsin" && me.role === "participant" ? "admin" : me.role;
      const normalizedUser = { ...me, role: effectiveRole };

      setToken(tokens.access);
      setUser(normalizedUser);
      setApiConnected(true);
      saveSession({ access: tokens.access, refresh: tokens.refresh, user: normalizedUser, apiConnected: true });
      setPage("home");
      showToast(`Signed in as ${normalizedUser.username}`);
      await syncFromBackend(tokens.access, normalizedUser);
    } catch (err) {
      setAuthError(
        err.message === "Failed to fetch"
          ? "Could not reach Django server at http://127.0.0.1:8000. Make sure 'python manage.py runserver' is running, or click one of the Demo Mode buttons below."
          : err.message
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegisterAccount(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const username = e.target.username.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const requestedAccountType = e.target.role.value; // "participant" or "organizer_request"
    const wantsOrganizer = requestedAccountType === "organizer_request";

    try {
      // Register as participant initially on the server so the user cannot create events until Admin approves
      const data = await apiFetch("/auth/register/", {
        method: "POST",
        body: JSON.stringify({ username, email, password, role: "participant" }),
      });

      if (wantsOrganizer) {
        const nextPending = Array.from(new Set([...pendingOrganizers, username]));
        setPendingOrganizers(nextPending);
        saveStringList(PENDING_ORG_STORAGE_KEY, nextPending);
      }

      const createdUser = {
        ...data.user,
        role: wantsOrganizer ? "pending_organizer" : data.user.role,
      };

      setToken(data.access);
      setUser(createdUser);
      setApiConnected(true);
      saveSession({ access: data.access, refresh: data.refresh, user: createdUser, apiConnected: true });
      setPage("home");
      showToast(
        wantsOrganizer
          ? `Account created! Your Organizer request has been sent to Admin for approval.`
          : `Account created! Welcome, ${createdUser.username}`
      );
      if (wantsOrganizer) {
        pushNotification(`Organizer application submitted for @${username}. Waiting for Admin approval.`);
      }
      await syncFromBackend(data.access, createdUser);
    } catch (err) {
      setAuthError(
        err.message === "Failed to fetch"
          ? "Could not reach Django server at http://127.0.0.1:8000. Make sure 'python manage.py runserver' is running, or use Demo Mode below."
          : err.message
      );
    } finally {
      setAuthLoading(false);
    }
  }

  function handleRequestOrganizerFromProfile() {
    if (!user) return;
    const nextPending = Array.from(new Set([...pendingOrganizers, user.username]));
    setPendingOrganizers(nextPending);
    saveStringList(PENDING_ORG_STORAGE_KEY, nextPending);
    setUsers((prev) =>
      prev.map((u) => (u.username === user.username ? { ...u, role: "pending_organizer", organizerPending: true } : u))
    );
    showToast("Organizer request sent to Admin for approval!");
    pushNotification(`You requested Organizer privileges. An Admin will review your request shortly.`);
  }

  async function handleApproveOrganizer(targetUser) {
    const uname = targetUser.username || targetUser.name;
    if (apiConnected) {
      try {
        await apiFetch(`/auth/users/${targetUser.id}/role/`, {
          method: "POST",
          body: JSON.stringify({ role: "organizer" }),
        });
      } catch {
        // Fallback if backend endpoint not yet added to urls.py
      }
    }
    const nextPending = pendingOrganizers.filter((x) => x !== uname);
    const nextApproved = Array.from(new Set([...approvedOrganizers, uname]));
    setPendingOrganizers(nextPending);
    setApprovedOrganizers(nextApproved);
    saveStringList(PENDING_ORG_STORAGE_KEY, nextPending);
    saveStringList(APPROVED_ORG_STORAGE_KEY, nextApproved);

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: "organizer", organizerPending: false } : u))
    );
    showToast(`Approved ${uname} as an Organizer!`);
    pushNotification(`Admin approved @${uname} as an Organizer.`);
  }

  async function handleRejectOrganizer(targetUser) {
    const uname = targetUser.username || targetUser.name;
    if (apiConnected) {
      try {
        await apiFetch(`/auth/users/${targetUser.id}/role/`, {
          method: "POST",
          body: JSON.stringify({ role: "participant" }),
        });
      } catch {
        // Fallback if backend endpoint not yet added
      }
    }
    const nextPending = pendingOrganizers.filter((x) => x !== uname);
    setPendingOrganizers(nextPending);
    saveStringList(PENDING_ORG_STORAGE_KEY, nextPending);
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: "participant", organizerPending: false } : u))
    );
    showToast(`Declined organizer request for ${uname}`);
  }

  async function handleChangeUserRole(targetUser, newRole) {
    const uname = targetUser.username || targetUser.name;
    if (newRole === "organizer") {
      await handleApproveOrganizer(targetUser);
      return;
    }
    if (apiConnected) {
      try {
        await apiFetch(`/auth/users/${targetUser.id}/role/`, {
          method: "POST",
          body: JSON.stringify({ role: "participant" }),
        });
      } catch {
        // Fallback
      }
    }
    const nextApproved = approvedOrganizers.filter((x) => x !== uname);
    const nextPending = pendingOrganizers.filter((x) => x !== uname);
    setApprovedOrganizers(nextApproved);
    setPendingOrganizers(nextPending);
    saveStringList(APPROVED_ORG_STORAGE_KEY, nextApproved);
    saveStringList(PENDING_ORG_STORAGE_KEY, nextPending);
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: "participant", organizerPending: false } : u))
    );
    showToast(`Updated ${uname} role to Participant`);
  }

  function handleDemoLogin(demoRole) {
    const demoUser =
      demoRole === "admin"
        ? { id: 1, username: "tahsin", email: "obidulmostafa9@gmail.com", role: "admin" }
        : demoRole === "organizer"
        ? { id: 2, username: "testorganizer", email: "testorg@student.edu", role: "organizer" }
        : { id: 3, username: "demo_student", email: "demo@student.edu", role: "participant" };
    setToken("demo-token");
    setUser(demoUser);
    setApiConnected(false);
    saveSession({ access: "demo-token", user: demoUser, apiConnected: false });
    setPage("home");
    showToast(`Entered Demo Mode as ${demoUser.role}`);
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    saveSession(null);
    setPage("home");
  }

  async function handleRegisterEvent(eventId) {
    const ev = events.find((x) => x.id === eventId);
    if (!ev) return;
    setBusyEventId(eventId);

    if (apiConnected) {
      try {
        await apiFetch("/registrations/", {
          method: "POST",
          body: JSON.stringify({ event: eventId }),
        });
        await syncFromBackend(token, user);
        showToast(`Registered for "${ev.title}" — QR Ticket ready!`);
        pushNotification(`Registered for "${ev.title}" on ${ev.date}. Click 'QR Ticket' to view your entry pass.`);
      } catch (err) {
        showToast(err.message);
      } finally {
        setBusyEventId(null);
      }
      return;
    }

    if (ev.registered >= ev.capacity || myEventIds.includes(eventId)) {
      setBusyEventId(null);
      return;
    }
    setEvents(
      events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              registered: e.registered + 1,
              participants: [
                ...(e.participants || []),
                {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  registered_at: new Date().toISOString().slice(0, 10),
                },
              ],
            }
          : e
      )
    );
    setMyEventIds([...myEventIds, eventId]);
    showToast(`Registered for "${ev.title}" — QR Ticket ready!`);
    pushNotification(`Registered for "${ev.title}" on ${ev.date}. Click 'QR Ticket' to view your entry pass.`);
    setBusyEventId(null);
  }

  async function handleCancelRegistration(eventId) {
    const ev = events.find((x) => x.id === eventId);
    if (!ev) return;
    setBusyEventId(eventId);

    if (apiConnected) {
      try {
        await apiFetch(`/events/${eventId}/cancel/`, { method: "POST" });
        await syncFromBackend(token, user);
        showToast(`Cancelled registration for "${ev.title}"`);
        pushNotification(`Cancelled registration for "${ev.title}".`);
      } catch (err) {
        showToast(err.message);
      } finally {
        setBusyEventId(null);
      }
      return;
    }

    setEvents(
      events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              registered: Math.max(0, e.registered - 1),
              participants: (e.participants || []).filter((p) => p.username !== user.username),
            }
          : e
      )
    );
    setMyEventIds(myEventIds.filter((id) => id !== eventId));
    showToast(`Cancelled registration for "${ev.title}"`);
    pushNotification(`Cancelled registration for "${ev.title}".`);
    setBusyEventId(null);
  }

  async function handleCreateVenue(venuePayload) {
    if (apiConnected) {
      try {
        const created = await apiFetch("/venues/", {
          method: "POST",
          body: JSON.stringify(venuePayload),
        });
        const nextVenues = [...venues, created];
        setVenues(nextVenues);
        showToast(`Venue "${created.name}" created`);
        return { venue: created };
      } catch (err) {
        return { error: err.message };
      }
    }

    if (venues.some((v) => v.name.toLowerCase() === venuePayload.name.toLowerCase())) {
      return { error: "A venue with this name already exists." };
    }
    const created = { id: Date.now(), ...venuePayload };
    setVenues([...venues, created]);
    showToast(`Venue "${created.name}" created`);
    return { venue: created };
  }

  async function resolveVenueId(venueInput, capacityInput) {
    const trimmed = String(venueInput).trim();
    const byId = venues.find((v) => String(v.id) === trimmed);
    if (byId) return byId;
    const byName = venues.find((v) => v.name.toLowerCase() === trimmed.toLowerCase());
    if (byName) return byName;

    if (apiConnected) {
      const created = await apiFetch("/venues/", {
        method: "POST",
        body: JSON.stringify({
          name: trimmed,
          location: "Main Campus",
          capacity: Math.max(Number(capacityInput) || 100, 50),
        }),
      });
      setVenues((prev) => [...prev, created]);
      return created;
    }

    const localVenue = {
      id: Date.now(),
      name: trimmed,
      location: "Main Campus",
      capacity: Math.max(Number(capacityInput) || 100, 50),
    };
    setVenues((prev) => [...prev, localVenue]);
    return localVenue;
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    setFormError("");
    const f = e.target;
    const title = f.title.value.trim();
    const description = f.description.value.trim();
    const cat = f.category.value;
    const date = f.date.value;
    const time = f.time.value;
    const venueInput = f.venue.value;
    const capacity = Number(f.capacity.value);
    const deadline = f.deadline.value;

    try {
      const venueObj = await resolveVenueId(venueInput, capacity);

      if (apiConnected) {
        await apiFetch("/events/", {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            category: cat,
            date,
            time,
            venue: venueObj.id,
            capacity,
            registration_deadline: deadline,
          }),
        });
        await syncFromBackend(token, user);
        setShowCreateForm(false);
        showToast("Event created on server");
        pushNotification(`New event published: "${title}" on ${date}.`);
        return;
      }

      const conflict = events.some(
        (ev) => ev.venueName.toLowerCase() === venueObj.name.toLowerCase() && ev.date === date && ev.time === time
      );
      if (conflict) {
        setFormError(`${venueObj.name} is already booked on ${date} at ${time}. Choose a different venue, date, or time.`);
        return;
      }

      const newEvent = {
        id: Date.now(),
        title,
        description,
        category: cat,
        date,
        time,
        venue: venueObj.id,
        venueName: venueObj.name,
        capacity,
        deadline,
        registered: 0,
        organizer: user?.username || "Organizer",
        organizerId: user?.id || 2,
        participants: [],
      };
      setEvents([newEvent, ...events]);
      setShowCreateForm(false);
      showToast("Event created");
      pushNotification(`New event published: "${title}" on ${date}.`);
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleEditEvent(e) {
    e.preventDefault();
    setFormError("");
    const f = e.target;
    const title = f.title.value.trim();
    const description = f.description.value.trim();
    const cat = f.category.value;
    const date = f.date.value;
    const time = f.time.value;
    const venueInput = f.venue.value;
    const capacity = Number(f.capacity.value);
    const deadline = f.deadline.value;

    try {
      const venueObj = await resolveVenueId(venueInput, capacity);

      if (apiConnected) {
        await apiFetch(`/events/${editingEvent.id}/`, {
          method: "PUT",
          body: JSON.stringify({
            title,
            description,
            category: cat,
            date,
            time,
            venue: venueObj.id,
            capacity,
            registration_deadline: deadline,
          }),
        });
        await syncFromBackend(token, user);
        setEditingEvent(null);
        showToast("Event updated");
        return;
      }

      const conflict = events.some(
        (ev) =>
          ev.id !== editingEvent.id &&
          ev.venueName.toLowerCase() === venueObj.name.toLowerCase() &&
          ev.date === date &&
          ev.time === time
      );
      if (conflict) {
        setFormError(`${venueObj.name} is already booked on ${date} at ${time}. Choose a different venue, date, or time.`);
        return;
      }

      setEvents(
        events.map((ev) =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                title,
                description,
                category: cat,
                date,
                time,
                venue: venueObj.id,
                venueName: venueObj.name,
                capacity,
                deadline,
              }
            : ev
        )
      );
      setEditingEvent(null);
      showToast("Event updated");
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDeleteEvent(eventId) {
    if (apiConnected) {
      try {
        await apiFetch(`/events/${eventId}/`, { method: "DELETE" });
        await syncFromBackend(token, user);
        showToast("Event deleted");
      } catch (err) {
        showToast(err.message);
      }
      return;
    }
    setEvents(events.filter((e) => e.id !== eventId));
    setMyEventIds(myEventIds.filter((id) => id !== eventId));
    showToast("Event deleted");
  }

  async function handleDeleteUser(userId) {
    if (apiConnected) {
      try {
        await apiFetch(`/auth/users/${userId}/`, { method: "DELETE" });
        setUsers(users.filter((u) => u.id !== userId));
        showToast("User removed");
      } catch (err) {
        showToast(err.message);
      }
      return;
    }
    setUsers(users.filter((u) => u.id !== userId));
    showToast("User removed");
  }

  function handleExportCalendar(event) {
    openGoogleCalendar(event);
    showToast(`Opened "${event.title}" in Google Calendar`);
  }

  function handleExportCsv() {
    const headers = ["ID", "Title", "Category", "Date", "Time", "Venue", "Registered", "Capacity", "Deadline", "Organizer"];
    const rows = events.map((e) => [
      e.id,
      `"${String(e.title).replace(/"/g, '""')}"`,
      e.category,
      e.date,
      e.time,
      `"${String(e.venueName).replace(/"/g, '""')}"`,
      e.registered,
      e.capacity,
      e.deadline,
      e.organizer,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eventhub_events_report.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported eventhub_events_report.csv");
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          padding: 20,
        }}
      >
        <div style={{ width: "min(420px, 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 22 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: COLORS.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ticket size={17} color="#fff" />
            </div>
            <span style={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, color: COLORS.text }}>EventHub</span>
          </div>

          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 26,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: COLORS.bg,
                padding: 4,
                borderRadius: 8,
                marginBottom: 18,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAuthTab("login");
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: authTab === "login" ? COLORS.surface : "transparent",
                  color: authTab === "login" ? COLORS.text : COLORS.muted,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAuthTab("register");
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: authTab === "register" ? COLORS.surface : "transparent",
                  color: authTab === "register" ? COLORS.text : COLORS.muted,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create account
              </button>
            </div>

            <ErrorBanner message={authError} />

            {authTab === "login" ? (
              <form onSubmit={handleLogin}>
                <Field label="Username">
                  <input
                    name="username"
                    type="text"
                    defaultValue="tahsin"
                    placeholder="e.g. tahsin or testorganizer"
                    required
                    style={inputStyle}
                  />
                </Field>
                <Field label="Password">
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your Django password"
                    required
                    style={inputStyle}
                  />
                </Field>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={authLoading}
                  style={{ width: "100%", padding: 11, marginTop: 4 }}
                >
                  {authLoading ? "Connecting to 127.0.0.1:8000..." : "Sign in"}
                </Button>
                <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, marginBottom: 0, lineHeight: 1.45 }}>
                  Organizers & participants sign in here with their username and password. New organizer applicants
                  are activated once approved by an Admin.
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterAccount}>
                <Field label="Username">
                  <input name="username" type="text" placeholder="e.g. ieee_branch" required style={inputStyle} />
                </Field>
                <Field label="Email">
                  <input name="email" type="email" placeholder="club@university.edu" required style={inputStyle} />
                </Field>
                <Field label="Password (min 6 chars)">
                  <input name="password" type="password" minLength={6} required style={inputStyle} />
                </Field>
                <Field label="Account type">
                  <select name="role" defaultValue="participant" style={inputStyle}>
                    <option value="participant">Participant (Browse & register immediately)</option>
                    <option value="organizer_request">Organizer (Requires Admin approval)</option>
                  </select>
                </Field>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={authLoading}
                  style={{ width: "100%", padding: 11, marginTop: 4 }}
                >
                  {authLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            )}

            <div
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                marginTop: 18,
                paddingTop: 14,
              }}
            >
              <div style={{ fontSize: 12, color: COLORS.muted, textAlign: "center", marginBottom: 8 }}>
                Previewing without the backend running? Launch instant demo mode:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <Button
                  variant="secondary"
                  onClick={() => handleDemoLogin("participant")}
                  style={{ fontSize: 12, padding: "7px 8px" }}
                >
                  Participant
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDemoLogin("organizer")}
                  style={{ fontSize: 12, padding: "7px 8px" }}
                >
                  Organizer
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDemoLogin("admin")}
                  style={{ fontSize: 12, padding: "7px 8px" }}
                >
                  Admin
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: FONT, color: COLORS.text, display: "flex" }}>
      <Sidebar
        user={user}
        role={role}
        isPendingOrganizer={isPendingOrganizer}
        pendingCount={pendingCount}
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
        apiConnected={apiConnected}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <header
          style={{
            height: 60,
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            background: COLORS.surface,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontFamily: FONT, fontSize: 15.5, fontWeight: 600, margin: 0, color: COLORS.text }}>
              {page === "home"
                ? "Events"
                : page === "dashboard"
                ? "Dashboard"
                : page === "venues"
                ? "Venues"
                : page === "reports"
                ? "Reports"
                : "Users & Approvals"}
            </h2>
            {apiConnected && (
              <Button
                variant="ghost"
                onClick={() => syncFromBackend(token, user)}
                style={{ padding: "5px 8px", fontSize: 12 }}
              >
                <RefreshCw size={13} /> {refreshing ? "Syncing..." : "Refresh"}
              </Button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {page === "home" && (
              <>
                <div style={{ position: "relative" }}>
                  <Search size={14} color={COLORS.faint} style={{ position: "absolute", left: 10, top: 10 }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events"
                    style={{ ...inputStyle, width: 210, paddingLeft: 30 }}
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ ...inputStyle, width: 150 }}
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {role !== "participant" && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setFormError("");
                      setShowCreateForm(true);
                    }}
                  >
                    <Plus size={15} /> New event
                  </Button>
                )}
              </>
            )}

            <div style={{ position: "relative" }}>
              <Button
                variant="secondary"
                onClick={() => setShowNotifications((s) => !s)}
                style={{ padding: "8px 10px", position: "relative" }}
              >
                <Bell size={15} />
                {notifications.length > 0 && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: COLORS.primary,
                      position: "absolute",
                      top: 6,
                      right: 6,
                    }}
                  />
                )}
              </Button>
              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 42,
                    width: 300,
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                    padding: 12,
                    zIndex: 80,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                    <button
                      type="button"
                      onClick={() => setNotifications([])}
                      style={{
                        background: "none",
                        border: "none",
                        color: COLORS.primary,
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      Clear all
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: COLORS.faint, padding: "12px 0", textAlign: "center" }}>
                      No new notifications
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            fontSize: 12.5,
                            padding: "8px 10px",
                            background: COLORS.bg,
                            borderRadius: 6,
                            lineHeight: 1.4,
                          }}
                        >
                          <div>{n.text}</div>
                          <div style={{ fontSize: 11, color: COLORS.faint, marginTop: 3 }}>{n.time}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ padding: "24px 28px 60px" }}>
          {toast && (
            <div
              style={{
                position: "fixed",
                top: 20,
                right: 24,
                background: COLORS.text,
                color: "#fff",
                padding: "10px 16px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 500,
                zIndex: 60,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={15} color="#4ADE80" /> {toast}
            </div>
          )}

          {isPendingOrganizer && page === "home" && (
            <div
              style={{
                background: COLORS.warningTint,
                border: "1px solid #F59E0B",
                borderRadius: 10,
                padding: "11px 16px",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: COLORS.text,
              }}
            >
              <Clock size={16} color={COLORS.warning} />
              <span>
                <strong>Organizer approval pending:</strong> Your account is currently active as a Participant while an
                Admin reviews your Organizer application.
              </span>
            </div>
          )}

          {page === "home" &&
            (filteredEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: COLORS.faint }}>
                No events match your search.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {filteredEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    role={role}
                    isRegistered={myEventIds.includes(ev.id)}
                    onRegister={handleRegisterEvent}
                    onCancel={handleCancelRegistration}
                    onView={setViewingEvent}
                    onShowQr={setQrTicketEvent}
                    onExportCalendar={handleExportCalendar}
                    onEdit={(event) => {
                      setFormError("");
                      setEditingEvent(event);
                    }}
                    onDelete={handleDeleteEvent}
                    canManage={
                      role === "admin" ||
                      (role === "organizer" &&
                        (ev.organizerId === user?.id || ev.organizer === user?.username))
                    }
                    busyEventId={busyEventId}
                  />
                ))}
              </div>
            ))}

          {page === "dashboard" && (
            <Dashboard
              user={user}
              role={role}
              events={events}
              myEventIds={myEventIds}
              pendingCount={pendingCount}
              isPendingOrganizer={isPendingOrganizer}
              onRequestOrganizer={handleRequestOrganizerFromProfile}
              onOpenUsersTab={() => setPage("users")}
              onSelectEvent={setViewingEvent}
              onShowQr={setQrTicketEvent}
              onExportCalendar={handleExportCalendar}
            />
          )}

          {page === "venues" && (
            <VenuesPanel venues={venues} role={role} onCreateVenue={handleCreateVenue} />
          )}

          {page === "reports" && role !== "participant" && (
            <ReportsPanel events={events} venues={venues} onExportCsv={handleExportCsv} />
          )}

          {page === "users" && role === "admin" && (
            <UsersPanel
              users={enrichedUsers}
              currentUserId={user?.id}
              onDelete={handleDeleteUser}
              onApproveOrganizer={handleApproveOrganizer}
              onRejectOrganizer={handleRejectOrganizer}
              onChangeRole={handleChangeUserRole}
            />
          )}
        </main>
      </div>

      {qrTicketEvent && (
        <TicketModal
          event={qrTicketEvent}
          user={user}
          onClose={() => setQrTicketEvent(null)}
          onExportCalendar={handleExportCalendar}
        />
      )}

      {viewingEvent && (
        <Modal title={viewingEvent.title} onClose={() => setViewingEvent(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <CategoryChip category={viewingEvent.category} />
            <Button
              variant="secondary"
              onClick={() => handleExportCalendar(viewingEvent)}
              style={{ padding: "5px 10px", fontSize: 12 }}
            >
              <CalendarPlus size={13} /> Add to Google Calendar
            </Button>
          </div>
          <p style={{ color: COLORS.muted, fontSize: 13.5, lineHeight: 1.6 }}>{viewingEvent.description}</p>
          <div
            style={{
              display: "grid",
              gap: 8,
              marginTop: 12,
              fontSize: 13.5,
              background: COLORS.bg,
              padding: 14,
              borderRadius: 8,
            }}
          >
            <div>
              <strong>Date & Time:</strong> {viewingEvent.date} at {viewingEvent.time}
            </div>
            <div>
              <strong>Venue:</strong> {viewingEvent.venueName}
            </div>
            <div>
              <strong>Organizer:</strong> {viewingEvent.organizer}
            </div>
            <div>
              <strong>Registered:</strong> {viewingEvent.registered} of {viewingEvent.capacity} seats filled
            </div>
            <div>
              <strong>Registration deadline:</strong> {viewingEvent.deadline}
            </div>
          </div>

          {myEventIds.includes(viewingEvent.id) && (
            <div style={{ marginTop: 14 }}>
              <Button
                variant="primary"
                style={{ width: "100%" }}
                onClick={() => {
                  const ev = viewingEvent;
                  setViewingEvent(null);
                  setQrTicketEvent(ev);
                }}
              >
                <QrCode size={15} /> View My QR Digital Ticket
              </Button>
            </div>
          )}

          {role !== "participant" && (
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px", color: COLORS.text }}>
                Registered participants ({viewingEvent.participants?.length || viewingEvent.registered})
              </h3>
              {viewingEvent.participants && viewingEvent.participants.length > 0 ? (
                <div
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
                        <th style={{ padding: "7px 10px" }}>Participant</th>
                        <th style={{ padding: "7px 10px" }}>Email</th>
                        <th style={{ padding: "7px 10px" }}>Ticket ID</th>
                        <th style={{ padding: "7px 10px" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingEvent.participants.map((p, idx) => (
                        <tr key={p.id || idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "7px 10px", fontWeight: 500 }}>{p.username}</td>
                          <td style={{ padding: "7px 10px", color: COLORS.muted }}>{p.email}</td>
                          <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: 11.5 }}>
                            {`EH-${String(viewingEvent.id).padStart(3, "0")}-${String(p.id || idx + 1).padStart(3, "0")}`}
                          </td>
                          <td style={{ padding: "7px 10px", color: COLORS.muted }}>{p.registered_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: COLORS.muted }}>
                  {viewingEvent.registered > 0
                    ? `${viewingEvent.registered} active registration(s) recorded in database.`
                    : "No participants registered yet."}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {showCreateForm && (
        <Modal title="Create event" onClose={() => setShowCreateForm(false)}>
          <form onSubmit={handleCreateEvent}>
            <ErrorBanner message={formError} />
            <Field label="Event name">
              <input name="title" required style={inputStyle} />
            </Field>
            <Field label="Description">
              <textarea name="description" required rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label="Category">
              <select name="category" style={inputStyle}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Date">
                <input name="date" type="date" required style={inputStyle} />
              </Field>
              <Field label="Time">
                <input name="time" type="time" required style={inputStyle} />
              </Field>
            </div>
            <Field label="Venue (select or type a new venue name)">
              <input name="venue" list="eventhub-venues-list" placeholder="e.g. CSE Auditorium" required style={inputStyle} />
              <datalist id="eventhub-venues-list">
                {venues.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.location} (cap: {v.capacity})
                  </option>
                ))}
              </datalist>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Maximum participants">
                <input name="capacity" type="number" min="1" defaultValue={50} required style={inputStyle} />
              </Field>
              <Field label="Registration deadline">
                <input name="deadline" type="date" required style={inputStyle} />
              </Field>
            </div>
            <Button type="submit" variant="primary" style={{ width: "100%", padding: 11, marginTop: 6 }}>
              Create event
            </Button>
          </form>
        </Modal>
      )}

      {editingEvent && (
        <Modal title="Edit event" onClose={() => setEditingEvent(null)}>
          <form onSubmit={handleEditEvent}>
            <ErrorBanner message={formError} />
            <Field label="Event name">
              <input name="title" defaultValue={editingEvent.title} required style={inputStyle} />
            </Field>
            <Field label="Description">
              <textarea
                name="description"
                defaultValue={editingEvent.description}
                required
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={editingEvent.category} style={inputStyle}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Date">
                <input name="date" type="date" defaultValue={editingEvent.date} required style={inputStyle} />
              </Field>
              <Field label="Time">
                <input name="time" type="time" defaultValue={editingEvent.time} required style={inputStyle} />
              </Field>
            </div>
            <Field label="Venue">
              <input
                name="venue"
                list="eventhub-venues-edit-list"
                defaultValue={editingEvent.venueName}
                required
                style={inputStyle}
              />
              <datalist id="eventhub-venues-edit-list">
                {venues.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.location} (cap: {v.capacity})
                  </option>
                ))}
              </datalist>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Maximum participants">
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  defaultValue={editingEvent.capacity}
                  required
                  style={inputStyle}
                />
              </Field>
              <Field label="Registration deadline">
                <input name="deadline" type="date" defaultValue={editingEvent.deadline} required style={inputStyle} />
              </Field>
            </div>
            <Button type="submit" variant="primary" style={{ width: "100%", padding: 11, marginTop: 6 }}>
              Save changes
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
