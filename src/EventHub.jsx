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
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Phone,
  GraduationCap,
  BookOpen,
  Copy,
  ExternalLink,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const API_BASE = "https://event-backend-01.onrender.com/api";

const THEME_VARS = {
  light: {
    "--eh-bg": "#F5F6F8",
    "--eh-surface": "#FFFFFF",
    "--eh-surface-subtle": "#F8FAFC",
    "--eh-tab-bg": "#F1F5F9",
    "--eh-border": "#E2E5EA",
    "--eh-border-strong": "#CBD5E1",
    "--eh-text": "#151A26",
    "--eh-muted": "#64748B",
    "--eh-faint": "#94A3B8",
    "--eh-primary": "#2451DB",
    "--eh-primary-hover": "#1D3FB0",
    "--eh-primary-tint": "#EAF0FE",
    "--eh-danger": "#C0392B",
    "--eh-danger-tint": "#FBEAE8",
    "--eh-success": "#166A46",
    "--eh-success-tint": "#E7F6EE",
    "--eh-warning": "#B45309",
    "--eh-warning-tint": "#FDF1E5",
  },
  dark: {
    "--eh-bg": "#0B0F19",
    "--eh-surface": "#131B2E",
    "--eh-surface-subtle": "#1A243B",
    "--eh-tab-bg": "#0F172A",
    "--eh-border": "#23304C",
    "--eh-border-strong": "#334468",
    "--eh-text": "#F1F5F9",
    "--eh-muted": "#94A3B8",
    "--eh-faint": "#64748B",
    "--eh-primary": "#3B82F6",
    "--eh-primary-hover": "#2563EB",
    "--eh-primary-tint": "rgba(59, 130, 246, 0.18)",
    "--eh-danger": "#F87171",
    "--eh-danger-tint": "rgba(248, 113, 113, 0.16)",
    "--eh-success": "#34D399",
    "--eh-success-tint": "rgba(52, 211, 153, 0.16)",
    "--eh-warning": "#FBBF24",
    "--eh-warning-tint": "rgba(251, 191, 36, 0.16)",
  },
};

const COLORS = {
  bg: "var(--eh-bg, #F5F6F8)",
  surface: "var(--eh-surface, #FFFFFF)",
  surfaceSubtle: "var(--eh-surface-subtle, #F8FAFC)",
  tabBg: "var(--eh-tab-bg, #F1F5F9)",
  border: "var(--eh-border, #E2E5EA)",
  borderStrong: "var(--eh-border-strong, #CBD5E1)",
  text: "var(--eh-text, #151A26)",
  muted: "var(--eh-muted, #64748B)",
  faint: "var(--eh-faint, #94A3B8)",
  primary: "var(--eh-primary, #2451DB)",
  primaryHover: "var(--eh-primary-hover, #1D3FB0)",
  primaryTint: "var(--eh-primary-tint, #EAF0FE)",
  danger: "var(--eh-danger, #C0392B)",
  dangerTint: "var(--eh-danger-tint, #FBEAE8)",
  success: "var(--eh-success, #166A46)",
  successTint: "var(--eh-success-tint, #E7F6EE)",
  warning: "var(--eh-warning, #B45309)",
  warningTint: "var(--eh-warning-tint, #FDF1E5)",
};

const CATEGORY_COLORS = {
  Workshop: { bg: "#EAF0FE", text: "#2451DB" },
  Cultural: { bg: "#F3ECFB", text: "#7C3AED" },
  Competition: { bg: "#FDF1E5", text: "#B45309" },
  Career: { bg: "#E7F6EE", text: "#166A46" },
};

const CATEGORIES = ["Workshop", "Cultural", "Competition", "Career"];
const DEPARTMENTS = ["CSE", "FMRT", "FES", "MGT", "THM"];

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
    participants: [],
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
    registered: 186,
    organizer: "testorganizer",
    organizerId: 2,
    deadline: "2026-11-24",
    description: "A night of music, dance, and drama celebrating the university's cultural societies.",
    participants: [],
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
    registered: 95,
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
  {
    id: 1,
    username: "tahsin",
    full_name: "Obidul Mostafa Tahsin",
    email: "obidulmostafa9@gmail.com",
    phone: "01800000000",
    batch: "9th",
    department: "CSE",
    role: "admin",
  },
  {
    id: 2,
    username: "testorganizer",
    full_name: "Tech Club Organizer",
    email: "testorg@student.edu",
    phone: "01700000000",
    batch: "9th",
    department: "CSE",
    role: "organizer",
  },
];

const AUTH_STORAGE_KEY = "eventhub_jwt_session";
const PENDING_ORG_STORAGE_KEY = "eventhub_pending_organizers";
const APPROVED_ORG_STORAGE_KEY = "eventhub_approved_organizers";
const USER_PROFILES_STORAGE_KEY = "eventhub_user_profiles";

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
  } catch {}
}

function loadJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJsonStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function getInitialQrEventId() {
  try {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("register_event");
    return id ? Number(id) : null;
  } catch {
    return null;
  }
}

function buildEventRegistrationUrl(eventId) {
  if (typeof window !== "undefined" && window.location?.origin && !window.location.origin.startsWith("null")) {
    return `${window.location.origin}${window.location.pathname}?register_event=${eventId}`;
  }
  return `https://event-management-system-tan-six.vercel.app/?register_event=${eventId}`;
}

function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
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

  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank", "noopener,noreferrer");
}

const QR_VERSION_INFO = {
  1: [21, 19, 7, []],
  2: [25, 34, 10, [6, 18]],
  3: [29, 55, 15, [6, 22]],
  4: [33, 80, 20, [6, 26]],
  5: [37, 108, 26, [6, 30]],
};

function generateQrMatrix(payload) {
  const text = String(payload || "https://event-management-system-tan-six.vercel.app").slice(0, 104);
  const bytes = Array.from(new TextEncoder().encode(text));

  let ver = 5;
  for (let v = 1; v <= 5; v++) {
    if (bytes.length + 2 <= QR_VERSION_INFO[v][1]) {
      ver = v;
      break;
    }
  }
  const [size, dataCw, ecCw, align] = QR_VERSION_INFO[ver];

  const bits = [0, 1, 0, 0];
  for (let i = 7; i >= 0; i--) bits.push((bytes.length >> i) & 1);
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  }
  const maxBits = dataCw * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let val = 0;
    for (let j = 0; j < 8; j++) val = (val << 1) | bits[i + j];
    codewords.push(val);
  }
  const pads = [0xec, 0x11];
  let padIdx = 0;
  while (codewords.length < dataCw) {
    codewords.push(pads[padIdx % 2]);
    padIdx++;
  }

  const exp = new Array(512).fill(0);
  const log = new Array(256).fill(0);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];

  const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : exp[log[a] + log[b]]);

  let gen = [1];
  for (let i = 0; i < ecCw; i++) {
    const nxt = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      nxt[j] ^= gen[j];
      nxt[j + 1] ^= gfMul(gen[j], exp[i]);
    }
    gen = nxt;
  }

  const rem = [...codewords, ...new Array(ecCw).fill(0)];
  for (let i = 0; i < codewords.length; i++) {
    const coef = rem[i];
    if (coef !== 0) {
      for (let j = 1; j < gen.length; j++) {
        rem[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  const allCw = [...codewords, ...rem.slice(codewords.length)];

  const grid = Array.from({ length: size }, () => new Array(size).fill(0));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

  const setFn = (r, c, val) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      grid[r][c] = val ? 1 : 0;
      reserved[r][c] = true;
    }
  };

  const placeFinder = (r0, c0) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = r0 + dr;
        const c = c0 + dc;
        if (r >= 0 && r < size && c >= 0 && c < size) {
          const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6 && (dr === 0 || dr === 6 || dc === 0 || dc === 6);
          const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          setFn(r, c, inOuter || inInner);
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  if (align.length) {
    for (const ar of align) {
      for (const ac of align) {
        if ((ar === 6 && ac === 6) || (ar === 6 && ac === size - 7) || (ar === size - 7 && ac === 6)) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dist = Math.max(Math.abs(dr), Math.abs(dc));
            setFn(ar + dr, ac + dc, dist === 0 || dist === 2);
          }
        }
      }
    }
  }

  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setFn(6, i, i % 2 === 0);
    if (!reserved[i][6]) setFn(i, 6, i % 2 === 0);
  }

  setFn(size - 8, 8, true);
  for (let i = 0; i < 9; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }

  const fullBits = [];
  for (const cw of allCw) {
    for (let i = 7; i >= 0; i--) fullBits.push((cw >> i) & 1);
  }

  let bitIdx = 0;
  let up = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;
    for (let step = 0; step < size; step++) {
      const r = up ? size - 1 - step : step;
      for (const dc of [0, -1]) {
        const c = col + dc;
        if (!reserved[r][c]) {
          let b = bitIdx < fullBits.length ? fullBits[bitIdx++] : 0;
          if ((r + c) % 2 === 0) b ^= 1;
          grid[r][c] = b;
        }
      }
    }
    up = !up;
  }

  const fmt = 0x77c4;
  const fmtBits = Array.from({ length: 15 }, (_, i) => (fmt >> i) & 1);
  const coords1 = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  const coords2 = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];
  for (let i = 0; i < 15; i++) {
    const [r1, c1] = coords1[i];
    const [r2, c2] = coords2[i];
    grid[r1][c1] = fmtBits[14 - i];
    grid[r2][c2] = fmtBits[14 - i];
  }

  return grid;
}

function QrCodeSvg({ value, pixelSize = 200 }) {
  const matrix = useMemo(() => generateQrMatrix(value), [value]);
  const size = matrix.length;
  const quietZone = 4;
  const total = size + quietZone * 2;
  return (
    <svg
      id="eventhub-organizer-reg-qr-svg"
      width={pixelSize}
      height={pixelSize}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      style={{ background: "#FFFFFF", borderRadius: 10, border: `1px solid ${COLORS.border}`, display: "block" }}
    >
      <rect width={total} height={total} fill="#FFFFFF" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? <rect key={`${r}-${c}`} x={c + quietZone} y={r + quietZone} width={1} height={1} fill="#0F172A" /> : null
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
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          fontFamily: FONT,
          fontSize: 12.5,
          fontWeight: 600,
          color: COLORS.muted,
          display: "block",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", onClick, type = "button", style = {}, disabled, title }) {
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
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...(variants[variant] || variants.primary), ...style }}
    >
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
        background: "rgba(21,26,38,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface,
          borderRadius: 12,
          width: `min(${width}px, 100%)`,
          maxHeight: "90vh",
          overflow: "auto",
          padding: 24,
          boxShadow: "0 20px 60px rgba(21,26,38,0.28)",
          color: COLORS.text,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <h2 style={{ fontFamily: FONT, fontSize: 17, color: COLORS.text, margin: 0, fontWeight: 700 }}>{title}</h2>
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
        color: COLORS.danger,
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

function EventRegistrationQrModal({ event, onClose, onCopyLink, onSimulateScan }) {
  if (!event) return null;
  const regUrl = buildEventRegistrationUrl(event.id);

  function handleDownloadQrSvg() {
    const svgEl = document.getElementById("eventhub-organizer-reg-qr-svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = String(event.title || "event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");
    a.download = `${slug}_registration_qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal title="Event Registration QR Code" onClose={onClose} width={460}>
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
            background: "linear-gradient(135deg, #1E3A8A 0%, #2451DB 100%)",
            color: "#FFFFFF",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.6 }}>
            Scan to Register for Event
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>{event.title}</div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>
            {event.date} at {event.time} &middot; {event.venueName}
          </div>
        </div>

        <div
          style={{
            padding: 22,
            background: COLORS.surface,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: `1px dashed ${COLORS.borderStrong}`,
          }}
        >
          <QrCodeSvg value={regUrl} pixelSize={208} />
          <div
            style={{
              fontSize: 12.5,
              color: COLORS.muted,
              marginTop: 12,
              textAlign: "center",
              lineHeight: 1.45,
            }}
          >
            Students can scan this QR code with their phone camera to go directly to this event's registration page.
          </div>
        </div>

        <div style={{ padding: "12px 16px", background: COLORS.surfaceSubtle }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.muted, marginBottom: 4 }}>
            Direct Registration Link
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: "7px 10px",
              fontSize: 12,
              color: COLORS.text,
              wordBreak: "break-all",
            }}
          >
            <span style={{ flex: 1 }}>{regUrl}</span>
            <button
              type="button"
              onClick={() => onCopyLink(regUrl)}
              style={{
                background: COLORS.primaryTint,
                color: COLORS.primary,
                border: "none",
                borderRadius: 5,
                padding: "5px 8px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <Copy size={12} /> Copy
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
        <Button variant="primary" onClick={handleDownloadQrSvg}>
          <Download size={14} /> Download QR (.svg)
        </Button>
        <Button variant="secondary" onClick={() => onSimulateScan(event)}>
          <ExternalLink size={14} /> Preview Scan Page
        </Button>
      </div>
    </Modal>
  );
}

function QrScannedRegistrationModal({
  event,
  user,
  isRegistered,
  onConfirmRegister,
  onOpenCalendar,
  onClose,
  busy,
}) {
  if (!event) return null;
  const full = event.registered >= event.capacity;
  const todayStr = new Date().toISOString().slice(0, 10);
  const pastDeadline = Boolean(event.deadline && event.deadline < todayStr);

  return (
    <Modal title="QR Event Registration" onClose={onClose} width={480}>
      <div
        style={{
          background: COLORS.primaryTint,
          color: COLORS.primary,
          padding: "10px 14px",
          borderRadius: 8,
          fontSize: 12.5,
          fontWeight: 600,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <QrCode size={16} /> You opened this event via its official Registration QR Code.
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <CategoryChip category={event.category} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: full ? COLORS.danger : COLORS.success }}>
          {event.capacity - event.registered} seats remaining ({event.registered}/{event.capacity})
        </span>
      </div>

      <h3 style={{ fontSize: 19, fontWeight: 700, color: COLORS.text, margin: "0 0 8px" }}>{event.title}</h3>
      <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.55, margin: "0 0 14px" }}>{event.description}</p>

      <div
        style={{
          background: COLORS.bg,
          borderRadius: 8,
          padding: 14,
          display: "grid",
          gap: 7,
          fontSize: 13,
          marginBottom: 16,
          color: COLORS.text,
        }}
      >
        <div>
          <strong>Date & Time:</strong> {event.date} at {event.time}
        </div>
        <div>
          <strong>Venue:</strong> {event.venueName}
        </div>
        <div>
          <strong>Organizer:</strong> {event.organizer}
        </div>
        <div>
          <strong>Registration Deadline:</strong> {event.deadline}
        </div>
        {user && (
          <div style={{ paddingTop: 6, borderTop: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
            <strong>Registering as:</strong> {user.full_name || user.username} ({user.department || "Participant"})
          </div>
        )}
      </div>

      {isRegistered ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              background: COLORS.successTint,
              color: COLORS.success,
              padding: "11px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} /> You are registered for this event!
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => onOpenCalendar(event)}>
              <CalendarPlus size={14} /> Add to Google Calendar
            </Button>
            <Button variant="secondary" style={{ flex: 1 }} onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="primary"
            disabled={full || pastDeadline || busy}
            onClick={() => onConfirmRegister(event.id)}
            style={{ flex: 1, padding: "11px 16px" }}
          >
            {busy
              ? "Registering..."
              : full
              ? "Event is Full"
              : pastDeadline
              ? "Registration Closed"
              : "Confirm Event Registration"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
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
  onShowEventQr,
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
                <Button
                  variant="secondary"
                  style={{ flex: 1, padding: "8px 10px", fontSize: 12.5 }}
                  onClick={() => onExportCalendar(event)}
                >
                  <CalendarPlus size={14} /> Add to Google Calendar
                </Button>
                <Button
                  variant="secondary"
                  title="Share Event Registration QR"
                  style={{ padding: "8px 10px", fontSize: 12.5 }}
                  onClick={() => onShowEventQr(event)}
                >
                  <QrCode size={14} />
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
          <Button
            variant="secondary"
            title="Registration QR Code"
            onClick={() => onShowEventQr(event)}
            style={{ padding: "9px 11px" }}
          >
            <QrCode size={14} /> {role !== "participant" ? "Registration QR" : ""}
          </Button>
          <Button
            variant="secondary"
            title="Add to Google Calendar"
            onClick={() => onExportCalendar(event)}
            style={{ padding: "9px 11px" }}
          >
            <CalendarPlus size={14} />
          </Button>
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

function EventTable({ events, onSelectEvent, onShowEventQr, onExportCalendar }) {
  if (!events.length) {
    return <div style={{ padding: 30, textAlign: "center", color: COLORS.faint, fontSize: 13.5 }}>No events yet.</div>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: COLORS.text }}>
        <thead>
          <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Event</th>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Category</th>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Date & Time</th>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Venue</th>
            <th style={{ padding: "9px 8px", fontWeight: 500 }}>Filled</th>
            {(onSelectEvent || onShowEventQr || onExportCalendar) && (
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
              {(onSelectEvent || onShowEventQr || onExportCalendar) && (
                <td style={{ padding: "10px 8px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {onShowEventQr && (
                      <Button
                        variant="primary"
                        onClick={() => onShowEventQr(e)}
                        style={{ padding: "5px 9px", fontSize: 12 }}
                      >
                        <QrCode size={12} /> Registration QR
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color={COLORS.warning} />
            <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: 0, color: COLORS.text }}>
              Pending organizer requests ({pendingUsers.length})
            </h2>
          </div>
          <span style={{ fontSize: 12, color: COLORS.muted }}>
            Users who requested organizer access during signup or profile
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div style={{ padding: "14px 8px", color: COLORS.faint, fontSize: 13 }}>
            No pending organizer requests right now.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: COLORS.text }}>
              <thead>
                <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
                  <th style={{ padding: "9px 8px", fontWeight: 500 }}>Full Name & Username</th>
                  <th style={{ padding: "9px 8px", fontWeight: 500 }}>Dept & Batch</th>
                  <th style={{ padding: "9px 8px", fontWeight: 500 }}>Contact</th>
                  <th style={{ padding: "9px 8px", textAlign: "right" }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "10px 8px", color: COLORS.text }}>
                      <div style={{ fontWeight: 600 }}>{u.full_name || u.username || u.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>@{u.username}</div>
                    </td>
                    <td style={{ padding: "10px 8px", color: COLORS.muted }}>
                      {u.department || "—"} {u.batch ? `• Batch ${u.batch}` : ""}
                    </td>
                    <td style={{ padding: "10px 8px", color: COLORS.muted }}>
                      <div>{u.email}</div>
                      {u.phone && <div style={{ fontSize: 12 }}>{u.phone}</div>}
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <Button
                          variant="success"
                          onClick={() => onApproveOrganizer(u)}
                          style={{ padding: "5px 10px", fontSize: 12.5 }}
                        >
                          <UserCheck size={13} /> Approve
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
          </div>
        )}
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
        <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
          All registered accounts ({users.length})
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: COLORS.text }}>
            <thead>
              <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Full Name</th>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Username</th>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Dept / Batch</th>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Email & Phone</th>
                <th style={{ padding: "9px 8px", fontWeight: 500 }}>Role</th>
                <th style={{ padding: "9px 8px", textAlign: "right" }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isPending = u.role === "pending_organizer" || u.organizerPending;
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: COLORS.text }}>
                      {u.full_name || u.username || u.name}
                    </td>
                    <td style={{ padding: "10px 8px", color: COLORS.muted }}>@{u.username}</td>
                    <td style={{ padding: "10px 8px", color: COLORS.muted }}>
                      {u.department || "—"} {u.batch ? `(${u.batch})` : ""}
                    </td>
                    <td style={{ padding: "10px 8px", color: COLORS.muted }}>
                      <div>{u.email}</div>
                      {u.phone && <div style={{ fontSize: 12 }}>{u.phone}</div>}
                    </td>
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
                      <div style={{ display: "inline-flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
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
                          <Trash2 size={12} /> {u.id === currentUserId ? "Self" : "Remove"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
          gridTemplateColumns: role !== "participant" ? "repeat(auto-fit, minmax(260px, 1fr))" : "1fr",
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
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: COLORS.text }}>
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
          </div>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
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
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: COLORS.text }}>
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
  onShowEventQr,
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
              flexWrap: "wrap",
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
          <EventTable
            events={events}
            onSelectEvent={onSelectEvent}
            onShowEventQr={onShowEventQr}
            onExportCalendar={onExportCalendar}
          />
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
            My events & Registration QR codes
          </h2>
          <EventTable
            events={mine}
            onSelectEvent={onSelectEvent}
            onShowEventQr={onShowEventQr}
            onExportCalendar={onExportCalendar}
          />
        </div>
      </div>
    );
  }
  const myEvents = events.filter((e) => myEventIds.includes(e.id));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
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
            <strong>Organizer request pending:</strong> Your request to create events is waiting for Admin approval.
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
        <StatCard label="Department" value={user?.department || "Student"} subtext={user?.batch ? `Batch ${user.batch}` : ""} />
      </div>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
        <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, margin: "0 0 12px", color: COLORS.text }}>
          My registrations
        </h2>
        <EventTable events={myEvents} onExportCalendar={onExportCalendar} />
      </div>
    </div>
  );
}

function Sidebar({
  user,
  role,
  isPendingOrganizer,
  pendingCount,
  page,
  setPage,
  onLogout,
  apiConnected,
  darkMode,
  onToggleTheme,
  isMobile,
  mobileMenuOpen,
  onCloseMobileMenu,
}) {
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

  if (isMobile && !mobileMenuOpen) {
    return null;
  }

  const sidebarContent = (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: isMobile ? "min(280px, 84vw)" : 225,
        flexShrink: 0,
        background: COLORS.surface,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: isMobile ? "relative" : "sticky",
        top: 0,
        height: "100vh",
        boxSizing: "border-box",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobileMenu}
            style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", padding: 4 }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: 2, flex: 1, alignContent: "start" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setPage(item.key); if (onCloseMobileMenu) onCloseMobileMenu(); }}
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
          {apiConnected ? "Backend Connected" : "Offline"}
        </div>

        <div style={{ padding: "0 8px" }}>
          <div style={{ fontSize: 12, color: COLORS.faint }}>Signed in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 1 }}>
            {user?.full_name || user?.username || "User"}
          </div>
          {user?.department && (
            <div style={{ fontSize: 11.5, color: COLORS.muted }}>
              {user.department} {user.batch ? `• Batch ${user.batch}` : ""}
            </div>
          )}
          <div
            style={{
              fontSize: 11.5,
              color: isPendingOrganizer ? COLORS.warning : COLORS.primary,
              textTransform: "capitalize",
              fontWeight: 600,
              marginTop: 1,
            }}
          >
            {isPendingOrganizer ? "Participant (Organizer Pending)" : role}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 7,
            border: `1px solid ${COLORS.border}`,
            background: COLORS.surfaceSubtle,
            color: COLORS.text,
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {darkMode ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color={COLORS.muted} />}
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
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

  if (isMobile) {
    return (
      <div
        onClick={onCloseMobileMenu}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.55)",
          zIndex: 95,
          display: "flex",
        }}
      >
        {sidebarContent}
      </div>
    );
  }

  return sidebarContent;
}

function MobileBottomNav({ role, pendingCount, page, setPage }) {
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
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 62,
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`,
        display: "grid",
        gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
        zIndex: 45,
        padding: "4px 6px",
        boxSizing: "border-box",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = page === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setPage(item.key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              border: "none",
              background: "transparent",
              color: active ? COLORS.primary : COLORS.muted,
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Icon size={17} />
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: "22%",
                  background: COLORS.warning,
                  color: "#fff",
                  fontSize: 9.5,
                  fontWeight: 700,
                  padding: "0px 5px",
                  borderRadius: 8,
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default function EventHub() {
  const savedSession = loadSession();
  const isMobile = useIsMobile(768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => loadJsonStorage("eventhub_dark_mode", false));
  const themeStyle = darkMode ? THEME_VARS.dark : THEME_VARS.light;

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      saveJsonStorage("eventhub_dark_mode", next);
      return next;
    });
  }, []);

  const [token, setToken] = useState(savedSession?.access ?? null);
  const [user, setUser] = useState(savedSession?.user ?? null);
  const [apiConnected, setApiConnected] = useState(savedSession?.apiConnected ?? true);

  const [pendingOrganizers, setPendingOrganizers] = useState(() =>
    loadJsonStorage(PENDING_ORG_STORAGE_KEY, [])
  );
  const [approvedOrganizers, setApprovedOrganizers] = useState(() =>
    loadJsonStorage(APPROVED_ORG_STORAGE_KEY, ["testorganizer"])
  );
  const [userProfiles, setUserProfiles] = useState(() =>
    loadJsonStorage(USER_PROFILES_STORAGE_KEY, {
      tahsin: {
        full_name: "Obidul Mostafa Tahsin",
        phone: "01800000000",
        batch: "51st",
        department: "CSE",
      },
    })
  );

  const [qrTargetEventId, setQrTargetEventId] = useState(() => getInitialQrEventId());
  const [authTab, setAuthTab] = useState(() => (getInitialQrEventId() ? "register" : "login"));
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupRole, setSignupRole] = useState("participant");

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
  const [organizerQrEvent, setOrganizerQrEvent] = useState(null);
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
      const profile = userProfiles[u.username] || {};
      const isPending =
        (u.role === "pending_organizer" || pendingOrganizers.includes(u.username)) &&
        !approvedOrganizers.includes(u.username) &&
        u.role !== "admin";
      const isApprovedOrg = approvedOrganizers.includes(u.username) || (u.role === "organizer" && !isPending);
      return {
        ...u,
        full_name: u.full_name || profile.full_name || u.first_name || u.username,
        phone: u.phone || profile.phone || "",
        batch: u.batch || profile.batch || "",
        department: u.department || profile.department || "",
        role: u.role === "admin" ? "admin" : isPending ? "pending_organizer" : isApprovedOrg ? "organizer" : "participant",
        organizerPending: isPending,
      };
    });
  }, [users, userProfiles, pendingOrganizers, approvedOrganizers]);

  const pendingCount = useMemo(
    () => enrichedUsers.filter((u) => u.role === "pending_organizer" || u.organizerPending).length,
    [enrichedUsers]
  );

  const qrScannedEvent = useMemo(() => {
    if (!qrTargetEventId) return null;
    return events.find((e) => Number(e.id) === Number(qrTargetEventId)) || null;
  }, [events, qrTargetEventId]);

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
      if (activeToken && activeToken !== "demo-token") {
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
      if (!activeToken || activeToken === "demo-token") return;
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
      } finally {
        setRefreshing(false);
      }
    },
    [apiFetch, normalizeEvent]
  );

  useEffect(() => {
    if (!user && qrTargetEventId) {
      fetch(`${API_BASE}/events/`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          const rawEvents = Array.isArray(data) ? data : data?.results || [];
          if (rawEvents.length) {
            setEvents(rawEvents.map((ev) => normalizeEvent(ev, INITIAL_VENUES)));
          }
        })
        .catch(() => {});
    }
  }, [user, qrTargetEventId, normalizeEvent]);

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
      const savedProf = userProfiles[me.username] || {};
      const normalizedUser = {
        ...me,
        role: effectiveRole,
        full_name: me.full_name || savedProf.full_name || me.username,
        phone: me.phone || savedProf.phone || "",
        batch: me.batch || savedProf.batch || "",
        department: me.department || savedProf.department || "",
      };

      setToken(tokens.access);
      setUser(normalizedUser);
      setApiConnected(true);
      saveSession({ access: tokens.access, refresh: tokens.refresh, user: normalizedUser, apiConnected: true });
      setPage("home");
      showToast(`Signed in as ${normalizedUser.full_name || normalizedUser.username}`);
      await syncFromBackend(tokens.access, normalizedUser);
    } catch (err) {
      setAuthError(err.message === "Failed to fetch" ? "Could not connect to backend server." : err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegisterAccount(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const fullName = e.target.full_name.value.trim();
    const username = e.target.username.value.trim();
    const email = e.target.email.value.trim();
    const phone = e.target.phone.value.trim();
    const batch = e.target.batch.value.trim();
    const department = e.target.department.value;
    const password = e.target.password.value;
    const requestedAccountType = e.target.role.value;
    const wantsOrganizer = requestedAccountType === "organizer_request";

    const profileData = { full_name: fullName, phone, batch, department };

    try {
      const data = await apiFetch("/auth/register/", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          role: "participant",
          full_name: fullName,
          phone,
          batch,
          department,
        }),
      });

      const nextProfiles = { ...userProfiles, [username]: profileData };
      setUserProfiles(nextProfiles);
      saveJsonStorage(USER_PROFILES_STORAGE_KEY, nextProfiles);

      if (wantsOrganizer) {
        const nextPending = Array.from(new Set([...pendingOrganizers, username]));
        setPendingOrganizers(nextPending);
        saveJsonStorage(PENDING_ORG_STORAGE_KEY, nextPending);
      }

      const createdUser = {
        ...data.user,
        ...profileData,
        role: wantsOrganizer ? "pending_organizer" : data.user.role,
      };

      setToken(data.access);
      setUser(createdUser);
      setApiConnected(true);
      saveSession({ access: data.access, refresh: data.refresh, user: createdUser, apiConnected: true });
      setPage("home");
      showToast(wantsOrganizer ? "Account created! Organizer application submitted." : `Welcome, ${fullName}!`);
      if (wantsOrganizer) {
        pushNotification(`Organizer application submitted for @${username}. Waiting for Admin approval.`);
      }
      await syncFromBackend(data.access, createdUser);
    } catch (err) {
      setAuthError(err.message === "Failed to fetch" ? "Could not connect to backend server." : err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleRequestOrganizerFromProfile() {
    if (!user) return;
    const nextPending = Array.from(new Set([...pendingOrganizers, user.username]));
    setPendingOrganizers(nextPending);
    saveJsonStorage(PENDING_ORG_STORAGE_KEY, nextPending);
    setUsers((prev) =>
      prev.map((u) => (u.username === user.username ? { ...u, role: "pending_organizer", organizerPending: true } : u))
    );
    showToast("Organizer request sent to Admin for approval!");
    pushNotification("You requested Organizer privileges. An Admin will review shortly.");
  }

  async function handleApproveOrganizer(targetUser) {
    const uname = targetUser.username || targetUser.name;
    if (apiConnected) {
      try {
        await apiFetch(`/auth/users/${targetUser.id}/role/`, {
          method: "POST",
          body: JSON.stringify({ role: "organizer" }),
        });
      } catch {}
    }
    const nextPending = pendingOrganizers.filter((x) => x !== uname);
    const nextApproved = Array.from(new Set([...approvedOrganizers, uname]));
    setPendingOrganizers(nextPending);
    setApprovedOrganizers(nextApproved);
    saveJsonStorage(PENDING_ORG_STORAGE_KEY, nextPending);
    saveJsonStorage(APPROVED_ORG_STORAGE_KEY, nextApproved);

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: "organizer", organizerPending: false } : u))
    );
    showToast(`Approved ${targetUser.full_name || uname} as Organizer!`);
    pushNotification(`Admin approved @${uname} as Organizer.`);
  }

  async function handleRejectOrganizer(targetUser) {
    const uname = targetUser.username || targetUser.name;
    if (apiConnected) {
      try {
        await apiFetch(`/auth/users/${targetUser.id}/role/`, {
          method: "POST",
          body: JSON.stringify({ role: "participant" }),
        });
      } catch {}
    }
    const nextPending = pendingOrganizers.filter((x) => x !== uname);
    setPendingOrganizers(nextPending);
    saveJsonStorage(PENDING_ORG_STORAGE_KEY, nextPending);
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
      } catch {}
    }
    const nextApproved = approvedOrganizers.filter((x) => x !== uname);
    const nextPending = pendingOrganizers.filter((x) => x !== uname);
    setApprovedOrganizers(nextApproved);
    setPendingOrganizers(nextPending);
    saveJsonStorage(APPROVED_ORG_STORAGE_KEY, nextApproved);
    saveJsonStorage(PENDING_ORG_STORAGE_KEY, nextPending);
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: "participant", organizerPending: false } : u))
    );
    showToast(`Updated ${uname} role to Participant`);
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    saveSession(null);
    setPage("home");
  }

  function clearQrUrlParam() {
    setQrTargetEventId(null);
    try {
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch {}
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
        showToast(`Registered for "${ev.title}"!`);
        pushNotification(`Registered for "${ev.title}" on ${ev.date}.`);
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
                  full_name: user.full_name || user.username,
                  email: user.email,
                  phone: user.phone || "",
                  batch: user.batch || "",
                  department: user.department || "",
                  registered_at: new Date().toISOString().slice(0, 10),
                },
              ],
            }
          : e
      )
    );
    setMyEventIds([...myEventIds, eventId]);
    showToast(`Registered for "${ev.title}"!`);
    pushNotification(`Registered for "${ev.title}" on ${ev.date}.`);
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
        const createdRaw = await apiFetch("/events/", {
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
        const createdNorm = normalizeEvent(createdRaw, [...venues, venueObj]);
        setOrganizerQrEvent(createdNorm);
        showToast("Event created! Registration QR code generated.");
        pushNotification(`New event published: "${title}" on ${date}.`);
        return;
      }

      const conflict = events.some(
        (ev) => ev.venueName.toLowerCase() === venueObj.name.toLowerCase() && ev.date === date && ev.time === time
      );
      if (conflict) {
        setFormError(`${venueObj.name} is already booked on ${date} at ${time}.`);
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
      setOrganizerQrEvent(newEvent);
      showToast("Event created! Registration QR code generated.");
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

  function handleCopyRegistrationLink(url) {
    copyTextToClipboard(url);
    showToast("Event registration link copied to clipboard!");
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
    const iconInputWrap = { position: "relative", display: "flex", alignItems: "center" };
    const leftIconStyle = { position: "absolute", left: 12, color: COLORS.faint, pointerEvents: "none" };
    const authInputStyle = {
      ...inputStyle,
      padding: "10px 12px 10px 36px",
      borderRadius: 9,
      border: `1px solid ${COLORS.borderStrong}`,
      background: COLORS.surfaceSubtle,
      color: COLORS.text,
      fontSize: 13.5,
      transition: "all 0.15s ease",
    };

    return (
      <div
        style={{
          ...themeStyle,
          minHeight: "100vh",
          background: darkMode
            ? "linear-gradient(135deg, #060911 0%, #0F172A 50%, #060911 100%)"
            : "linear-gradient(135deg, #E2E8F0 0%, #F8FAFC 50%, #E2E8F0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          padding: "24px 16px",
          transition: "background 0.2s ease",
        }}
      >
        <div
          style={{
            width: "min(1020px, 100%)",
            background: COLORS.surface,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 25px 70px rgba(0, 0, 0, 0.45)",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(340px, 1fr))",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(155deg, #1E3A8A 0%, #2451DB 55%, #1D4ED8 100%)",
              color: "#FFFFFF",
              padding: isMobile ? "24px 20px" : "42px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.18)",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    <Ticket size={20} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em" }}>EventHub</span>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 10px",
                    borderRadius: 20,
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Sparkles size={12} /> CAMPUS PORTAL
                </span>
              </div>

              <h2
                style={{
                  fontSize: isMobile ? 21 : 28,
                  fontWeight: 800,
                  lineHeight: 1.22,
                  margin: "0 0 12px",
                  letterSpacing: "-0.02em",
                }}
              >
                Discover, organize, and manage campus events in one place.
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.84)",
                  lineHeight: 1.6,
                  margin: "0 0 28px",
                }}
              >
                A unified platform for students, club organizers, and administrators with QR code event registration
                and automated venue scheduling.
              </p>

              <div style={{ display: "grid", gap: 12 }}>
                {[
                  {
                    icon: QrCode,
                    title: "QR Code Event Registration",
                    desc: "Scan an event's QR poster to jump straight to registration.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Verified Organizer Workflow",
                    desc: "Role-based access with Admin approval for club organizers.",
                  },
                  {
                    icon: CalendarPlus,
                    title: "One-Click Google Calendar",
                    desc: "Sync workshops, competitions, and career fairs in one click.",
                  },
                ].map((item, idx) => {
                  const FeatureIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "rgba(255, 255, 255, 0.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <FeatureIcon size={16} color="#FFFFFF" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.78)", lineHeight: 1.4 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: isMobile ? "24px 20px" : "36px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: COLORS.surface,
              color: COLORS.text,
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 11px",
                    borderRadius: 20,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surfaceSubtle,
                    color: COLORS.text,
                    fontFamily: FONT,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {darkMode ? <Sun size={14} color="#FBBF24" /> : <Moon size={14} color={COLORS.muted} />}
                  {darkMode ? "Light mode" : "Dark mode"}
                </button>
              </div>

              {qrTargetEventId && (
                <div
                  style={{
                    background: COLORS.primaryTint,
                    border: `1px solid ${COLORS.primary}`,
                    borderRadius: 10,
                    padding: "11px 14px",
                    marginBottom: 18,
                    fontSize: 12.5,
                    color: COLORS.text,
                    lineHeight: 1.45,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.primary, fontWeight: 700, marginBottom: 2 }}>
                    <QrCode size={15} /> QR Event Registration Invite
                  </div>
                  {qrScannedEvent ? (
                    <span>
                      Sign in or create an account below to register for <strong>{qrScannedEvent.title}</strong> (
                      {qrScannedEvent.date} &middot; {qrScannedEvent.venueName}).
                    </span>
                  ) : (
                    <span>Sign in or create a student account below to complete your event registration.</span>
                  )}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  background: COLORS.tabBg,
                  padding: 4,
                  borderRadius: 10,
                  marginBottom: 20,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthError("");
                    setAuthTab("login");
                  }}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: authTab === "login" ? COLORS.surface : "transparent",
                    color: authTab === "login" ? COLORS.text : COLORS.muted,
                    boxShadow: authTab === "login" ? "0 2px 8px rgba(15, 23, 42, 0.08)" : "none",
                    fontFamily: FONT,
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
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
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: authTab === "register" ? COLORS.surface : "transparent",
                    color: authTab === "register" ? COLORS.text : COLORS.muted,
                    boxShadow: authTab === "register" ? "0 2px 8px rgba(15, 23, 42, 0.08)" : "none",
                    fontFamily: FONT,
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Create account
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h1
                  style={{
                    fontFamily: FONT,
                    fontSize: 21,
                    fontWeight: 800,
                    color: COLORS.text,
                    margin: "0 0 4px",
                  }}
                >
                  {authTab === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p style={{ fontFamily: FONT, fontSize: 13, color: COLORS.muted, margin: 0 }}>
                  {authTab === "login"
                    ? "Enter your credentials to access your dashboard."
                    : "Fill in your official student or organizer details below."}
                </p>
              </div>

              <ErrorBanner message={authError} />

              {authTab === "login" ? (
                <form onSubmit={handleLogin}>
                  <Field label="Username">
                    <div style={iconInputWrap}>
                      <UserIcon size={16} style={leftIconStyle} />
                      <input
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        required
                        style={authInputStyle}
                      />
                    </div>
                  </Field>

                  <Field label="Password">
                    <div style={iconInputWrap}>
                      <Lock size={16} style={leftIconStyle} />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        style={{ ...authInputStyle, paddingRight: 38 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: 10,
                          background: "none",
                          border: "none",
                          color: "#94A3B8",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={authLoading}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      marginTop: 8,
                      borderRadius: 9,
                      fontSize: 14,
                      fontWeight: 600,
                      boxShadow: "0 4px 14px rgba(36, 81, 219, 0.3)",
                    }}
                  >
                    {authLoading ? "Signing in..." : "Sign in to EventHub"} <ArrowRight size={15} />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegisterAccount}>
                  <Field label="Select account type">
                    <input type="hidden" name="role" value={signupRole} />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                      {[
                        {
                          key: "participant",
                          title: "Participant",
                          sub: "Browse & book events",
                          badge: "Instant access",
                          badgeBg: COLORS.successTint,
                          badgeColor: COLORS.success,
                          icon: Ticket,
                        },
                        {
                          key: "organizer_request",
                          title: "Organizer",
                          sub: "Create & host events",
                          badge: "Admin approval",
                          badgeBg: COLORS.warningTint,
                          badgeColor: COLORS.warning,
                          icon: ShieldCheck,
                        },
                      ].map((opt) => {
                        const OptIcon = opt.icon;
                        const selected = signupRole === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setSignupRole(opt.key)}
                            style={{
                              textAlign: "left",
                              padding: "9px 11px",
                              borderRadius: 10,
                              border: selected ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.borderStrong}`,
                              background: selected ? COLORS.primaryTint : COLORS.surfaceSubtle,
                              cursor: "pointer",
                              fontFamily: FONT,
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <OptIcon size={15} color={selected ? COLORS.primary : "#64748B"} />
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: opt.badgeBg,
                                  color: opt.badgeColor,
                                }}
                              >
                                {opt.badge}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{opt.title}</div>
                            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 1 }}>{opt.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    <Field label="1. Full Name (Official)">
                      <div style={iconInputWrap}>
                        <UserIcon size={15} style={leftIconStyle} />
                        <input
                          name="full_name"
                          type="text"
                          placeholder="e.g. Obidul Mostafa"
                          required
                          style={authInputStyle}
                        />
                      </div>
                    </Field>

                    <Field label="2. Username">
                      <div style={iconInputWrap}>
                        <UserIcon size={15} style={leftIconStyle} />
                        <input
                          name="username"
                          type="text"
                          placeholder="e.g. tahsin_01"
                          required
                          style={authInputStyle}
                        />
                      </div>
                    </Field>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    <Field label="3. Personal Email">
                      <div style={iconInputWrap}>
                        <Mail size={15} style={leftIconStyle} />
                        <input
                          name="email"
                          type="email"
                          placeholder="you@gmail.com"
                          required
                          style={authInputStyle}
                        />
                      </div>
                    </Field>

                    <Field label="4. Phone Number">
                      <div style={iconInputWrap}>
                        <Phone size={15} style={leftIconStyle} />
                        <input
                          name="phone"
                          type="tel"
                          placeholder="e.g. 017XXXXXXXX"
                          required
                          style={authInputStyle}
                        />
                      </div>
                    </Field>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    <Field label="5. Batch">
                      <div style={iconInputWrap}>
                        <GraduationCap size={15} style={leftIconStyle} />
                        <input
                          name="batch"
                          type="text"
                          placeholder="e.g. 52nd"
                          required
                          style={authInputStyle}
                        />
                      </div>
                    </Field>

                    <Field label="6. Department">
                      <div style={iconInputWrap}>
                        <BookOpen size={15} style={leftIconStyle} />
                        <select name="department" defaultValue="CSE" required style={authInputStyle}>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>
                  </div>

                  <Field label="Password (min 6 characters)">
                    <div style={iconInputWrap}>
                      <Lock size={15} style={leftIconStyle} />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        minLength={6}
                        placeholder="Create a strong password"
                        required
                        style={{ ...authInputStyle, paddingRight: 38 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: 10,
                          background: "none",
                          border: "none",
                          color: "#94A3B8",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={authLoading}
                    style={{
                      width: "100%",
                      padding: "11px 16px",
                      marginTop: 4,
                      borderRadius: 9,
                      fontSize: 14,
                      fontWeight: 600,
                      boxShadow: "0 4px 14px rgba(36, 81, 219, 0.3)",
                    }}
                  >
                    {authLoading
                      ? "Creating account..."
                      : signupRole === "organizer_request"
                      ? "Submit Organizer Application"
                      : "Create Account & Continue"}{" "}
                    <ArrowRight size={15} />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...themeStyle,
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: FONT,
        color: COLORS.text,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <Sidebar
        user={user}
        role={role}
        isPendingOrganizer={isPendingOrganizer}
        pendingCount={pendingCount}
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
        apiConnected={apiConnected}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />

      <div style={{ flex: 1, minWidth: 0, paddingBottom: isMobile ? 70 : 0 }}>
        <header
          style={{
            minHeight: 60,
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: isMobile ? "10px 14px" : "0 28px",
            background: COLORS.surface,
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: isMobile ? 42 : 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{
                    background: "none",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 7,
                    padding: "6px 8px",
                    color: COLORS.text,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Menu size={17} />
                </button>
              )}
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
                  <RefreshCw size={13} /> {!isMobile && (refreshing ? "Syncing..." : "Refresh")}
                </Button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!isMobile && page === "home" && (
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
                </>
              )}

              {page === "home" && role !== "participant" && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setFormError("");
                    setShowCreateForm(true);
                  }}
                  style={isMobile ? { padding: "7px 10px", fontSize: 12.5 } : {}}
                >
                  <Plus size={15} /> {isMobile ? "New" : "New event"}
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={toggleTheme}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                style={{ padding: "8px 10px" }}
              >
                {darkMode ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color={COLORS.muted} />}
              </Button>

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
                      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Notifications</span>
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
                              color: COLORS.text,
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
          </div>

          {isMobile && page === "home" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: 8, marginTop: 8 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} color={COLORS.faint} style={{ position: "absolute", left: 10, top: 11 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  style={{ ...inputStyle, width: "100%", paddingLeft: 30, fontSize: 13 }}
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputStyle, width: "100%", fontSize: 13 }}
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>

        <main style={{ padding: isMobile ? "16px 14px 80px" : "24px 28px 60px" }}>
          {toast && (
            <div
              style={{
                position: "fixed",
                top: 20,
                right: 24,
                background: COLORS.text,
                color: darkMode ? "#151A26" : "#fff",
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
                <strong>Organizer approval pending:</strong> Your account is active as a Participant while Admin reviews.
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
                    onShowEventQr={setOrganizerQrEvent}
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
              onShowEventQr={setOrganizerQrEvent}
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

      {isMobile && (
        <MobileBottomNav role={role} pendingCount={pendingCount} page={page} setPage={setPage} />
      )}

      {organizerQrEvent && (
        <EventRegistrationQrModal
          event={organizerQrEvent}
          onClose={() => setOrganizerQrEvent(null)}
          onCopyLink={handleCopyRegistrationLink}
          onSimulateScan={(ev) => {
            setOrganizerQrEvent(null);
            setQrTargetEventId(ev.id);
          }}
        />
      )}

      {qrScannedEvent && (
        <QrScannedRegistrationModal
          event={qrScannedEvent}
          user={user}
          isRegistered={myEventIds.includes(qrScannedEvent.id)}
          onConfirmRegister={handleRegisterEvent}
          onOpenCalendar={handleExportCalendar}
          onClose={clearQrUrlParam}
          busy={busyEventId === qrScannedEvent.id}
        />
      )}

      {viewingEvent && (
        <Modal title={viewingEvent.title} onClose={() => setViewingEvent(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <CategoryChip category={viewingEvent.category} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  const ev = viewingEvent;
                  setViewingEvent(null);
                  setOrganizerQrEvent(ev);
                }}
                style={{ padding: "5px 10px", fontSize: 12 }}
              >
                <QrCode size={13} /> Registration QR
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleExportCalendar(viewingEvent)}
                style={{ padding: "5px 10px", fontSize: 12 }}
              >
                <CalendarPlus size={13} /> Google Calendar
              </Button>
            </div>
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
              color: COLORS.text,
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
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, color: COLORS.text }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}` }}>
                        <th style={{ padding: "7px 10px" }}>Participant</th>
                        <th style={{ padding: "7px 10px" }}>Dept / Batch</th>
                        <th style={{ padding: "7px 10px" }}>Email</th>
                        <th style={{ padding: "7px 10px" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingEvent.participants.map((p, idx) => {
                        const prof = userProfiles[p.username] || {};
                        return (
                          <tr key={p.id || idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <td style={{ padding: "7px 10px", fontWeight: 500 }}>
                              {p.full_name || prof.full_name || p.username}
                            </td>
                            <td style={{ padding: "7px 10px", color: COLORS.muted }}>
                              {p.department || prof.department || "—"}{" "}
                              {p.batch || prof.batch ? `(${p.batch || prof.batch})` : ""}
                            </td>
                            <td style={{ padding: "7px 10px", color: COLORS.muted }}>{p.email}</td>
                            <td style={{ padding: "7px 10px", color: COLORS.muted }}>{p.registered_at}</td>
                          </tr>
                        );
                      })}
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
              Create event & Generate Registration QR
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
