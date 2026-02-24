import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";

// ─── THEME & CONSTANTS ────────────────────────────────────────────────────────
const COLORS = {
  navy: "#0B1426",
  navyMid: "#112240",
  navyLight: "#1A3A5C",
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  slate: "#8892B0",
  slateLight: "#A8B2D8",
  white: "#E6F1FF",
  green: "#4CAF82",
  red: "#E05C5C",
  amber: "#E8A84C",
  blue: "#4C9BE8",
  purple: "#9B59B6",
  teal: "#4ECDC4",
};

const ASSET_CATEGORIES = {
  "Real Estate": {
    icon: "🏠",
    color: "#4C9BE8",
    subcategories: ["Primary Residence","Vacation Home","Rental Property","Commercial Property","Land/Undeveloped","Motor Home (Stationary)"],
    fields: ["address","sqFootage","propertyTax","mortgageBalance","mortgageRate","rentalIncome","propertyType"],
  },
  "Vehicles & Transportation": {
    icon: "🚗",
    color: "#4ECDC4",
    subcategories: ["Automobile","Boat/Watercraft","Motorcycle","RV/Motor Home","Aircraft","Jet Ski"],
    fields: ["make","model","year","vinHin","registrationState","loanBalance","loanRate"],
  },
  "Financial Accounts": {
    icon: "🏦",
    color: "#4CAF82",
    subcategories: ["Checking Account","Savings Account","Certificate of Deposit","Money Market"],
    fields: ["bankName","accountNumber","interestRate","maturityDate"],
  },
  "Investment & Retirement": {
    icon: "📈",
    color: "#C9A84C",
    subcategories: ["Traditional IRA","Roth IRA","401(k)","403(b)","SEP IRA","Brokerage Account","Individual Stocks","Bonds","Mutual Funds","ETFs","Index Funds"],
    fields: ["custodian","accountNumber","beneficiary","rmdDate","contributionLimit"],
  },
  "Business Interests": {
    icon: "💼",
    color: "#9B59B6",
    subcategories: ["Sole Proprietorship","Partnership","LLC","S-Corp","C-Corp","Franchise"],
    fields: ["businessName","ein","valuationMethod","annualRevenue","profitMargin","ownershipPct"],
  },
  "Trust Funds & Estate": {
    icon: "⚖️",
    color: "#E05C5C",
    subcategories: ["Revocable Living Trust","Irrevocable Trust","Special Needs Trust","Charitable Trust","Beneficiary Interest","Estate Proceeds"],
    fields: ["trusteeName","beneficiaries","distributionSchedule","trustTerms","trustDate"],
  },
  "Insurance & Annuities": {
    icon: "🛡️",
    color: "#E8A84C",
    subcategories: ["Term Life Insurance","Whole Life Insurance","Universal Life Insurance","Fixed Annuity","Variable Annuity","Long-Term Care"],
    fields: ["policyNumber","insurer","deathBenefit","cashValue","premiumAmount","beneficiary"],
  },
  "Personal Property": {
    icon: "💎",
    color: "#FF6B9D",
    subcategories: ["Jewelry","Fine Art","Antiques","Collectibles","Precious Metals","Significant Furniture"],
    fields: ["itemDescription","appraisalDate","appraiserName","insuranceValue"],
  },
  "Digital & Alternative": {
    icon: "₿",
    color: "#F7A347",
    subcategories: ["Cryptocurrency","NFTs","Domain Names","Digital Business","Intellectual Property"],
    fields: ["platform","walletAddress","tokenSymbol","contractAddress"],
  },
  "Other Assets": {
    icon: "📦",
    color: "#8892B0",
    subcategories: ["Livestock","Mineral Rights","Royalty Interests","Patents","Trademarks","Custom Asset"],
    fields: ["customDescription","jurisdiction","royaltyRate","expirationDate"],
  },
};

const SAMPLE_CLIENTS = [
  { id: "CLT-001", name: "Robert & Margaret Harrington", type: "Couple", status: "active", netWorth: 4850000, assignedTo: "JW", lastUpdated: "2d ago", nextDeadline: "Mar 15 — RMD Filing", assets: 23, flagged: false },
  { id: "CLT-002", name: "Whitfield Family Trust", type: "Trust", status: "review", netWorth: 12400000, assignedTo: "SK", lastUpdated: "5h ago", nextDeadline: "Feb 28 — Trust Review", assets: 41, flagged: true },
  { id: "CLT-003", name: "Dr. Elena Vasquez", type: "Individual", status: "active", netWorth: 2100000, assignedTo: "JW", lastUpdated: "1w ago", nextDeadline: "Apr 1 — Tax Filing", assets: 14, flagged: false },
  { id: "CLT-004", name: "Meridian Holdings LLC", type: "Business", status: "active", netWorth: 8750000, assignedTo: "RM", lastUpdated: "3d ago", nextDeadline: "Mar 31 — Valuation Update", assets: 19, flagged: false },
  { id: "CLT-005", name: "James & Carol Whitmore", type: "Couple", status: "inactive", netWorth: 975000, assignedTo: "SK", lastUpdated: "3w ago", nextDeadline: "May 1 — Insurance Review", assets: 9, flagged: false },
  { id: "CLT-006", name: "The Pemberton Estate", type: "Trust", status: "action", netWorth: 6300000, assignedTo: "RM", lastUpdated: "1d ago", nextDeadline: "Tomorrow — Probate Filing", assets: 34, flagged: true },
];

const SAMPLE_ASSETS = [
  { id: 1, name: "Primary Residence - Oak Grove", category: "Real Estate", sub: "Primary Residence", value: 1250000, acquired: "2015-06-12", client: "CLT-001", liquidity: "illiquid", tax: "taxable", ownership: 100 },
  { id: 2, name: "Vanguard Traditional IRA", category: "Investment & Retirement", sub: "Traditional IRA", value: 485000, acquired: "2008-03-01", client: "CLT-001", liquidity: "semi-liquid", tax: "tax-deferred", ownership: 100 },
  { id: 3, name: "2022 Sea Ray Sundancer 350", category: "Vehicles & Transportation", sub: "Boat/Watercraft", value: 185000, acquired: "2022-08-15", client: "CLT-001", liquidity: "illiquid", tax: "taxable", ownership: 100 },
  { id: 4, name: "Harrington Family Trust", category: "Trust Funds & Estate", sub: "Revocable Living Trust", value: 2400000, acquired: "2019-01-10", client: "CLT-001", liquidity: "illiquid", tax: "tax-free", ownership: 100 },
  { id: 5, name: "Bitcoin Holdings", category: "Digital & Alternative", sub: "Cryptocurrency", value: 95000, acquired: "2021-11-03", client: "CLT-001", liquidity: "liquid", tax: "taxable", ownership: 100 },
  { id: 6, name: "Chase Checking - Personal", category: "Financial Accounts", sub: "Checking Account", value: 48500, acquired: "2010-02-20", client: "CLT-001", liquidity: "liquid", tax: "taxable", ownership: 100 },
];

const CHART_DATA = [
  { category: "Real Estate", value: 1250000, pct: 26 },
  { category: "Trust Funds", value: 2400000, pct: 50 },
  { category: "Retirement", value: 485000, pct: 10 },
  { category: "Vehicles", value: 185000, pct: 4 },
  { category: "Digital", value: 95000, pct: 2 },
  { category: "Cash", value: 48500, pct: 1 },
  { category: "Other", value: 386500, pct: 7 },
];

const NET_WORTH_TIMELINE = [
  { month: "Mar '24", value: 3900000 },
  { month: "Jun '24", value: 4100000 },
  { month: "Sep '24", value: 4350000 },
  { month: "Dec '24", value: 4620000 },
  { month: "Jan '25", value: 4720000 },
  { month: "Feb '25", value: 4850000 },
];

const LIQUIDITY_DATA = [
  { name: "Liquid", value: 143500, color: "#4CAF82" },
  { name: "Semi-Liquid", value: 485000, color: "#E8A84C" },
  { name: "Illiquid", value: 4221500, color: "#E05C5C" },
];

const ACTIVITY_FEED = [
  { action: "Asset Updated", detail: "Vanguard IRA value updated to $485,000", user: "JW", time: "2h ago", icon: "📈" },
  { action: "Document Uploaded", detail: "2024 Property Tax Statement — Oak Grove", user: "JW", time: "5h ago", icon: "📄" },
  { action: "Deadline Added", detail: "RMD Filing deadline set for Mar 15", user: "SK", time: "1d ago", icon: "📅" },
  { action: "Asset Added", detail: "Bitcoin Holdings added to portfolio", user: "JW", time: "3d ago", icon: "₿" },
  { action: "Report Generated", detail: "Comprehensive Asset Inventory PDF", user: "RM", time: "1w ago", icon: "📊" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtK = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${(n/1000).toFixed(0)}K`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const StatusDot = ({ status }) => {
  const colors = { active: "#4CAF82", review: "#E8A84C", inactive: "#8892B0", action: "#E05C5C" };
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background: colors[status] || "#8892B0", marginRight:6 }} />;
};

const Badge = ({ text, color }) => (
  <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.06em", padding:"2px 8px", borderRadius:20, background:`${color}22`, color, textTransform:"uppercase", border:`1px solid ${color}44` }}>{text}</span>
);

const Card = ({ children, style = {}, className = "", onClick }) => (
  <div onClick={onClick} style={{ background:"#112240", border:"1px solid #1A3A5C", borderRadius:12, padding:"20px 24px", ...style }} className={className}>{children}</div>
);

const StatCard = ({ label, value, sub, color = COLORS.gold, icon }) => (
  <Card style={{ display:"flex", flexDirection:"column", gap:8, cursor:"default" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <span style={{ fontSize:12, color: COLORS.slate, fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}</span>
      <span style={{ fontSize:20 }}>{icon}</span>
    </div>
    <div style={{ fontSize:26, fontWeight:700, color, letterSpacing:"-0.02em" }}>{value}</div>
    {sub && <div style={{ fontSize:12, color: COLORS.slate }}>{sub}</div>}
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:"#0B1426", border:"1px solid #1A3A5C", borderRadius:8, padding:"10px 14px", fontSize:13 }}>
        {label && <div style={{ color: COLORS.slateLight, marginBottom:4 }}>{label}</div>}
        {payload.map((p, i) => (
          <div key={i} style={{ color: COLORS.gold }}>{p.name ? `${p.name}: ` : ""}{typeof p.value === "number" ? fmt(p.value) : p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── ADD ASSET MODAL ─────────────────────────────────────────────────────────
const AddAssetModal = ({ onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ category: "", subcategory: "", name: "", value: "", acquisitionDate: "", purchasePrice: "", ownershipPct: 100, notes: "", liquidity: "illiquid", tax: "taxable", beneficiary: "" });
  const [specificFields, setSpecificFields] = useState({});
  const cat = ASSET_CATEGORIES[form.category];

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateSpec = (k, v) => setSpecificFields(f => ({ ...f, [k]: v }));

  const SPECIFIC_FIELD_LABELS = {
    address: "Property Address", sqFootage: "Sq. Footage", propertyTax: "Annual Property Tax ($)",
    mortgageBalance: "Mortgage Balance ($)", mortgageRate: "Mortgage Rate (%)", rentalIncome: "Monthly Rental Income ($)",
    propertyType: "Property Type", make: "Make", model: "Model", year: "Year", vinHin: "VIN / HIN",
    registrationState: "Registration State", loanBalance: "Loan Balance ($)", loanRate: "Loan Rate (%)",
    bankName: "Bank Name", accountNumber: "Account Number", interestRate: "Interest Rate (%)", maturityDate: "Maturity Date",
    custodian: "Custodian", beneficiary: "Beneficiary(ies)", rmdDate: "RMD Date", contributionLimit: "Annual Contribution Limit ($)",
    businessName: "Business Name", ein: "EIN", valuationMethod: "Valuation Method", annualRevenue: "Annual Revenue ($)",
    profitMargin: "Profit Margin (%)", ownershipPct: "Ownership %", trusteeName: "Trustee Name", beneficiaries: "Beneficiaries",
    distributionSchedule: "Distribution Schedule", trustTerms: "Trust Terms", trustDate: "Trust Date",
    policyNumber: "Policy Number", insurer: "Insurer", deathBenefit: "Death Benefit ($)", cashValue: "Cash Value ($)",
    premiumAmount: "Annual Premium ($)", itemDescription: "Item Description", appraisalDate: "Last Appraisal Date",
    appraiserName: "Appraiser Name", insuranceValue: "Insured Value ($)", platform: "Exchange/Platform",
    walletAddress: "Wallet Address", tokenSymbol: "Token Symbol", contractAddress: "Contract Address",
    customDescription: "Full Description", jurisdiction: "Jurisdiction", royaltyRate: "Royalty Rate (%)", expirationDate: "Expiration Date",
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(11,20,38,0.92)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
      <div style={{ background:"#112240", border:"1px solid #1A3A5C", borderRadius:16, width:"min(700px,95vw)", maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 40px 80px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div style={{ padding:"24px 28px", borderBottom:"1px solid #1A3A5C", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color: COLORS.white }}>Add New Asset</div>
            <div style={{ fontSize:12, color: COLORS.slate, marginTop:2 }}>Step {step} of 3 — {["Asset Type","Details","Classification"][step-1]}</div>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:"1px solid #1A3A5C", color: COLORS.slate, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13 }}>Cancel</button>
        </div>

        {/* Steps progress */}
        <div style={{ display:"flex", padding:"16px 28px", gap:8 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex:1, height:3, borderRadius:2, background: s <= step ? COLORS.gold : "#1A3A5C", transition:"background 0.3s" }} />
          ))}
        </div>

        <div style={{ overflow:"auto", padding:"8px 28px 28px", flex:1 }}>
          {step === 1 && (
            <div>
              <div style={{ fontSize:13, color: COLORS.slateLight, marginBottom:16 }}>Select the asset category to unlock relevant fields</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12 }}>
                {Object.entries(ASSET_CATEGORIES).map(([cat, info]) => (
                  <div key={cat} onClick={() => { update("category", cat); update("subcategory", ""); }}
                    style={{ padding:"16px", borderRadius:10, border:`1px solid ${form.category === cat ? COLORS.gold : "#1A3A5C"}`, background: form.category === cat ? `${COLORS.gold}11` : "transparent", cursor:"pointer", transition:"all 0.2s" }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>{info.icon}</div>
                    <div style={{ fontSize:12, fontWeight:600, color: form.category === cat ? COLORS.gold : COLORS.slateLight }}>{cat}</div>
                    <div style={{ fontSize:10, color: COLORS.slate, marginTop:4 }}>{info.subcategories.length} types</div>
                  </div>
                ))}
              </div>
              {form.category && (
                <div style={{ marginTop:20 }}>
                  <label style={labelStyle}>Asset Subtype *</label>
                  <select value={form.subcategory} onChange={e => update("subcategory", e.target.value)} style={selectStyle}>
                    <option value="">Select type...</option>
                    {cat.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={labelStyle}>Asset Name / Description *</label>
                  <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Primary Residence - 123 Oak St" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Current Estimated Value ($) *</label>
                  <input type="number" value={form.value} onChange={e => update("value", e.target.value)} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Original Purchase Price ($)</label>
                  <input type="number" value={form.purchasePrice} onChange={e => update("purchasePrice", e.target.value)} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Acquisition Date</label>
                  <input type="date" value={form.acquisitionDate} onChange={e => update("acquisitionDate", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Ownership Percentage (%)</label>
                  <input type="number" value={form.ownershipPct} onChange={e => update("ownershipPct", e.target.value)} min={0} max={100} style={inputStyle} />
                </div>
              </div>

              {/* Type-specific fields */}
              {cat && cat.fields.length > 0 && (
                <>
                  <div style={{ fontSize:12, fontWeight:600, color: COLORS.gold, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:8, borderTop:"1px solid #1A3A5C", paddingTop:16 }}>
                    {form.category} — Specific Details
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {cat.fields.map(f => (
                      <div key={f}>
                        <label style={labelStyle}>{SPECIFIC_FIELD_LABELS[f] || f}</label>
                        <input value={specificFields[f] || ""} onChange={e => updateSpec(f, e.target.value)} style={inputStyle} placeholder={`Enter ${SPECIFIC_FIELD_LABELS[f] || f}...`} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Additional notes, lien information, document references..." style={{ ...inputStyle, height:80, resize:"vertical" }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={labelStyle}>Asset Liquidity</label>
                <div style={{ display:"flex", gap:8 }}>
                  {["liquid","semi-liquid","illiquid"].map(l => (
                    <div key={l} onClick={() => update("liquidity", l)}
                      style={{ flex:1, padding:"12px", borderRadius:8, border:`1px solid ${form.liquidity === l ? COLORS.gold : "#1A3A5C"}`, background: form.liquidity === l ? `${COLORS.gold}11` : "transparent", cursor:"pointer", textAlign:"center", fontSize:12, fontWeight:600, color: form.liquidity === l ? COLORS.gold : COLORS.slate, textTransform:"capitalize" }}>
                      {l === "liquid" ? "💧" : l === "semi-liquid" ? "🌊" : "🪨"} {l}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tax Treatment</label>
                <div style={{ display:"flex", gap:8 }}>
                  {["taxable","tax-deferred","tax-free"].map(t => (
                    <div key={t} onClick={() => update("tax", t)}
                      style={{ flex:1, padding:"12px", borderRadius:8, border:`1px solid ${form.tax === t ? COLORS.teal : "#1A3A5C"}`, background: form.tax === t ? `${COLORS.teal}11` : "transparent", cursor:"pointer", textAlign:"center", fontSize:12, fontWeight:600, color: form.tax === t ? COLORS.teal : COLORS.slate, textTransform:"capitalize" }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Estate Classification</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[["probate","🔴","Probate Asset"],["non-probate","🟢","Non-Probate"]].map(([v,e,l]) => (
                    <div key={v} onClick={() => update("estate", v)}
                      style={{ flex:1, padding:"12px", borderRadius:8, border:`1px solid ${form.estate === v ? COLORS.amber : "#1A3A5C"}`, background: form.estate === v ? `${COLORS.amber}11` : "transparent", cursor:"pointer", textAlign:"center", fontSize:12, fontWeight:600, color: form.estate === v ? COLORS.amber : COLORS.slate }}>
                      {e} {l}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Beneficiary Designation</label>
                <input value={form.beneficiary} onChange={e => update("beneficiary", e.target.value)} placeholder="e.g. Margaret Harrington (spouse)" style={inputStyle} />
              </div>
              <div style={{ background:"#0B1426", borderRadius:10, padding:16, border:"1px solid #1A3A5C" }}>
                <div style={{ fontSize:12, fontWeight:600, color: COLORS.slateLight, marginBottom:8 }}>Asset Summary</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:13 }}>
                  <div style={{ color: COLORS.slate }}>Category</div><div style={{ color: COLORS.white }}>{form.category}</div>
                  <div style={{ color: COLORS.slate }}>Subtype</div><div style={{ color: COLORS.white }}>{form.subcategory}</div>
                  <div style={{ color: COLORS.slate }}>Name</div><div style={{ color: COLORS.white }}>{form.name || "—"}</div>
                  <div style={{ color: COLORS.slate }}>Value</div><div style={{ color: COLORS.gold, fontWeight:700 }}>{form.value ? fmt(parseFloat(form.value)) : "—"}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"16px 28px", borderTop:"1px solid #1A3A5C", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          {step > 1
            ? <button onClick={() => setStep(s => s-1)} style={secBtnStyle}>← Back</button>
            : <div />
          }
          {step < 3
            ? <button onClick={() => { if (step === 1 && !form.category) return; setStep(s => s+1); }} style={{ ...primBtnStyle, opacity: step === 1 && !form.category ? 0.5 : 1 }}>Continue →</button>
            : <button onClick={() => { onAdd({ ...form, ...specificFields, id: Date.now(), value: parseFloat(form.value)||0 }); onClose(); }} style={primBtnStyle}>✓ Add Asset</button>
          }
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AssetManagementApp() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(SAMPLE_CLIENTS[0]);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [assets, setAssets] = useState(SAMPLE_ASSETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterLiquidity, setFilterLiquidity] = useState("All");
  const [showNotifications, setShowNotifications] = useState(false);
  const [clientView, setClientView] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bg = darkMode ? COLORS.navy : "#F0F4F8";
  const cardBg = darkMode ? COLORS.navyMid : "#FFFFFF";
  const borderColor = darkMode ? COLORS.navyLight : "#E2EAF4";
  const textColor = darkMode ? COLORS.white : "#1A2C4E";
  const subtleText = darkMode ? COLORS.slate : "#64748B";

  const navItems = [
    { id:"dashboard", label:"Dashboard", icon:"⬡" },
    { id:"clients", label:"Clients", icon:"👥" },
    { id:"assets", label:"Assets", icon:"📊" },
    { id:"reports", label:"Reports", icon:"📋" },
    { id:"tasks", label:"Tasks & Deadlines", icon:"📅" },
    { id:"documents", label:"Documents", icon:"📁" },
    { id:"settings", label:"Settings", icon:"⚙" },
  ];

  const clientAssets = assets.filter(a => a.client === selectedClient.id);
  const totalValue = clientAssets.reduce((s, a) => s + a.value, 0);

  const filteredAssets = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "All" || a.category === filterCategory;
    const matchLiq = filterLiquidity === "All" || a.liquidity === filterLiquidity;
    return matchSearch && matchCat && matchLiq;
  });

  return (
    <div style={{ display:"flex", height:"100vh", background: bg, fontFamily:"'Outfit', 'DM Sans', sans-serif", color: textColor, overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1A3A5C; border-radius:2px; }
        input, select, textarea { font-family:inherit; }
        .nav-item:hover { background:#1A3A5C !important; }
        .client-card:hover { border-color:#C9A84C !important; transform:translateY(-2px); transition:all 0.2s; }
        .asset-row:hover { background:#1A3A5C44 !important; }
        .action-btn:hover { background:#1A3A5C !important; opacity:0.9; }
        @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .slide-in { animation: slideIn 0.3s ease; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 220 : 64, background: darkMode ? "#080F1D" : "#0B1426", display:"flex", flexDirection:"column", transition:"width 0.3s ease", overflow:"hidden", flexShrink:0 }}>
        {/* Logo */}
        <div style={{ padding:"24px 16px 20px", borderBottom:"1px solid #1A3A5C" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:"linear-gradient(135deg, #C9A84C, #E8C97A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>⬡</div>
            {sidebarOpen && <div style={{ fontSize:15, fontWeight:700, color: COLORS.white, letterSpacing:"-0.01em", fontFamily:"'Playfair Display', serif" }}>AssetVault</div>}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"16px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {navItems.map(item => (
            <div key={item.id} className="nav-item" onClick={() => setActiveView(item.id)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 10px", borderRadius:8, cursor:"pointer", background: activeView === item.id ? "#1A3A5C" : "transparent", transition:"background 0.15s" }}>
              <span style={{ fontSize:16, width:20, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize:13, fontWeight: activeView === item.id ? 600 : 400, color: activeView === item.id ? COLORS.gold : COLORS.slateLight, whiteSpace:"nowrap" }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"16px 8px", borderTop:"1px solid #1A3A5C" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg, #4C9BE8, #9B59B6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>JW</div>
            {sidebarOpen && (
              <div>
                <div style={{ fontSize:12, fontWeight:600, color: COLORS.white }}>J. Williams</div>
                <div style={{ fontSize:10, color: COLORS.slate }}>Attorney</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column" }}>
        {/* Top Bar */}
        <div style={{ padding:"16px 28px", borderBottom:`1px solid ${borderColor}`, display:"flex", alignItems:"center", justifyContent:"space-between", background: darkMode ? "#0D1B2E" : "#FFFFFF", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setSidebarOpen(s => !s)} style={{ background:"transparent", border:"none", color: subtleText, cursor:"pointer", fontSize:18, padding:"4px 8px" }}>☰</button>
            <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Playfair Display', serif", color: textColor }}>
              {activeView === "dashboard" && "Portfolio Overview"}
              {activeView === "clients" && "Client Portfolio"}
              {activeView === "assets" && "Asset Registry"}
              {activeView === "reports" && "Reports & Analytics"}
              {activeView === "tasks" && "Tasks & Deadlines"}
              {activeView === "documents" && "Document Vault"}
              {activeView === "settings" && "Settings"}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setDarkMode(d => !d)} style={{ background: darkMode ? "#1A3A5C" : "#E2EAF4", border:"none", borderRadius:8, padding:"8px 14px", cursor:"pointer", fontSize:13, color: textColor }}>
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>
            <div style={{ position:"relative" }}>
              <button onClick={() => setShowNotifications(s => !s)} style={{ background:"#1A3A5C", border:"none", borderRadius:8, padding:"8px 14px", cursor:"pointer", color: COLORS.white, fontSize:13, position:"relative" }}>
                🔔 <span style={{ position:"absolute", top:4, right:4, width:8, height:8, borderRadius:"50%", background: COLORS.red }}></span>
              </button>
              {showNotifications && (
                <div style={{ position:"absolute", right:0, top:44, width:300, background:"#112240", border:"1px solid #1A3A5C", borderRadius:12, boxShadow:"0 20px 40px rgba(0,0,0,0.5)", zIndex:200, overflow:"hidden" }}>
                  <div style={{ padding:"14px 16px", borderBottom:"1px solid #1A3A5C", fontSize:13, fontWeight:600, color: COLORS.white }}>Notifications</div>
                  {[
                    { msg:"Pemberton Estate — Probate Filing DUE TOMORROW", urgent:true },
                    { msg:"Whitfield Trust — Periodic review overdue", urgent:true },
                    { msg:"Harrington IRA — RMD deadline in 18 days", urgent:false },
                    { msg:"New report generated: Q4 Asset Summary", urgent:false },
                  ].map((n, i) => (
                    <div key={i} style={{ padding:"12px 16px", borderBottom:"1px solid #1A3A5C11", display:"flex", gap:10, alignItems:"flex-start" }}>
                      <span style={{ fontSize:8, marginTop:5 }}>🔴</span>
                      <div style={{ fontSize:12, color: n.urgent ? COLORS.white : COLORS.slateLight }}>{n.msg}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setShowAddAsset(true)} style={primBtnStyle}>+ Add Asset</button>
          </div>
        </div>

        {/* Views */}
        <div style={{ flex:1, padding:"24px 28px", overflow:"auto" }} className="slide-in">

          {/* DASHBOARD VIEW */}
          {activeView === "dashboard" && (
            <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
              {/* Client selector */}
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:13, color: subtleText }}>Viewing:</div>
                <select value={selectedClient.id} onChange={e => setSelectedClient(SAMPLE_CLIENTS.find(c => c.id === e.target.value))}
                  style={{ background:"#112240", border:"1px solid #1A3A5C", borderRadius:8, padding:"8px 12px", color: COLORS.white, fontSize:13, cursor:"pointer" }}>
                  {SAMPLE_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Badge text={selectedClient.type} color={COLORS.blue} />
                <StatusDot status={selectedClient.status} />
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:16 }}>
                <StatCard label="Total Net Worth" value={fmtK(totalValue)} sub={`${clientAssets.length} assets tracked`} color={COLORS.gold} icon="💎" />
                <StatCard label="Liquid Assets" value={fmtK(clientAssets.filter(a=>a.liquidity==="liquid").reduce((s,a)=>s+a.value,0))} sub="Immediately accessible" color={COLORS.green} icon="💧" />
                <StatCard label="Tax-Deferred" value={fmtK(clientAssets.filter(a=>a.tax==="tax-deferred").reduce((s,a)=>s+a.value,0))} sub="Retirement accounts" color={COLORS.amber} icon="📈" />
                <StatCard label="Probate Assets" value="$1.43M" sub="Subject to probate" color={COLORS.red} icon="⚖️" />
                <StatCard label="Next Deadline" value="Mar 15" sub="RMD Filing — IRA" color={COLORS.blue} icon="📅" />
              </div>

              {/* Charts row */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {/* Pie chart */}
                <Card>
                  <div style={{ fontSize:13, fontWeight:600, color: COLORS.slateLight, marginBottom:16 }}>Asset Allocation</div>
                  <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={CHART_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                          {CHART_DATA.map((entry, i) => (
                            <Cell key={i} fill={Object.values(ASSET_CATEGORIES)[i % Object.values(ASSET_CATEGORIES).length].color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                      {CHART_DATA.map((d, i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:8, height:8, borderRadius:2, background: Object.values(ASSET_CATEGORIES)[i % Object.values(ASSET_CATEGORIES).length].color }} />
                            <span style={{ color: COLORS.slateLight }}>{d.category}</span>
                          </div>
                          <span style={{ color: COLORS.white, fontWeight:600 }}>{d.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Net worth timeline */}
                <Card>
                  <div style={{ fontSize:13, fontWeight:600, color: COLORS.slateLight, marginBottom:16 }}>Net Worth Timeline</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={NET_WORTH_TIMELINE}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: COLORS.slate, fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} tick={{ fill: COLORS.slate, fontSize:11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke={COLORS.gold} strokeWidth={2} fill="url(#goldGrad)" name="Net Worth" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Liquidity + Tax breakdown */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Card>
                  <div style={{ fontSize:13, fontWeight:600, color: COLORS.slateLight, marginBottom:16 }}>Liquidity Analysis</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {LIQUIDITY_DATA.map(d => (
                      <div key={d.name}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                          <span style={{ color: COLORS.slateLight }}>{d.name}</span>
                          <span style={{ color: d.color, fontWeight:600 }}>{fmt(d.value)}</span>
                        </div>
                        <div style={{ height:6, borderRadius:3, background:"#1A3A5C", overflow:"hidden" }}>
                          <div style={{ width:`${(d.value/4850000*100).toFixed(0)}%`, height:"100%", background:d.color, borderRadius:3, transition:"width 1s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <div style={{ fontSize:13, fontWeight:600, color: COLORS.slateLight, marginBottom:16 }}>Tax Treatment Breakdown</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={[
                      { name:"Taxable", value: 1578500, fill: COLORS.blue },
                      { name:"Tax-Deferred", value: 485000, fill: COLORS.amber },
                      { name:"Tax-Free", value: 2400000, fill: COLORS.teal },
                    ]} layout="vertical" barSize={16}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{ fill: COLORS.slate, fontSize:11 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0,4,4,0]} name="Value">
                        {[COLORS.blue, COLORS.amber, COLORS.teal].map((c, i) => <Cell key={i} fill={c} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Assets table */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:600, color: COLORS.slateLight }}>Asset Registry — {selectedClient.name}</div>
                  <button onClick={() => setShowAddAsset(true)} style={{ ...primBtnStyle, fontSize:12, padding:"6px 12px" }}>+ Add Asset</button>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid #1A3A5C" }}>
                        {["Asset Name","Category","Current Value","Acquisition","Liquidity","Tax Treatment","Ownership"].map(h => (
                          <th key={h} style={{ padding:"8px 12px", textAlign:"left", color: COLORS.slate, fontWeight:500, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clientAssets.map(a => (
                        <tr key={a.id} className="asset-row" style={{ borderBottom:"1px solid #1A3A5C22", cursor:"pointer", transition:"background 0.15s" }}>
                          <td style={{ padding:"12px", color: COLORS.white, fontWeight:500 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span>{ASSET_CATEGORIES[a.category]?.icon}</span>
                              {a.name}
                            </div>
                          </td>
                          <td style={{ padding:"12px" }}><Badge text={a.sub} color={ASSET_CATEGORIES[a.category]?.color || COLORS.slate} /></td>
                          <td style={{ padding:"12px", color: COLORS.gold, fontWeight:700 }}>{fmt(a.value)}</td>
                          <td style={{ padding:"12px", color: COLORS.slate }}>{new Date(a.acquired).toLocaleDateString("en-US", {month:"short",year:"numeric"})}</td>
                          <td style={{ padding:"12px" }}>
                            <span style={{ fontSize:11, padding:"3px 8px", borderRadius:4, background: a.liquidity==="liquid"?`${COLORS.green}22`:a.liquidity==="semi-liquid"?`${COLORS.amber}22`:`${COLORS.red}22`, color: a.liquidity==="liquid"?COLORS.green:a.liquidity==="semi-liquid"?COLORS.amber:COLORS.red, fontWeight:600, textTransform:"capitalize" }}>{a.liquidity}</span>
                          </td>
                          <td style={{ padding:"12px" }}>
                            <span style={{ fontSize:11, color: COLORS.slate, textTransform:"capitalize" }}>{a.tax}</span>
                          </td>
                          <td style={{ padding:"12px", color: COLORS.slateLight }}>{a.ownership}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Activity feed */}
              <Card>
                <div style={{ fontSize:13, fontWeight:600, color: COLORS.slateLight, marginBottom:16 }}>Recent Activity</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {ACTIVITY_FEED.map((a, i) => (
                    <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom:12, borderBottom: i < ACTIVITY_FEED.length-1 ? "1px solid #1A3A5C22" : "none" }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:"#1A3A5C", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{a.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color: COLORS.white, fontWeight:500 }}>{a.action}</div>
                        <div style={{ fontSize:12, color: COLORS.slate }}>{a.detail}</div>
                      </div>
                      <div style={{ fontSize:11, color: COLORS.slate, whiteSpace:"nowrap" }}>
                        <span style={{ background:"#1A3A5C", borderRadius:4, padding:"2px 6px", marginRight:6 }}>{a.user}</span>
                        {a.time}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* CLIENTS VIEW */}
          {activeView === "clients" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Stats bar */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:12 }}>
                {[
                  { label:"Total AUM", v: fmtK(SAMPLE_CLIENTS.reduce((s,c)=>s+c.netWorth,0)), c: COLORS.gold },
                  { label:"Active Clients", v: SAMPLE_CLIENTS.filter(c=>c.status==="active").length, c: COLORS.green },
                  { label:"Upcoming Deadlines (30d)", v:4, c: COLORS.amber },
                  { label:"Updated This Week", v:3, c: COLORS.blue },
                  { label:"Flagged for Review", v:2, c: COLORS.red },
                ].map((s,i) => (
                  <div key={i} style={{ background: darkMode?"#112240":"#FFFFFF", border:`1px solid ${borderColor}`, borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ fontSize:11, color: subtleText, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontSize:22, fontWeight:700, color:s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search clients..." style={{ ...inputStyle, width:220 }} />
                <select style={selectStyle}>
                  <option>All Statuses</option><option>Active</option><option>Pending Review</option><option>Inactive</option>
                </select>
                <select style={selectStyle}>
                  <option>All Asset Ranges</option><option>Under $500K</option><option>$500K–$2M</option><option>$2M–$10M</option><option>$10M+</option>
                </select>
                <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
                  {["grid","list"].map(v => (
                    <button key={v} onClick={() => setClientView(v)} style={{ background: clientView===v?"#1A3A5C":"transparent", border:"1px solid #1A3A5C", borderRadius:6, padding:"6px 12px", cursor:"pointer", color: clientView===v?COLORS.white:COLORS.slate, fontSize:12 }}>
                      {v === "grid" ? "⊞ Grid" : "☰ List"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client cards */}
              <div style={{ display: clientView === "grid" ? "grid" : "flex", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16, flexDirection:"column" }}>
                {SAMPLE_CLIENTS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(client => (
                  <div key={client.id} className="client-card" onClick={() => { setSelectedClient(client); setActiveView("dashboard"); }}
                    style={{ background: darkMode?"#112240":"#FFFFFF", border:`1px solid ${borderColor}`, borderRadius:12, padding:"20px", cursor:"pointer", transition:"all 0.2s", position:"relative" }}>
                    {client.flagged && <div style={{ position:"absolute", top:14, right:14, fontSize:12, background:`${COLORS.red}22`, color:COLORS.red, borderRadius:4, padding:"2px 6px", fontWeight:600 }}>⚑ Review</div>}
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:`linear-gradient(135deg, ${client.type==="Trust"?COLORS.purple:client.type==="Business"?COLORS.teal:COLORS.blue}, ${COLORS.navyLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:COLORS.white, flexShrink:0 }}>
                        {client.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:600, color: textColor, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{client.name}</div>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <Badge text={client.type} color={client.type==="Trust"?COLORS.purple:client.type==="Business"?COLORS.teal:COLORS.blue} />
                          <StatusDot status={client.status} />
                          <span style={{ fontSize:10, color: subtleText }}>{client.id}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop:16, fontSize:26, fontWeight:800, color: COLORS.gold, letterSpacing:"-0.02em" }}>{fmtK(client.netWorth)}</div>
                    {/* Mini asset bar */}
                    <div style={{ display:"flex", height:6, borderRadius:3, overflow:"hidden", marginTop:10, gap:1 }}>
                      <div style={{ flex:4, background: COLORS.blue }} />
                      <div style={{ flex:3, background: COLORS.purple }} />
                      <div style={{ flex:2, background: COLORS.gold }} />
                      <div style={{ flex:1, background: COLORS.green }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, fontSize:12 }}>
                      <span style={{ color: subtleText }}>{client.assets} assets</span>
                      <span style={{ color: COLORS.amber }}>📅 {client.nextDeadline}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
                      <span style={{ fontSize:11, color: subtleText }}>Updated {client.lastUpdated}</span>
                      <div style={{ display:"flex", gap:4 }}>
                        {["View","Report","Task"].map(action => (
                          <button key={action} className="action-btn" onClick={e => { e.stopPropagation(); }}
                            style={{ fontSize:10, padding:"4px 8px", background:"#1A3A5C", border:"none", borderRadius:4, color: COLORS.slateLight, cursor:"pointer", transition:"all 0.15s" }}>{action}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSETS VIEW */}
          {activeView === "assets" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search assets..." style={{ ...inputStyle, width:220 }} />
                <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={selectStyle}>
                  <option value="All">All Categories</option>
                  {Object.keys(ASSET_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterLiquidity} onChange={e=>setFilterLiquidity(e.target.value)} style={selectStyle}>
                  <option value="All">All Liquidity</option>
                  <option value="liquid">Liquid</option>
                  <option value="semi-liquid">Semi-Liquid</option>
                  <option value="illiquid">Illiquid</option>
                </select>
                <button onClick={() => setShowAddAsset(true)} style={{ ...primBtnStyle, marginLeft:"auto" }}>+ Add Asset</button>
              </div>

              {/* Category overview cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px,1fr))", gap:10 }}>
                {Object.entries(ASSET_CATEGORIES).map(([cat, info]) => {
                  const catAssets = assets.filter(a => a.category === cat);
                  const catVal = catAssets.reduce((s,a)=>s+a.value,0);
                  return (
                    <div key={cat} onClick={() => setFilterCategory(cat === filterCategory ? "All" : cat)}
                      style={{ background: darkMode?"#112240":"#FFF", border:`1px solid ${filterCategory===cat?info.color:borderColor}`, borderRadius:10, padding:"12px", cursor:"pointer", transition:"all 0.2s" }}>
                      <div style={{ fontSize:22 }}>{info.icon}</div>
                      <div style={{ fontSize:11, fontWeight:600, color: filterCategory===cat?info.color:subtleText, marginTop:6, lineHeight:1.3 }}>{cat}</div>
                      <div style={{ fontSize:14, fontWeight:700, color: COLORS.white, marginTop:4 }}>{catVal > 0 ? fmtK(catVal) : "—"}</div>
                    </div>
                  );
                })}
              </div>

              {/* Assets table */}
              <Card>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #1A3A5C" }}>
                      {["Asset","Category","Client","Value","Liquidity","Tax","Acquired","Actions"].map(h => (
                        <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:COLORS.slate, fontWeight:500, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(a => (
                      <tr key={a.id} className="asset-row" style={{ borderBottom:"1px solid #1A3A5C22", cursor:"pointer" }}>
                        <td style={{ padding:"12px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:18 }}>{ASSET_CATEGORIES[a.category]?.icon}</span>
                            <div>
                              <div style={{ color:COLORS.white, fontWeight:500 }}>{a.name}</div>
                              <div style={{ fontSize:11, color:COLORS.slate }}>{a.sub}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"12px" }}><Badge text={a.category.split(" ")[0]} color={ASSET_CATEGORIES[a.category]?.color||COLORS.slate} /></td>
                        <td style={{ padding:"12px", fontSize:11, color:COLORS.slate }}>{a.client}</td>
                        <td style={{ padding:"12px", color:COLORS.gold, fontWeight:700 }}>{fmt(a.value)}</td>
                        <td style={{ padding:"12px" }}>
                          <span style={{ fontSize:11, padding:"3px 8px", borderRadius:4, background:a.liquidity==="liquid"?`${COLORS.green}22`:a.liquidity==="semi-liquid"?`${COLORS.amber}22`:`${COLORS.red}22`, color:a.liquidity==="liquid"?COLORS.green:a.liquidity==="semi-liquid"?COLORS.amber:COLORS.red, fontWeight:600 }}>{a.liquidity}</span>
                        </td>
                        <td style={{ padding:"12px", fontSize:11, color:COLORS.slate }}>{a.tax}</td>
                        <td style={{ padding:"12px", fontSize:11, color:COLORS.slate }}>{new Date(a.acquired).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</td>
                        <td style={{ padding:"12px" }}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button style={{ background:"#1A3A5C", border:"none", borderRadius:4, padding:"4px 8px", color:COLORS.slateLight, cursor:"pointer", fontSize:11 }}>Edit</button>
                            <button style={{ background:"transparent", border:`1px solid ${COLORS.red}44`, borderRadius:4, padding:"4px 8px", color:COLORS.red, cursor:"pointer", fontSize:11 }}>Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* REPORTS VIEW */}
          {activeView === "reports" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ fontSize:13, color:subtleText }}>Generate professional reports for client presentations and compliance filings.</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
                {[
                  { title:"Comprehensive Asset Inventory", desc:"All assets listed by category with current values, acquisition dates, and ownership details.", icon:"📊", color:COLORS.blue, formats:["PDF","Excel","CSV"] },
                  { title:"Net Worth Statement", desc:"Formatted financial statement showing total assets, liabilities, and net worth calculation.", icon:"💰", color:COLORS.gold, formats:["PDF","Excel"] },
                  { title:"Estate Planning Summary", desc:"Probate vs non-probate asset breakdown with beneficiary designations and trust structures.", icon:"⚖️", color:COLORS.purple, formats:["PDF"] },
                  { title:"Liquidity Analysis", desc:"Liquid vs semi-liquid vs illiquid asset breakdown with accessibility timeline.", icon:"💧", color:COLORS.green, formats:["PDF","Excel"] },
                  { title:"Tax Planning Report", desc:"Assets organized by tax treatment — taxable, tax-deferred, and tax-free accounts.", icon:"📋", color:COLORS.amber, formats:["PDF","Excel","CSV"] },
                  { title:"Beneficiary Distribution Preview", desc:"Projected asset distribution based on current beneficiary designations and trust terms.", icon:"👥", color:COLORS.teal, formats:["PDF"] },
                ].map(r => (
                  <Card key={r.title} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:`${r.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{r.icon}</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:textColor }}>{r.title}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:subtleText, lineHeight:1.5 }}>{r.desc}</div>
                    <div style={{ marginTop:"auto", display:"flex", gap:6, alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        {r.formats.map(f => <span key={f} style={{ fontSize:10, padding:"2px 7px", borderRadius:4, background:"#1A3A5C", color:COLORS.slateLight }}>{f}</span>)}
                      </div>
                      <button style={primBtnStyle}>Generate ↗</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TASKS VIEW */}
          {activeView === "tasks" && (
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <Card>
                  <div style={{ fontSize:13, fontWeight:600, color:COLORS.slateLight, marginBottom:16 }}>Upcoming Deadlines — All Clients</div>
                  {[
                    { client:"The Pemberton Estate", task:"Probate Filing", date:"Feb 25", days:1, urgency:"red" },
                    { client:"Whitfield Family Trust", task:"Annual Trust Review", date:"Feb 28", days:4, urgency:"red" },
                    { client:"Robert Harrington", task:"IRA RMD Filing", date:"Mar 15", days:18, urgency:"amber" },
                    { client:"Meridian Holdings LLC", task:"Business Valuation Update", date:"Mar 31", days:35, urgency:"green" },
                    { client:"Dr. Elena Vasquez", task:"Tax Return Filing", date:"Apr 1", days:36, urgency:"green" },
                    { client:"James Whitmore", task:"Life Insurance Review", date:"May 1", days:66, urgency:"green" },
                  ].map((t, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom: i < 5 ? "1px solid #1A3A5C22" : "none" }}>
                      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS[t.urgency], flexShrink:0 }} />
                        <div>
                          <div style={{ fontSize:13, color:COLORS.white, fontWeight:500 }}>{t.task}</div>
                          <div style={{ fontSize:11, color:COLORS.slate }}>{t.client}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:12, fontWeight:600, color:COLORS[t.urgency] }}>{t.date}</div>
                        <div style={{ fontSize:10, color:COLORS.slate }}>{t.days} days</div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <Card>
                  <div style={{ fontSize:13, fontWeight:600, color:COLORS.slateLight, marginBottom:16 }}>Add Deadline</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div><label style={labelStyle}>Client</label><select style={selectStyle}>{SAMPLE_CLIENTS.map(c=><option key={c.id}>{c.name}</option>)}</select></div>
                    <div><label style={labelStyle}>Task Description</label><input style={inputStyle} placeholder="e.g. IRA RMD Filing" /></div>
                    <div><label style={labelStyle}>Due Date</label><input type="date" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Priority</label>
                      <select style={selectStyle}><option>High</option><option>Medium</option><option>Low</option></select>
                    </div>
                    <button style={primBtnStyle}>Add Deadline</button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* DOCUMENTS VIEW */}
          {activeView === "documents" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ display:"flex", gap:12 }}>
                <input style={{ ...inputStyle, flex:1 }} placeholder="Search documents..." />
                <button style={primBtnStyle}>+ Upload Document</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
                {[
                  { name:"2024 Property Tax — Oak Grove.pdf", type:"PDF", client:"CLT-001", size:"1.2 MB", date:"Feb 12", icon:"📄" },
                  { name:"Harrington Trust Agreement.pdf", type:"PDF", client:"CLT-001", size:"4.8 MB", date:"Jan 28", icon:"⚖️" },
                  { name:"Vanguard IRA Statement Q4.pdf", type:"PDF", client:"CLT-001", size:"0.8 MB", date:"Jan 15", icon:"📈" },
                  { name:"2022 Sea Ray Title.pdf", type:"PDF", client:"CLT-001", size:"0.3 MB", date:"Aug 2022", icon:"🚤" },
                  { name:"Bitcoin Wallet Record.txt", type:"TXT", client:"CLT-001", size:"0.1 MB", date:"Nov 2021", icon:"₿" },
                  { name:"2024 Comprehensive Report.pdf", type:"PDF", client:"CLT-001", size:"2.1 MB", date:"Jan 5", icon:"📊" },
                ].map((d, i) => (
                  <Card key={i} style={{ cursor:"pointer" }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>{d.icon}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:COLORS.white, lineHeight:1.4, marginBottom:6 }}>{d.name}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:COLORS.slate }}>
                      <span>{d.size}</span><span>{d.date}</span>
                    </div>
                    <div style={{ marginTop:10, display:"flex", gap:4 }}>
                      <button style={{ flex:1, background:"#1A3A5C", border:"none", borderRadius:4, padding:"5px", color:COLORS.slateLight, cursor:"pointer", fontSize:11 }}>View</button>
                      <button style={{ flex:1, background:"#1A3A5C", border:"none", borderRadius:4, padding:"5px", color:COLORS.slateLight, cursor:"pointer", fontSize:11 }}>↓ Download</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeView === "settings" && (
            <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:20 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {["Profile","Firm Branding","Billing & Plan","Team Members","Notifications","Security & 2FA","Integrations","Data Export"].map((s, i) => (
                  <div key={s} style={{ padding:"10px 12px", borderRadius:8, cursor:"pointer", background: i===3?"#1A3A5C":"transparent", color: i===3?COLORS.gold:COLORS.slateLight, fontSize:13 }}>{s}</div>
                ))}
              </div>
              <Card>
                <div style={{ fontSize:16, fontWeight:600, color:COLORS.white, marginBottom:20 }}>Team Members</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {[
                    { name:"James Williams", role:"Attorney", email:"j.williams@firm.com", status:"active", initials:"JW" },
                    { name:"Sarah Kim", role:"Financial Advisor", email:"s.kim@firm.com", status:"active", initials:"SK" },
                    { name:"Robert Martinez", role:"CPA/Accountant", email:"r.martinez@firm.com", status:"active", initials:"RM" },
                    { name:"Ashley Chen", role:"Associate", email:"a.chen@firm.com", status:"inactive", initials:"AC" },
                  ].map((m, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px", background:"#0B1426", borderRadius:8 }}>
                      <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#4C9BE8,#9B59B6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:COLORS.white }}>{m.initials}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:COLORS.white }}>{m.name}</div>
                        <div style={{ fontSize:12, color:COLORS.slate }}>{m.email}</div>
                      </div>
                      <Badge text={m.role} color={COLORS.blue} />
                      <StatusDot status={m.status} />
                      <button style={{ background:"transparent", border:"1px solid #1A3A5C", borderRadius:6, padding:"4px 10px", color:COLORS.slate, cursor:"pointer", fontSize:11 }}>Edit</button>
                    </div>
                  ))}
                </div>
                <button style={{ ...primBtnStyle, marginTop:16 }}>+ Invite Team Member</button>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddAsset && (
        <AddAssetModal
          onClose={() => setShowAddAsset(false)}
          onAdd={(asset) => setAssets(a => [...a, { ...asset, client: selectedClient.id }])}
        />
      )}
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const inputStyle = {
  width:"100%", background:"#0B1426", border:"1px solid #1A3A5C", borderRadius:8,
  padding:"10px 12px", color:"#E6F1FF", fontSize:13, outline:"none",
};
const selectStyle = {
  background:"#0B1426", border:"1px solid #1A3A5C", borderRadius:8,
  padding:"8px 12px", color:"#E6F1FF", fontSize:13, cursor:"pointer",
};
const labelStyle = {
  display:"block", fontSize:11, fontWeight:600, color:"#8892B0",
  letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6,
};
const primBtnStyle = {
  background:"linear-gradient(135deg, #C9A84C, #E8C97A)", border:"none", borderRadius:8,
  padding:"8px 18px", color:"#0B1426", fontWeight:700, cursor:"pointer", fontSize:13,
};
const secBtnStyle = {
  background:"transparent", border:"1px solid #1A3A5C", borderRadius:8,
  padding:"8px 18px", color:"#8892B0", cursor:"pointer", fontSize:13,
};
