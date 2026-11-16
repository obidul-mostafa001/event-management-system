import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar, MapPin, Users, Clock, Plus, Search, Shield, CheckCircle2, LogOut,
  Moon, Sun, X, QrCode, Check, User, ArrowRight, Sparkles, Lock, Mail, Phone,
  GraduationCap, Building2,
} from "lucide-react";

const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000";
const CATS = ["All", "Workshop", "Competition", "Cultural", "Career"];
const TONE = {
  Workshop: "from-sky-500 to-indigo-600",
  Competition: "from-orange-500 to-rose-600",
  Cultural: "from-fuchsia-500 to-purple-600",
  Career: "from-emerald-500 to-teal-600",
};
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const BLANK_EVENT = {
  title: "", description: "", category: "Workshop", date: "", time: "10:00",
  venue: "", capacity: 100, registration_deadline: "",
};

const cx = (...a) => a.filter(Boolean).join(" ");
const list = (d) => (Array.isArray(d) ? d : d?.results || []);
const dparts = (s) => { const [, m, d] = (s || "").split("-"); return { m: MON[+m - 1] || "—", d: d || "—" }; };
const left = (e) => (e.capacity || 100) - (e.registered_count || 0);
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
  return { ok: res.ok, data };
}

/* ---------- UI primitives ---------- */
const Btn = ({ v = "primary", className, ...p }) => {
  const s = {
    primary: "bg-brand text-white shadow-sm shadow-brand/25 hover:brightness-110",
    soft: "bg-brand/10 text-brand hover:bg-brand/15",
    ghost: "border border-line bg-surface hover:bg-sunken",
    danger: "border border-rose-500/30 text-rose-500 hover:bg-rose-500/10",
    dark: "bg-ink text-bg hover:opacity-90",
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

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-brand/30">
      <Calendar className="h-5 w-5" />
    </div>
    <span className="font-display text-xl font-extrabold tracking-tight">EventHub</span>
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
    <div className={cx("dots bg-gradient-to-br p-4", TONE[e.category] || TONE.Workshop, className)}>
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{e.category}</span>
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
  const [tab, setTab] = useState("home");
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
  const [login, setLogin] = useState({ username: "", password: "" });
  const [reg, setReg] = useState({
    username: "", password: "", email: "", full_name: "", phone: "",
    batch: "", department: "CSE", apply_organizer: false,
  });
  const [draft, setDraft] = useState(BLANK_EVENT);

  const token = user?.token;
  const isAdmin = user?.role === "admin";
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ev, vn] = await Promise.all([api("/events/", { token }), api("/venues/", { token })]);
      if (ev.ok) setEvents(list(ev.data));
      if (vn.ok) setVenues(list(vn.data));
      if (user) {
        const [rg, us] = await Promise.all([
          api("/registrations/", { token }),
          isAdmin ? api("/auth/users/", { token }) : null,
        ]);
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
      ok ? finishAuth(data, `Welcome back, ${data.user?.full_name || data.user?.username}!`)
        : notify("error", errText(data, "Invalid login credentials."));
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

  const logout = () => {
    setUser(null); setRegs([]); setUsers([]); setTab("home");
    localStorage.removeItem("eh_user");
    localStorage.removeItem("eh_token");
  };

  const eventAction = async (id, kind) => {
    if (!user) {
      notify("warning", "Please sign in or create an account first.");
      setAuthMode("signin"); setTab("profile"); setDetail(null);
      return;
    }
    try {
      const { ok, data } = await api(`/events/${id}/${kind}/`, { method: "POST", token });
      if (ok) {
        notify("success", kind === "register" ? "You're in! Your pass is ready." : "Registration cancelled.");
        load();
      } else notify("error", errText(data, "Something went wrong."));
    } catch { notify("error", "Server unreachable."); }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { ok, data } = await api("/events/", { method: "POST", token, body: draft });
      if (ok) { setCreating(false); setDraft(BLANK_EVENT); notify("success", "Event published."); load(); }
      else notify("error", errText(data, "Could not publish event."));
    } catch { notify("error", "Server unreachable."); }
    finally { setBusy(false); }
  };

  const approve = async (id) => {
    const { ok } = await api(`/auth/users/${id}/`, { method: "PATCH", token, body: { role: "organizer", requested_role: null } });
    if (ok) { notify("success", "Organizer approved."); load(); }
  };

  const gcal = (e) => {
    const d = (e.date || "").replace(/-/g, "");
    const t = (e.time || "10:00").replace(/:/g, "").slice(0, 4) + "00";
    const p = new URLSearchParams({
      action: "TEMPLATE", text: e.title || "", details: e.description || "",
      location: e.venue_details?.name || "Campus Venue", dates: `${d}T${t}/${d}T${t}`,
    });
    window.open(`https://calendar.google.com/calendar/render?${p}`, "_blank");
  };

  const filtered = useMemo(
    () => events.filter((e) =>
      (cat === "All" || e.category === cat) &&
      `${e.title} ${e.description}`.toLowerCase().includes(q.toLowerCase())),
    [events, cat, q]
  );
  const mine = regs.filter((r) => r.status === "registered");
  const isReg = (id) => !!user && mine.some((r) => (r.event?.id ?? r.event) === id);
  const first = (user?.full_name || user?.username || "").split(" ")[0];
  const pending = users.filter((u) => u.requested_role === "organizer" && u.role !== "organizer").length;

  const nav = [
    { id: "home", label: "Explore", icon: Sparkles },
    ...(user ? [{ id: "registrations", label: "My Passes", icon: CheckCircle2, badge: mine.length }] : []),
    ...(isStaff ? [{ id: "venues", label: "Venues", icon: MapPin }] : []),
    ...(isAdmin ? [{ id: "users", label: "Admin", icon: Shield, badge: pending }] : []),
    { id: "profile", label: user ? "Account" : "Sign in", icon: User },
  ];

  const actions = (e, full) =>
    isReg(e.id) ? (
      <>
        <Btn className={full && "flex-1"} onClick={() => setPass(e)}><QrCode className="h-4 w-4" />View pass</Btn>
        <Btn v="danger" onClick={() => eventAction(e.id, "cancel")}>Cancel</Btn>
      </>
    ) : (
      <Btn className={full && "flex-1"} disabled={left(e) <= 0} onClick={() => eventAction(e.id, "register")}>
        {!user && <Lock className="h-4 w-4" />}
        {left(e) <= 0 ? "Sold out" : user ? "Register" : "Sign in to register"}
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

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button onClick={() => setTab("home")} aria-label="Home"><Logo /></button>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((t) => (
              <button
                key={t.id} onClick={() => setTab(t.id)}
                className={cx("relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition",
                  tab === t.id ? "bg-brand/10 text-brand" : "text-mute hover:bg-sunken hover:text-ink")}
              >
                <t.icon className="h-4 w-4" />{t.label}
                {!!t.badge && <span className="rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">{t.badge}</span>}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isStaff && (
              <Btn onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /><span className="hidden sm:inline">Host event</span>
              </Btn>
            )}
            <button
              onClick={() => setDark(!dark)} aria-label="Toggle theme"
              className="rounded-xl border border-line bg-surface p-2.5 text-mute transition hover:text-ink"
            >{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            {user ? (
              <button onClick={() => setTab("profile")} aria-label="Account"><Avatar u={user} size="h-10 w-10 text-sm" /></button>
            ) : (
              <Btn v="dark" onClick={() => { setAuthMode("signin"); setTab("profile"); }}>Sign in</Btn>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-14">
        {/* ===== EXPLORE ===== */}
        {tab === "home" && (
          <div className="space-y-8">
            <section className="mesh relative overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-10 sm:px-12 sm:py-14">
              <p className="text-sm font-semibold text-brand">{user ? `Welcome back, ${first}` : "Campus & enterprise events"}</p>
              <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
                Find your next <span className="text-brand">great event.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-mute">
                Workshops, hackathons, cultural fests and career fairs. Register in one tap, get a QR pass, sync to your calendar.
              </p>
              <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                  <input
                    value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…"
                    className={cx(inputCls, "!rounded-2xl !bg-surface py-3.5 pl-11 shadow-sm")}
                  />
                </div>
                {!user && (
                  <Btn className="!rounded-2xl px-6" onClick={() => { setAuthMode("signup"); setTab("profile"); }}>
                    Create account<ArrowRight className="h-4 w-4" />
                  </Btn>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
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
                <Stat icon={CheckCircle2} value={regs.length} label="Registrations" />
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
                    <Banner e={e} className="h-28" />
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div>
                        <h3 className="font-display text-xl font-bold leading-snug transition group-hover:text-brand">{e.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-mute">{e.description}</p>
                      </div>
                      <div className="space-y-2">
                        <Meta icon={Clock}>{e.date} · {e.time}</Meta>
                        <Meta icon={MapPin}>{e.venue_details?.name || "Main Campus Venue"}</Meta>
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
            <div className="dots h-32 bg-gradient-to-br from-indigo-600 to-violet-700" />
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
            <aside className="dots hidden flex-col justify-between bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white lg:col-span-2 lg:flex">
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
                    <span className="text-xs text-mute">Quick demo login:</span>
                    {[["admin", "AdminPass123!"], ["organizer", "OrganizerPass123!"], ["student", "StudentPass123!"]].map(([u, p]) => (
                      <button key={u} type="button" onClick={() => setLogin({ username: u, password: p })}
                        className="rounded-full border border-line px-3 py-1 text-xs font-semibold capitalize transition hover:bg-sunken">{u}</button>
                    ))}
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
                  <Field className="sm:col-span-2" label="Password" required type="password" placeholder="Min 6 characters" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
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
              <h2 className="font-display text-3xl font-extrabold">My passes</h2>
              <p className="text-sm text-mute">{mine.length} active registration{mine.length === 1 ? "" : "s"}</p>
            </div>
            {!regs.length ? (
              <Empty icon={QrCode} title="No passes yet" text="Register for an event and your QR pass will show up here.">
                <Btn onClick={() => setTab("home")}>Explore events<ArrowRight className="h-4 w-4" /></Btn>
              </Empty>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {regs.map((r) => {
                  const e = r.event_details || {};
                  const on = r.status === "registered";
                  return (
                    <div key={r.id} className="flex overflow-hidden rounded-2xl border border-line bg-surface">
                      <div className={cx("w-2 bg-gradient-to-b", TONE[e.category] || TONE.Workshop)} />
                      <div className="flex-1 space-y-3 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg font-bold">{e.title || "Event registration"}</h3>
                          <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize",
                            on ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-sunken text-mute")}>{r.status}</span>
                        </div>
                        <Meta icon={Clock}>{e.date} · {e.time}</Meta>
                        <Meta icon={MapPin}>{e.venue_details?.name || "Campus"}</Meta>
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
                const n = events.filter((e) => (e.venue_details?.id ?? e.venue) === v.id).length;
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
                      <td className="p-4 text-right">
                        {u.requested_role === "organizer" && u.role !== "organizer"
                          ? <Btn className="!px-3 !py-1.5" onClick={() => approve(u.id)}>Approve organizer</Btn>
                          : <span className="text-xs text-mute">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-line bg-bg/90 backdrop-blur-xl md:hidden">
        {nav.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cx("relative flex flex-col items-center gap-1 px-3 text-[11px] font-semibold", tab === t.id ? "text-brand" : "text-mute")}>
            <t.icon className="h-5 w-5" />{t.label}
            {!!t.badge && <span className="absolute -right-0.5 -top-1 rounded-full bg-brand px-1.5 text-[9px] font-bold text-white">{t.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Event detail drawer */}
      {detail && (
        <Modal side onClose={() => setDetail(null)}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/90 px-6 py-3 backdrop-blur">
            <span className="text-sm font-semibold">Event details</span>
            <CloseBtn onClick={() => setDetail(null)} />
          </div>
          <Banner e={detail} className="h-36" />
          <div className="space-y-6 p-6">
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-tight">{detail.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-mute">{detail.description || "No description provided."}</p>
            </div>
            <div className="space-y-3 rounded-2xl border border-line bg-sunken p-4">
              <Meta icon={Clock}>{detail.date} at {detail.time}</Meta>
              <Meta icon={MapPin}>{detail.venue_details?.name || "Main Campus Venue"}{detail.venue_details?.location ? ` · ${detail.venue_details.location}` : ""}</Meta>
              <Meta icon={Calendar}>Registration closes {detail.registration_deadline || "—"}</Meta>
              <Meta icon={Users}>Capacity {detail.capacity}</Meta>
            </div>
            <Seats e={detail} />
            <div className="flex gap-2">{actions(detail, true)}</div>
            <div className="grid grid-cols-2 gap-2">
              <Btn v="ghost" onClick={() => gcal(detail)}><Calendar className="h-4 w-4" />Add to calendar</Btn>
              <Btn v="ghost" onClick={() => setQr(detail)}><QrCode className="h-4 w-4" />Share QR</Btn>
            </div>
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
          <div className={cx("dots bg-gradient-to-br p-6 text-white", TONE[pass.category] || TONE.Workshop)}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4" />Verified pass</span>
              <button onClick={() => setPass(null)} aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <h4 className="font-display mt-5 text-2xl font-extrabold leading-tight">{pass.title}</h4>
            <p className="mt-1 text-sm text-white/80">{pass.date} · {pass.time}</p>
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
        <Modal onClose={() => setCreating(false)} panel="max-w-lg">
          <form onSubmit={createEvent} className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-xl font-extrabold">Publish new event</h4><CloseBtn onClick={() => setCreating(false)} />
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
            <Btn type="submit" disabled={busy} className="w-full py-3">{busy ? "Publishing…" : "Publish event"}</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
