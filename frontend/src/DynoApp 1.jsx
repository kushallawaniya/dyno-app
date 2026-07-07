import { useState, useEffect } from "react";
import Login from "./pages/Login";

// ── Data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "driver", icon: "🚗", label: "Driver", base: 800 },
  { id: "caretaker", icon: "👶", label: "Caretaker", base: 700 },
  { id: "cleaner", icon: "🏠", label: "House Cleaner", base: 500 },
  { id: "chef", icon: "👨‍🍳", label: "Chef / Cook", base: 900 },
  { id: "handyman", icon: "🔧", label: "Handyman", base: 650 },
  { id: "security", icon: "🛡️", label: "Security Guard", base: 750 },
  { id: "assistant", icon: "💼", label: "Office Assistant", base: 600 },
  { id: "delivery", icon: "📦", label: "Delivery Helper", base: 550 },
];

const WORKERS = [
  { id: 1, name: "Rajan Mehta", category: "driver", rating: 4.9, jobs: 312, rate: 800, location: "Delhi", verified: true, exp: "5 yrs", img: "👨‍✈️", bio: "Professional driver with clean record. Available for city, outstation & wedding trips.", avail: "Immediate" },
  { id: 2, name: "Sunita Devi", category: "caretaker", rating: 4.8, jobs: 198, rate: 700, location: "Noida", verified: true, exp: "4 yrs", img: "👩‍⚕️", bio: "Experienced elderly & child care. First aid certified. Gentle, trustworthy, punctual.", avail: "Tomorrow" },
  { id: 3, name: "Mohan Sharma", category: "cleaner", rating: 4.7, jobs: 540, rate: 450, location: "Gurgaon", verified: true, exp: "6 yrs", img: "🧹", bio: "Deep cleaning specialist. Brings own equipment. Trusted by 200+ families.", avail: "Immediate" },
  { id: 4, name: "Priya Nair", category: "chef", rating: 5.0, jobs: 87, rate: 950, location: "Delhi", verified: true, exp: "3 yrs", img: "👩‍🍳", bio: "South Indian & North Indian cuisine expert. Hygienic, creative, and punctual.", avail: "Weekends" },
  { id: 5, name: "Arjun Singh", category: "handyman", rating: 4.6, jobs: 421, rate: 600, location: "Faridabad", verified: true, exp: "7 yrs", img: "🔨", bio: "Electrician + plumber + carpentry. All-in-one repair expert. Affordable rates.", avail: "Immediate" },
  { id: 6, name: "Kavita Rao", category: "caretaker", rating: 4.9, jobs: 264, rate: 750, location: "Delhi", verified: true, exp: "5 yrs", img: "👩‍🦱", bio: "Nanny & elderly care. Background checked. References from 50+ families.", avail: "Immediate" },
  { id: 7, name: "Deepak Kumar", category: "driver", rating: 4.5, jobs: 189, rate: 750, location: "Gurgaon", verified: false, exp: "2 yrs", img: "🧑‍✈️", bio: "Reliable city driver. Knows Delhi NCR thoroughly. App-based tracking enabled.", avail: "Tomorrow" },
  { id: 8, name: "Ramesh Patel", category: "security", rating: 4.7, jobs: 93, rate: 800, location: "Noida", verified: true, exp: "4 yrs", img: "💂", bio: "Ex-army trained. Event security specialist. Night shifts available.", avail: "Immediate" },
];

const BOOKINGS = [
  { id: "B001", worker: "Rajan Mehta", role: "Driver", date: "Apr 18–21", amount: 3200, status: "completed" },
  { id: "B002", worker: "Sunita Devi", role: "Caretaker", date: "Apr 24–27", amount: 2800, status: "active" },
  { id: "B003", worker: "Priya Nair", role: "Chef", date: "Apr 30", amount: 950, status: "upcoming" },
];

// ── Styles ─────────────────────────────────────────────────────────────
const S = {
  app: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "#0A0A0F",
    color: "#FFFFFF",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
  background: "rgba(10,10,15,0.95)",
  borderBottom: "1px solid rgba(255,107,0,0.2)",
  padding: "0 1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  minHeight: 60,
  position: "sticky",
  top: 0,
  zIndex: 100,
  backdropFilter: "blur(12px)",
},
  logo: { fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#FF6B00", letterSpacing: 1 },
  navLinks: { display: "flex", gap: "0.8rem", alignItems: "center",flexWrap: "wrap" },
  navLink: { color: "#AAA", cursor: "pointer", fontSize: 14, transition: "color 0.2s" },
  navLinkActive: { color: "#FF6B00", fontWeight: 600 },
  pill: { background: "#FF6B00", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 },
  main: { flex: 1 },
  hero: {
    background: "linear-gradient(135deg, #0A0A0F 0%, #10101E 50%, #0F0A00 100%)",
    padding: "3rem 1rem",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroTag: { display: "inline-block", background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)", color: "#FF9A3C", borderRadius: 20, padding: "6px 16px", fontSize: 13, marginBottom: "1.5rem" },
  heroTitle: { fontFamily: "Georgia, serif", fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 700, margin: "0 0 1rem", lineHeight: 1.1 },
  heroSub: { color: "#999", fontSize: "1.1rem", maxWidth: 520, margin: "0 auto 2.5rem", lineHeight: 1.7 },
  heroBtns: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" },
  btnPrimary: { background: "#FF6B00", color: "#fff", border: "none", borderRadius: 8, padding: "14px 32px", cursor: "pointer", fontWeight: 700, fontSize: 15, transition: "transform 0.15s, box-shadow 0.15s" },
  btnOutline: { background: "transparent", color: "#FF6B00", border: "2px solid #FF6B00", borderRadius: 8, padding: "14px 32px", cursor: "pointer", fontWeight: 700, fontSize: 15, transition: "transform 0.15s" },
  statsBar: { display: "flex", justifyContent: "center", gap: "3rem", marginTop: "3rem", flexWrap: "wrap" },
  statItem: { textAlign: "center" },
  statNum: { fontFamily: "Georgia, serif", fontSize: "2.2rem", fontWeight: 700, color: "#FF6B00" },
  statLabel: { fontSize: "0.8rem", color: "#666", marginTop: 4 },
  section: { padding: "2rem 1rem", maxWidth: "100%", margin: "0 auto" },
  sectionTitle: { fontFamily: "Georgia, serif", fontSize: "2.2rem", fontWeight: 700, marginBottom: "0.5rem" },
  sectionSub: { color: "#888", marginBottom: "2.5rem", fontSize: "0.95rem" },
  grid: { display: "grid", gap: "1.5rem" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem" },
  catCard: { background: "#16162A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.25rem 0.75rem", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s" },
  catCardActive: { borderColor: "#FF6B00", background: "rgba(255,107,0,0.08)" },
  catIcon: { fontSize: 32, marginBottom: 8 },
  catLabel: { fontSize: 12, color: "#CCC" },
  workerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" },
  workerCard: { background: "#16162A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.4rem", transition: "border-color 0.2s, transform 0.2s", cursor: "pointer" },
  workerHead: { display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "0.85rem" },
  workerAvatar: { width: 52, height: 52, borderRadius: 12, background: "#0A0A1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: "2px solid rgba(255,107,0,0.3)" },
  workerName: { fontWeight: 700, fontSize: 15 },
  workerRole: { color: "#888", fontSize: 12, marginTop: 2 },
  badge: { display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,107,0,0.12)", color: "#FF9A3C", borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 600, marginTop: 4 },
  stars: { color: "#FF6B00", fontSize: 13 },
  workerMeta: { display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: 12, color: "#888" },
  workerFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.06)" },
  rateText: { fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#FF6B00" },
  hireBtn: { background: "#FF6B00", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 },
  formContainer: { background: "#16162A", border: "1px solid rgba(255,107,0,0.15)", borderRadius: 16, padding: "2rem", maxWidth: 520 },
  formTitle: { fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" },
  formGroup: { marginBottom: "1.25rem" },
  formLabel: { display: "block", fontSize: 13, color: "#AAA", marginBottom: 6, fontWeight: 500 },
  formInput: { width: "100%", background: "#0A0A0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#FFF", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  formSelect: { width: "100%", background: "#0A0A0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#FFF", fontSize: 14, outline: "none", boxSizing: "border-box" },
  bookingCard: { background: "#16162A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" },
  statusPill: { borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 },
  footer: { background: "#0A0A0F", borderTop: "1px solid rgba(255,107,0,0.1)", padding: "2.5rem 2rem", textAlign: "center" },
};

// ── Components ──────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const links = ["Home", "Browse", "Post Job", "Bookings"];
  return (
    <nav style={S.nav}>
      <div style={S.logo}>DYNO</div>
      <div style={S.navLinks}>
        {links.map(l => (
          <span key={l}
            style={{ ...S.navLink, ...(page === l ? S.navLinkActive : {}) }}
            onClick={() => setPage(l)}>{l}</span>
        ))}
        <button style={S.pill} onClick={() => setPage("Browse")}>Get Started</button>
      </div>
    </nav>
  );
}

function Home({ setPage }) {
  return (
    <>
      <div style={S.hero}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: 300, height: 300, background: "rgba(255,107,0,0.06)", borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: 250, height: 250, background: "rgba(255,107,0,0.04)", borderRadius: "50%", filter: "blur(60px)" }} />

        <div style={S.heroTag}>🚀 Flexible Employment, Redefined</div>
        <h1 style={S.heroTitle}>
          Hire Anyone.<br />
          <span style={{ color: "#FF6B00" }}>Any Time.</span>
        </h1>
        <p style={S.heroSub}>
          DYNO connects you with verified, skilled workers — by the hour, day, or week. Drivers, caretakers, chefs, cleaners, and more. Instantly.
        </p>
        <div style={S.heroBtns}>
          <button style={S.btnPrimary} onClick={() => setPage("Browse")}>Browse Workers</button>
          <button style={S.btnOutline} onClick={() => setPage("Post Job")}>Post a Job</button>
        </div>
        <div style={S.statsBar}>
          {[["12,000+", "Verified Workers"], ["98%", "Satisfaction Rate"], ["3 mins", "Avg. Match Time"], ["50+ Cities", "Across India"]].map(([n, l]) => (
            <div key={l} style={S.statItem}>
              <div style={S.statNum}>{n}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ ...S.section, maxWidth: 1100 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ color: "#FF6B00", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>SIMPLE PROCESS</p>
          <h2 style={S.sectionTitle}>How DYNO Works</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {[
            { step: "01", icon: "📋", title: "Post Your Need", desc: "Describe the role, schedule, and duration you need." },
            { step: "02", icon: "🔍", title: "Browse Matches", desc: "DYNO shows verified workers available near you." },
            { step: "03", icon: "💬", title: "Chat & Select", desc: "Review profiles, read reviews, and chat before hiring." },
            { step: "04", icon: "✅", title: "Hire & Track", desc: "Hire with one tap. Track work progress in the app." },
            { step: "05", icon: "💳", title: "Pay Securely", desc: "Escrow-protected payment. Pay only when satisfied." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} style={{ background: "#16162A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "1.5rem", position: "relative" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 42, fontWeight: 700, color: "rgba(255,107,0,0.1)", position: "absolute", top: 12, right: 14, lineHeight: 1 }}>{step}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{title}</div>
              <div style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ background: "#0C0C16", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: "#FF6B00", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>WORKERS WE OFFER</p>
            <h2 style={S.sectionTitle}>Browse by Category</h2>
          </div>
          <div style={S.catGrid}>
            {CATEGORIES.map(cat => (
              <div key={cat.id} style={{ ...S.catCard, ":hover": {} }}>
                <div style={S.catIcon}>{cat.icon}</div>
                <div style={{ ...S.catLabel, fontWeight: 600, color: "#DDD" }}>{cat.label}</div>
                <div style={{ fontSize: 11, color: "#FF6B00", marginTop: 4 }}>From ₹{cat.base}/day</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ ...S.section, maxWidth: 1100 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ color: "#FF6B00", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>TESTIMONIALS</p>
          <h2 style={S.sectionTitle}>What People Say</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {[
            { name: "Anjali Kapoor", role: "Hired a Caretaker", stars: 5, text: "Found an amazing caretaker for my mother within 20 minutes. She was verified, gentle, and absolutely trustworthy. DYNO is a lifesaver!" },
            { name: "Vikram Malhotra", role: "Hired a Driver", stars: 5, text: "Needed a driver for 4 days for a family trip. Rajan was punctual, knew all routes, and was extremely professional. Will use DYNO again!" },
            { name: "Neha Sharma", role: "Hired a Chef", stars: 5, text: "Priya cooked incredible food for our family event. The booking was seamless and payment was secure. Highly recommend DYNO!" },
          ].map(({ name, role, stars, text }) => (
            <div key={name} style={{ background: "#16162A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.4rem" }}>
              <div style={{ color: "#FF6B00", fontSize: 18, marginBottom: 10 }}>{"★".repeat(stars)}</div>
              <p style={{ color: "#CCC", fontSize: 14, lineHeight: 1.7, marginBottom: "1rem" }}>"{text}"</p>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
              <div style={{ color: "#888", fontSize: 12 }}>{role}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Browse({ setPage, setHireTarget }) {
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [selected, setSelected] = useState(null);

  const filtered = WORKERS
    .filter(w => activeCat === "all" || w.category === activeCat)
    .filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.location.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "rating" ? b.rating - a.rating : a.rate - b.rate);

  function openWorker(w) { setSelected(w); }

  if (selected) return (
    <div style={{ ...S.section, maxWidth: 700 }}>
      <button onClick={() => setSelected(null)} style={{ ...S.btnOutline, padding: "8px 18px", fontSize: 13, marginBottom: "1.5rem" }}>← Back</button>
      <div style={{ background: "#16162A", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 16, padding: "2rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: 16, background: "#0A0A1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, border: "2px solid rgba(255,107,0,0.3)", flexShrink: 0 }}>{selected.img}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif" }}>{selected.name}</h2>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 6 }}>{CATEGORIES.find(c => c.id === selected.category)?.label} · {selected.location}</div>
            {selected.verified && <span style={{ ...S.badge }}>✅ Verified Pro</span>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#FF6B00" }}>₹{selected.rate}</div>
            <div style={{ color: "#888", fontSize: 12 }}>/day</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          {[["⭐ Rating", `${selected.rating}/5`], ["✅ Jobs", selected.jobs], ["🕐 Exp", selected.exp], ["📍 Avail", selected.avail]].map(([k, v]) => (
            <div key={k} style={{ background: "#0A0A0F", borderRadius: 10, padding: "0.75rem", textAlign: "center" }}>
              <div style={{ color: "#888", fontSize: 11 }}>{k}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
        <p style={{ color: "#BBB", fontSize: 14, lineHeight: 1.7, marginBottom: "1.5rem" }}>{selected.bio}</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button style={{ ...S.btnPrimary, flex: 1 }} onClick={() => { setHireTarget(selected); setPage("Post Job"); }}>Hire {selected.name.split(" ")[0]}</button>
          <button style={{ ...S.btnOutline, padding: "14px 20px" }}>💬 Chat</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>Browse Workers</h2>
      <p style={S.sectionSub}>Find verified, skilled workers near you</p>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="🔍  Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...S.formInput, width: "100%", maxWidth: 260, flex: "1" }}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...S.formSelect, maxWidth: 180 }}>
          <option value="rating">Sort: Top Rated</option>
          <option value="rate">Sort: Lowest Rate</option>
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <button onClick={() => setActiveCat("all")}
          style={{ ...S.pill, background: activeCat === "all" ? "#FF6B00" : "transparent", border: "1px solid rgba(255,107,0,0.4)", color: activeCat === "all" ? "#fff" : "#FF9A3C", padding: "6px 14px", fontSize: 13 }}>
          All
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            style={{ ...S.pill, background: activeCat === cat.id ? "#FF6B00" : "transparent", border: "1px solid rgba(255,107,0,0.4)", color: activeCat === cat.id ? "#fff" : "#FF9A3C", padding: "6px 14px", fontSize: 13 }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Worker cards */}
      <div style={S.workerGrid}>
        {filtered.map(w => (
          <div key={w.id} style={S.workerCard} onClick={() => openWorker(w)}>
            <div style={S.workerHead}>
              <div style={S.workerAvatar}>{w.img}</div>
              <div style={{ flex: 1 }}>
                <div style={S.workerName}>{w.name}</div>
                <div style={S.workerRole}>{CATEGORIES.find(c => c.id === w.category)?.label} · {w.location}</div>
                {w.verified && <span style={S.badge}>✅ Verified</span>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={S.stars}>{"★".repeat(Math.floor(w.rating))}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{w.rating}</span>
              <span style={{ color: "#666", fontSize: 12 }}>({w.jobs} jobs)</span>
            </div>
            <div style={S.workerMeta}>
              <span>🕐 {w.exp}</span>
              <span>📍 {w.avail}</span>
            </div>
            <div style={S.workerFooter}>
              <div>
                <span style={S.rateText}>₹{w.rate}</span>
                <span style={{ color: "#666", fontSize: 12 }}>/day</span>
              </div>
              <button style={S.hireBtn} onClick={e => { e.stopPropagation(); setHireTarget(w); setPage("Post Job"); }}>Hire Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostJob({ hireTarget, setHireTarget, setPage }) {
  const [form, setForm] = useState({
    category: hireTarget?.category || "",
    location: "",
    startDate: "",
    days: "1",
    budget: hireTarget ? String(hireTarget.rate) : "",
    desc: "",
    name: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handle(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function submit() {
    if (!form.category || !form.location || !form.startDate || !form.name || !form.phone) {
      alert("Please fill all required fields.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) return (
    <div style={{ ...S.section, maxWidth: 520, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: "1rem" }}>✅</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", marginBottom: "0.75rem" }}>Job Posted!</h2>
      <p style={{ color: "#888", lineHeight: 1.7, marginBottom: "2rem" }}>
        Your job has been posted successfully. Dyno will match you with available verified workers shortly.
        You'll receive a confirmation on <strong style={{ color: "#FF6B00" }}>{form.phone}</strong>.
      </p>
      <div style={{ background: "#16162A", border: "1px solid rgba(255,107,0,0.15)", borderRadius: 12, padding: "1.25rem", marginBottom: "2rem", textAlign: "left" }}>
        {[["Role", CATEGORIES.find(c => c.id === form.category)?.label], ["Location", form.location], ["Start Date", form.startDate], ["Duration", `${form.days} day(s)`], ["Budget", `₹${form.budget}/day`]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14 }}>
            <span style={{ color: "#888" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button style={S.btnPrimary} onClick={() => { setPage("Bookings"); }}>View Bookings</button>
        <button style={S.btnOutline} onClick={() => { setSubmitted(false); setHireTarget(null); }}>Post Another</button>
      </div>
    </div>
  );

  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>Post a Job</h2>
      <p style={S.sectionSub}>Tell us what you need — we'll find the right person</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start", maxWidth: 900 }}>
        {/* Form */}
        <div style={S.formContainer}>
          {hireTarget && (
            <div style={{ background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 10, padding: "0.85rem 1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: 24 }}>{hireTarget.img}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Hiring: {hireTarget.name}</div>
                <div style={{ color: "#888", fontSize: 12 }}>₹{hireTarget.rate}/day · {hireTarget.location}</div>
              </div>
              <button onClick={() => setHireTarget(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
          )}

          <h3 style={S.formTitle}>Job Details</h3>

          <div style={S.formGroup}>
            <label style={S.formLabel}>Worker Category *</label>
            <select value={form.category} onChange={e => handle("category", e.target.value)} style={S.formSelect}>
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Your Location *</label>
            <input placeholder="e.g. Connaught Place, Delhi" value={form.location} onChange={e => handle("location", e.target.value)} style={S.formInput} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => handle("startDate", e.target.value)} style={S.formInput} />
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Duration (days)</label>
              <input type="number" min="1" max="365" value={form.days} onChange={e => handle("days", e.target.value)} style={S.formInput} />
            </div>
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Budget (₹/day)</label>
            <input type="number" placeholder="e.g. 800" value={form.budget} onChange={e => handle("budget", e.target.value)} style={S.formInput} />
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Additional Requirements</label>
            <textarea placeholder="Any specific skills, timings, or instructions..." value={form.desc} onChange={e => handle("desc", e.target.value)}
              style={{ ...S.formInput, minHeight: 80, resize: "vertical" }} />
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Your Name *</label>
            <input placeholder="Full name" value={form.name} onChange={e => handle("name", e.target.value)} style={S.formInput} />
          </div>
          <div style={S.formGroup}>
            <label style={S.formLabel}>Phone Number *</label>
            <input placeholder="+91 98765 43210" value={form.phone} onChange={e => handle("phone", e.target.value)} style={S.formInput} />
          </div>

          <button style={{ ...S.btnPrimary, width: "100%", marginTop: "0.5rem" }} onClick={submit}>
            Post Job →
          </button>
        </div>

        {/* Summary */}
        <div>
          <div style={{ background: "#16162A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem", marginBottom: "1.25rem" }}>
            <h4 style={{ marginBottom: "1rem", fontFamily: "Georgia, serif" }}>Cost Estimate</h4>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: "#888" }}>Daily rate</span>
              <span>₹{form.budget || "–"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: "#888" }}>Duration</span>
              <span>{form.days} day(s)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: "#888" }}>Platform fee (10%)</span>
              <span>₹{form.budget && form.days ? Math.round(form.budget * form.days * 0.1) : "–"}</span>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.75rem", marginTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#FF6B00" }}>
                {form.budget && form.days ? `₹${Math.round(form.budget * form.days * 1.1)}` : "–"}
              </span>
            </div>
          </div>
          <div style={{ background: "#16162A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem" }}>
            <h4 style={{ marginBottom: "1rem", fontFamily: "Georgia, serif" }}>Why DYNO?</h4>
            {["All workers are ID-verified & background-checked", "Escrow-based secure payment system", "Real reviews from genuine employers", "24/7 support via chat or call", "Cancel anytime within 2 hours of booking"].map(pt => (
              <div key={pt} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.65rem", fontSize: 13, color: "#CCC" }}>
                <span style={{ color: "#FF6B00" }}>✓</span>{pt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bookings() {
  const statusColors = { completed: "#22c55e", active: "#FF6B00", upcoming: "#3b82f6" };

  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>My Bookings</h2>
      <p style={S.sectionSub}>Track and manage your hiring activity</p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        {[["Total", BOOKINGS.length, "#FF6B00"], ["Active", BOOKINGS.filter(b => b.status === "active").length, "#22c55e"], ["Upcoming", BOOKINGS.filter(b => b.status === "upcoming").length, "#3b82f6"]].map(([label, count, color]) => (
          <div key={label} style={{ background: "#16162A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem 1.5rem", minWidth: 120 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color }}>{count}</div>
            <div style={{ color: "#888", fontSize: 13 }}>{label} Bookings</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {BOOKINGS.map(b => (
          <div key={b.id} style={S.bookingCard}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{b.worker}</div>
              <div style={{ color: "#888", fontSize: 13 }}>{b.role} · {b.date}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#FF6B00" }}>₹{b.amount.toLocaleString()}</div>
              <div style={{ color: "#888", fontSize: 12 }}>Total</div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ ...S.statusPill, background: `${statusColors[b.status]}20`, color: statusColors[b.status] }}>
                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
              </span>
              {b.status === "active" && <button style={{ ...S.hireBtn, background: "transparent", border: "1px solid #FF6B00", color: "#FF6B00" }}>Track</button>}
              {b.status === "completed" && <button style={{ ...S.hireBtn, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#CCC" }}>Rate</button>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#16162A", border: "1px dashed rgba(255,107,0,0.3)", borderRadius: 14, padding: "2rem", textAlign: "center", marginTop: "1.5rem" }}>
        <div style={{ fontSize: 36, marginBottom: "0.75rem" }}>➕</div>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Need another worker?</div>
        <div style={{ color: "#888", fontSize: 14, marginBottom: "1rem" }}>Browse our verified workers and hire in minutes.</div>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────
export default function DynoApp() {
  const [page, setPage] = useState("Home");
  const [hireTarget, setHireTarget] = useState(null);

  const pages = { Home: <Home setPage={setPage} />, Browse: <Browse setPage={setPage} setHireTarget={setHireTarget} />, "Post Job": <PostJob hireTarget={hireTarget} setHireTarget={setHireTarget} setPage={setPage} />, Bookings: <Bookings /> };

  return (
    <div style={S.app}>
      <Nav page={page} setPage={setPage} />
      <main style={S.main}>{pages[page]}</main>
      <footer style={S.footer}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#FF6B00", marginBottom: 8 }}>DYNO</div>
        <div style={{ color: "#666", fontSize: 13 }}>Hire by Work. Hire by Time. · © 2025 Dyno Technologies Pvt. Ltd.</div>
        <div style={{ color: "#444", fontSize: 12, marginTop: 8 }}>Delhi · Mumbai · Bangalore · Hyderabad · Chennai · Pune · Noida · Gurgaon</div>
      </footer>
    </div>
  );
}
