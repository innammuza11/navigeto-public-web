import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Browser } from "@capacitor/browser";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  Home,
  Hotel,
  LoaderCircle,
  LogOut,
  MapPin,
  MessageCircle,
  Plane,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Stamp,
  UserRound,
  Users,
  WifiOff,
  X
} from "lucide-react";
import { deactivateCurrentDevice, initializeNative } from "./lib/native";
import { env, supabase } from "./lib/supabase";
import {
  createCustomerEnquiry,
  listFeaturedTours,
  listMyEnquiries,
  listMyNotifications,
  listTours,
  type CustomerEnquiry,
  type PublicTour
} from "./lib/travelos";

type Tab = "home" | "explore" | "request" | "trips" | "account";

type Profile = {
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  nationality: string;
  marketing_opt_in: boolean;
};

const services = [
  { title: "Hotels", subtitle: "Live approved selling rates", path: "/hotels", icon: Hotel },
  { title: "Transfers", subtitle: "Private airport and island travel", path: "/transfers", icon: Car },
  { title: "Flights", subtitle: "Request checked flight options", path: "/flights", icon: Plane },
  { title: "Visas", subtitle: "Requirements and application support", path: "/visas", icon: Stamp }
];

function formatDate(value?: string | null) {
  if (!value) return "Dates to be confirmed";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function enquiryStatus(status: string) {
  const labels: Record<string, string> = {
    new: "Received",
    assigned: "With consultant",
    quoted: "Quotation ready",
    converted: "Booking started",
    closed: "Closed",
    spam: "Closed"
  };
  return labels[status] || status.replaceAll("_", " ");
}

async function openWebsite(path: string) {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  await Browser.open({ url: `${env.VITE_PUBLIC_WEB_URL.replace(/\/$/, "")}${safePath}` });
}

function AuthPanel({ onClose }: { onClose?: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    if (mode === "signin") {
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) setError(result.error.message);
      else onClose?.();
    } else {
      const result = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } }
      });
      if (result.error) setError(result.error.message);
      else if (result.data.session) onClose?.();
      else setMessage("Account created. Check your email to confirm your account, then sign in.");
    }
    setPending(false);
  }

  return <section className="auth-card">
    <div className="auth-heading">
      <div><p className="eyebrow">MY NAVIGETO</p><h2>{mode === "signin" ? "Welcome back" : "Create your travel account"}</h2></div>
      {onClose ? <button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={20} /></button> : null}
    </div>
    <p className="muted">Save your requests and receive quotation, booking and visa updates in one secure place.</p>
    <form className="stack-form" onSubmit={submit}>
      {mode === "signup" ? <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label> : null}
      <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error ? <div className="alert error">{error}</div> : null}
      {message ? <div className="alert success">{message}</div> : null}
      <button className="primary-button" disabled={pending}>
        {pending ? <LoaderCircle className="spin" size={18} /> : <ShieldCheck size={18} />}
        {pending ? "Please wait…" : mode === "signin" ? "Secure sign in" : "Create account"}
      </button>
    </form>
    <button type="button" className="text-button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>
      {mode === "signin" ? "New to Navigeto? Create an account" : "Already registered? Sign in"}
    </button>
  </section>;
}

function TourCard({ tour, onRequest }: { tour: PublicTour; onRequest: (tour: PublicTour) => void }) {
  return <article className="tour-card">
    {tour.hero_image_url ? <img src={tour.hero_image_url} alt="" /> : <div className="tour-placeholder"><MapPin size={34} /></div>}
    <div className="tour-content">
      <div className="tour-meta"><span>{tour.duration_nights} nights</span><span>{tour.country || "Sri Lanka"}</span></div>
      <h3>{tour.title}</h3>
      <p>{tour.summary}</p>
      <div className="destination-line"><MapPin size={15} />{tour.destinations.slice(0, 4).join(" · ") || "Tailor-made route"}</div>
      <div className="tour-footer">
        <strong>{tour.price_from ? `From ${tour.currency} ${tour.price_from.toLocaleString()}` : "Price on request"}</strong>
        <button type="button" onClick={() => onRequest(tour)}>Request <ChevronRight size={17} /></button>
      </div>
    </div>
  </article>;
}

function RequestForm({ session, selectedTour, onCreated }: {
  session: Session;
  selectedTour: PublicTour | null;
  onCreated: (enquiry: CustomerEnquiry) => void;
}) {
  const [form, setForm] = useState({
    customer_name: String(session.user.user_metadata?.full_name || ""),
    whatsapp: "",
    nationality: "",
    travel_start_date: "",
    travel_end_date: "",
    adults: "2",
    children: "0",
    hotel_category: "4 Star",
    subject: selectedTour?.title || "",
    notes: selectedTour ? `I am interested in ${selectedTour.title}.` : ""
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedTour) return;
    setForm((current) => ({ ...current, subject: selectedTour.title, notes: `I am interested in ${selectedTour.title}.` }));
  }, [selectedTour]);

  function set(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const enquiry = await createCustomerEnquiry({
        enquiry_type: selectedTour ? "tour" : "custom_trip",
        customer_name: form.customer_name,
        whatsapp: form.whatsapp,
        email: session.user.email,
        nationality: form.nationality,
        travel_start_date: form.travel_start_date || null,
        travel_end_date: form.travel_end_date || null,
        pax: Number(form.adults || 0) + Number(form.children || 0),
        subject: form.subject || "Mobile app trip request",
        notes: form.notes,
        details: {
          adults: Number(form.adults || 0),
          children: Number(form.children || 0),
          hotel_category: form.hotel_category,
          public_package_id: selectedTour?.id || null,
          public_package_slug: selectedTour?.slug || null
        }
      });
      onCreated(enquiry);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your request could not be submitted.");
    } finally {
      setPending(false);
    }
  }

  return <form className="request-card" onSubmit={submit}>
    <div className="section-title"><div><p className="eyebrow">TRIP REQUEST</p><h2>{selectedTour ? selectedTour.title : "Plan a tailor-made journey"}</h2></div><Sparkles size={25} /></div>
    <div className="form-grid">
      <label>Full name<input value={form.customer_name} onChange={(event) => set("customer_name", event.target.value)} required /></label>
      <label>WhatsApp<input inputMode="tel" placeholder="Include country code" value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} required /></label>
      <label>Nationality<input value={form.nationality} onChange={(event) => set("nationality", event.target.value)} /></label>
      <label>Hotel preference<select value={form.hotel_category} onChange={(event) => set("hotel_category", event.target.value)}><option>3 Star</option><option>4 Star</option><option>5 Star</option><option>Luxury Boutique</option><option>Mixed Category</option></select></label>
      <label>Arrival date<input type="date" value={form.travel_start_date} onChange={(event) => set("travel_start_date", event.target.value)} /></label>
      <label>Departure date<input type="date" min={form.travel_start_date || undefined} value={form.travel_end_date} onChange={(event) => set("travel_end_date", event.target.value)} /></label>
      <label>Adults<input type="number" min="1" value={form.adults} onChange={(event) => set("adults", event.target.value)} /></label>
      <label>Children<input type="number" min="0" value={form.children} onChange={(event) => set("children", event.target.value)} /></label>
      <label className="wide">Trip or package<input value={form.subject} onChange={(event) => set("subject", event.target.value)} /></label>
      <label className="wide">Places, interests and special requests<textarea rows={5} value={form.notes} onChange={(event) => set("notes", event.target.value)} /></label>
    </div>
    {error ? <div className="alert error">{error}</div> : null}
    <button className="primary-button" disabled={pending}>{pending ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}{pending ? "Sending to TravelOS…" : "Submit trip request"}</button>
  </form>;
}

function TripsScreen({ enquiries, loading, onRefresh }: { enquiries: CustomerEnquiry[]; loading: boolean; onRefresh: () => void }) {
  return <section>
    <div className="screen-heading"><div><p className="eyebrow">MY NAVIGETO</p><h2>Requests and journeys</h2></div><button type="button" className="icon-button" onClick={onRefresh} aria-label="Refresh"><RefreshCw size={19} className={loading ? "spin" : ""} /></button></div>
    {loading ? <div className="empty-state"><LoaderCircle className="spin" /><p>Loading your requests…</p></div> : null}
    {!loading && !enquiries.length ? <div className="empty-state"><BriefcaseBusiness size={38} /><h3>No requests yet</h3><p>Send your first trip request and follow every update here.</p></div> : null}
    <div className="request-list">
      {enquiries.map((item) => <article className="request-item" key={item.id}>
        <div className="request-top"><span className={`status ${item.status}`}>{enquiryStatus(item.status)}</span><small>{item.public_ref}</small></div>
        <h3>{item.subject || item.enquiry_type.replaceAll("_", " ")}</h3>
        <div className="request-details"><span><CalendarDays size={15} />{formatDate(item.travel_start_date)}</span><span><Users size={15} />{item.pax || "—"} travellers</span></div>
        <p>Submitted {new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.created_at))}</p>
      </article>)}
    </div>
  </section>;
}

function AccountScreen({ session, onSignOut }: { session: Session; onSignOut: () => Promise<void> }) {
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: session.user.email || "", phone: "", whatsapp: "", nationality: "", marketing_opt_in: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void supabase.from("travelos_public_customer_profiles").select("full_name,email,phone,whatsapp,nationality,marketing_opt_in").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({
          full_name: data.full_name || "",
          email: data.email || session.user.email || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          nationality: data.nationality || "",
          marketing_opt_in: Boolean(data.marketing_opt_in)
        });
      }).finally(() => setLoading(false));
  }, [session.user.email, session.user.id]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("travelos_public_customer_profiles").upsert({ id: session.user.id, ...profile });
    setMessage(error ? "Profile could not be saved." : "Profile saved.");
    setSaving(false);
  }

  if (loading) return <div className="empty-state"><LoaderCircle className="spin" /></div>;

  return <section>
    <div className="screen-heading"><div><p className="eyebrow">ACCOUNT</p><h2>Your traveller profile</h2></div><UserRound size={30} /></div>
    <form className="request-card" onSubmit={save}>
      <div className="form-grid">
        <label>Full name<input value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} /></label>
        <label>Email<input value={profile.email} disabled /></label>
        <label>Phone<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
        <label>WhatsApp<input value={profile.whatsapp} onChange={(event) => setProfile({ ...profile, whatsapp: event.target.value })} /></label>
        <label className="wide">Nationality<input value={profile.nationality} onChange={(event) => setProfile({ ...profile, nationality: event.target.value })} /></label>
      </div>
      <label className="check-line"><input type="checkbox" checked={profile.marketing_opt_in} onChange={(event) => setProfile({ ...profile, marketing_opt_in: event.target.checked })} />Send me useful travel offers and inspiration.</label>
      {message ? <div className={`alert ${message === "Profile saved." ? "success" : "error"}`}>{message}</div> : null}
      <button className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spin" size={18} /> : <CheckCircle2 size={18} />}{saving ? "Saving…" : "Save profile"}</button>
    </form>
    <button type="button" className="danger-button" onClick={() => void onSignOut()}><LogOut size={18} />Sign out</button>
    <button type="button" className="text-button" onClick={() => void openWebsite("/privacy")}>Privacy and account deletion</button>
  </section>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [connected, setConnected] = useState(true);
  const [featuredTours, setFeaturedTours] = useState<PublicTour[]>([]);
  const [tours, setTours] = useState<PublicTour[]>([]);
  const [tourSearch, setTourSearch] = useState("");
  const [toursLoading, setToursLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<PublicTour | null>(null);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [successRef, setSuccessRef] = useState("");

  const userName = useMemo(() => session?.user.user_metadata?.full_name || session?.user.email?.split("@")[0] || "Traveller", [session]);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setAuthLoading(false); });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    void Promise.all([listFeaturedTours(), listTours()])
      .then(([featured, all]) => { setFeaturedTours(featured); setTours(all); })
      .catch(() => undefined)
      .finally(() => setToursLoading(false));
  }, []);

  async function loadTrips() {
    if (!session) return;
    setTripsLoading(true);
    try { setEnquiries(await listMyEnquiries()); } finally { setTripsLoading(false); }
  }

  async function refreshNotifications() {
    if (!session) return;
    try {
      const notifications = await listMyNotifications();
      setNotificationCount(notifications.filter((item) => !item.read_at).length);
    } catch {
      setNotificationCount(0);
    }
  }

  useEffect(() => {
    if (!session) { setEnquiries([]); setNotificationCount(0); return; }
    void loadTrips();
    void refreshNotifications();
    void initializeNative(session.user.id, {
      onNetworkChange: setConnected,
      onDeepLink: (path) => {
        if (path.includes("request")) setTab("request");
        else if (path.includes("booking") || path.includes("trip") || path.includes("quotation")) setTab("trips");
      },
      onNotification: () => { void refreshNotifications(); void loadTrips(); }
    });
  }, [session?.user.id]);

  async function searchTours(event: FormEvent) {
    event.preventDefault();
    setToursLoading(true);
    try { setTours(await listTours(tourSearch)); } finally { setToursLoading(false); }
  }

  function requestTour(tour: PublicTour) {
    setSelectedTour(tour);
    setSuccessRef("");
    setTab("request");
  }

  async function signOut() {
    if (session) await deactivateCurrentDevice(session.user.id);
    await supabase.auth.signOut();
    setTab("home");
  }

  function requireAccount(nextTab: Tab) {
    if (!session) { setShowAuth(true); return; }
    setTab(nextTab);
  }

  const content = (() => {
    if (tab === "home") return <>
      <section className="hero-card">
        <div className="hero-copy"><p className="eyebrow light">SRI LANKA · HOLIDAYS · VISAS · FLIGHTS</p><h1>Your whole journey, connected.</h1><p>Discover ideas, send one clear request and follow the quotation and booking journey with Navigeto.</p><div className="hero-actions"><button type="button" onClick={() => requireAccount("request")}><Sparkles size={18} />Plan my trip</button><button type="button" onClick={() => setTab("explore")}>Explore tours</button></div></div>
        <div className="island-mark" aria-hidden="true">LK</div>
      </section>
      <section className="service-grid">
        {services.map((service) => { const Icon = service.icon; return <button type="button" key={service.title} onClick={() => void openWebsite(service.path)}><span><Icon size={23} /></span><strong>{service.title}</strong><small>{service.subtitle}</small></button>; })}
      </section>
      <section className="content-section">
        <div className="section-title"><div><p className="eyebrow">FEATURED JOURNEYS</p><h2>Start with a route you love</h2></div><button type="button" className="text-button inline" onClick={() => setTab("explore")}>View all</button></div>
        <div className="tour-list">{featuredTours.slice(0, 3).map((tour) => <TourCard tour={tour} onRequest={requestTour} key={tour.id} />)}</div>
      </section>
      <section className="support-card"><MessageCircle size={28} /><div><h3>Real local support</h3><p>Your request goes directly into Navigeto TravelOS for our Sri Lanka-based team to review.</p></div><button type="button" onClick={() => void openWebsite("/custom-trip")}><ChevronRight /></button></section>
    </>;

    if (tab === "explore") return <section>
      <div className="screen-heading"><div><p className="eyebrow">EXPLORE</p><h2>Tours and holiday ideas</h2></div><Compass size={31} /></div>
      <form className="search-bar" onSubmit={searchTours}><Search size={19} /><input value={tourSearch} onChange={(event) => setTourSearch(event.target.value)} placeholder="Search destinations or tours" /><button>Search</button></form>
      {toursLoading ? <div className="empty-state"><LoaderCircle className="spin" /><p>Loading journeys…</p></div> : <div className="tour-list">{tours.map((tour) => <TourCard tour={tour} onRequest={requestTour} key={tour.id} />)}</div>}
    </section>;

    if (tab === "request") {
      if (!session) return <AuthPanel />;
      if (successRef) return <section className="success-card"><CheckCircle2 size={54} /><p className="eyebrow">REQUEST RECEIVED</p><h2>{successRef}</h2><p>Your request is now inside Navigeto TravelOS. The team can match your customer record and begin the quotation workflow.</p><button className="primary-button" onClick={() => setTab("trips")}>View my requests</button><button className="text-button" onClick={() => { setSuccessRef(""); setSelectedTour(null); }}>Send another request</button></section>;
      return <RequestForm session={session} selectedTour={selectedTour} onCreated={(enquiry) => { setSuccessRef(enquiry.public_ref); setEnquiries((current) => [enquiry, ...current]); }} />;
    }

    if (tab === "trips") return session ? <TripsScreen enquiries={enquiries} loading={tripsLoading} onRefresh={() => void loadTrips()} /> : <AuthPanel />;
    return session ? <AccountScreen session={session} onSignOut={signOut} /> : <AuthPanel />;
  })();

  if (authLoading) return <main className="loading-screen"><div className="brand-mark">N</div><LoaderCircle className="spin" /><p>Opening Navigeto…</p></main>;

  return <div className="app-root">
    <header className="app-header">
      <button type="button" className="brand-button" onClick={() => setTab("home")}><span className="brand-mark small">N</span><span><strong>Navigeto</strong><small>Travel & Holidays</small></span></button>
      <div className="header-actions">
        {!connected ? <span className="offline" title="Offline"><WifiOff size={19} /></span> : null}
        <button type="button" className="notification-button" onClick={() => requireAccount("trips")}><Bell size={21} />{notificationCount ? <span>{notificationCount > 9 ? "9+" : notificationCount}</span> : null}</button>
        <button type="button" className="avatar-button" onClick={() => requireAccount("account")}>{session ? userName.slice(0, 1).toUpperCase() : <UserRound size={20} />}</button>
      </div>
    </header>
    {!connected ? <div className="network-banner"><WifiOff size={17} />You are offline. Saved trip documents will be available in a later offline-data sprint.</div> : null}
    <main className="app-content">{content}</main>
    <nav className="bottom-nav" aria-label="Main navigation">
      <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><Home size={21} /><span>Home</span></button>
      <button className={tab === "explore" ? "active" : ""} onClick={() => setTab("explore")}><Compass size={21} /><span>Explore</span></button>
      <button className={`request-tab ${tab === "request" ? "active" : ""}`} onClick={() => requireAccount("request")}><Send size={22} /><span>Request</span></button>
      <button className={tab === "trips" ? "active" : ""} onClick={() => requireAccount("trips")}><BriefcaseBusiness size={21} /><span>My trips</span></button>
      <button className={tab === "account" ? "active" : ""} onClick={() => requireAccount("account")}><UserRound size={21} /><span>Account</span></button>
    </nav>
    {showAuth && !session ? <div className="modal-backdrop" onMouseDown={() => setShowAuth(false)}><div className="modal-sheet" onMouseDown={(event) => event.stopPropagation()}><AuthPanel onClose={() => setShowAuth(false)} /></div></div> : null}
  </div>;
}
