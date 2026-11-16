import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar, MapPin, Users, Clock, Plus, Search, Shield,
  CheckCircle2, LogOut, Moon, Sun, X, QrCode, Check,
  User, ArrowRight, Sparkles, Lock, Mail, Phone, GraduationCap, Building2
} from "lucide-react";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://127.0.0.1:8000";

export default function EventHub() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("signin");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'registrations' | 'venues' | 'users' | 'profile'
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    phone: "",
    batch: "",
    department: "CSE",
    role: "participant",
    apply_organizer: false,
  });

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "Workshop",
    date: "",
    time: "10:00",
    venue: "",
    capacity: 100,
    registration_deadline: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("eh_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("eh_user");
      }
    }
    const savedDark = localStorage.getItem("eh_dark");
    setIsDarkMode(savedDark === null ? true : savedDark === "true");
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("eh_dark", isDarkMode);
  }, [isDarkMode]);

  const token = currentUser?.token || localStorage.getItem("eh_token");

  const authHeaders = useMemo(() => {
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, vnRes] = await Promise.all([
        fetch(`${API_BASE}/api/events/`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/venues/`, { headers: authHeaders }),
      ]);
      if (evRes.ok) {
        const evData = await evRes.json();
        setEvents(Array.isArray(evData) ? evData : evData.results || []);
      }
      if (vnRes.ok) {
        const vnData = await vnRes.json();
        setVenues(Array.isArray(vnData) ? vnData : vnData.results || []);
      }

      if (currentUser?.role === "admin" || currentUser?.role === "organizer") {
        const [usrRes, regRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/users/`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/registrations/`, { headers: authHeaders }),
        ]);
        if (usrRes.ok) {
          const uData = await usrRes.json();
          setUsers(Array.isArray(uData) ? uData : uData.results || []);
        }
        if (regRes.ok) {
          const rData = await regRes.json();
          setRegistrations(Array.isArray(rData) ? rData : rData.results || []);
        }
      } else if (currentUser) {
        const regRes = await fetch(`${API_BASE}/api/registrations/`, { headers: authHeaders });
        if (regRes.ok) {
          const rData = await regRes.json();
          setRegistrations(Array.isArray(rData) ? rData : rData.results || []);
        }
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.warn("API offline or loading cached data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        const userObj = { ...data.user, token: data.access };
        setCurrentUser(userObj);
        localStorage.setItem("eh_user", JSON.stringify(userObj));
        localStorage.setItem("eh_token", data.access);
        setStatusMsg({ type: "success", text: `Welcome back, ${userObj.full_name || userObj.username}!` });
        setActiveTab("home");
      } else {
        setStatusMsg({ type: "error", text: data.detail || "Invalid login credentials." });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Backend server unreachable. Make sure backend is running." });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: "", text: "" });
    try {
      const payload = {
        ...registerForm,
        role: "participant",
        requested_role: registerForm.apply_organizer ? "organizer" : null,
      };
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        const userObj = { ...data.user, token: data.access };
        setCurrentUser(userObj);
        localStorage.setItem("eh_user", JSON.stringify(userObj));
        localStorage.setItem("eh_token", data.access);
        setStatusMsg({ type: "success", text: "Account created! You can now register for events." });
        setActiveTab("home");
      } else {
        const firstErr = Object.values(data)[0];
        setStatusMsg({
          type: "error",
          text: Array.isArray(firstErr) ? firstErr[0] : String(firstErr || "Registration failed."),
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Server connection error during sign up." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("eh_user");
    localStorage.removeItem("eh_token");
    setRegistrations([]);
    setActiveTab("home");
    setStatusMsg({ type: "", text: "" });
  };

  // Guardrail: Unauthenticated users cannot register for any event
  const handleRegisterEvent = async (eventId) => {
    if (!currentUser) {
      setStatusMsg({
        type: "warning",
        text: "Authentication required: Please sign in or create an account before registering for an event.",
      });
      setAuthMode("signin");
      setActiveTab("profile");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/register/`, {
        method: "POST",
        headers: authHeaders,
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/cancel/`, {
        method: "POST",
        headers: authHeaders,
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewEvent({
          title: "",
          description: "",
          category: "Workshop",
          date: "",
          time: "10:00",
          venue: "",
          capacity: 100,
          registration_deadline: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrganizer = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${userId}/`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ role: "organizer", requested_role: null }),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openGoogleCalendar = (ev) => {
    const title = encodeURIComponent(ev.title);
    const details = encodeURIComponent(ev.description || "");
    const location = encodeURIComponent(ev.venue_details?.name || "Campus Venue");
    const dStr = (ev.date || "").replace(/-/g, "");
    const tStr = (ev.time || "10:00").replace(/:/g, "") + "00";
    const dates = `${dStr}T${tStr}/${dStr}T${tStr}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(url, "_blank");
  };

  const filteredEvents = Array.isArray(events)
    ? events.filter((ev) => {
        const matchCat = selectedCategory === "All" || ev.category === selectedCategory;
        const matchSearch =
          (ev.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ev.description || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
      })
    : [];

  const isRegistered = (eventId) => {
    if (!currentUser) return false;
    return registrations.some(
      (r) =>
        (r.event === eventId || r.event?.id === eventId) &&
        r.status === "registered"
    );
  };

  const navItems = [
    { id: "home", label: "Explore Events", icon: Sparkles },
    ...(currentUser ? [{ id: "registrations", label: "My Passes", icon: CheckCircle2 }] : []),
    ...(currentUser?.role === "admin" || currentUser?.role === "organizer"
      ? [{ id: "venues", label: "Venues", icon: MapPin }]
      : []),
    ...(currentUser?.role === "admin"
      ? [{ id: "users", label: "Admin Panel", icon: Shield }]
      : []),
    { id: "profile", label: currentUser ? "Profile" : "Sign In / Join", icon: User },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 dark:bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-violet-600/10 dark:bg-violet-500/10 blur-3xl" />
      </div>

      {/* Modern Glassmorphic Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-3 text-left group"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
                EventHub
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-400 -mt-1">
                Campus & Enterprise Portal
              </span>
            </div>
          </button>

          {/* Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {(currentUser?.role === "admin" || currentUser?.role === "organizer") && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Host Event</span>
              </button>
            )}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-500/50 transition"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <button
                onClick={() => setActiveTab("profile")}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/50 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                  {(currentUser.full_name || currentUser.username || "U")[0]}
                </div>
                <span className="hidden sm:inline text-xs font-semibold max-w-[90px] truncate">
                  {currentUser.username}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setActiveTab("profile");
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:opacity-90 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        {/* ================= HOME TAB (LANDING + EVENTS) ================= */}
        {activeTab === "home" && (
          <div className="space-y-8">
            {/* Hero Banner Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 p-8 sm:p-12 text-white shadow-2xl shadow-indigo-900/20">
              <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-indigo-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Next-Gen Campus & Organization Event Platform</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Discover, Host & Experience Unforgettable Events.
                </h1>

                <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                  EventHub is a unified event management platform designed for universities, tech communities, and organizations. Explore upcoming workshops, hackathons, and cultural fests, claim instant scannable QR tickets, and sync schedules directly to your Google Calendar.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {!currentUser ? (
                    <>
                      <button
                        onClick={() => {
                          setAuthMode("signup");
                          setActiveTab("profile");
                        }}
                        className="px-6 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg"
                      >
                        <span>Create Free Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode("signin");
                          setActiveTab("profile");
                        }}
                        className="px-6 py-3 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/40 border border-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition"
                      >
                        Member Sign In
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveTab("registrations")}
                      className="px-6 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg"
                    >
                      <span>View My Event Passes ({registrations.filter((r) => r.status === "registered").length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Feature Highlights Strip */}
                <div className="pt-6 mt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-indigo-100">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Verified Student & Organizer Profiles</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Instant Digital QR Entry Passes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-sky-300 shrink-0" />
                    <span>1-Click Google Calendar Sync</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Search & Category Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events by title or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {["All", "Workshop", "Competition", "Cultural", "Career"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Cards Grid */}
            {loading && filteredEvents.length === 0 ? (
              <div className="text-center py-16 text-sm text-slate-400">Loading upcoming events...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-500">No events match your search criteria.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((ev) => {
                  const registered = isRegistered(ev.id);
                  const filled = ev.registered_count || 0;
                  const cap = ev.capacity || 100;
                  const fillPercent = Math.min(100, Math.round((filled / cap) * 100));

                  return (
                    <div
                      key={ev.id}
                      className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                            {ev.category}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            Closes {ev.registration_deadline}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {ev.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {ev.description}
                          </p>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>{ev.date} · {ev.time}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>{ev.venue_details?.name || "Main Campus Venue"}</span>
                          </div>
                        </div>

                        {/* Seat Capacity Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[11px] font-medium">
                            <span className="text-slate-500 dark:text-slate-400">Seat Availability</span>
                            <span className="text-slate-700 dark:text-slate-200 font-semibold">
                              {filled} / {cap}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openGoogleCalendar(ev)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Add to Google Calendar"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowQRModal(ev)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Share Event QR Poster"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>

                        {registered ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowTicketModal(ev)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                            >
                              View Pass
                            </button>
                            <button
                              onClick={() => handleCancelRegistration(ev.id)}
                              className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-500 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegisterEvent(ev.id)}
                            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                          >
                            {!currentUser && <Lock className="w-3.5 h-3.5" />}
                            <span>{currentUser ? "Register Now" : "Sign In to Register"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= PROFILE & AUTH SECTION ================= */}
        {activeTab === "profile" && (
          <div className="max-w-3xl mx-auto">
            {statusMsg.text && (
              <div
                className={`p-4 mb-6 rounded-2xl border text-xs font-medium flex items-center justify-between ${
                  statusMsg.type === "error"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                    : statusMsg.type === "warning"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                }`}
              >
                <span>{statusMsg.text}</span>
                <button onClick={() => setStatusMsg({ type: "", text: "" })}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentUser ? (
              /* Logged-In Profile Card */
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-700" />
                <div className="px-6 sm:px-8 pb-8">
                  <div className="relative flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
                    <div className="flex items-end gap-4">
                      <div className="w-24 h-24 rounded-3xl bg-slate-900 dark:bg-slate-800 border-4 border-white dark:border-slate-900 text-white font-black text-3xl flex items-center justify-center shadow-lg uppercase">
                        {(currentUser.full_name || currentUser.username || "U")[0]}
                      </div>
                      <div className="pb-1">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                          {currentUser.full_name || currentUser.username}
                        </h2>
                        <p className="text-xs text-slate-400">@{currentUser.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-bold capitalize">
                        {currentUser.role} Account
                      </span>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-slate-400 text-[11px]">Email Address</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.email || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3">
                      <Phone className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-slate-400 text-[11px]">Phone Number</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.phone || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-slate-400 text-[11px]">Department</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.department || "General"}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-slate-400 text-[11px]">Academic Batch</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.batch || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Guest Sign In / Sign Up Panel */
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {authMode === "signin" ? "Welcome Back" : "Create Your EventHub Account"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {authMode === "signin"
                        ? "Sign in to register for events and access your digital passes."
                        : "Register once to participate in campus events or apply as an organizer."}
                    </p>
                  </div>

                  {/* Mode Toggle Tabs */}
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start">
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                        authMode === "signin"
                          ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                        authMode === "signup"
                          ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {authMode === "signin" ? (
                  <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your username"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/25"
                    >
                      {loading ? "Signing In..." : "Sign In to Account"}
                    </button>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                      Demo Accounts: <strong>admin</strong> / <strong>organizer</strong> / <strong>student</strong> <br />
                      Passwords: <code>AdminPass123!</code> · <code>OrganizerPass123!</code> · <code>StudentPass123!</code>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sayed Obidul"
                          value={registerForm.full_name}
                          onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Username</label>
                        <input
                          type="text"
                          required
                          placeholder="Choose a unique username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="student@university.edu"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                        <input
                          type="text"
                          placeholder="+880 1XXX-XXXXXX"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Department</label>
                        <select
                          value={registerForm.department}
                          onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:border-indigo-500"
                        >
                          <option value="CSE">CSE</option>
                          <option value="FMRT">FMRT</option>
                          <option value="FES">FES</option>
                          <option value="MGT">MGT</option>
                          <option value="THM">THM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Batch</label>
                        <input
                          type="text"
                          placeholder="e.g. 2022-26"
                          value={registerForm.batch}
                          onChange={(e) => setRegisterForm({ ...registerForm, batch: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Password</label>
                        <input
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={registerForm.apply_organizer}
                        onChange={(e) => setRegisterForm({ ...registerForm, apply_organizer: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span>Request Organizer Privileges (requires Admin approval to host events)</span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/25"
                    >
                      {loading ? "Creating Account..." : "Create Account & Continue"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= MY REGISTRATIONS / PASSES ================= */}
        {activeTab === "registrations" && currentUser && (
          <div className="space-y-4">
            <h2 className="font-black text-xl">My Event Passes & Registrations</h2>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="p-4">Event</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Venue</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {reg.event_details?.title || "Event Registration"}
                      </td>
                      <td className="p-4 text-slate-500">
                        {reg.event_details?.date} · {reg.event_details?.time}
                      </td>
                      <td className="p-4 text-slate-500">
                        {reg.event_details?.venue_details?.name || "Campus"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            reg.status === "registered"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openGoogleCalendar(reg.event_details)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                        >
                          Calendar
                        </button>
                        <button
                          onClick={() => setShowTicketModal(reg.event_details)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold"
                        >
                          QR Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        You haven't registered for any events yet. Explore events on the Home tab!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= ADMIN USER MANAGEMENT ================= */}
        {activeTab === "users" && currentUser?.role === "admin" && (
          <div className="space-y-4">
            <h2 className="font-black text-xl">User Directory & Organizer Approvals</h2>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Dept & Batch</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="p-4 font-bold">
                        <div>{u.full_name || u.username}</div>
                        <div className="text-[11px] font-normal text-slate-400">@{u.username}</div>
                      </td>
                      <td className="p-4 text-slate-500">
                        <div>{u.email || "No email"}</div>
                        <div className="text-[11px]">{u.phone || "No phone"}</div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {u.department} · {u.batch}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-purple-500/10 text-purple-500"
                              : u.role === "organizer"
                              ? "bg-indigo-500/10 text-indigo-500"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.requested_role === "organizer" && u.role !== "organizer" ? (
                          <button
                            onClick={() => handleApproveOrganizer(u.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            Approve Organizer
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VENUES TAB ================= */}
        {activeTab === "venues" && (
          <div className="space-y-4">
            <h2 className="font-black text-xl">Campus Venues</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {venues.map((v) => (
                <div key={v.id} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <MapPin className="w-5 h-5 text-indigo-500 mb-3" />
                  <h4 className="font-bold text-sm">{v.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{v.location}</p>
                  <p className="text-xs font-bold text-indigo-500 mt-3">Capacity: {v.capacity} Seats</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-30">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* QR Poster Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-500">Event Share QR</span>
              <button onClick={() => setShowQRModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="font-bold text-base">{showQRModal.title}</h4>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${window.location.origin}/?event=${showQRModal.id}`
                )}`}
                alt="Event QR"
                className="w-44 h-44 rounded-xl"
              />
            </div>
            <p className="text-xs text-slate-400">
              Scan this code to view event details. Sign in required to complete registration.
            </p>
          </div>
        </div>
      )}

      {/* Digital Ticket Pass Modal */}
      {showTicketModal && currentUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Verified Entry Pass
              </span>
              <button onClick={() => setShowTicketModal(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center space-y-3">
              <h4 className="font-black text-base">{showTicketModal.title}</h4>
              <p className="text-xs text-slate-400">
                {showTicketModal.date} · {showTicketModal.time}
              </p>
              <div className="py-2 flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    `PASS:${showTicketModal.id}:${currentUser.username}`
                  )}`}
                  alt="Ticket Pass"
                  className="w-36 h-36 rounded-xl"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                PASS #{showTicketModal.id}-{(currentUser.username || "").toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base">Publish New Event</h4>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Competition">Competition</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Career">Career</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Venue</label>
                  <select
                    required
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="">Select Venue</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Cap: {v.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Max Capacity</label>
                  <input
                    type="number"
                    required
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Registration Deadline</label>
                  <input
                    type="date"
                    required
                    value={newEvent.registration_deadline}
                    onChange={(e) => setNewEvent({ ...newEvent, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition"
              >
                {loading ? "Publishing..." : "Publish Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
