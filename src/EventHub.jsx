import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar, MapPin, Users, Clock, Plus, Search, Shield, CheckCircle2, LogOut,
  Moon, Sun, X, QrCode, Check, User, ArrowRight, Sparkles, Lock, Mail, Phone,
  GraduationCap, Building2,
} from "lucide-react";

const API_BASE = (import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const CATS = ["All", "Workshop", "Competition", "Cultural", "Career"];
const IMG = { Workshop: "workshop", Competition: "competition", Cultural: "cultural", Career: "career" };
const imgOf = (e) => `/${IMG[e?.category] || "general"}.svg`;
// [image, left %, top %, width vw, rotation, float delay s]
const WP = "https://pd.w.org/"; // free CC0 flower photos (WordPress Photo Directory)
const TILES = [
  [WP + "2026/04/85569f38208cd2f95.73515056-768x1365.jpg", 3, 4, 14, -4, 0],
  ["workshop", 15, 30, 12, 4, 1.2],
  [WP + "2025/08/93468a02258c586d8.34940109-768x512.jpg", 2, 37, 13, -3, 2.2],
  ["cultural", 14, 58, 14, 4, 0.9],
  ["sports", 1, 76, 12, -5, 1.6],
  [WP + "2025/04/88067fc9e132b6a07.16929199-768x432.jpg", 82, 4, 14, 4, 0.4],
  ["hackathon", 73, 24, 12, -3, 1.8],
  [WP + "2026/05/35569f7659633f9d6.48417481-768x1024.jpeg", 85, 38, 12.5, 3, 0.7],
  ["career", 73, 56, 12, -4, 2.6],
  ["music", 86, 62, 10.5, 5, 0.3],
  ["fest", 72, 82, 14, -3, 1.1],
  ["techtalk", 41, -4, 13, 2, 0.6],
  ["general", 38, 84, 14, -2, 1.9],
];
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const BLANK_EVENT = {
  title: "", description: "", category: "Workshop", date: "", time: "10:00",
  venue: "", capacity: 100, registration_deadline: "",
};

const STEPS = [
  [User, "Create your account", "Sign up as a student, or apply to become an organizer. It takes under a minute."],
  [Search, "Find and book an event", "Browse workshops, competitions, cultural fests and career fairs, then register in one tap."],
  [QrCode, "Walk in with your QR pass", "Get an instant digital pass and add the event to your Google Calendar."],
];
const FEATURES = [
  [CheckCircle2, "One-tap registration", "See live seat counts and deadlines before you book, and cancel any time."],
  [QrCode, "Instant QR passes", "Every booking comes with a digital pass for quick, paperless entry."],
  [Calendar, "Calendar sync", "Add any event to Google Calendar so you never miss it."],
  [MapPin, "Smart venue booking", "A venue can’t be double-booked at the same date and time."],
  [Users, "Organizer tools", "Publish, edit and manage events, and see exactly who registered."],
  [Shield, "Admin control", "Approve organizers and manage members from one place."],
];
const ROLES = [
  [GraduationCap, "Participants", ["Discover events by category", "Register and cancel in one tap", "Keep every pass in My Bookings"]],
  [Building2, "Organizers", ["Host events with capacity and deadlines", "Edit details any time", "See the participant list live"]],
  [Shield, "Admins", ["Approve organizer requests", "Manage members and roles", "Full control via the admin panel"]],
];
const SectionHead = ({ kicker, title, text }) => (
  <div className="mx-auto mb-10 max-w-2xl text-center">
    <p className="text-sm font-semibold text-brand">{kicker}</p>
    <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
    {text && <p className="mt-3 text-mute">{text}</p>}
  </div>
);
const cx = (...a) => a.filter(Boolean).join(" ");
const list = (d) => (Array.isArray(d) ? d : d?.results || []);
const dparts = (s) => { const [, m, d] = (s || "").split("-"); return { m: MON[+m - 1] || "—", d: d || "—" }; };
const left = (e) => (e.capacity || 100) - (e.registered_count || 0);
const hm = (t) => (t || "").slice(0, 5);
const today = () => new Date().toLocaleDateString("en-CA");
const closed = (e) => !!e.registration_deadline && e.registration_deadline < today();
const errText = (d, fb) => {
  if (!d) return fb;
  if (d.detail) return d.detail;
  const v = Object.values(d)[0];
  return Array.isArray(v) ? v[0] : typeof v === "string" ? v : fb;
};

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

/* ---------- UI primitives ---------- */
const Btn = ({ v = "primary", className, ...p }) => {
  const s = {
    primary: "bg-brand text-white shadow-sm shadow-brand/25 hover:brightness-110",
    soft: "bg-brand/10 text-brand hover:bg-brand/15",
    ghost: "border border-line bg-surface hover:bg-sunken",
    danger: "border border-rose-500/30 text-rose-500 hover:bg-rose-500/10",
    dark: "bg-ink text-bg hover:opacity-90",
    accent: "bg-accent text-slate-950 shadow-lg shadow-accent/30 hover:brightness-110",
  }[v];
  return (
    <button
      {...p}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
        s, className
      )}
    />
  );
};

const inputCls =
  "w-full rounded-xl border border-line bg-sunken px-3.5 py-2.5 text-sm outline-none transition placeholder:text-mute/60 focus:border-brand focus:ring-4 focus:ring-brand/15";
const Field = ({ label, className, options, ...p }) => (
  <label className={cx("block", className)}>
    <span className="mb-1.5 block text-xs font-medium text-mute">{label}</span>
    {options ? <select {...p} className={inputCls}>{options}</select>
      : p.rows ? <textarea {...p} className={inputCls} />
      : <input {...p} className={inputCls} />}
  </label>
);

const Seg = ({ value, onChange, items }) => (
  <div className="inline-flex rounded-xl bg-sunken p-1">
    {items.map(([id, label]) => (
      <button
        key={id} type="button" onClick={() => onChange(id)}
        className={cx("rounded-lg px-4 py-1.5 text-sm font-semibold transition",
          value === id ? "bg-surface text-ink shadow-sm" : "text-mute hover:text-ink")}
      >{label}</button>
    ))}
  </div>
);

function Modal({ onClose, side, panel, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      className={cx("anim-fade fixed inset-0 z-50 flex bg-black/55 backdrop-blur-sm", side ? "justify-end" : "items-center justify-center p-4")}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={side
          ? "anim-slide h-full w-full max-w-md overflow-y-auto bg-surface shadow-2xl"
          : cx("anim-pop max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-surface shadow-2xl", panel)}
      >{children}</div>
    </div>
  );
}

const CloseBtn = ({ onClick }) => (
  <button onClick={onClick} aria-label="Close" className="rounded-full p-2 text-mute transition hover:bg-sunken hover:text-ink">
    <X className="h-4 w-4" />
  </button>
);

const DEMO_USERS = {
  participant: { id: 900001, username: "demo_participant", full_name: "Demo Participant", role: "participant", email: "participant@demo.test", phone: "+880 1700-000001", department: "CSE", batch: "2022-26", demo: true },
  organizer: { id: 900002, username: "demo_organizer", full_name: "Demo Organizer", role: "organizer", email: "organizer@demo.test", phone: "+880 1700-000002", department: "CSE", batch: "Faculty", demo: true },
};
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString("en-CA"); };
function demoSeed(role) {
  const venues = [
    { id: 1, name: "Main Auditorium", location: "Academic Building, Floor 1", capacity: 300 },
    { id: 2, name: "Innovation Lab", location: "CSE Building, Floor 2", capacity: 60 },
    { id: 3, name: "Open Stage", location: "Central Field", capacity: 500 },
    { id: 4, name: "Conference Room", location: "Admin Block", capacity: 80 },
  ];
  const own = DEMO_USERS.organizer.id;
  const person = (i, n) => ({ id: 100 + i, username: n, email: `${n}@demo.test`, registered_at: new Date().toISOString() });
  const mk = (id, title, category, days, time, venue, capacity, registered_count, organizer, description, participants = []) => ({
    id, title, category, date: addDays(days), time, venue, venue_name: venues.find((v) => v.id === venue).name,
    capacity, registered_count, registration_deadline: addDays(days - 1), organizer, description, participants,
  });
  const events = [
    mk(1, "Intro to Machine Learning", "Workshop", 5, "10:00", 2, 60, 41, own, "Hands-on beginner session: build and train your first model.", [person(1, "rafi"), person(2, "nusrat"), person(3, "imran")]),
    mk(2, "Campus Hackathon", "Competition", 9, "09:00", 2, 60, 38, own, "24-hour team coding challenge with prizes.", [person(4, "sadia"), person(5, "tanvir")]),
    mk(3, "Cultural Night", "Cultural", 12, "18:00", 3, 500, 212, 1, "Music, dance and drama performances by student clubs."),
    mk(4, "Career Fair", "Career", 15, "11:00", 1, 300, 187, 1, "Meet recruiters and alumni from leading companies."),
    mk(5, "Photography Walk", "Workshop", 20, "08:00", 4, 80, 22, 1, "Golden-hour photo walk with tips from a pro."),
  ];
  const regs = role === "participant" ? [{ id: 1, event: 3, event_title: "Cultural Night", status: "registered", registered_at: new Date().toISOString() }] : [];
  return { venues, events, regs };
}

const MenuItem = ({ icon: I, badge, danger, children, ...p }) => (
  <button {...p} className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-sunken", danger ? "text-rose-500" : "text-ink")}>
    <I className={cx("h-4 w-4 shrink-0", danger ? "text-rose-500" : "text-mute")} />
    {children}
    {!!badge && <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">{badge}</span>}
  </button>
);

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white">
      <Calendar className="h-5 w-5" />
    </div>
    <span className="font-display text-xl font-extrabold tracking-tight">Event Management</span>
  </div>
);

const Avatar = ({ u, size = "h-8 w-8 text-sm" }) => (
  <div className={cx("grid shrink-0 place-items-center rounded-full bg-brand font-bold uppercase text-white", size)}>
    {(u?.full_name || u?.username || "U")[0]}
  </div>
);

const Meta = ({ icon: I, children }) => (
  <div className="flex items-center gap-2.5 text-sm text-mute">
    <I className="h-4 w-4 shrink-0 text-brand" /><span className="truncate">{children}</span>
  </div>
);

const Banner = ({ e, className }) => {
  const d = dparts(e.date);
  return (
    <div className={cx("relative overflow-hidden bg-sunken", className)}>
      <img src={imgOf(e)} alt={`${e.category || "Event"} poster`} loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/10" />
      <div className="relative flex items-start justify-between p-4">
        <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{e.category}</span>
        <div className="rounded-xl bg-white px-2.5 py-1.5 text-center text-stone-900 shadow-md">
          <div className="text-[9px] font-bold tracking-widest text-stone-500">{d.m}</div>
          <div className="font-display text-lg font-extrabold leading-none">{d.d}</div>
        </div>
      </div>
    </div>
  );
};

const Seats = ({ e }) => {
  const cap = e.capacity || 100, n = e.registered_count || 0;
  const pct = Math.min(100, Math.round((n / cap) * 100));
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className={cx("font-medium", left(e) <= 0 ? "text-rose-500" : "text-mute")}>
          {left(e) > 0 ? `${left(e)} seats left` : "Sold out"}
        </span>
        <span className="font-semibold">{n}/{cap}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
        <div className={cx("h-full rounded-full transition-all duration-500", pct >= 90 ? "bg-rose-500" : "bg-brand")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Stat = ({ icon: I, value, label }) => (
  <div className="rounded-2xl border border-line bg-surface p-4">
    <I className="h-4 w-4 text-brand" />
    <div className="font-display mt-3 text-2xl font-extrabold">{value}</div>
    <div className="text-xs text-mute">{label}</div>
  </div>
);

const Empty = ({ icon: I, title, text, children }) => (
  <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand"><I className="h-6 w-6" /></div>
    <p className="font-display text-lg font-bold">{title}</p>
    <p className="mx-auto mt-1 max-w-sm text-sm text-mute">{text}</p>
    <div className="mt-5">{children}</div>
  </div>
);

/* ---------- App ---------- */
export default function EventHub() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("eh_user")); } catch { return null; } });
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [tab, setTab] = useState("welcome");
  const [authMode, setAuthMode] = useState("signin");
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [detail, setDetail] = useState(null);
  const [qr, setQr] = useState(null);
  const [pass, setPass] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [menu, setMenu] = useState(false);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [reg, setReg] = useState({
    username: "", password: "", email: "", full_name: "", phone: "",
    batch: "", department: "CSE", apply_organizer: false,
  });
  const [draft, setDraft] = useState(BLANK_EVENT);

  const token = user?.token;
  const isAdmin = user?.role === "admin";
  const isDemo = !!user?.demo;
  const isStaff = isAdmin || user?.role === "organizer";
  const notify = (type, text) => setToast({ type, text, k: Date.now() });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("eh_dark", dark);
  }, [dark]);

  useEffect(() => {
    if (!menu) return;
    const k = (e) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [menu]);

  const load = useCallback(async () => {
    if (user?.demo) return; // demo mode never touches the backend
    setLoading(true);
    try {
      const [ev, vn] = await Promise.all([api("/events/", { token }), api("/venues/", { token })]);
      if (ev.ok) { const evs = list(ev.data); setEvents(evs); setDetail((d) => d && (evs.find((x) => x.id === d.id) || null)); }
      if (vn.ok) setVenues(list(vn.data));
      if (user) {
        const [rg, us] = await Promise.all([
          api("/registrations/", { token }),
          isAdmin ? api("/auth/users/", { token }) : null,
        ]);
        if (rg.status === 401) {
          localStorage.removeItem("eh_user"); localStorage.removeItem("eh_token");
          setUser(null); notify("warning", "Session expired. Please log in again.");
          return;
        }
        if (rg.ok) setRegs(list(rg.data));
        if (us?.ok) setUsers(list(us.data));
      } else setRegs([]);
    } catch {
      /* API offline */
    } finally {
      setLoading(false);
    }
  }, [token, user, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const finishAuth = (data, msg) => {
    const u = { ...data.user, token: data.access };
    setUser(u);
    localStorage.setItem("eh_user", JSON.stringify(u));
    localStorage.setItem("eh_token", data.access);
    notify("success", msg);
    setTab("home");
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { ok, data } = await api("/auth/login/", { method: "POST", body: login });
      if (!ok) return notify("error", errText(data, "Invalid login credentials."));
      let u = data.user;
      if (!u) u = (await api("/auth/me/", { token: data.access })).data;
      finishAuth({ user: u, access: data.access }, `Welcome back, ${u?.full_name || u?.username}!`);
    } catch { notify("error", "Backend unreachable. Make sure the server is running."); }
    finally { setBusy(false); }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...reg, role: "participant", requested_role: reg.apply_organizer ? "organizer" : null };
      const { ok, data } = await api("/auth/register/", { method: "POST", body });
      ok ? finishAuth(data, "Account created! You can now register for events.")
        : notify("error", errText(data, "Registration failed."));
    } catch { notify("error", "Server connection error during sign up."); }
    finally { setBusy(false); }
  };

  const startDemo = (role) => {
    const { venues: vn, events: ev, regs: rg } = demoSeed(role);
    setUser(DEMO_USERS[role]); setVenues(vn); setEvents(ev); setRegs(rg); setUsers([]);
    setLoading(false); setTab("home"); setMenu(false);
    notify("success", `Demo ${role} mode: try anything, nothing is saved.`);
  };

  const logout = () => {
    if (user?.demo) { setEvents([]); setVenues([]); }
    setUser(null); setRegs([]); setUsers([]); setTab(user?.demo ? "welcome" : "home");
    localStorage.removeItem("eh_user");
    localStorage.removeItem("eh_token");
  };

  const bump = (id, delta, p) => {
    const next = events.map((e) => e.id !== id ? e : {
      ...e,
      registered_count: Math.max(0, (e.registered_count || 0) + delta),
      participants: delta > 0 ? [...(e.participants || []), p] : (e.participants || []).filter((x) => x.username !== user.username),
    });
    setEvents(next);
    setDetail((d) => d && (next.find((x) => x.id === d.id) || null));
  };
  const demoAction = (id, kind) => {
    const e = events.find((x) => x.id === id);
    if (!e) return;
    const active = regs.find((r) => r.event === id && r.status === "registered");
    if (kind === "register") {
      if (active) return notify("error", "You are already registered for this event.");
      if (closed(e)) return notify("error", "Registration for this event has closed.");
      if (left(e) <= 0) return notify("error", "This event is fully booked.");
      const p = { id: Date.now(), username: user.username, email: user.email, registered_at: new Date().toISOString() };
      setRegs([...regs.filter((r) => r.event !== id), { id: p.id, event: id, event_title: e.title, status: "registered", registered_at: p.registered_at }]);
      bump(id, 1, p);
      notify("success", "You're in! Your pass is ready. (demo)");
    } else {
      if (!active) return notify("error", "You have no active registration for this event.");
      setRegs(regs.map((r) => (r === active ? { ...r, status: "cancelled" } : r)));
      bump(id, -1);
      notify("success", "Registration cancelled. (demo)");
    }
  };

  const eventAction = async (id, kind) => {
    if (!user) {
      notify("warning", "Please sign in or create an account first.");
      setAuthMode("signin"); setTab("profile"); setDetail(null);
      return;
    }
    try {
      if (user.demo) return demoAction(id, kind);
      const { ok, data } = kind === "register"
        ? await api("/registrations/", { method: "POST", token, body: { event: id } })
        : await api(`/events/${id}/cancel/`, { method: "POST", token });
      if (ok) {
        notify("success", kind === "register" ? "You're in! Your pass is ready." : "Registration cancelled.");
        load();
      } else notify("error", errText(data, "Something went wrong."));
    } catch { notify("error", "Server unreachable."); }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    if (user?.demo) {
      const v = venues.find((x) => String(x.id) === String(draft.venue));
      const base = { ...draft, capacity: Number(draft.capacity), venue: Number(draft.venue), venue_name: v?.name || "" };
      const next = editId
        ? events.map((x) => (x.id === editId ? { ...x, ...base } : x))
        : [...events, { id: Date.now(), registered_count: 0, organizer: user.id, participants: [], ...base }];
      next.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      setEvents(next); closeForm(); setDraft(BLANK_EVENT);
      notify("success", editId ? "Event updated. (demo)" : "Event published. (demo)");
      return;
    }
    setBusy(true);
    try {
      const { ok, data } = await api(editId ? `/events/${editId}/` : "/events/", { method: editId ? "PATCH" : "POST", token, body: draft });
      if (ok) { closeForm(); setDraft(BLANK_EVENT); notify("success", editId ? "Event updated." : "Event published."); load(); }
      else notify("error", errText(data, "Could not publish event."));
    } catch { notify("error", "Server unreachable."); }
    finally { setBusy(false); }
  };

  const closeForm = () => { setCreating(false); setEditId(null); };
  const openEdit = (e) => {
    setDraft({ title: e.title, description: e.description, category: e.category, date: e.date, time: hm(e.time),
      venue: e.venue, capacity: e.capacity, registration_deadline: e.registration_deadline });
    setEditId(e.id); setDetail(null); setCreating(true);
  };
  const deleteEvent = async (e) => {
    if (!window.confirm(`Delete "${e.title}"? This also removes its registrations.`)) return;
    if (user?.demo) {
      setEvents(events.filter((x) => x.id !== e.id)); setRegs(regs.filter((r) => r.event !== e.id));
      setDetail(null); notify("success", "Event deleted. (demo)");
      return;
    }
    const { ok, data } = await api(`/events/${e.id}/`, { method: "DELETE", token });
    if (ok) { notify("success", "Event deleted."); setDetail(null); load(); }
    else notify("error", errText(data, "Could not delete event."));
  };
  const setRole = async (id, approveIt) => {
    const body = approveIt ? { role: "organizer", requested_role: null } : { requested_role: null };
    const { ok, data } = await api(`/auth/users/${id}/`, { method: "PATCH", token, body });
    if (ok) { notify("success", approveIt ? "Organizer approved." : "Request declined."); load(); }
    else notify("error", errText(data, "Update failed."));
  };
  const removeUser = async (u) => {
    if (!window.confirm(`Remove ${u.username}? This cannot be undone.`)) return;
    const { ok, data } = await api(`/auth/users/${u.id}/`, { method: "DELETE", token });
    if (ok) { notify("success", "User removed."); load(); } else notify("error", errText(data, "Could not remove user."));
  };

  const gcal = (e) => {
    const d = (e.date || "").replace(/-/g, "");
    const t = (e.time || "10:00").replace(/:/g, "").slice(0, 4) + "00";
    const p = new URLSearchParams({
      action: "TEMPLATE", text: e.title || "", details: e.description || "",
      location: e.venue_name || "Campus Venue", dates: `${d}T${t}/${d}T${t}`,
    });
    window.open(`https://calendar.google.com/calendar/render?${p}`, "_blank");
  };

  const filtered = useMemo(
    () => events.filter((e) =>
      (cat === "All" || e.category === cat) &&
      `${e.title} ${e.description}`.toLowerCase().includes(q.toLowerCase())),
    [events, cat, q]
  );
  const venueOf = (e) => venues.find((v) => v.id === e.venue);
  const canManage = (e) => isAdmin || (user?.role === "organizer" && e.organizer === user.id);
  const cta = isStaff
    ? ["Host your first event", () => { setDraft(BLANK_EVENT); setEditId(null); setCreating(true); }]
    : user ? ["Browse events", () => setTab("home")] : ["Create your account", () => goLogin("signup")];
  const soon = events.filter((e) => (e.date || "") >= today()).slice(0, 3);
  const mine = regs.filter((r) => r.status === "registered");
  const isReg = (id) => !!user && mine.some((r) => (r.event?.id ?? r.event) === id);
  const first = (user?.full_name || user?.username || "").split(" ")[0];
  const pending = users.filter((u) => u.requested_role === "organizer" && u.role !== "organizer").length;

  const goLogin = (mode = "signin") => { setAuthMode(mode); setTab("profile"); };
  const pick = (fn) => () => { setMenu(false); fn(); };

  const actions = (e, full) =>
    isReg(e.id) ? (
      <>
        <Btn className={full && "flex-1"} onClick={() => setPass(e)}><QrCode className="h-4 w-4" />View pass</Btn>
        <Btn v="danger" onClick={() => eventAction(e.id, "cancel")}>Cancel</Btn>
      </>
    ) : (
      <Btn className={full && "flex-1"} disabled={left(e) <= 0 || closed(e)} onClick={() => eventAction(e.id, "register")}>
        {!user && <Lock className="h-4 w-4" />}
        {left(e) <= 0 ? "Sold out" : closed(e) ? "Registration closed" : user ? "Register" : "Sign in to register"}
      </Btn>
    );

  return (
    <div className="min-h-screen">
      {/* Toast */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
        {toast && (
          <div
            key={toast.k}
            className={cx(
              "anim-pop pointer-events-auto flex items-center gap-2 rounded-full border bg-surface px-4 py-2.5 text-sm font-medium shadow-xl",
              toast.type === "error" ? "border-rose-500/40 text-rose-500"
                : toast.type === "warning" ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {toast.type === "success" && <Check className="h-4 w-4" />}
            {toast.text}
            <button onClick={() => setToast(null)} aria-label="Dismiss"><X className="h-3.5 w-3.5 opacity-60" /></button>
          </div>
        )}
      </div>

      {isDemo && (
        <div className="fixed bottom-4 left-1/2 z-[55] flex -translate-x-1/2 items-center gap-3 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-xl">
          Demo mode · nothing is saved
          <button onClick={logout} className="rounded-full bg-black/10 px-2.5 py-1 transition hover:bg-black/20">Exit demo</button>
        </div>
      )}

      {/* Header */}
      <header className={cx("z-30 text-white", tab === "welcome" ? "absolute inset-x-0 top-0" : "sticky top-0 bg-brand shadow-lg shadow-brand/20")}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button onClick={() => setTab("welcome")} aria-label="Home page"><Logo /></button>
          <div className="flex items-center gap-2">
            {isStaff && tab !== "welcome" && (
              <Btn v="accent" onClick={() => { setDraft(BLANK_EVENT); setEditId(null); setCreating(true); }}>
                <Plus className="h-4 w-4" /><span className="hidden sm:inline">Host event</span>
              </Btn>
            )}
            <button
              onClick={() => setDark(!dark)} aria-label="Toggle theme"
              className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white/20"
            >{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>

            <div className="relative">
              <button
                onClick={() => setMenu(!menu)} aria-label="Open menu" aria-expanded={menu}
                className="flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-3.5 pr-1.5 transition hover:bg-white/20"
              >
                <span className="flex flex-col gap-[3px]">{[0, 1, 2].map((i) => <i key={i} className="block h-0.5 w-4 rounded bg-current" />)}</span>
                {user
                  ? <Avatar u={user} size="h-8 w-8 text-sm !bg-white/20" />
                  : <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20"><User className="h-4 w-4" /></span>}
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                  <div className="anim-pop absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-surface text-ink shadow-2xl">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 border-b border-line bg-sunken p-4">
                          <Avatar u={user} size="h-11 w-11 text-base" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{user.full_name || user.username}</p>
                            <p className="truncate text-xs text-mute">@{user.username} · <span className="capitalize">{user.role}</span></p>
                            {user.email && <p className="truncate text-xs text-mute">{user.email}</p>}
                          </div>
                        </div>
                        <div className="p-2">
                          <MenuItem icon={Calendar} onClick={pick(() => setTab("welcome"))}>Home</MenuItem>
                          <MenuItem icon={Sparkles} onClick={pick(() => setTab("home"))}>Dashboard</MenuItem>
                          <MenuItem icon={CheckCircle2} badge={mine.length} onClick={pick(() => setTab("registrations"))}>My bookings</MenuItem>
                          {isStaff && <MenuItem icon={MapPin} onClick={pick(() => setTab("venues"))}>Venues</MenuItem>}
                          {isAdmin && <MenuItem icon={Users} badge={pending} onClick={pick(() => setTab("users"))}>Members</MenuItem>}
                          <MenuItem icon={User} onClick={pick(() => setTab("profile"))}>Account info</MenuItem>
                          {isAdmin && <MenuItem icon={Shield} onClick={pick(() => window.open(`${API_BASE}/admin/`, "_blank", "noopener"))}>Admin panel</MenuItem>}
                        </div>
                        <div className="border-t border-line p-2">
                          <MenuItem icon={LogOut} danger onClick={pick(logout)}>{isDemo ? "Exit demo" : "Sign out"}</MenuItem>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4 p-4">
                        <div>
                          <p className="font-display text-lg font-bold">Welcome</p>
                          <p className="mt-1 text-sm text-mute">Log in to register for events, see your bookings and get QR passes.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Btn onClick={pick(() => goLogin("signin"))}>Log in</Btn>
                          <Btn v="ghost" onClick={pick(() => goLogin("signup"))}>Register</Btn>
                        </div>
                        <MenuItem icon={Calendar} onClick={pick(() => setTab("welcome"))}>Home</MenuItem>
                        <MenuItem icon={Sparkles} onClick={pick(() => setTab("home"))}>Browse events</MenuItem>
                        <div className="rounded-xl bg-sunken p-3">
                          <p className="text-xs font-semibold">Try the demo</p>
                          <p className="mt-0.5 text-xs text-mute">Do anything, nothing is saved.</p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Btn v="ghost" className="!px-2 !py-2 !text-xs" onClick={pick(() => startDemo("participant"))}>Participant</Btn>
                            <Btn v="ghost" className="!px-2 !py-2 !text-xs" onClick={pick(() => startDemo("organizer"))}>Organizer</Btn>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===== WELCOME (landing page) ===== */}
      {tab === "welcome" && (
        <div className="anim-fade">
          {/* Hero */}
          <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#111113] px-6 text-center text-white">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {TILES.map(([img, l, t, w, r, d]) => (
                <div key={img} className={cx("float absolute", !(t < 14 || t >= 76) && "hidden sm:block")}
                  style={{ left: `${l}%`, top: `${t}%`, width: `clamp(84px, ${w}vw, ${w * 19}px)`, animationDelay: `${d}s` }}>
                  <img src={img.startsWith("http") ? img : `/${img}.svg`} alt="" loading="lazy"
                    onError={(ev) => { ev.currentTarget.onerror = null; ev.currentTarget.src = "/general.svg"; }}
                    style={{ transform: `rotate(${r}deg)` }}
                    className="aspect-square w-full rounded-3xl border border-white/10 bg-white/5 object-cover shadow-2xl shadow-black/60 ring-4 ring-white/5" />
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, rgba(17,17,19,.93) 0%, rgba(17,17,19,.6) 38%, transparent 70%)" }} />
            <div className="relative z-10 max-w-3xl py-28">
              <div className="mb-6 flex items-center justify-center gap-2 text-white/60">
                <Calendar className="h-6 w-6" /><span className="font-display text-2xl font-bold tracking-tight">Event Management</span>
              </div>
              <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
                Campus events<br />
                <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">made effortless</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
                From workshops and hackathons to cultural nights and career fairs, discover what’s on, register in one tap and walk in with a QR pass.
              </p>
              <button onClick={cta[1]}
                className="mt-9 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-black shadow-xl shadow-white/10 transition hover:scale-[1.03] active:scale-[.98]">
                {cta[0]}
              </button>
              <div>
                <button onClick={() => setTab("home")} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-white">
                  Discover events<ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {!user && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
                  <span>Or explore with a demo account:</span>
                  <button onClick={() => startDemo("participant")} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/20">Participant</button>
                  <button onClick={() => startDemo("organizer")} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/20">Organizer</button>
                </div>
              )}
              <p className="mt-8 text-xs text-white/40">
                {events.length} events · {venues.length} venues · {events.reduce((a, e) => a + (e.registered_count || 0), 0)} seats booked
              </p>
            </div>
          </section>

          {/* How it works */}
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <SectionHead kicker="How it works" title="From sign-up to front row in three steps" />
            <div className="grid gap-5 md:grid-cols-3">
              {STEPS.map(([I, t, d], i) => (
                <div key={t} className="relative rounded-3xl border border-line bg-surface p-6">
                  <span className="font-display absolute right-6 top-4 text-5xl font-extrabold text-brand/10">{i + 1}</span>
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand"><I className="h-5 w-5" /></div>
                  <h3 className="font-display text-lg font-bold">{t}</h3>
                  <p className="mt-2 text-sm text-mute">{d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="border-y border-line bg-sunken">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
              <SectionHead kicker="What you get" title="Everything an event needs, in one place"
                text="No more spreadsheets, paper lists or group-chat chaos." />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map(([I, t, d]) => (
                  <div key={t} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><I className="h-5 w-5" /></div>
                    <div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-mute">{d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Happening soon */}
          {soon.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
              <div className="mb-8 flex items-end justify-between">
                <h2 className="font-display text-3xl font-extrabold tracking-tight">Happening soon</h2>
                <button onClick={() => setTab("home")} className="flex items-center gap-1 text-sm font-semibold text-brand">View all<ArrowRight className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {soon.map((e) => (
                  <article key={e.id} onClick={() => setDetail(e)}
                    className="cursor-pointer overflow-hidden rounded-3xl border border-line bg-surface transition hover:-translate-y-1 hover:shadow-xl">
                    <Banner e={e} className="h-32" />
                    <div className="space-y-2 p-5">
                      <h3 className="font-display text-lg font-bold">{e.title}</h3>
                      <Meta icon={Clock}>{e.date} · {hm(e.time)}</Meta>
                      <Meta icon={MapPin}>{e.venue_name || "Campus"}</Meta>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Roles */}
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <SectionHead kicker="Who it’s for" title="Built for everyone behind an event" />
            <div className="grid gap-5 md:grid-cols-3">
              {ROLES.map(([I, t, items]) => (
                <div key={t} className="rounded-3xl border border-line bg-surface p-6">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white"><I className="h-5 w-5" /></div>
                  <h3 className="font-display text-xl font-bold">{t}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-mute">
                    {items.map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{x}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="px-4 pb-20 sm:px-6">
            <div className="dots mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-br from-blue-700 to-sky-600 px-6 py-14 text-center text-white">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Ready for your next event?</h2>
              <p className="mx-auto mt-3 max-w-lg text-white/80">Join in seconds to attend events, or apply to host your own.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {!user && <Btn v="accent" className="!rounded-full !px-7 !py-3.5" onClick={() => goLogin("signup")}>Create free account</Btn>}
                <button onClick={() => setTab("home")} className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold transition hover:bg-white/20">Explore events</button>
              </div>
            </div>
          </section>

          <footer className="border-t border-line">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-mute sm:flex-row sm:px-6">
              <span>© {new Date().getFullYear()} Event Management System</span>
              <div className="flex gap-5">
                <button onClick={() => setTab("home")} className="hover:text-ink">Events</button>
              </div>
            </div>
          </footer>
        </div>
      )}

      <main className={cx("mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6", tab === "welcome" && "hidden")}>
        {/* ===== EXPLORE ===== */}
        {tab === "home" && (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-sm font-semibold text-brand">{user ? `Welcome back, ${first}` : "Browse and book events"}</p>
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                <input
                  value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…"
                  className={cx(inputCls, "!rounded-2xl !bg-surface py-3.5 pl-11 shadow-sm")}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {CATS.map((c) => (
                  <button
                    key={c} onClick={() => setCat(c)}
                    className={cx("rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                      cat === c ? "border-brand bg-brand text-white" : "border-line bg-surface text-mute hover:text-ink")}
                  >{c}</button>
                ))}
              </div>
            </section>

            {isStaff && (
              <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat icon={Calendar} value={events.length} label="Events" />
                <Stat icon={CheckCircle2} value={events.reduce((a, e) => a + (e.registered_count || 0), 0)} label="Total registrations" />
                <Stat icon={MapPin} value={venues.length} label="Venues" />
                {isAdmin ? <Stat icon={Shield} value={pending} label="Pending approvals" />
                  : <Stat icon={Users} value={events.reduce((a, e) => a + Math.max(0, left(e)), 0)} label="Open seats" />}
              </section>
            )}

            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-extrabold">Upcoming events</h2>
              <span className="text-sm text-mute">{filtered.length} found</span>
            </div>

            {loading && !events.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => <div key={i} className="skeleton h-80 rounded-3xl" />)}
              </div>
            ) : !filtered.length ? (
              <Empty icon={Search} title="No events found" text="Try a different keyword or category, or check back soon.">
                <Btn v="ghost" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</Btn>
              </Empty>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((e) => (
                  <article
                    key={e.id} onClick={() => setDetail(e)}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10"
                  >
                    <Banner e={e} className="h-40" />
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div>
                        <h3 className="font-display text-xl font-bold leading-snug transition group-hover:text-brand">{e.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-mute">{e.description}</p>
                      </div>
                      <div className="space-y-2">
                        <Meta icon={Clock}>{e.date} · {hm(e.time)}</Meta>
                        <Meta icon={MapPin}>{e.venue_name || "Main Campus Venue"}</Meta>
                      </div>
                      <div className="mt-auto space-y-4">
                        <Seats e={e} />
                        <div className="flex gap-2" onClick={(ev) => ev.stopPropagation()}>{actions(e, true)}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== AUTH / PROFILE ===== */}
        {tab === "profile" && (user ? (
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-line bg-surface">
            <div className="dots h-32 bg-gradient-to-br from-blue-700 to-sky-600" />
            <div className="px-6 pb-8 sm:px-8">
              <div className="-mt-12 mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="flex items-end gap-4">
                  <Avatar u={user} size="h-24 w-24 border-4 border-surface text-4xl" />
                  <div className="pb-1">
                    <h2 className="font-display text-2xl font-extrabold">{user.full_name || user.username}</h2>
                    <p className="text-sm text-mute">@{user.username} · <span className="capitalize">{user.role}</span></p>
                  </div>
                </div>
                <Btn v="danger" onClick={logout}><LogOut className="h-4 w-4" />Sign out</Btn>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[[Mail, "Email", user.email], [Phone, "Phone", user.phone], [Building2, "Department", user.department], [GraduationCap, "Batch", user.batch]].map(([I, l, v]) => (
                  <div key={l} className="flex items-center gap-3 rounded-2xl border border-line bg-sunken p-4">
                    <I className="h-5 w-5 text-brand" />
                    <div><p className="text-xs text-mute">{l}</p><p className="text-sm font-semibold">{v || "Not provided"}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-surface lg:grid-cols-5">
            <aside className="dots hidden flex-col justify-between bg-gradient-to-br from-blue-700 to-sky-600 p-10 text-white lg:col-span-2 lg:flex">
              <div className="flex items-center gap-2.5 font-display text-xl font-extrabold"><Calendar className="h-6 w-6" />EventHub</div>
              <div>
                <h2 className="font-display text-4xl font-extrabold leading-tight">Your campus, one calendar.</h2>
                <ul className="mt-6 space-y-3 text-sm text-indigo-100">
                  <li className="flex gap-3"><Shield className="h-5 w-5 shrink-0" />Verified student & organizer profiles</li>
                  <li className="flex gap-3"><QrCode className="h-5 w-5 shrink-0" />Instant QR entry passes</li>
                  <li className="flex gap-3"><Calendar className="h-5 w-5 shrink-0" />One-click Google Calendar sync</li>
                </ul>
              </div>
            </aside>
            <div className="p-6 sm:p-10 lg:col-span-3">
              <Seg value={authMode} onChange={setAuthMode} items={[["signin", "Sign in"], ["signup", "Sign up"]]} />
              <h2 className="font-display mt-6 text-3xl font-extrabold">
                {authMode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mb-6 mt-1 text-sm text-mute">
                {authMode === "signin" ? "Sign in to register for events and access your passes." : "Join to attend events or apply as an organizer."}
              </p>

              {authMode === "signin" ? (
                <form onSubmit={onLogin} className="space-y-4">
                  <Field label="Username" required autoComplete="username" placeholder="Your username" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} />
                  <Field label="Password" required type="password" autoComplete="current-password" placeholder="••••••••" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
                  <Btn type="submit" disabled={busy} className="w-full py-3">{busy ? "Signing in…" : "Sign in"}</Btn>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs text-mute">Just looking? Try the demo:</span>
                    <button type="button" onClick={() => startDemo("participant")} className="rounded-full border border-line px-3 py-1 text-xs font-semibold transition hover:bg-sunken">Demo participant</button>
                    <button type="button" onClick={() => startDemo("organizer")} className="rounded-full border border-line px-3 py-1 text-xs font-semibold transition hover:bg-sunken">Demo organizer</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={onRegister} className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required placeholder="e.g. Sayed Obidul" value={reg.full_name} onChange={(e) => setReg({ ...reg, full_name: e.target.value })} />
                  <Field label="Username" required placeholder="Choose a username" value={reg.username} onChange={(e) => setReg({ ...reg, username: e.target.value })} />
                  <Field label="Email" required type="email" placeholder="you@university.edu" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
                  <Field label="Phone" placeholder="+880 1XXX-XXXXXX" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
                  <Field label="Department" value={reg.department} onChange={(e) => setReg({ ...reg, department: e.target.value })}
                    options={["CSE", "FMRT", "FES", "MGT", "THM"].map((d) => <option key={d}>{d}</option>)} />
                  <Field label="Batch" placeholder="e.g. 2022-26" value={reg.batch} onChange={(e) => setReg({ ...reg, batch: e.target.value })} />
                  <Field className="sm:col-span-2" label="Password" required type="password" placeholder="At least 4 characters" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-sunken p-3.5 text-sm sm:col-span-2">
                    <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--brand))]" checked={reg.apply_organizer} onChange={(e) => setReg({ ...reg, apply_organizer: e.target.checked })} />
                    Request organizer privileges (needs admin approval)
                  </label>
                  <Btn type="submit" disabled={busy} className="w-full py-3 sm:col-span-2">{busy ? "Creating account…" : "Create account"}</Btn>
                </form>
              )}
            </div>
          </div>
        ))}

        {/* ===== MY PASSES ===== */}
        {tab === "registrations" && user && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl font-extrabold">My bookings</h2>
              <p className="text-sm text-mute">{mine.length} active registration{mine.length === 1 ? "" : "s"}</p>
            </div>
            {!regs.length ? (
              <Empty icon={QrCode} title="No passes yet" text="Register for an event and your QR pass will show up here.">
                <Btn onClick={() => setTab("home")}>Explore events<ArrowRight className="h-4 w-4" /></Btn>
              </Empty>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {regs.map((r) => {
                  const e = events.find((x) => x.id === r.event) || { id: r.event, title: r.event_title };
                  const on = r.status === "registered";
                  return (
                    <div key={r.id} className="flex overflow-hidden rounded-2xl border border-line bg-surface">
                      <img src={imgOf(e)} alt="" className="hidden w-24 object-cover sm:block" />
                      <div className="flex-1 space-y-3 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg font-bold">{e.title || "Event registration"}</h3>
                          <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize",
                            on ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-sunken text-mute")}>{r.status}</span>
                        </div>
                        <Meta icon={Clock}>{e.date} · {hm(e.time)}</Meta>
                        <Meta icon={MapPin}>{e.venue_name || "Campus"}</Meta>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Btn className="!px-3 !py-2" disabled={!on} onClick={() => setPass(e)}><QrCode className="h-4 w-4" />QR pass</Btn>
                          <Btn v="ghost" className="!px-3 !py-2" onClick={() => gcal(e)}><Calendar className="h-4 w-4" />Calendar</Btn>
                          {on && <Btn v="danger" className="!px-3 !py-2" onClick={() => eventAction(e.id ?? r.event, "cancel")}>Cancel</Btn>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== VENUES ===== */}
        {tab === "venues" && isStaff && (
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-extrabold">Venues</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {venues.map((v) => {
                const n = events.filter((e) => e.venue === v.id).length;
                return (
                  <div key={v.id} className="rounded-3xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand"><MapPin className="h-5 w-5" /></div>
                    <h4 className="font-display text-lg font-bold">{v.name}</h4>
                    <p className="text-sm text-mute">{v.location}</p>
                    <div className="mt-4 flex justify-between border-t border-line pt-3 text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-brand" />{v.capacity} seats</span>
                      <span className="text-mute">{n} event{n === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== ADMIN ===== */}
        {tab === "users" && isAdmin && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl font-extrabold">Members</h2>
              <p className="text-sm text-mute">{users.length} total · {pending} awaiting organizer approval</p>
              <Btn v="ghost" className="mt-3" onClick={() => window.open(`${API_BASE}/admin/`, "_blank", "noopener")}>
                <Shield className="h-4 w-4" />Open Django admin panel
              </Btn>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-sunken text-xs uppercase tracking-wide text-mute">
                  <tr>{["Member", "Contact", "Dept · Batch", "Role", ""].map((h) => <th key={h} className="p-4 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.map((u) => (
                    <tr key={u.id} className="transition hover:bg-sunken/60">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar u={u} />
                          <div><div className="font-semibold">{u.full_name || u.username}</div><div className="text-xs text-mute">@{u.username}</div></div>
                        </div>
                      </td>
                      <td className="p-4 text-mute"><div>{u.email || "—"}</div><div className="text-xs">{u.phone || "—"}</div></td>
                      <td className="p-4 text-mute">{u.department} · {u.batch}</td>
                      <td className="p-4">
                        <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize",
                          u.role === "admin" ? "bg-purple-500/10 text-purple-500" : u.role === "organizer" ? "bg-brand/10 text-brand" : "bg-sunken text-mute")}>{u.role}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {u.requested_role === "organizer" && u.role !== "organizer" && (
                            <>
                              <Btn className="!px-3 !py-1.5" onClick={() => setRole(u.id, true)}>Approve</Btn>
                              <Btn v="ghost" className="!px-3 !py-1.5" onClick={() => setRole(u.id, false)}>Decline</Btn>
                            </>
                          )}
                          {u.id !== user.id && <Btn v="danger" className="!px-3 !py-1.5" onClick={() => removeUser(u)}>Remove</Btn>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      
      {/* Event detail drawer */}
      {detail && (
        <Modal side onClose={() => setDetail(null)}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/90 px-6 py-3 backdrop-blur">
            <span className="text-sm font-semibold">Event details</span>
            <CloseBtn onClick={() => setDetail(null)} />
          </div>
          <Banner e={detail} className="h-48" />
          <div className="space-y-6 p-6">
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-tight">{detail.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-mute">{detail.description || "No description provided."}</p>
            </div>
            <div className="space-y-3 rounded-2xl border border-line bg-sunken p-4">
              <Meta icon={Clock}>{detail.date} at {hm(detail.time)}</Meta>
              <Meta icon={MapPin}>{detail.venue_name || "Main Campus Venue"}{venueOf(detail)?.location ? ` · ${venueOf(detail).location}` : ""}</Meta>
              <Meta icon={Calendar}>Registration closes {detail.registration_deadline || "—"}</Meta>
              <Meta icon={Users}>Capacity {detail.capacity}</Meta>
            </div>
            <Seats e={detail} />
            <div className="flex gap-2">{actions(detail, true)}</div>
            <div className="grid grid-cols-2 gap-2">
              <Btn v="ghost" onClick={() => gcal(detail)}><Calendar className="h-4 w-4" />Add to calendar</Btn>
              <Btn v="ghost" onClick={() => setQr(detail)}><QrCode className="h-4 w-4" />Share QR</Btn>
            </div>
            {canManage(detail) && (
              <div className="space-y-4 border-t border-line pt-5">
                <div className="grid grid-cols-2 gap-2">
                  <Btn v="ghost" onClick={() => openEdit(detail)}>Edit event</Btn>
                  <Btn v="danger" onClick={() => deleteEvent(detail)}>Delete event</Btn>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mute">Participants ({detail.participants?.length || 0})</p>
                  <ul className="divide-y divide-line rounded-2xl border border-line text-sm">
                    {(detail.participants || []).map((p) => (
                      <li key={p.id} className="flex justify-between gap-3 px-4 py-2.5">
                        <span className="font-medium">{p.username}</span><span className="truncate text-mute">{p.email || p.registered_at}</span>
                      </li>
                    ))}
                    {!detail.participants?.length && <li className="px-4 py-3 text-mute">No registrations yet.</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Share QR */}
      {qr && (
        <Modal onClose={() => setQr(null)}>
          <div className="space-y-4 p-6 text-center">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brand">Share event</span><CloseBtn onClick={() => setQr(null)} />
            </div>
            <h4 className="font-display text-xl font-bold">{qr.title}</h4>
            <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-inner">
              <img alt="Event QR" className="h-44 w-44"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/?event=${qr.id}`)}`} />
            </div>
            <p className="text-xs text-mute">Scan to view event details. Sign-in is required to register.</p>
            <Btn v="ghost" className="w-full" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/?event=${qr.id}`); notify("success", "Link copied."); }}>Copy link</Btn>
          </div>
        </Modal>
      )}

      {/* Ticket */}
      {pass && user && (
        <Modal onClose={() => setPass(null)} panel="max-w-xs">
          <div className="p-6 text-white" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.78)),url(${imgOf(pass)})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4" />Verified pass</span>
              <button onClick={() => setPass(null)} aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <h4 className="font-display mt-5 text-2xl font-extrabold leading-tight">{pass.title}</h4>
            <p className="mt-1 text-sm text-white/80">{pass.date} · {hm(pass.time)}</p>
          </div>
          <div className="relative border-t-2 border-dashed border-line px-6 pb-6 pt-8 text-center">
            <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-black/55" />
            <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-black/55" />
            <div className="mx-auto w-fit rounded-2xl bg-white p-3">
              <img alt="Ticket QR" className="h-36 w-36"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`PASS:${pass.id}:${user.username}`)}`} />
            </div>
            <p className="mt-4 font-mono text-xs tracking-wider text-mute">PASS #{pass.id}-{(user.username || "").toUpperCase()}</p>
            <p className="mt-1 text-sm font-semibold">{user.full_name || user.username}</p>
          </div>
        </Modal>
      )}

      {/* Create event */}
      {creating && (
        <Modal onClose={() => closeForm()} panel="max-w-lg">
          <form onSubmit={createEvent} className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-xl font-extrabold">{editId ? "Edit event" : "Publish new event"}</h4><CloseBtn onClick={() => closeForm()} />
            </div>
            <Field label="Title" required placeholder="e.g. Intro to Machine Learning" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                options={CATS.slice(1).map((c) => <option key={c}>{c}</option>)} />
              <Field label="Venue" required value={draft.venue} onChange={(e) => setDraft({ ...draft, venue: e.target.value })}
                options={<><option value="">Select venue</option>{venues.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.capacity})</option>)}</>} />
              <Field label="Date" required type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              <Field label="Start time" required type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
              <Field label="Capacity" required type="number" min="1" value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} />
              <Field label="Registration deadline" required type="date" value={draft.registration_deadline} onChange={(e) => setDraft({ ...draft, registration_deadline: e.target.value })} />
            </div>
            <Field label="Description" rows={3} placeholder="What should attendees know?" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <Btn type="submit" disabled={busy} className="w-full py-3">{busy ? "Saving…" : editId ? "Save changes" : "Publish event"}</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
