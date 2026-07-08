export const colors = {
  gd: "#0B7A2A",
  gm: "#16A34A",
  gl: "#EAF7EE",
  am: "#F59E0B",
  al: "#FFF7E6",
  cream: "#F7F8F6",
  cb: "#FFFFFF",
  tp: "#111827",
  ts: "#6B7280",
  bd: "rgba(17,24,39,0.10)",
  rd: "#DC2626",
  rdl: "#FEE2E2",
};

export const items = [
  { name: "Lunch", icon: "🍛", price: 50, unit: "plate" },
  { name: "Tea", icon: "☕", price: 10, unit: "cup" },
  { name: "Snacks", icon: "🥟", price: 20, unit: "pack" },
  { name: "Egg", icon: "🥚", price: 15, unit: "piece" },
];

export const navTabs = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "booking", label: "Booking", icon: "▣" },
  { key: "coupons", label: "Coupons", icon: "★" },
  { key: "profile", label: "Profile", icon: "◉" },
];

export const CREDENTIALS = {
  chef: { email: "chef@stqc.gov.in", pass: "chef123" },
  admin: { email: "admin@stqc.gov.in", pass: "admin123" },
  purchaser: { email: "purchaser@stqc.gov.in", pass: "purchaser123" },
};

export const CHEF_NAME = "Chef Rajan";
export const TODAY_DAY = 11;

export const chefUsers = [
  { id: "u1", name: "Kiran Kumar", mobile: "9876543210", email: "kiran@stqc.gov.in", avatar: "👦" },
  { id: "u2", name: "Rahul Sharma", mobile: "9123456780", email: "rahul@stqc.gov.in", avatar: "👨" },
  { id: "u3", name: "Anushka Singh", mobile: "9988776655", email: "anushka@stqc.gov.in", avatar: "👩" },
  { id: "u4", name: "Priya Nair", mobile: "9765432198", email: "priya@stqc.gov.in", avatar: "👩" },
  { id: "u5", name: "Arjun Menon", mobile: "9654321087", email: "arjun@stqc.gov.in", avatar: "👦" },
  { id: "u6", name: "Sneha Pillai", mobile: "9543210976", email: "sneha@stqc.gov.in", avatar: "👩" },
];

export const categoryIcons = { Lunch: "🍛", Tea: "☕", Snacks: "🥟", Egg: "🥚" };

export function makeChefKey(cat, day) {
  return `${cat}-2026-04-${String(day).padStart(2, "0")}`;
}

export function seedChefBookingDB() {
  const db = {};
  const cats = ["Lunch", "Tea", "Snacks", "Egg"];
  cats.forEach((cat) => {
    db[makeChefKey(cat, TODAY_DAY)] = chefUsers.slice(0, 4).map((u) => ({
      userId: u.id,
      qty: 1,
      taken: false,
    }));
    db[makeChefKey(cat, 12)] = chefUsers.slice(0, 3).map((u) => ({
      userId: u.id,
      qty: 1,
      taken: false,
    }));
    db[makeChefKey(cat, 14)] = chefUsers.slice(1, 5).map((u) => ({
      userId: u.id,
      qty: 1,
      taken: false,
    }));
  });
  return db;
}

export const initialRechargeRequests = [
  {
    id: "RCH-20260515-0003",
    user: "Anushka Sharma",
    avatar: "👩",
    email: "anushka@stqc.gov.in",
    amount: 500,
    mode: "UPI",
    utr: "412387659021",
    date: "15 May 2026",
    status: "Pending",
  },
  {
    id: "RCH-20260515-0004",
    user: "Rajan Mehta",
    avatar: "👨",
    email: "rajan@stqc.gov.in",
    amount: 200,
    mode: "NEFT",
    utr: "812387659033",
    date: "15 May 2026",
    status: "Pending",
  },
  {
    id: "RCH-20260514-0002",
    user: "Priya Nair",
    avatar: "👩",
    email: "priya@stqc.gov.in",
    amount: 250,
    mode: "UPI",
    utr: "612387659044",
    date: "14 May 2026",
    status: "Pending",
  },
  {
    id: "RCH-20260513-0001",
    user: "Suresh Kumar",
    avatar: "👨",
    email: "suresh@stqc.gov.in",
    amount: 1000,
    mode: "NEFT",
    utr: "512387659055",
    date: "13 May 2026",
    status: "Approved",
  },
  {
    id: "RCH-20260512-0001",
    user: "Deepa Varma",
    avatar: "👩",
    email: "deepa@stqc.gov.in",
    amount: 300,
    mode: "Cash",
    utr: "-",
    date: "12 May 2026",
    status: "Approved",
  },
  {
    id: "RCH-20260511-0001",
    user: "Arun Pillai",
    avatar: "👨",
    email: "arun@stqc.gov.in",
    amount: 500,
    mode: "UPI",
    utr: "312387659066",
    date: "11 May 2026",
    status: "Approved",
  },
  {
    id: "RCH-20260510-0001",
    user: "Meera Singh",
    avatar: "👩",
    email: "meera@stqc.gov.in",
    amount: 200,
    mode: "Cheque",
    utr: "112387659077",
    date: "10 May 2026",
    status: "Approved",
  },
  {
    id: "RCH-20260509-0001",
    user: "Vijay Rao",
    avatar: "👨",
    email: "vijay@stqc.gov.in",
    amount: 150,
    mode: "UPI",
    utr: "912387659088",
    date: "09 May 2026",
    status: "Rejected",
  },
];

export const expenditureByDate = [
  {
    date: "15/05/2026",
    label: "15 May 2026",
    total: 3150,
    items: [
      { name: "Lunch", icon: "🍛", qty: 36, unitPrice: 50, price: 1800 },
      { name: "Tea", icon: "☕", qty: 60, unitPrice: 10, price: 600 },
      { name: "Snacks", icon: "🥟", qty: 24, unitPrice: 20, price: 480 },
      { name: "Egg", icon: "🥚", qty: 18, unitPrice: 15, price: 270 },
    ],
  },
  {
    date: "14/05/2026",
    label: "14 May 2026",
    total: 2850,
    items: [
      { name: "Lunch", icon: "🍛", qty: 30, unitPrice: 50, price: 1500 },
      { name: "Tea", icon: "☕", qty: 55, unitPrice: 10, price: 550 },
      { name: "Snacks", icon: "🥟", qty: 30, unitPrice: 20, price: 600 },
      { name: "Egg", icon: "🥚", qty: 14, unitPrice: 15, price: 200 },
    ],
  },
  {
    date: "13/05/2026",
    label: "13 May 2026",
    total: 2700,
    items: [
      { name: "Lunch", icon: "🍛", qty: 28, unitPrice: 50, price: 1400 },
      { name: "Tea", icon: "☕", qty: 50, unitPrice: 10, price: 500 },
      { name: "Snacks", icon: "🥟", qty: 25, unitPrice: 20, price: 500 },
      { name: "Egg", icon: "🥚", qty: 20, unitPrice: 15, price: 300 },
    ],
  },
];

export const incomeData = [
  { type: "Booking", icon: "▣", user: "28 employees", detail: "Lunch - 15 May 2026", amount: 1400, ref: "BK-multi" },
  { type: "Booking", icon: "▣", user: "20 employees", detail: "Tea - 15 May 2026", amount: 200, ref: "BK-multi" },
  { type: "Recharge", icon: "▰", user: "Suresh Kumar", detail: "NEFT - 13 May", amount: 1000, ref: "RCH-20260513-0001" },
  { type: "Booking", icon: "▣", user: "12 employees", detail: "Snacks - 14 May", amount: 240, ref: "BK-multi" },
  { type: "Recharge", icon: "▰", user: "Deepa Varma", detail: "Cash - 12 May", amount: 300, ref: "RCH-20260512-0001" },
];

export const initialKsStock = [
  {
    id: 1,
    name: "Rice",
    qty: "5",
    unit: "kg",
    status: "low",
    notes: "Need before Monday",
    addedAt: "19 May 2026",
  },
  {
    id: 2,
    name: "Gas Cylinder",
    qty: "1",
    unit: "cylinder",
    status: "out",
    notes: "Urgent",
    addedAt: "19 May 2026",
  },
];

export const quickStockItems = [
  { emoji: "🌾", name: "Rice" },
  { emoji: "🥬", name: "Vegetables" },
  { emoji: "🌶️", name: "Chilly Powder" },
  { emoji: "🧂", name: "Salt" },
  { emoji: "🛢️", name: "Oil" },
  { emoji: "✨", name: "Spices" },
];

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function formatDateIN() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
