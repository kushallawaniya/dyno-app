import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./services/api";

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
  navLinks: { display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" },
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
function Nav({ page, setPage, user, handleLogout }) {
  const isWorker = user?.role === 'worker';
  const links = isWorker ? ["My Jobs", "Edit Profile"] : ["Home", "Browse", "Post Job", "Bookings"];
  return (
    <nav style={S.nav}>
      <div style={S.logo}>DYNO</div>
      <div style={S.navLinks}>
        {links.map(l => (
          <span key={l}
            style={{ ...S.navLink, ...(page === l ? S.navLinkActive : {}) }}
            onClick={() => setPage(l)}>{l}</span>
        ))}
        {user && (
          <span style={{ color: "#FF9A3C", fontSize: 13, fontWeight: 600, borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: "12px", marginRight: "6px" }}>
            👤 {user.name} ({user.role})
          </span>
        )}
        <button style={{ ...S.pill, background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.4)", color: "#FF4444" }} onClick={handleLogout}>Logout</button>
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
              <div key={cat.id} style={S.catCard}>
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

function WorkerMap({ workers, onSelectWorker }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center of Delhi NCR
    const defaultCenter = [28.58, 77.22]; 
    const defaultZoom = 10;

    // Initialize Leaflet map
    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add elegant tiles (CartoDB Dark Matter)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
    }

    return () => {
      // Clean up map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when filtered workers change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter out workers without coordinates
    const workersWithCoords = workers.filter(w => w.lat && w.lng);

    // Create markers for each worker
    workersWithCoords.forEach(w => {
      // Define a custom glowing neon orange icon using Leaflet's HTML divIcon
      const orangeDotIcon = window.L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          width: 32px;
          height: 32px;
          background: rgba(255, 107, 0, 0.2);
          border: 2px solid #FF6B00;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 10px #FF6B00;
        ">${w.img}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = window.L.marker([w.lat, w.lng], { icon: orangeDotIcon })
        .addTo(mapRef.current);

      // Create a popup design
      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
      popupContent.style.color = "#FFF";
      popupContent.style.padding = "4px";
      popupContent.style.width = "180px";
      popupContent.innerHTML = `
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #FFF">${w.name}</div>
        <div style="color: #FF6B00; font-size: 12px; font-weight: 600; margin-bottom: 6px">${w.category.toUpperCase()} · ★ ${w.rating}</div>
        <div style="color: #AAA; font-size: 11px; margin-bottom: 10px; line-height: 1.4">${w.bio.substring(0, 50)}...</div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px">
          <span style="font-family: Georgia, serif; font-weight: 700; color: #FF6B00; font-size: 14px">₹${w.rate}/day</span>
          <button id="btn-hire-${w.id}" style="
            background: #FF6B00;
            color: #FFF;
            border: none;
            border-radius: 5px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          ">Hire Now</button>
        </div>
      `;

      // Mount hire action listener when popup opens
      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      marker.on('popupopen', () => {
        const hireBtn = document.getElementById(`btn-hire-${w.id}`);
        if (hireBtn) {
          hireBtn.onclick = () => {
            onSelectWorker(w);
          };
        }
      });

      markersRef.current.push(marker);
    });

    // Auto fit map bounds if we have workers
    if (markersRef.current.length > 0) {
      const group = new window.L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.15));
    }
  }, [workers, onSelectWorker]);

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,107,0,0.15)", marginBottom: "2rem" }}>
      <style>{`
        .leaflet-popup-content-wrapper {
          background: rgba(22, 22, 42, 0.95) !important;
          border: 1px solid rgba(255, 107, 0, 0.3) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-tip {
          background: rgba(22, 22, 42, 0.95) !important;
          border-left: 1px solid rgba(255, 107, 0, 0.3) !important;
          border-bottom: 1px solid rgba(255, 107, 0, 0.3) !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
      <div ref={mapContainerRef} style={{ width: "100%", height: "450px", background: "#0A0A0F", zIndex: 1 }} />
    </div>
  );
}

function Browse({ setPage, setHireTarget, workers }) {
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const filtered = workers
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
        <div>
          <h2 style={S.sectionTitle}>Browse Workers</h2>
          <p style={S.sectionSub}>Find verified, skilled workers near you</p>
        </div>
        
        {/* Toggle Switch */}
        <div style={{ display: "flex", background: "#16162A", borderRadius: 8, padding: 4, border: "1px solid rgba(255,107,0,0.15)", marginBottom: "1rem" }}>
          <button onClick={() => setViewMode("list")} style={{ background: viewMode === "list" ? "#FF6B00" : "transparent", color: "#FFF", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>📋 List View</button>
          <button onClick={() => setViewMode("map")} style={{ background: viewMode === "map" ? "#FF6B00" : "transparent", color: "#FFF", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>🗺️ Map View</button>
        </div>
      </div>

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

      {viewMode === "map" ? (
        <WorkerMap workers={filtered} onSelectWorker={openWorker} />
      ) : (
        /* Worker cards */
        <div style={S.workerGrid}>
          {filtered.map(w => (
            <div key={w.id} style={S.workerCard} onClick={() => openWorker(w)}>
              <div style={S.workerHead}>
                <div style={S.workerAvatar}>{w.img}</div>
                <div style={{ flex: 1 }}>
                  <div style={S.workerName}>{w.name}</div>
                  <div style={{ ...S.workerRole, display: "flex", gap: "6px" }}>{CATEGORIES.find(c => c.id === w.category)?.label} · {w.location}</div>
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
      )}
    </div>
  );
}

function PostJob({ hireTarget, setHireTarget, setPage, onJobOrBookingCreated, user }) {
  const [form, setForm] = useState({
    category: hireTarget?.category || "",
    location: hireTarget?.location || "",
    startDate: "",
    days: "1",
    budget: hireTarget ? String(hireTarget.rate) : "",
    desc: "",
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Sync state if hireTarget changes
  useEffect(() => {
    if (hireTarget) {
      setForm(f => ({
        ...f,
        category: hireTarget.category,
        location: hireTarget.location,
        budget: String(hireTarget.rate)
      }));
    }
  }, [hireTarget]);

  function handle(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.category || !form.location || !form.startDate || !form.name || !form.phone) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (hireTarget) {
        // Create Booking in SQLite
        await api.bookings.create({
          worker_id: hireTarget.id,
          role: CATEGORIES.find(c => c.id === form.category)?.label || "Worker",
          start_date: form.startDate,
          days: parseInt(form.days),
          amount: Math.round(Number(form.budget) * parseInt(form.days) * 1.1)
        });
      } else {
        // Create Generic Job Post in SQLite
        await api.jobs.create({
          category: form.category,
          location: form.location,
          start_date: form.startDate,
          days: parseInt(form.days),
          budget: parseInt(form.budget) || 0,
          description: form.desc,
          contact_name: form.name,
          contact_phone: form.phone
        });
      }
      onJobOrBookingCreated();
      setSubmitted(true);
      setShowSuccessModal(true);
    } catch (err) {
      alert(err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.section}>
      {submitted ? (
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: "1rem" }}>✅</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", marginBottom: "0.75rem" }}>{hireTarget ? "Booking Completed!" : "Job Posted!"}</h2>
          <p style={{ color: "#888", lineHeight: 1.7, marginBottom: "2rem" }}>
            {hireTarget 
              ? `You have successfully hired ${hireTarget.name}. The booking details are saved in the system.`
              : "Your job has been posted successfully. Dyno will match you with available verified workers shortly."}
            <br />
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
            <button style={{ ...S.btnOutline, border: '1.5px solid #FF6B00' }} onClick={() => { setSubmitted(false); setHireTarget(null); }}>{hireTarget ? "Hire Another" : "Post Another"}</button>
          </div>
        </div>
      ) : (
        <>
          <h2 style={S.sectionTitle}>{hireTarget ? `Hire ${hireTarget.name}` : "Post a Job"}</h2>
          <p style={S.sectionSub}>{hireTarget ? "Review dates and confirm pricing to secure your booking" : "Tell us what you need — we'll find the right person"}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start", maxWidth: 900 }}>
            {/* Form */}
            <div style={S.formContainer}>
              {hireTarget && (
                <div style={{ background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 10, padding: "0.85rem 1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: 24 }}>{hireTarget.img}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Hiring: {hireTarget.name}</div>
                    <div style={{ color: "#888", fontSize: 12 }}>₹{hireTarget.rate}/day · {hireTarget.location}</div>
                  </div>
                  <button onClick={() => setHireTarget(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
              )}

              <h3 style={S.formTitle}>Job Details</h3>

              <div style={S.formGroup}>
                <label style={S.formLabel}>Worker Category *</label>
                <select value={form.category} onChange={e => handle("category", e.target.value)} style={S.formSelect} disabled={!!hireTarget}>
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
                <input type="number" placeholder="e.g. 800" value={form.budget} onChange={e => handle("budget", e.target.value)} style={S.formInput} disabled={!!hireTarget} />
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

              <button style={{ ...S.btnPrimary, width: "100%", marginTop: "0.5rem" }} onClick={submit} disabled={loading}>
                {loading ? "Processing..." : hireTarget ? "Confirm Booking & Hire →" : "Post Job →"}
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
                  <span>₹{form.budget && form.days ? Math.round(Number(form.budget) * parseInt(form.days) * 0.1) : "–"}</span>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.75rem", marginTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#FF6B00" }}>
                    {form.budget && form.days ? `₹${Math.round(Number(form.budget) * parseInt(form.days) * 1.1)}` : "–"}
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
        </>
      )}

      {/* SUCCESS MODAL OVERLAY */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 5, 10, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#16162A',
            border: '1.5px solid rgba(255, 107, 0, 0.5)',
            borderRadius: '16px',
            padding: '36px 30px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 107, 0, 0.1)'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#FF6B00', margin: '0 0 10px', fontWeight: 700 }}>
              {hireTarget ? 'Booking Confirmed!' : 'Job Posted Successfully!'}
            </h2>
            <p style={{ color: '#CCC', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
              {hireTarget 
                ? `You have successfully hired ${hireTarget.name} for ${form.days} day(s). A receipt and confirmation has been dispatched to your Gmail!`
                : 'Your job requirement has been listed dynamically in our server DB. Check Gmail for confirmation details.'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ ...S.btnPrimary, flex: 1, padding: '12px 20px', fontSize: '14px' }} onClick={() => { setShowSuccessModal(false); setPage("Bookings"); }}>
                View Bookings
              </button>
              <button style={{ ...S.btnOutline, flex: 1, padding: '12px 20px', fontSize: '14px', border: '1.5px solid #FF6B00' }} onClick={() => { setShowSuccessModal(false); }}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Bookings({ bookings, loading }) {
  const statusColors = { completed: "#22c55e", active: "#FF6B00", upcoming: "#3b82f6" };

  if (loading) {
    return (
      <div style={{ ...S.section, textAlign: "center", color: "#888" }}>
        Loading bookings...
      </div>
    );
  }

  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>My Bookings</h2>
      <p style={S.sectionSub}>Track and manage your hiring activity</p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        {[
          ["Total", bookings.length, "#FF6B00"], 
          ["Active", bookings.filter(b => b.status === "active").length, "#22c55e"], 
          ["Upcoming", bookings.filter(b => b.status === "upcoming").length, "#3b82f6"]
        ].map(([label, count, color]) => (
          <div key={label} style={{ background: "#16162A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem 1.5rem", minWidth: 120 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color }}>{count}</div>
            <div style={{ color: "#888", fontSize: 13 }}>{label} Bookings</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {bookings.length === 0 ? (
          <div style={{ color: "#888", textAlign: "center", padding: "2rem" }}>
            No bookings found yet. Go to the "Browse" tab to hire a worker!
          </div>
        ) : (
          bookings.map(b => (
            <div key={b.id} style={S.bookingCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: 24 }}>{b.worker_img}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{b.worker_name}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>{b.role} · {b.start_date} ({b.days} days)</div>
                </div>
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
          ))
        )}
      </div>

      <div style={{ background: "#16162A", border: "1px dashed rgba(255,107,0,0.3)", borderRadius: 14, padding: "2rem", textAlign: "center", marginTop: "1.5rem" }}>
        <div style={{ fontSize: 36, marginBottom: "0.75rem" }}>➕</div>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Need another worker?</div>
        <div style={{ color: "#888", fontSize: 14, marginBottom: "1rem" }}>Browse our verified workers and hire in minutes.</div>
      </div>
    </div>
  );
}

function WorkerJobs({ bookings, onStatusUpdated, loading }) {
  const statusColors = { completed: "#22c55e", active: "#FF6B00", upcoming: "#3b82f6", cancelled: "#ef4444" };

  async function updateStatus(bookingId, status) {
    try {
      await api.bookings.updateStatus(bookingId, status);
      onStatusUpdated();
    } catch (err) {
      alert("Error updating booking status: " + err.message);
    }
  }

  if (loading) {
    return (
      <div style={{ ...S.section, textAlign: "center", color: "#888" }}>
        Loading assigned jobs...
      </div>
    );
  }

  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>My Jobs</h2>
      <p style={S.sectionSub}>Manage your incoming client assignments and update work progress</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {bookings.length === 0 ? (
          <div style={{ color: "#888", textAlign: "center", padding: "3rem", background: "#16162A", border: "1px dashed rgba(255,107,0,0.2)", borderRadius: 14 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>💼</div>
            No jobs assigned yet. Clients can book you directly from the worker search listing!
          </div>
        ) : (
          bookings.map(b => (
            <div key={b.id} style={S.bookingCard}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Job ID: {b.id}</span>
                  <span style={{ ...S.statusPill, background: `${statusColors[b.status]}20`, color: statusColors[b.status], padding: "3px 10px" }}>
                    {b.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: "#AAA", fontSize: 13, marginTop: 6 }}>
                  Role: <strong style={{ color: "#FFF" }}>{b.role}</strong> · Start Date: <strong>{b.start_date}</strong> ({b.days} days)
                </div>
                <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                  Client Contact ID: #{b.client_id}
                </div>
              </div>
              
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#FF6B00" }}>₹{b.amount.toLocaleString()}</div>
                <div style={{ color: "#888", fontSize: 11 }}>Payout</div>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                {b.status === "upcoming" && (
                  <>
                    <button style={S.hireBtn} onClick={() => updateStatus(b.id, 'active')}>
                      Accept & Start
                    </button>
                    <button style={{ ...S.hireBtn, background: "rgba(239,68,68,0.15)", border: "1.5px solid #ef4444", color: "#ef4444" }} onClick={() => updateStatus(b.id, 'cancelled')}>
                      Decline
                    </button>
                  </>
                )}
                {b.status === "active" && (
                  <button style={{ ...S.hireBtn, background: "#22c55e" }} onClick={() => updateStatus(b.id, 'completed')}>
                    Mark Completed ✓
                  </button>
                )}
                {b.status === "completed" && (
                  <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>✓ Completed successfully</span>
                )}
                {b.status === "cancelled" && (
                  <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>Declined / Cancelled</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function WorkerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const data = await api.workers.getMe();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.workers.updateProfile({
        rate: parseInt(profile.rate),
        category: profile.category,
        exp: profile.exp,
        bio: profile.bio,
        avail: profile.avail
      });
      setSuccess(true);
    } catch (err) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ ...S.section, textAlign: "center", color: "#888" }}>
        Loading professional profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ ...S.section, textAlign: "center", color: "#ef4444" }}>
        Error: Worker profile details could not be loaded.
      </div>
    );
  }

  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>Edit Profile Settings</h2>
      <p style={S.sectionSub}>Update your daily billing rate, job category, availability, and description</p>

      <div style={{ ...S.formContainer, maxWidth: 600, margin: "0 auto" }}>
        {success && (
          <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid #22c55e", color: "#22c55e", borderRadius: 8, padding: "10px 14px", marginBottom: "1.5rem", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
            ✓ Professional Profile Saved Successfully!
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Profession Category</label>
              <select value={profile.category} onChange={e => setProfile({ ...profile, category: e.target.value })} style={S.formSelect}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            
            <div style={S.formGroup}>
              <label style={S.formLabel}>Daily Rate (₹/day)</label>
              <input type="number" min="100" max="10000" value={profile.rate} onChange={e => setProfile({ ...profile, rate: e.target.value })} style={S.formInput} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Total Experience</label>
              <input type="text" placeholder="e.g. 5 yrs, 6 months" value={profile.exp} onChange={e => setProfile({ ...profile, exp: e.target.value })} style={S.formInput} required />
            </div>
            
            <div style={S.formGroup}>
              <label style={S.formLabel}>Availability</label>
              <select value={profile.avail} onChange={e => setProfile({ ...profile, avail: e.target.value })} style={S.formSelect}>
                <option value="Immediate">Immediate</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="Weekends">Weekends Only</option>
                <option value="No Availability">Not Available</option>
              </select>
            </div>
          </div>

          <div style={S.formGroup}>
            <label style={S.formLabel}>Bio (Summary)</label>
            <textarea style={{ ...S.formInput, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} required />
          </div>

          <button type="submit" style={{ ...S.btnPrimary, width: "100%", marginTop: "1rem" }} disabled={saving}>
            {saving ? "Saving Profile..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────
export default function DynoApp() {
  const [page, setPage] = useState(api.auth.getUser()?.role === 'worker' ? "My Jobs" : "Home");
  const [hireTarget, setHireTarget] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(api.auth.getUser());
  const navigate = useNavigate();

  useEffect(() => {
    if (!api.auth.isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    // Sync default page just in case role changes or loads slowly
    const currentUser = api.auth.getUser();
    setUser(currentUser);
    if (currentUser?.role === 'worker') {
      setPage("My Jobs");
    } else {
      setPage("Home");
    }

    fetchData();
  }, [navigate]);

  async function fetchData(background = false) {
    if (!background) setLoading(true);
    try {
      const workersData = await api.workers.getAll();
      const bookingsData = await api.bookings.getAll();
      setWorkers(workersData);
      setBookings(bookingsData);
    } catch (err) {
      console.error("Error loading data from APIs:", err);
    } finally {
      if (!background) setLoading(false);
    }
  }

  function handleLogout() {
    api.auth.logout();
    navigate("/login");
  }

  const pages = user?.role === 'worker' ? {
    "My Jobs": <WorkerJobs bookings={bookings} onStatusUpdated={() => fetchData(true)} loading={loading} />,
    "Edit Profile": <WorkerProfile />
  } : {
    Home: <Home setPage={setPage} />,
    Browse: <Browse setPage={setPage} setHireTarget={setHireTarget} workers={workers} />,
    "Post Job": <PostJob hireTarget={hireTarget} setHireTarget={setHireTarget} setPage={setPage} onJobOrBookingCreated={() => fetchData(true)} user={user} />,
    Bookings: <Bookings bookings={bookings} loading={loading} />
  };

  return (
    <div style={S.app}>
      <Nav page={page} setPage={setPage} user={user} handleLogout={handleLogout} />
      {loading && page !== "Home" && page !== "My Jobs" ? (
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", color: "#FF6B00", fontWeight: "bold" }}>
          Loading Dyno Hub...
        </div>
      ) : (
        <main style={S.main}>{pages[page]}</main>
      )}
      <footer style={S.footer}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#FF6B00", marginBottom: 8 }}>DYNO</div>
        <div style={{ color: "#666", fontSize: 13 }}>Hire by Work. Hire by Time. · © 2025 Dyno Technologies Pvt. Ltd.</div>
        <div style={{ color: "#444", fontSize: 12, marginTop: 8 }}>Delhi · Mumbai · Bangalore · Hyderabad · Chennai · Pune · Noida · Gurgaon</div>
      </footer>
    </div>
  );
}
