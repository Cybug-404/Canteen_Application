import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppSafeProvider, AuthLayout, PageLayout, useScreenMetrics } from "./components/ScreenLayout";
import {
  AdminHome,
  AdminRechargeList,
  AdminInventoryView,
  AdminBottomNav,
  ChefHistoryView,
  ChefHome,
  ChefKitchenStock,
  ChefListView,
  PurchaserDashboard,
  PurchaserRequests,
  RoleDrawer,
} from "./components/RoleViews";
import {
  CREDENTIALS,
  expenditureByDate,
  incomeData,
  initialKsStock,
  initialRechargeRequests,
  items,
  makeChefKey,
  navTabs,
  seedChefBookingDB,
  TODAY_DAY,
  chefUsers,
  categoryIcons,
} from "./data/canteenData";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { CustomIcon, ColoredIcon } from "./components/AppIcons";

// Custom hook to provide dynamic colors and styles reactively
function useAppStyles() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, isDarkMode, toggleTheme, styles };
}

export default function App() {
  return (
    <ThemeProvider>
      <AppSafeProvider>
        <AppContent />
      </AppSafeProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { cardWidth, calCellWidth } = useScreenMetrics();
  const { colors, isDarkMode, toggleTheme, styles } = useAppStyles();
  
  const [screen, setScreen] = useState("intro");
  const [adminInventory, setAdminInventory] = useState({ Lunch: 250, Tea: 180, Snacks: 90, Egg: 145 });
  const [navHistory, setNavHistory] = useState([]);
  const [currentRole, setCurrentRole] = useState("user");
  const [authTab, setAuthTab] = useState("login");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chefDrawerOpen, setChefDrawerOpen] = useState(false);
  const [admDrawerOpen, setAdmDrawerOpen] = useState(false);
  const [pDrawerOpen, setPDrawerOpen] = useState(false);

  const [loginEmail, setLoginEmail] = useState("customerertls@gmail.com");
  const [loginPass, setLoginPass] = useState("");

  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupDesignation, setSignupDesignation] = useState("");
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [currentItem, setCurrentItem] = useState(items[0]);
  const [qty, setQty] = useState(1);
  const [bookings, setBookings] = useState([
    { id: "LU-20260422-0001", key: "2026-04-22-Lunch", item: "Lunch", icon: "L", day: 22, qty: 1, price: 50, total: 50, time: "12:30 PM", status: "Confirmed" },
    { id: "TE-20260423-0002", key: "2026-04-23-Tea", item: "Tea", icon: "T", day: 23, qty: 1, price: 10, total: 10, time: "04:00 PM", status: "Confirmed" },
    { id: "SN-20260424-0003", key: "2026-04-24-Snacks", item: "Snacks", icon: "S", day: 24, qty: 1, price: 20, total: 20, time: "11:00 AM", status: "Confirmed" },
    { id: "EG-20260425-0004", key: "2026-04-25-Egg", item: "Egg", icon: "E", day: 25, qty: 1, price: 15, total: 15, time: "09:00 AM", status: "Confirmed" },
  ]);
  const [bookingTab, setBookingTab] = useState("upcoming");
  const [simAfter10, setSimAfter10] = useState(false);
  const [selectedDay, setSelectedDay] = useState(14);
  const [bookingCounter, setBookingCounter] = useState(5);
  const [lastBooking, setLastBooking] = useState(null);
  const [withdrawMsg, setWithdrawMsg] = useState(null);

  const [selectedAmount, setSelectedAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState("200");
  const [selectedMode, setSelectedMode] = useState("UPI");
  const [utr, setUtr] = useState("");
  const [hasImg, setHasImg] = useState(false);
  const [uploadedName, setUploadedName] = useState("payment_screenshot.jpg");
  const [uploadedSize, setUploadedSize] = useState(284);
  const [rechargeCount, setRechargeCount] = useState(1);
  const [rechargeResult, setRechargeResult] = useState(null);
  const [showUploadErr, setShowUploadErr] = useState(false);
  const [showUtrErr, setShowUtrErr] = useState(false);

  const [chefBookingDB, setChefBookingDB] = useState(() => seedChefBookingDB());
  const [submittedKeys, setSubmittedKeys] = useState(() => new Set());
  const [chefCurCat, setChefCurCat] = useState("Lunch");
  const [chefCurIcon, setChefCurIcon] = useState("L");
  const [chefCurDay, setChefCurDay] = useState(TODAY_DAY);
  const [chefFilterMode, setChefFilterMode] = useState("all");
  const [chefSubmitSummary, setChefSubmitSummary] = useState(null);
  const [histFilter, setHistFilter] = useState("all");

  const [rechargeRequests, setRechargeRequests] = useState(initialRechargeRequests);
  const [rqFilter, setRqFilter] = useState("all");
  const [expDetailIdx, setExpDetailIdx] = useState(0);
  const [incFilter, setIncFilter] = useState("all");

  const [ksStockList, setKsStockList] = useState(initialKsStock);
  const [ksTab, setKsTab] = useState("list");
  const [ksStatus, setKsStatus] = useState("low");
  const [ksFilter, setKsFilter] = useState("all");
  const [ksForm, setKsForm] = useState({ name: "", qty: "", notes: "" });

  const [pRequests, setPRequests] = useState([]);
  const [pHistory, setPHistory] = useState([]);
  const [pReqFilter, setPReqFilter] = useState("all");

  const rootForRole = useCallback((role = currentRole) => {
    if (role === "admin") return "adm-home";
    if (role === "chef") return "chef-home";
    if (role === "purchaser") return "pdashboard";
    return "home";
  }, [currentRole]);

  const resetTo = useCallback((next) => {
    setNavHistory([]);
    setScreen(next);
  }, []);

  const goTo = useCallback((next) => {
    setScreen((prev) => {
      if (prev === next) return prev;
      setNavHistory((history) => [...history, prev].slice(-30));
      return next;
    });
  }, []);

  const goBack = useCallback((fallback) => {
    setNavHistory((history) => {
      const previous = history[history.length - 1];
      if (previous) {
        setScreen(previous);
        return history.slice(0, -1);
      }
      setScreen(fallback || rootForRole());
      return [];
    });
  }, [rootForRole]);

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (drawerOpen) {
        setDrawerOpen(false);
        return true;
      }
      if (chefDrawerOpen) {
        setChefDrawerOpen(false);
        return true;
      }
      if (admDrawerOpen) {
        setAdmDrawerOpen(false);
        return true;
      }
      if (pDrawerOpen) {
        setPDrawerOpen(false);
        return true;
      }
      if (screen === "login" || screen === "intro") return false;
      goBack(rootForRole());
      return true;
    });
    return () => subscription.remove();
  }, [admDrawerOpen, chefDrawerOpen, drawerOpen, goBack, pDrawerOpen, rootForRole, screen]);

  useEffect(() => {
    if (screen === "intro") {
      const timer = setTimeout(() => {
        goTo("login");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen, goTo]);

  const logout = () => {
    setCurrentRole("user");
    setDrawerOpen(false);
    setChefDrawerOpen(false);
    setAdmDrawerOpen(false);
    setPDrawerOpen(false);
    resetTo("login");
  };

  const syncPurchaserFromStock = (stockList) => {
    setPRequests((prev) => {
      const next = [...prev];
      stockList.forEach((item) => {
        if (!next.find((r) => r.ksId === item.id)) {
          next.push({
            id: `REQ-${String(next.length + 1).padStart(4, "0")}`,
            ksId: item.id,
            name: item.name,
            qty: `${item.qty} ${item.unit}`,
            unit: item.unit,
            status: "pending",
            priority: item.status === "out" ? "High" : "Medium",
            notes: item.notes || "",
            addedAt: item.addedAt,
            vendor: "",
            amount: 0,
            billAttached: false,
          });
        }
      });
      return next;
    });
  };

  const handleLogin = () => {
    const email = loginEmail.trim().toLowerCase();
    const pass = loginPass.trim();
    if (email === CREDENTIALS.admin.email && pass === CREDENTIALS.admin.pass) {
      setCurrentRole("admin");
      resetTo("adm-home");
      return;
    }
    if (email === CREDENTIALS.chef.email && pass === CREDENTIALS.chef.pass) {
      setCurrentRole("chef");
      resetTo("chef-home");
      return;
    }
    if (email === CREDENTIALS.purchaser.email && pass === CREDENTIALS.purchaser.pass) {
      setCurrentRole("purchaser");
      syncPurchaserFromStock(ksStockList);
      resetTo("pdashboard");
      return;
    }
    if (email === CREDENTIALS.customer.email) {
      setCurrentRole("user");
      resetTo("home");
      return;
    }
    alert("Invalid credentials!");
  };

  const openBooking = (item) => {
    setCurrentItem(item);
    setQty(1);
    setWithdrawMsg(null);
    goTo("booking");
  };

  const dateKey = (day) => `2026-04-${String(day).padStart(2, "0")}-${currentItem.name}`;

  const existingBooking = useMemo(
    () => bookings.find((b) => b.key === dateKey(selectedDay)),
    [bookings, selectedDay, currentItem]
  );

  const total = qty * currentItem.price;
  const pNote = `${qty} ${currentItem.unit}${qty > 1 ? "s" : ""} x Rs ${currentItem.price}`;

  const checkStateMessage = () => {
    if (withdrawMsg) return { type: "info", text: withdrawMsg };
    if (existingBooking) {
      return { type: "error", text: `Already booked for this date.\nID: ${existingBooking.id}` };
    }
    if (simAfter10) {
      return { type: "warn", text: "New bookings accepted only before 10:00 AM" };
    }
    return null;
  };

  const confirmBooking = () => {
    if (simAfter10 || existingBooking) return;
    let prefix = "BK";
    if (currentItem.name === "Lunch") prefix = "LU";
    else if (currentItem.name === "Tea") prefix = "TE";
    else if (currentItem.name === "Snacks") prefix = "SN";
    else if (currentItem.name === "Egg") prefix = "EG";
    const id = `${prefix}-202604${String(selectedDay).padStart(2, "0")}-${String(bookingCounter).padStart(4, "0")}`;
    setBookingCounter((v) => v + 1);
    const payload = {
      id,
      key: dateKey(selectedDay),
      item: currentItem.name,
      icon: currentItem.icon,
      day: selectedDay,
      qty,
      price: currentItem.price,
      unit: currentItem.unit,
      total,
    };
    setBookings((prev) => [...prev, payload]);
    setLastBooking(payload);
    setWithdrawMsg(null);
    goTo("confirm");
  };

  const withdrawBooking = () => {
    setBookings((prev) => prev.filter((b) => b.key !== dateKey(selectedDay)));
    setWithdrawMsg("- Booking withdrawn successfully.");
  };

  const submitRecharge = () => {
    const amt = Number(customAmount || selectedAmount || 0);
    const validUtr = utr.trim().length > 0;
    const validImg = hasImg;
    setShowUtrErr(!validUtr);
    setShowUploadErr(!validImg);
    if (!validUtr || !validImg) return;

    const id = `RCH-20260411-${String(rechargeCount).padStart(4, "0")}`;
    setRechargeCount((v) => v + 1);
    setRechargeRequests((prev) => [
      {
        id,
        user: "Anushka Sharma",
        avatar: "U",
        email: "customerertls@gmail.com",
        amount: amt,
        mode: selectedMode,
        utr: utr.trim(),
        date: "11 Apr 2026",
        status: "Pending",
      },
      ...prev,
    ]);
    setRechargeResult({ id, amount: amt, mode: selectedMode, date: "11 Apr 2026" });
    goTo("recharge-success");
  };

  const chefStats = useMemo(() => {
    let total = 0;
    let taken = 0;
    const counts = {};
    ["Lunch", "Tea", "Snacks", "Egg"].forEach((cat) => {
      const recs = chefBookingDB[makeChefKey(cat, TODAY_DAY)] || [];
      counts[cat] = recs.length;
      total += recs.length;
      taken += recs.filter((r) => r.taken).length;
    });
    return { total, taken, counts };
  }, [chefBookingDB]);

  const chefListKey = makeChefKey(chefCurCat, chefCurDay);
  const chefListRecs = chefBookingDB[chefListKey] || [];
  const chefListStats = {
    booked: chefListRecs.length,
    taken: chefListRecs.filter((r) => r.taken).length,
    locked: submittedKeys.has(chefListKey),
  };
  const filteredChefRecs = chefListRecs.filter((r) => {
    if (chefFilterMode === "taken") return r.taken;
    if (chefFilterMode === "pending") return !r.taken;
    return true;
  });

  const toggleChefTaken = (key, userId) => {
    if (submittedKeys.has(key)) return;
    setChefBookingDB((db) => {
      const copy = { ...db };
      const recs = (copy[key] || []).map((r) =>
        r.userId === userId ? { ...r, taken: !r.taken } : r
      );
      copy[key] = recs;
      return copy;
    });
  };

  const submitChefList = () => {
    const recs = chefBookingDB[chefListKey] || [];
    const taken = recs.filter((r) => r.taken);
    setSubmittedKeys((s) => new Set(s).add(chefListKey));
    setChefSubmitSummary({
      cat: chefCurCat,
      icon: chefCurIcon,
      day: chefCurDay,
      booked: recs.length,
      taken: taken.length,
      pending: recs.length - taken.length,
    });
    goTo("chef-submit-success");
  };

  const chefHistoryEntries = useMemo(() => {
    const all = [];
    Object.entries(chefBookingDB).forEach(([key, recs]) => {
      const dashIdx = key.indexOf("-");
      const cat = key.substring(0, dashIdx);
      const day = parseInt(key.split("-").pop(), 10);
      recs.forEach((rec) => {
        const u = chefUsers.find((x) => x.id === rec.userId) || { name: "Unknown" };
        all.push({
          cat,
          icon: categoryIcons[cat] || "<}",
          day,
          user: u,
          taken: rec.taken,
        });
      });
    });
    return all.sort((a, b) => b.day - a.day);
  }, [chefBookingDB]);

  const addKsItem = () => {
    if (!ksForm.name.trim() || !ksForm.qty.trim()) return;
    const item = {
      id: Date.now(),
      name: ksForm.name.trim(),
      qty: ksForm.qty,
      unit: "kg",
      status: ksStatus,
      notes: ksForm.notes.trim(),
      addedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
    setKsStockList((list) => {
      const next = [item, ...list];
      syncPurchaserFromStock(next);
      return next;
    });
    setKsForm({ name: "", qty: "", notes: "" });
    setKsStatus("low");
    setKsTab("list");
  };

  const pStats = {
    pending: pRequests.filter((r) => r.status === "pending").length,
    purchased: pRequests.filter((r) => r.status === "purchased" || r.status === "delivered").length,
  };

  const acceptPurchaser = (idx) => {
    setPRequests((list) => {
      const next = [...list];
      if (next[idx]) next[idx] = { ...next[idx], status: "purchased" };
      return next;
    });
  };

  const markPurchaserDelivered = (idx) => {
    setPRequests((list) => {
      const next = [...list];
      if (next[idx]) {
        const r = { ...next[idx], status: "delivered" };
        next[idx] = r;
        setPHistory((h) =>
          h.find((x) => x.reqId === r.id) ? h
            : [
                ...h,
                {
                  reqId: r.id,
                  name: r.name,
                  qty: r.qty,
                  date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                  status: "delivered",
                },
              ]
        );
      }
      return next;
    });
  };

  const pendingRecharge = rechargeRequests.filter((r) => r.status === "Pending").length;
  const filteredIncome =
    incFilter === "all" ? incomeData : incomeData.filter((i) => i.type === incFilter);

  const renderTopBar = (title, onBack, right = "..." ) => (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
        <CustomIcon name="chevron" size={20} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.topTitle}>{title}</Text>
      <TouchableOpacity style={styles.iconBtn}>
        <Text style={styles.iconText}>{right}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBottomNav = (active) => (
    <View style={styles.bottomNav}>
      {navTabs.map((tab) => {
        const iconMap = {
          home: "home",
          booking: "booking",
          coupons: "coupons",
          profile: "profile"
        };
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => {
              if (tab.key === "booking") goTo("booking-choose");
              else goTo(tab.key);
            }}
          >
            <CustomIcon
              name={iconMap[tab.key]}
              size={20}
              color={isActive ? colors.gm : colors.ts}
            />
            <Text style={[styles.navLabel, isActive && styles.navActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const getSelectedDateString = () => {
    const date = new Date(2026, 3, selectedDay);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const bookingMessage = checkStateMessage();
  const expDetail = expenditureByDate[expDetailIdx];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingTab === "upcoming") {
        return b.day >= TODAY_DAY;
      } else {
        return b.day < TODAY_DAY;
      }
    });
  }, [bookings, bookingTab]);
  return (
    <>
      {screen === "intro" && (
        <View style={[styles.introRoot, { backgroundColor: colors.cream }]}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
            <View style={[styles.logoCircleLarge, { borderColor: colors.gm }]}>
              <Text style={{ fontSize: 48 }}>🍴</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={[styles.introTitle, { color: isDarkMode ? colors.gm : colors.gd }]}>STQC CANTEEN</Text>
              <Text style={[styles.introSub, { color: colors.ts }]}>Food Coupon System</Text>
            </View>
          </View>
          <View style={styles.introFooter}>
            <View style={styles.paginationDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <TouchableOpacity
              style={styles.introBtn}
              onPress={() => goTo("login")}
            >
              <Text style={styles.introBtnText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {screen === "login" && (
        <AuthLayout showBranding={true}>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: -6,
              right: 10,
              backgroundColor: colors.cb,
              padding: 10,
              borderRadius: 22,
              borderWidth: 1.5,
              borderColor: colors.bd,
              zIndex: 999,
            }}
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: 16 }}>{isDarkMode ? "L" : "D"}</Text>
          </TouchableOpacity>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, authTab === "login" && styles.tabBtnActive]}
              onPress={() => setAuthTab("login")}
            >
              <Text style={[styles.tabText, authTab === "login" && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, authTab === "signup" && styles.tabBtnActive]}
              onPress={() => setAuthTab("signup")}
            >
              <Text style={[styles.tabText, authTab === "signup" && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {authTab === "login" ? (
            <View style={styles.formGap}>
                <View style={styles.formGap}>
                  <Field
                    label="Email Address *"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    placeholder="e.g. customerertls@gmail.com"
                    autoCapitalize="none"
                    icon="profile"
                  />
                  <Field
                    label="Password *"
                    value={loginPass}
                    onChangeText={setLoginPass}
                    placeholder="Enter password"
                    secureTextEntry
                    icon="lock"
                  />

                  <TouchableOpacity onPress={() => goTo("forgotpw")} style={{ alignSelf: "flex-end" }}>
                    <Text style={styles.forgot}>Forgot Password?</Text>
                  </TouchableOpacity>
                  <PrimaryBtn title="Login" onPress={handleLogin} />
                </View>
            </View>
          ) : (
            <View style={styles.formGap}>
              <View style={styles.row2}>
                <Field
                  label="First Name *"
                  value={signupFirstName}
                  onChangeText={(text) => setSignupFirstName(text.replace(/[^a-zA-Z]/g, ''))}
                  half
                  icon="profile"
                />
                <Field
                  label="Last Name *"
                  value={signupLastName}
                  onChangeText={(text) => setSignupLastName(text.replace(/[^a-zA-Z]/g, ''))}
                  half
                  icon="profile"
                />
              </View>
              <View style={{ zIndex: 10 }}>
                <TouchableOpacity onPress={() => setShowDesignationDropdown(!showDesignationDropdown)} activeOpacity={0.8}>
                  <View pointerEvents="none">
                    <Field
                      label="Designation *"
                      value={signupDesignation}
                      onChangeText={() => {}}
                      placeholder="Select Designation"
                      icon="profile"
                    />
                  </View>
                </TouchableOpacity>
                {showDesignationDropdown && (
                  <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.bd, borderRadius: 8, marginTop: 4, padding: 4 }}>
                    {["Permanent", "Contract", "Intern"].map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={{ padding: 12, borderBottomWidth: item !== "Intern" ? 1 : 0, borderBottomColor: colors.bd }}
                        onPress={() => {
                          setSignupDesignation(item);
                          setShowDesignationDropdown(false);
                        }}
                      >
                        <Text style={{ color: colors.text }}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <Field
                label="Mobile / Email *"
                value={signupEmail}
                onChangeText={setSignupEmail}
                placeholder="Phone or email"
                autoCapitalize="none"
                icon="profile"
              />
              <Field
                label="Password *"
                value={signupPassword}
                onChangeText={setSignupPassword}
                placeholder="Create a password"
                secureTextEntry
                icon="lock"
              />
              <PrimaryBtn
                title="Create Account"
                onPress={() => {
                  if (!signupFirstName.trim() || !signupLastName.trim() || !signupDesignation.trim() || !signupEmail.trim() || !signupPassword.trim()) {
                    alert("Please fill all required fields.");
                    return;
                  }
                  if (signupPassword.length < 6) {
                    alert("Password must be at least 6 characters.");
                    return;
                  }
                  setCurrentRole("user");
                  goTo("home");
                }}
                color={colors.gm}
              />
            </View>
          )}

          <Text style={styles.terms}>
            By continuing, you agree to our{" "}
            <Text style={{ color: colors.gm, fontWeight: "500" }}>Terms & Conditions</Text> and{" "}
            <Text style={{ color: colors.gm, fontWeight: "500" }}>Privacy Policy</Text>
          </Text>
        </AuthLayout>
      )}

      {screen === "forgotpw" && (
        <AuthLayout>
          <Text style={styles.sectionTitle}>Reset Password</Text>
          <Text style={styles.subtle}>Enter your registered email or mobile. We will send you a reset link.</Text>
          <Field label="Email / Mobile *" placeholder="Enter email or phone" />
          <PrimaryBtn title="Send Reset Link" onPress={() => goTo("login")} color={colors.gm} />
          <OutlineBtn title=" Back to Login" onPress={() => goTo("login")} />
        </AuthLayout>
      )}

      {screen === "home" && currentRole === "user" && (
        <PageLayout
          header={
            <View style={styles.waveHeader}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setDrawerOpen(true)}>
                  <CustomIcon name="menu" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.topTitle}>STQC Canteen</Text>
                <TouchableOpacity style={styles.iconBtn}>
                  <View style={{ position: "relative" }}>
                    <CustomIcon name="bell" size={20} color="#fff" />
                    <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: colors.rd, width: 8, height: 8, borderRadius: 4 }} />
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.headerGreeting}>Good Morning, Kiran 👋</Text>
              <Text style={styles.headerSubtitle}>Have a nice day!</Text>
            </View>
          }
          footer={renderBottomNav("home")}
        >
          {/* Floating Balance Card */}
          <View style={styles.floatingCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ColoredIcon name="wallet" colorTheme="green" size={20} />
              <View>
                <Text style={{ color: colors.ts, fontSize: 11, fontWeight: "600" }}>Wallet Balance</Text>
                <Text style={{ color: colors.tp, fontSize: 20, fontWeight: "500", marginTop: 2 }}>₹350.00</Text>
              </View>
            </View>
            <PrimaryBtn title="+ Recharge" onPress={() => goTo("recharge")} compact color={colors.gm} />
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Today's Meals</Text>
          <View style={styles.grid2}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.mealCard}
                onPress={() => openBooking(item)}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.gl, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.tp, fontWeight: "600", fontSize: 14 }}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => goTo("booking-choose")}>
              <ColoredIcon name="booking" colorTheme="green" size={18} />
              <Text style={styles.quickActionLabel}>Book Coupon</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => goTo("coupons")}>
              <ColoredIcon name="coupons" colorTheme="orange" size={18} />
              <Text style={styles.quickActionLabel}>Available Coupons</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => goTo("bookings")}>
              <ColoredIcon name="clock" colorTheme="blue" size={18} />
              <Text style={styles.quickActionLabel}>Booking History</Text>
            </TouchableOpacity>
          </View>
        </PageLayout>
      )}

      {screen === "booking-choose" && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("home")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.bhTitle}>Book Coupon</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.sectionLabel}>Choose Meal</Text>
            <View style={{ gap: 8 }}>
              {items.map((item) => {
                const isSelected = currentItem.name === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.cb,
                      padding: 14,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: isSelected ? colors.gm : colors.bd,
                      gap: 12,
                    }}
                    onPress={() => setCurrentItem(item)}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.gl, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.tp, fontWeight: "600", fontSize: 15 }}>{item.name}</Text>
                      <Text style={{ color: colors.ts, fontSize: 12 }}>
                        {item.name === "Lunch" ? "Nutritious & Healthy" : item.name === "Tea" ? "Hot & Refreshing" : item.name === "Snacks" ? "Tasty & Light" : "Protein Rich"}
                      </Text>
                    </View>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.gm : colors.ts,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gm }} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 24, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.bd }}>
              <CRow label="Price per coupon" value={`${currentItem.price}.00`} />
            </View>

            <PrimaryBtn title="Next" onPress={() => goTo("booking")} />
          </ScrollView>
        </View>
      )}

      {screen === "booking" && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("booking-choose")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.bhTitle}>Select Date</Text>
              <Text style={styles.bhSub}>Select date & quantity</Text>
            </View>
          </View>
          
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={[styles.couponCard, { borderStyle: "solid", borderColor: colors.gm, backgroundColor: colors.gl }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.cb, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 24 }}>{currentItem.icon}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.tp, fontWeight: "600", fontSize: 16 }}>{currentItem.name}</Text>
                  <Text style={{ color: colors.ts, fontSize: 12 }}>Price per coupon: ₹{currentItem.price}.00</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Select Date</Text>
            <View style={styles.calendarCard}>
              <View style={styles.calendarNav}>
                <TouchableOpacity style={styles.calArrow}>
                  <Text style={{ color: colors.gm, fontWeight: "600" }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.month}>April 2026</Text>
                <TouchableOpacity style={styles.calArrow}>
                  <Text style={{ color: colors.gm, fontWeight: "600" }}>→</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calendarGrid}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <Text key={`d-${i}`} style={[styles.dayHead, { width: calCellWidth }]}>
                    {d}
                  </Text>
                ))}
                {[1, 2].map((n) => (
                  <View key={`e-${n}`} style={[styles.emptyDay, { width: calCellWidth }]} />
                ))}
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const isPast = day < 11;
                  const selected = day === selectedDay;
                  const booked = bookings.some(
                    (b) => b.key === `2026-04-${String(day).padStart(2, "0")}-${currentItem.name}`
                  );
                  return (
                    <TouchableOpacity
                      key={day}
                      disabled={isPast}
                      onPress={() => {
                        setSelectedDay(day);
                        setWithdrawMsg(null);
                      }}
                      style={[
                        styles.dayCell,
                        { width: calCellWidth },
                        selected && styles.daySelected,
                        !selected && booked && styles.dayBooked,
                      ]}
                    >
                      <Text style={[styles.dayText, isPast && styles.dayPast, selected && { color: "#fff" }]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.bd }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gm }} />
                  <Text style={{ fontSize: 10, color: colors.ts, fontWeight: "500" }}>Available</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.bd }} />
                  <Text style={{ fontSize: 10, color: colors.ts, fontWeight: "500" }}>Past</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.rd }} />
                  <Text style={{ fontSize: 10, color: colors.ts, fontWeight: "500" }}>Unavailable</Text>
                </View>
              </View>
            </View>

            <View style={styles.selectedDateCard}>
              <View>
                <Text style={styles.selectedDateLbl}>Selected Date</Text>
                <Text style={styles.selectedDateVal}>{getSelectedDateString()}</Text>
              </View>
              <CustomIcon name="booking" size={20} color={colors.gm} />
            </View>

            <View style={styles.qtyCard}>
              <View>
                <Text style={styles.qtyLabel}>Quantity</Text>
                <Text style={styles.qtySub}>Max 5 per booking</Text>
              </View>
              <View style={styles.qtyCtr}>
                <QtyBtn title="−" onPress={() => setQty((q) => Math.max(1, q - 1))} />
                <Text style={styles.qtyVal}>{qty}</Text>
                <QtyBtn title="+" onPress={() => setQty((q) => Math.min(5, q + 1))} />
              </View>
            </View>

            <View style={styles.priceStrip}>
              <View>
                <Text style={styles.priceLbl}>Total Price</Text>
                <Text style={styles.priceNote}>{pNote}</Text>
              </View>
              <Text style={styles.priceTotal}>₹{total}</Text>
            </View>

            <PrimaryBtn title="Continue" onPress={() => goTo("booking-review")} disabled={simAfter10} />
          </ScrollView>
          {currentRole === "user" && renderBottomNav("booking")}
        </View>
      )}

      {screen === "booking-review" && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("booking")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.bhTitle}>Review & Confirm</Text>
          </View>
          
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.confirmTable}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.cb, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 24 }}>{currentItem.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.tp, fontWeight: "600", fontSize: 16 }}>{currentItem.name}</Text>
                  <Text style={{ color: colors.ts, fontSize: 12 }}>{selectedDay} April 2026</Text>
                </View>
                <TouchableOpacity onPress={() => goTo("booking")}>
                  <Text style={{ color: colors.gm, fontWeight: "600", fontSize: 13 }}>Change</Text>
                </TouchableOpacity>
              </View>

              <CRow label="Quantity" value={String(qty)} />
            </View>

            <Text style={styles.sectionLabel}>Price Details</Text>
            <View style={styles.confirmTable}>
              <CRow label="Price per coupon" value={`${currentItem.price}.00`} />
              <CRow label="Quantity" value={String(qty)} />
              <CRow label="Total Amount" value={`${total}.00`} total />
            </View>

            <PrimaryBtn title="Confirm Booking" onPress={confirmBooking} />
          </ScrollView>
        </View>
      )}

      {screen === "confirm" && lastBooking && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("home")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.bhTitle}>Booking Successful!</Text>
          </View>
          
          <ScrollView contentContainerStyle={[styles.scroll, { alignItems: "center", paddingTop: 30 }]}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#E8F5E9", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.gm, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 32, fontWeight: "500" }}>-</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { fontSize: 22, fontWeight: "500", color: colors.gd }]}>
              Booking Successful!
            </Text>
            <Text style={[styles.subtle, { textAlign: "center", marginTop: 4, marginBottom: 20 }]}>
              Your coupon has been booked.
            </Text>

            <View style={[styles.confirmTable, { width: "100%", paddingVertical: 16 }]}>
              <CRow label="Meal" value={lastBooking.item} />
              <CRow label="Date" value={`${lastBooking.day} April 2026`} />
              <CRow label="Quantity" value={String(lastBooking.qty)} />
              <CRow label="Amount" value={` ${lastBooking.total}`} />
              <CRow label="Coupon ID" value={lastBooking.id} total />
            </View>

            <View style={{ width: "100%", gap: 10, marginTop: 20 }}>
              <PrimaryBtn title="View My Coupons" onPress={() => goTo("coupons")} />
              <OutlineBtn title="Back to Home" onPress={() => goTo("home")} />
            </View>
          </ScrollView>
        </View>
      )}

      {screen === "coupons" && (
        <PageLayout
          header={renderTopBar("Your Coupons", () => goTo("home"))}
          footer={renderBottomNav("coupons")}
        >
            <View style={styles.couponTotal}>
              <Text style={{ color: colors.gm, fontWeight: "500" }}>Total Coupons</Text>
              <Text style={{ fontSize: 20, color: colors.gd, fontWeight: "600" }}>16</Text>
            </View>
            {[
              { i: "L", n: "Lunch", v: 5 },
              { i: "T", n: "Tea", v: 3 },
              { i: "S", n: "Snacks", v: 2 },
              { i: "E", n: "Egg", v: 6 },
            ].map((c) => (
              <View key={c.n} style={styles.couponCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={styles.couponIcon}>{c.i}</Text>
                  <View>
                    <Text style={styles.cardName}>{c.n}</Text>
                    <Text style={styles.cardPrice}>Valid till: 30 Apr 2026</Text>
                  </View>
                </View>
                <View style={styles.remaining}>
                  <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>{c.v}</Text>
                  <Text style={{ color: "#fff", fontSize: 9 }}>remaining</Text>
                </View>
              </View>
            ))}
        </PageLayout>
      )}

      {screen === "bookings" && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("home")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.bhTitle}>My Bookings</Text>
          </View>
          
          <View style={styles.tabRowContainer}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabBtn, bookingTab === "upcoming" && styles.tabBtnActive]}
                onPress={() => setBookingTab("upcoming")}
              >
                <Text style={[styles.tabText, bookingTab === "upcoming" && styles.tabTextActive]}>Upcoming</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, bookingTab === "past" && styles.tabBtnActive]}
                onPress={() => setBookingTab("past")}
              >
                <Text style={[styles.tabText, bookingTab === "past" && styles.tabTextActive]}>Past</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {filteredBookings.length === 0 ? (
              <Text style={styles.subtle}>No bookings found.</Text>
            ) : (
              filteredBookings.map((b) => (
                <View key={b.id || b.key} style={styles.couponCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.gl, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 24 }}>{b.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{b.item}</Text>
                      <Text style={styles.cardPrice}>Qty: {b.qty}  {b.day} Apr 2026 ? {b.time || "12:30 PM"}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.gm, fontWeight: '600', fontSize: 13 }}>{b.status || "Confirmed"}</Text>
                    <Text style={{ color: colors.ts, fontSize: 11, marginTop: 2 }}>{b.total}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          {renderBottomNav("booking")}
        </View>
      )}

      {screen === "profile" && (
        <PageLayout
          header={
            <View style={styles.profileHead}>
              <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                <Text style={{ fontSize: 34 }}>=d</Text>
              </View>
              <Text style={styles.pn}>Kiran Chandran</Text>
              <Text style={styles.pd}>Apprentice  STQC</Text>
              <View style={{ height: 42 }} />
              <View style={[styles.floatingCard, { position: "absolute", bottom: -28, left: 16, right: 16, width: "auto" }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <ColoredIcon name="wallet" colorTheme="green" size={20} />
                  <View>
                    <Text style={{ color: colors.ts, fontSize: 11, fontWeight: "600" }}>Wallet Balance</Text>
                    <Text style={{ color: colors.tp, fontSize: 20, fontWeight: "500", marginTop: 2 }}>350.00</Text>
                  </View>
                </View>
                <PrimaryBtn title="+ Recharge" onPress={() => goTo("recharge")} compact color={colors.gm} />
              </View>
            </View>
          }
          footer={renderBottomNav("profile")}
        >
          <View style={{ height: 28 }} />
          <View style={{ gap: 4, paddingVertical: 10 }}>
            <ProfileRow iconName="booking" colorTheme="blue" label="My Bookings" onPress={() => goTo("bookings")} />
            <ProfileRow iconName="wallet" colorTheme="amber" label="Recharge Wallet" onPress={() => goTo("recharge")} />
            <ProfileRow iconName="settings" colorTheme="grey" label="Settings" onPress={() => alert("Settings screen is in development")} />
            <ProfileRow iconName="help" colorTheme="purple" label="Help & Support" onPress={() => alert("Help and Support is in development")} />
            <ProfileRow iconName="logout" colorTheme="red" label="Logout" onPress={logout} danger />
          </View>
        </PageLayout>
      )}

      {screen === "editprofile" && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("profile")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.bhTitle}>Edit Profile</Text>
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={[styles.avatar, { alignSelf: "center", marginBottom: 6 }]}>=d</Text>
            <Text style={{ alignSelf: "center", color: colors.gm, fontWeight: "500", marginBottom: 8 }}>
              Change Photo
            </Text>
            <View style={styles.row2}>
              <Field label="First Name *" value="Anushka" half />
              <Field label="Last Name *" value="Sharma" half />
            </View>
            <Field label="Designation *" value="Apprentice" />
            <Field label="Email" value="customerertls@gmail.com" />
            <Field label="Mobile" value="+91 98765 43210" />
            <PrimaryBtn title="Save Changes" onPress={() => goTo("profile")} color={colors.gm} />
            <OutlineBtn title="Cancel" onPress={() => goTo("profile")} />
          </ScrollView>
        </View>
      )}

      {screen === "recharge" && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("home")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.bhTitle}>Recharge Wallet</Text>
          </View>
          
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.greetingCard}>
              <View>
                <Text style={styles.walletLbl}>Current Balance</Text>
                <Text style={{ color: "#fff", fontSize: 26, fontWeight: "600" }}>₹250.00</Text>
                <Text style={styles.greetSub}>STQC Canteen Wallet</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Select Amount</Text>
            <View style={styles.amountGrid}>
              {[100, 200, 500, 1000].map((amt) => {
                const active = Number(customAmount) === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.amountBtn, active && styles.amountBtnActive]}
                    onPress={() => {
                      setSelectedAmount(amt);
                      setCustomAmount(String(amt));
                    }}
                  >
                    <Text style={[styles.amountBtnText, active && { color: "#fff" }]}>{amt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Or enter other amount</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={customAmount}
              onChangeText={(v) => {
                setCustomAmount(v);
                setSelectedAmount(Number(v) || 0);
              }}
            />

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={{ gap: 8, marginBottom: 12 }}>
              {[
                { key: "UPI", label: "UPI" },
                { key: "Card", label: "Card" },
                { key: "Netbanking", label: "Netbanking" }
              ].map((m) => {
                const active = selectedMode === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.cb,
                      padding: 12,
                      borderRadius: 11,
                      borderWidth: 1.5,
                      borderColor: active ? colors.gm : colors.bd,
                      gap: 10
                    }}
                    onPress={() => setSelectedMode(m.key)}
                  >
                    <View style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 1.5,
                      borderColor: active ? colors.gm : colors.ts,
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {active && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gm }} />}
                    </View>
                    <Text style={{ color: colors.tp, fontWeight: "500", fontSize: 13 }}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Transaction / UTR Reference No. *</Text>
            <TextInput
              style={[styles.input, showUtrErr && styles.inputErr]}
              placeholder="e.g. 412387659021"
              value={utr}
              onChangeText={(v) => {
                setUtr(v);
                if (v.trim()) setShowUtrErr(false);
              }}
            />

            <Text style={styles.inputLabel}>Attach Payment Screenshot *</Text>
            <TouchableOpacity
              style={[styles.uploadBox, hasImg && styles.uploadAttached, showUploadErr && styles.uploadErr]}
              onPress={() => {
                setHasImg(true);
                setUploadedName("payment_screenshot.jpg");
                setUploadedSize(284);
                setShowUploadErr(false);
              }}
            >
              {!hasImg ? (
                <>
                  <Text style={{ fontSize: 22 }}>=</Text>
                  <Text style={{ color: colors.gm, fontWeight: "500" }}>Tap to attach screenshot</Text>
                  <Text style={styles.cardPrice}>Upload payment proof for verification.</Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 22 }}>=</Text>
                  <Text style={{ color: colors.gd, fontWeight: "500" }}>{uploadedName}</Text>
                  <Text style={styles.cardPrice}>
                    {uploadedSize} KB  JPG
                  </Text>
                  <OutlineBtn title=" Remove Image" onPress={() => setHasImg(false)} />
                </>
              )}
            </TouchableOpacity>
            {showUploadErr && <Text style={{ color: colors.rd }}>Please attach a payment screenshot.</Text>}

            <PrimaryBtn title="Proceed to Pay" onPress={submitRecharge} />
            
            <Text style={{ textAlign: "center", fontSize: 11, color: colors.ts, marginTop: 10, marginBottom: 20 }}>
              = Secure payments powered by Razorpay
            </Text>
          </ScrollView>
          {renderBottomNav("profile")}
        </View>
      )}

      {screen === "recharge-success" && rechargeResult && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("home")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.bhTitle}>Request Submitted</Text>
          </View>
          <ScrollView contentContainerStyle={[styles.scroll, { alignItems: "center" }]}>
            <Text style={{ fontSize: 60 }}></Text>
            <Text style={[styles.sectionTitle, { color: colors.gd }]}>Request Submitted!</Text>
            <Text style={[styles.subtle, { textAlign: "center" }]}>
              Your recharge request has been sent to the admin for verification.
            </Text>
            <View style={styles.successCard}>
              <CRow label="Request ID" value={rechargeResult.id} />
              <CRow label="Amount" value={` ${rechargeResult.amount}`} />
              <CRow label="Payment Mode" value={rechargeResult.mode} />
              <CRow label="Screenshot" value="- Attached" />
              <CRow label="Status" value=" Pending Review" total />
            </View>
            <PrimaryBtn title="Back to Home" onPress={() => goTo("home")} />
          </ScrollView>
          {renderBottomNav("profile")}
        </View>
      )}

      {/* Chef */}
      {screen === "chef-home" && (
        <ChefHome
          styles={styles}
          cardWidth={cardWidth}
          goTo={goTo}
          chefStats={chefStats}
          onOpenList={(cat, icon) => {
            setChefCurCat(cat);
            setChefCurIcon(icon);
            setChefCurDay(TODAY_DAY);
            setChefFilterMode("all");
            goTo("chef-list");
          }}
          onOpenDrawer={() => setChefDrawerOpen(true)}
        />
      )}
      {screen === "chef-list" && (
        <ChefListView
          styles={styles}
          goTo={goTo}
          chefCurCat={chefCurCat}
          chefCurIcon={chefCurIcon}
          chefCurDay={chefCurDay}
          setChefCurDay={setChefCurDay}
          chefFilterMode={chefFilterMode}
          setChefFilterMode={setChefFilterMode}
          chefBookingDB={chefBookingDB}
          submittedKeys={submittedKeys}
          onToggleTaken={toggleChefTaken}
          onSubmitList={submitChefList}
          listStats={chefListStats}
          filteredRecs={filteredChefRecs}
        />
      )}
      {screen === "chef-history" && (
        <ChefHistoryView
          styles={styles}
          goTo={goTo}
          entries={chefHistoryEntries}
          filter={histFilter}
          setFilter={setHistFilter}
        />
      )}
      {screen === "chef-submit-success" && chefSubmitSummary && (
        <View style={styles.page}>
          <View style={styles.bookingHeader}>
            <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("chef-home")}>
              <CustomIcon name="chevron" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.bhTitle}>List Submitted</Text>
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={{ fontSize: 48, textAlign: "center" }}></Text>
            <Text style={[styles.sectionTitle, { textAlign: "center", color: colors.gd }]}>
              {chefSubmitSummary.icon} {chefSubmitSummary.cat}
            </Text>
            <Text style={[styles.subtle, { textAlign: "center" }]}>
              Submitted for {chefSubmitSummary.day} April 2026
            </Text>
            <View style={styles.confirmTable}>
              <CRow label="Booked" value={String(chefSubmitSummary.booked)} />
              <CRow label="Taken" value={String(chefSubmitSummary.taken)} />
              <CRow label="Pending" value={String(chefSubmitSummary.pending)} total />
            </View>
            <PrimaryBtn title="Back to Chef Home" onPress={() => goTo("chef-home")} />
          </ScrollView>
        </View>
      )}
      {screen === "chef-kitchen-stock" && (
        <ChefKitchenStock
          styles={styles}
          goTo={goTo}
          ksStockList={ksStockList}
          ksTab={ksTab}
          setKsTab={setKsTab}
          ksStatus={ksStatus}
          setKsStatus={setKsStatus}
          ksFilter={ksFilter}
          setKsFilter={setKsFilter}
          ksForm={ksForm}
          setKsForm={setKsForm}
          onAddItem={addKsItem}
          onDeleteItem={(id) => {
            setKsStockList((list) => list.filter((i) => i.id !== id));
          }}
          onQuickAdd={(name) => setKsForm((f) => ({ ...f, name }))}
        />
      )}

      {/* Admin */}
      {screen === "adm-home" && (
        <AdminHome
          styles={styles}
          goTo={goTo}
          pendingCount={pendingRecharge}
          onOpenDrawer={() => setAdmDrawerOpen(true)}
        />
      )}
      {screen === "adm-recharge" && (
        <AdminRechargeList
          styles={styles}
          goTo={goTo}
          requests={rechargeRequests}
          filter={rqFilter}
          setFilter={setRqFilter}
          onApprove={(i) => {
            setRechargeRequests((list) => {
              const next = [...list];
              next[i] = { ...next[i], status: "Approved" };
              return next;
            });
          }}
          onReject={(i) => {
            setRechargeRequests((list) => {
              const next = [...list];
              next[i] = { ...next[i], status: "Rejected" };
              return next;
            });
          }}
        />
      )}
      {screen === "adm-inventory" && (
        <AdminInventoryView
          styles={styles}
          goTo={goTo}
          inventory={adminInventory}
          setInventory={setAdminInventory}
          onUpdate={() => {
            alert("Inventory updated successfully!");
            goTo("adm-home");
          }}
        />
      )}
      {screen === "adm-expenditure" && (
        <View style={styles.page}>
          {renderTopBar("Expenditure", () => goTo("adm-home"))}
          <ScrollView contentContainerStyle={styles.scroll}>
            {expenditureByDate.map((d, i) => (
              <TouchableOpacity
                key={d.date}
                style={styles.couponCard}
                onPress={() => {
                  setExpDetailIdx(i);
                  goTo("adm-exp-detail");
                }}
              >
                <Text style={styles.cardName}>{d.label}</Text>
                <Text style={[styles.cardName, { color: colors.rd }]}> {d.total.toLocaleString("en-IN")}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {screen === "adm-exp-detail" && expDetail && (
        <View style={styles.page}>
          {renderTopBar(expDetail.date, () => goTo("adm-expenditure"))}
          <ScrollView contentContainerStyle={styles.scroll}>
            {expDetail.items.map((it, i) => (
              <View key={it.name} style={styles.couponCard}>
                <Text style={styles.cardName}>
                  {it.icon} {it.name}
                </Text>
                <Text style={styles.cardPrice}>
                  {it.qty}  {it.unitPrice} =  {it.price.toLocaleString("en-IN")}
                </Text>
              </View>
            ))}
            <Text style={[styles.sectionTitle, { color: colors.rd }]}>Total:  {expDetail.total.toLocaleString("en-IN")}</Text>
          </ScrollView>
        </View>
      )}
      {screen === "adm-income" && (
        <View style={styles.page}>
          {renderTopBar("Income", () => goTo("adm-home"))}
          <ScrollView contentContainerStyle={styles.scroll}>
            <FilterRow
              options={[
                { key: "all", label: "All" },
                { key: "Booking", label: "Booking" },
                { key: "Recharge", label: "Recharge" },
              ]}
              value={incFilter}
              onChange={setIncFilter}
            />
            {filteredIncome.map((it) => (
              <View key={it.ref + it.user} style={styles.couponCard}>
                <Text style={styles.cardName}>
                  {it.icon} {it.user}
                </Text>
                <Text style={styles.cardPrice}>{it.detail}</Text>
                <Text style={[styles.cardName, { color: colors.gm }]}>+ {it.amount.toLocaleString("en-IN")}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {screen === "adm-balance" && (
        <PageLayout
          header={
            <View style={[styles.topBar, { backgroundColor: colors.gd, paddingVertical: 14 }]}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => goTo("adm-home")}>
                <CustomIcon name="chevron" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.topTitle, { fontSize: 18, color: "#fff" }]}>Balance</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Income vs Expenditure</Text>
              </View>
            </View>
          }
          footer={<AdminBottomNav active="adm-balance" goTo={goTo} styles={styles} />}
        >
          <View style={{ paddingHorizontal: 4, gap: 14 }}>
            {/* Top Net Balance Card */}
            <View style={{ backgroundColor: colors.gd, borderRadius: 20, padding: 18, marginVertical: 4 }}>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" }}>Net Balance — May 2026</Text>
              <Text style={{ color: "#fff", fontSize: 32, fontWeight: "bold", marginVertical: 8 }}>₹ 2,650</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Income ₹5,800 − Expenditure ₹3,150</Text>
            </View>

            {/* Summary Card */}
            <View style={{ backgroundColor: colors.cb, borderRadius: 18, borderWidth: 1.5, borderColor: colors.bd, padding: 16 }}>
              <Text style={{ color: colors.tp, fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>Summary</Text>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ColoredIcon name="income_chart" colorTheme="blue" size={16} />
                  <Text style={{ color: colors.tp, fontSize: 13, fontWeight: "500" }}>Total Income</Text>
                </View>
                <Text style={{ color: "#168A3A", fontSize: 14, fontWeight: "bold" }}>₹ 5,800</Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ColoredIcon name="expenditure" colorTheme="red" size={16} />
                  <Text style={{ color: colors.tp, fontSize: 13, fontWeight: "500" }}>Total Expenditure</Text>
                </View>
                <Text style={{ color: "#DC2626", fontSize: 14, fontWeight: "bold" }}>₹ 3,150</Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ColoredIcon name="wallet" colorTheme="blue" size={16} />
                  <Text style={{ color: colors.tp, fontSize: 13, fontWeight: "500" }}>Pending Recharges</Text>
                </View>
                <Text style={{ color: "#D97706", fontSize: 14, fontWeight: "bold" }}>₹ 950</Text>
              </View>
              
              <View style={{ height: 1, backgroundColor: colors.bd, marginVertical: 8 }} />
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ColoredIcon name="scales" colorTheme="amber" size={16} />
                  <Text style={{ color: colors.tp, fontSize: 13, fontWeight: "bold" }}>Net Balance</Text>
                </View>
                <Text style={{ color: "#7C3AED", fontSize: 14, fontWeight: "bold" }}>₹ 2,650</Text>
              </View>
            </View>

            {/* Income vs Expenditure Visual Bars */}
            <View style={{ backgroundColor: colors.cb, borderRadius: 18, borderWidth: 1.5, borderColor: colors.bd, padding: 16 }}>
              <Text style={{ color: colors.tp, fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>Income vs Expenditure</Text>
              
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <CustomIcon name="income_chart" size={16} color="#168A3A" />
                    <Text style={{ color: colors.ts, fontSize: 12, fontWeight: "500" }}>Income</Text>
                  </View>
                  <Text style={{ color: "#168A3A", fontSize: 13, fontWeight: "600" }}>₹ 5,800</Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.bd, borderRadius: 3, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: "100%", backgroundColor: "#168A3A", borderRadius: 3 }} />
                </View>
              </View>

              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <CustomIcon name="expenditure" size={16} color="#DC2626" />
                    <Text style={{ color: colors.ts, fontSize: 12, fontWeight: "500" }}>Expenditure</Text>
                  </View>
                  <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>₹ 3,150</Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.bd, borderRadius: 3, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: "54%", backgroundColor: "#DC2626", borderRadius: 3 }} />
                </View>
              </View>

              <View style={{ marginBottom: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <CustomIcon name="scales" size={16} color="#7C3AED" />
                    <Text style={{ color: colors.ts, fontSize: 12, fontWeight: "500" }}>Balance</Text>
                  </View>
                  <Text style={{ color: "#7C3AED", fontSize: 13, fontWeight: "600" }}>₹ 2,650</Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.bd, borderRadius: 3, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: "46%", backgroundColor: "#7C3AED", borderRadius: 3 }} />
                </View>
              </View>
            </View>

            {/* Month-wise Summary Table */}
            <View style={{ backgroundColor: colors.cb, borderRadius: 18, borderWidth: 1.5, borderColor: colors.bd, padding: 16, marginBottom: 12 }}>
              <Text style={{ color: colors.tp, fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>Month-wise Summary</Text>
              
              <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.bd, paddingBottom: 8, marginBottom: 8 }}>
                <Text style={{ flex: 1, color: colors.ts, fontSize: 11, fontWeight: "600" }}>Month</Text>
                <Text style={{ width: 70, color: colors.ts, fontSize: 11, fontWeight: "600", textAlign: "right" }}>Income</Text>
                <Text style={{ width: 70, color: colors.ts, fontSize: 11, fontWeight: "600", textAlign: "right" }}>Expense</Text>
                <Text style={{ width: 70, color: colors.ts, fontSize: 11, fontWeight: "600", textAlign: "right" }}>Balance</Text>
              </View>

              {[
                { month: "May 26", inc: "₹5,800", exp: "₹3,150", bal: "₹2,650" },
                { month: "Apr 26", inc: "₹6,200", exp: "₹3,400", bal: "₹2,800" },
                { month: "Mar 26", inc: "₹5,400", exp: "₹3,050", bal: "₹2,350" },
                { month: "Feb 26", inc: "₹5,900", exp: "₹3,300", bal: "₹2,600" },
              ].map((row, idx) => (
                <View key={idx} style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: idx === 3 ? 0 : 1, borderBottomColor: colors.bd + "40" }}>
                  <Text style={{ flex: 1, color: colors.tp, fontSize: 12, fontWeight: "500" }}>{row.month}</Text>
                  <Text style={{ width: 70, color: "#168A3A", fontSize: 12, fontWeight: "600", textAlign: "right" }}>{row.inc}</Text>
                  <Text style={{ width: 70, color: "#DC2626", fontSize: 12, fontWeight: "600", textAlign: "right" }}>{row.exp}</Text>
                  <Text style={{ width: 70, color: "#7C3AED", fontSize: 12, fontWeight: "600", textAlign: "right" }}>{row.bal}</Text>
                </View>
              ))}
            </View>
          </View>
        </PageLayout>
      )}
      {screen === "adm-profile" && (
        <PageLayout
          header={
            <View style={{ backgroundColor: colors.gd, alignItems: "center", paddingVertical: 28, paddingTop: 36, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
              <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <CustomIcon name="profile" size={38} color="#2E1065" />
              </View>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>Admin</Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>Administrator · STQC</Text>
              <View style={{ backgroundColor: "#F59E0B", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>🔐 Admin Access</Text>
              </View>
            </View>
          }
          footer={<AdminBottomNav active="adm-profile" goTo={goTo} styles={styles} />}
        >
          <View style={{ gap: 4, paddingHorizontal: 4, marginTop: 8 }}>
            <ProfileRow iconName="home" colorTheme="green" label="Home" onPress={() => goTo("adm-home")} />
            <ProfileRow iconName="wallet" colorTheme="blue" label="Recharge Requests" onPress={() => goTo("adm-recharge")} />
            <ProfileRow iconName="expenditure" colorTheme="red" label="Expenditure" onPress={() => goTo("adm-expenditure")} />
            <ProfileRow iconName="income_chart" colorTheme="blue" label="Income" onPress={() => goTo("adm-income")} />
            <ProfileRow iconName="scales" colorTheme="amber" label="Balance" onPress={() => goTo("adm-balance")} />
            
            <View style={{ height: 1.5, backgroundColor: colors.bd, marginVertical: 12, marginHorizontal: 12 }} />
            
            <ProfileRow iconName="exit" colorTheme="red" label="Logout" onPress={logout} danger />
          </View>
        </PageLayout>
      )}

      {/* Purchaser */}
      {screen === "pdashboard" && (
        <PurchaserDashboard
          styles={styles}
          goTo={goTo}
          stats={pStats}
          onOpenDrawer={() => setPDrawerOpen(true)}
        />
      )}
      {screen === "prequests" && (
        <PurchaserRequests
          styles={styles}
          goTo={goTo}
          requests={pRequests}
          filter={pReqFilter}
          setFilter={setPReqFilter}
          onAccept={acceptPurchaser}
          onMarkDelivered={markPurchaserDelivered}
        />
      )}
      {screen === "phistory" && (
        <View style={styles.page}>
          {renderTopBar("Purchase History", () => goTo("pdashboard"))}
          <ScrollView contentContainerStyle={styles.scroll}>
            {pHistory.length === 0 ? (
              <Text style={styles.subtle}>No completed purchases yet.</Text>
            ) : (
              pHistory.map((h) => (
                <View key={h.reqId} style={styles.couponCard}>
                  <Text style={styles.cardName}>{h.name}</Text>
                  <Text style={styles.cardPrice}>
                    {h.qty}  {h.date}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
      {screen === "pprofile" && (
        <View style={styles.page}>
          {renderTopBar("Purchaser Profile", () => goTo("pdashboard"))}
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.subtle}>purchaserertls@gmail.com</Text>
            <ProfileRow icon="=" label="Logout" onPress={logout} danger />
          </ScrollView>
        </View>
      )}

      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
        <TouchableOpacity style={styles.drawerOverlay} onPress={() => setDrawerOpen(false)}>
          <TouchableOpacity style={styles.drawer} activeOpacity={1}>
            <View style={[styles.drawerHead, { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }]}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 32 }}>=d</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>Kiran Chandran</Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Apprentice  STQC</Text>
              <Text style={styles.drawerWallet}>= Wallet: 350.00</Text>
            </View>
            <View style={{ paddingVertical: 12, gap: 4 }}>
              <ProfileRow
                iconName="home"
                colorTheme="green"
                label="Home"
                onPress={() => {
                  setDrawerOpen(false);
                  goTo("home");
                }}
              />
              <ProfileRow
                iconName="clock"
                colorTheme="blue"
                label="Booking History"
                onPress={() => {
                  setDrawerOpen(false);
                  goTo("bookings");
                }}
              />
              <ProfileRow
                iconName="coupons"
                colorTheme="orange"
                label="Available Coupons"
                onPress={() => {
                  setDrawerOpen(false);
                  goTo("coupons");
                }}
              />
              <ProfileRow
                iconName="wallet"
                colorTheme="amber"
                label="Recharge Wallet"
                onPress={() => {
                  setDrawerOpen(false);
                  goTo("recharge");
                }}
              />
              <ProfileRow
                iconName="settings"
                colorTheme="grey"
                label="Settings"
                onPress={() => {
                  setDrawerOpen(false);
                  alert("Settings is in development");
                }}
              />
              <ProfileRow
                iconName="help"
                colorTheme="purple"
                label="Help & Support"
                onPress={() => {
                  setDrawerOpen(false);
                  alert("Help & Support is in development");
                }}
              />
              <ProfileRow
                iconName="logout"
                colorTheme="red"
                label="Logout"
                onPress={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                danger
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <RoleDrawer
        visible={chefDrawerOpen}
        onClose={() => setChefDrawerOpen(false)}
        title="Chef Rajan"
        subtitle="Kitchen  STQC"
        rows={[
          { iconName: "home", colorTheme: "green", label: "Chef Home", onPress: () => { setChefDrawerOpen(false); goTo("chef-home"); } },
          { iconName: "trash", colorTheme: "orange", label: "Kitchen Stock", onPress: () => { setChefDrawerOpen(false); goTo("chef-kitchen-stock"); } },
          { iconName: "clock", colorTheme: "blue", label: "History", onPress: () => { setChefDrawerOpen(false); goTo("chef-history"); } },
          { iconName: "logout", colorTheme: "red", label: "Logout", onPress: () => { setChefDrawerOpen(false); logout(); }, danger: true },
        ]}
        styles={styles}
      />
      <RoleDrawer
        visible={admDrawerOpen}
        onClose={() => setAdmDrawerOpen(false)}
        title="Administrator"
        subtitle="ertlsadmin@gmail.com"
        rows={[
          { iconName: "home", colorTheme: "green", label: "Admin Home", onPress: () => { setAdmDrawerOpen(false); goTo("adm-home"); } },
          { iconName: "wallet", colorTheme: "amber", label: "Recharge", onPress: () => { setAdmDrawerOpen(false); goTo("adm-recharge"); } },
          { iconName: "logout", colorTheme: "red", label: "Logout", onPress: () => { setAdmDrawerOpen(false); logout(); }, danger: true },
        ]}
        styles={styles}
      />
      <RoleDrawer
        visible={pDrawerOpen}
        onClose={() => setPDrawerOpen(false)}
        title="Rajan Kumar"
        subtitle="Purchaser  STQC"
        rows={[
          { iconName: "chart", colorTheme: "blue", label: "Dashboard", onPress: () => { setPDrawerOpen(false); goTo("pdashboard"); } },
          { iconName: "booking", colorTheme: "orange", label: "Requests", onPress: () => { setPDrawerOpen(false); goTo("prequests"); } },
          { iconName: "logout", colorTheme: "red", label: "Logout", onPress: () => { setPDrawerOpen(false); logout(); }, danger: true },
        ]}
        styles={styles}
      />
    </>
  );
}

function FilterRow({ options, value, onChange }) {
  const { styles } = useAppStyles();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.filterChip, value === opt.key && styles.filterChipActive]}
          onPress={() => onChange(opt.key)}
        >
          <Text style={[styles.filterChipText, value === opt.key && styles.filterChipTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, autoCapitalize, half, icon, rightElement, keyboardType }) {
  const { colors, styles } = useAppStyles();
  const controlled = value !== undefined;
  return (
    <View style={half ? styles.fieldHalf : styles.fieldBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, rightElement && { paddingRight: 8 }]}>
        {icon && (
          <CustomIcon
            name={icon}
            size={18}
            color={colors.ts}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          style={styles.inputField}
          {...(controlled ? { value, onChangeText } : { defaultValue: value })}
          placeholder={placeholder}
          placeholderTextColor={colors.ts}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
        {rightElement}
      </View>
    </View>
  );
}

function PrimaryBtn({ title, onPress, color, compact, disabled }) {
  const { styles } = useAppStyles();
  return (
    <TouchableOpacity
      style={[
        styles.primaryBtn,
        color && { backgroundColor: color },
        compact && { paddingVertical: 8, paddingHorizontal: 12 },
        disabled && { opacity: 0.4 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.primaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

function OutlineBtn({ title, onPress, danger }) {
  const { colors, styles } = useAppStyles();
  return (
    <TouchableOpacity style={[styles.outlineBtn, danger && { borderColor: colors.rd }]} onPress={onPress}>
      <Text style={[styles.outlineBtnText, danger && { color: colors.rd }]}>{title}</Text>
    </TouchableOpacity>
  );
}

function QtyBtn({ title, onPress }) {
  const { colors, styles } = useAppStyles();
  return (
    <TouchableOpacity style={styles.qtyBtn} onPress={onPress}>
      <Text style={{ color: colors.gm, fontSize: 18, fontWeight: "500" }}>{title}</Text>
    </TouchableOpacity>
  );
}

function CRow({ label, value, total }) {
  const { colors, styles } = useAppStyles();
  return (
    <View style={[styles.cRow, total && styles.cRowTotal]}>
      <Text style={{ color: colors.ts }}>{label}</Text>
      <Text style={{ color: total ? colors.am : colors.tp, fontWeight: "500" }}>{value}</Text>
    </View>
  );
}

function ProfileRow({ icon, iconName, colorTheme = "grey", label, onPress, danger }) {
  const { colors, styles } = useAppStyles();
  return (
    <TouchableOpacity style={styles.profileRow} onPress={onPress}>
      {iconName ? (
        <ColoredIcon name={iconName} colorTheme={danger ? "red" : colorTheme} />
      ) : (
        <Text style={[styles.profileIcon, danger && { backgroundColor: "#FEE2E2" }]}>{icon}</Text>
      )}
      <Text style={[styles.profileText, danger && { color: colors.rd, fontWeight: "500" }]}>{label}</Text>
      <Text style={{ marginLeft: "auto", color: colors.ts, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}

// Function to generate the styles dynamically based on the current theme colors
const createStyles = (colors) => StyleSheet.create({
  introRoot: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  logoCircleLarge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: {
    fontSize: 32,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 1,
  },
  introSub: {
    fontSize: 15,
    marginTop: 6,
    textAlign: "center",
  },
  introFooter: {
    alignItems: "center",
    gap: 20,
    marginBottom: 40,
  },
  paginationDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bd,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.gm,
  },
  introBtn: {
    backgroundColor: colors.gd,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  introBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.bd,
    backgroundColor: colors.cb,
    borderRadius: 11,
    paddingHorizontal: 12,
    minHeight: 48,
    width: "100%",
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: colors.tp,
    paddingVertical: 10,
    minWidth: 0,
  },
  selectedDateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.cb,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.bd,
    padding: 12,
    marginTop: 12,
  },
  selectedDateLbl: {
    color: colors.ts,
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  selectedDateVal: {
    color: colors.tp,
    fontSize: 14,
    fontWeight: "600",
  },
  statCardGrid: {
    backgroundColor: colors.cb,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.bd,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statGridLbl: {
    color: colors.ts,
    fontSize: 11,
    fontWeight: "500",
  },
  statGridVal: {
    color: colors.tp,
    fontSize: 20,
    fontWeight: "500",
  },
  // New layout styles
  waveHeader: {
    backgroundColor: colors.gd,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerGreeting: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    marginTop: 4,
  },
  floatingCard: {
    backgroundColor: colors.cb,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.bd,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealCard: {
    backgroundColor: colors.cb,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bd,
    padding: 14,
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickActionsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.tp,
    marginTop: 20,
    marginBottom: 10,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 20,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: colors.cb,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bd,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
    elevation: 1,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.ts,
    textAlign: "center",
  },
  tabRowContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    width: "100%",
  },
  fieldBlock: { width: "100%", marginBottom: 2 },
  fieldHalf: { flex: 1, minWidth: 0, marginBottom: 2 },
  tabRow: { flexDirection: "row", backgroundColor: colors.bd, borderRadius: 11, padding: 3, gap: 3 },
  tabBtn: { flex: 1, padding: 9, borderRadius: 9, alignItems: "center" },
  tabBtnActive: { backgroundColor: colors.gd },
  tabText: { color: colors.ts, fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  formGap: { gap: 12, width: "100%" },
  hint: { fontSize: 11, color: colors.ts, lineHeight: 16, marginVertical: 4 },
  forgot: { color: colors.gm, alignSelf: "flex-end", fontWeight: "500" },
  terms: { textAlign: "center", color: colors.ts, fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: colors.tp },
  subtle: { color: colors.ts, lineHeight: 20 },
  inputLabel: { color: colors.ts, fontSize: 11, marginBottom: 3, fontWeight: "500", textTransform: "uppercase" },
  input: {
    borderWidth: 1.5,
    borderColor: colors.bd,
    backgroundColor: colors.cb,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 15,
    color: colors.tp,
  },
  inputErr: { borderColor: colors.rd, backgroundColor: colors.rdl },
  primaryBtn: { backgroundColor: colors.gd, borderRadius: 12, padding: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.gm, borderRadius: 12, padding: 10, alignItems: "center" },
  outlineBtnText: { color: colors.gm, fontWeight: "500" },
  page: { flex: 1, backgroundColor: colors.cream, minHeight: 0 },
  flexScroll: { flex: 1 },
  topBar: {
    backgroundColor: colors.gd,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topTitle: { color: "#fff", fontWeight: "600", fontSize: 16 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  scroll: { padding: 16, gap: 12, paddingBottom: 24 },
  greetingCard: { backgroundColor: colors.gm, borderRadius: 16, padding: 14 },
  greetTitle: { color: "#fff", fontSize: 17, fontWeight: "600" },
  greetSub: { color: "rgba(255,255,255,0.7)" },
  walletRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  walletLbl: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
  walletBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 2,
  },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: colors.tp },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  card: {
    backgroundColor: colors.cb,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.bd,
    gap: 2,
  },
  cardName: { color: colors.tp, fontWeight: "600" },
  cardPrice: { color: colors.ts, fontSize: 12 },
  available: {
    backgroundColor: colors.gl,
    color: colors.gm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: "flex-start",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.cb,
    borderRadius: 13,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.bd,
  },
  statNum: { color: colors.gd, fontSize: 24, fontWeight: "600" },
  statLbl: { color: colors.ts, fontSize: 11 },
  bottomNav: { backgroundColor: colors.cb, borderTopWidth: 1, borderTopColor: colors.bd, flexDirection: "row", paddingVertical: 6 },
  navItem: { flex: 1, alignItems: "center", gap: 2 },
  navIcon: { fontSize: 18, color: colors.ts },
  navLabel: { fontSize: 10, color: colors.ts, fontWeight: "500" },
  navActive: { color: colors.gm },
  drawerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  drawer: { width: 260, backgroundColor: colors.cb, height: "100%" },
  drawerHead: { backgroundColor: colors.gd, padding: 16, gap: 4 },
  drawerWallet: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    fontWeight: "500",
  },
  bookingHeader: { backgroundColor: colors.gd, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  bhTitle: { color: "#fff", fontWeight: "600", fontSize: 15 },
  bhSub: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
  demoBar: {
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  demoTxt: { color: "rgba(255,255,255,0.75)", fontSize: 10 },
  demoToggle: { borderWidth: 1, borderColor: "rgba(217,119,6,.5)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  demoToggleText: { color: colors.am, fontWeight: "600", fontSize: 10 },
  calendarCard: { backgroundColor: colors.cb, borderRadius: 15, borderWidth: 1.5, borderColor: colors.bd, padding: 12 },
  calendarNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  calArrow: { width: 26, height: 26, backgroundColor: colors.gl, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  month: { fontWeight: "600", color: colors.tp },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  dayHead: { width: "13.4%", textAlign: "center", color: colors.ts, fontWeight: "500", fontSize: 10, marginBottom: 4 },
  emptyDay: { width: "13.4%" },
  dayCell: { width: "13.4%", borderRadius: 7, alignItems: "center", paddingVertical: 5 },
  dayText: { color: colors.tp, fontSize: 12, fontWeight: "500" },
  dayPast: { color: colors.bd },
  daySelected: { backgroundColor: colors.gm },
  dayBooked: { backgroundColor: colors.rdl },
  msgBox: { borderRadius: 10, borderWidth: 1, padding: 9 },
  qtyCard: {
    backgroundColor: colors.cb,
    borderWidth: 1.5,
    borderColor: colors.bd,
    borderRadius: 13,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyLabel: { fontSize: 13, fontWeight: "600", color: colors.tp },
  qtySub: { fontSize: 11, color: colors.ts },
  qtyCtr: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: { width: 31, height: 31, borderRadius: 8, backgroundColor: colors.gl, alignItems: "center", justifyContent: "center" },
  qtyVal: { fontSize: 18, fontWeight: "600", minWidth: 20, textAlign: "center", color: colors.tp },
  priceStrip: {
    backgroundColor: colors.al,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLbl: { color: "#92400E", fontWeight: "500" },
  priceNote: { color: "#92400E", fontSize: 11 },
  priceTotal: { color: "#92400E", fontWeight: "500", fontSize: 18 },
  foodMock: { backgroundColor: colors.cb, padding: 20, borderBottomWidth: 2, borderBottomColor: colors.gl, alignItems: "center" },
  foodEmoji: { fontSize: 56 },
  foodText: { color: colors.gm, fontWeight: "600", marginTop: 4 },
  idRow: {
    backgroundColor: colors.gd,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idLbl: { color: "rgba(255,255,255,0.7)", fontSize: 11, textTransform: "uppercase" },
  idVal: { color: "#fff", fontWeight: "600" },
  confirmTable: { backgroundColor: colors.gl, borderRadius: 13, padding: 12 },
  cRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  cRowTotal: { marginTop: 4, borderTopWidth: 1, borderTopColor: colors.bd, paddingTop: 8 },
  couponTotal: {
    backgroundColor: colors.gl,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponCard: {
    backgroundColor: colors.cb,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.bd,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponIcon: {
    fontSize: 22,
    backgroundColor: colors.gl,
    borderRadius: 10,
    width: 40,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
    paddingTop: 6,
  },
  remaining: { backgroundColor: colors.gd, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 5, alignItems: "center" },
  profileHead: { backgroundColor: colors.gd, padding: 18, alignItems: "center", gap: 4 },
  avatar: {
    fontSize: 34,
    backgroundColor: colors.am,
    width: 66,
    height: 66,
    borderRadius: 40,
    textAlign: "center",
    textAlignVertical: "center",
    paddingTop: 10,
  },
  pn: { color: "#fff", fontSize: 18, fontWeight: "600" },
  pd: { color: "rgba(255,255,255,0.65)" },
  walletBig: {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 11,
    paddingHorizontal: 22,
    paddingVertical: 8,
    fontSize: 20,
    fontWeight: "600",
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  profileIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.gl,
    textAlign: "center",
    textAlignVertical: "center",
    paddingTop: 7,
  },
  profileText: { color: colors.tp, fontWeight: "500" },
  row2: { flexDirection: "row", gap: 9, width: "100%" },
  amountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  modeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  amountBtn: {
    flex: 1,
    minWidth: 60,
    borderWidth: 1.5,
    borderColor: colors.bd,
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.cb,
  },
  amountBtnActive: { backgroundColor: colors.gd, borderColor: colors.gd },
  amountBtnText: { color: colors.tp, fontWeight: "600", fontSize: 12 },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gm,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gl,
  },
  uploadAttached: { borderStyle: "solid", borderColor: colors.gm, backgroundColor: colors.cb },
  uploadErr: { borderColor: colors.rd, backgroundColor: colors.rdl },
  noteBox: { backgroundColor: colors.al, borderRadius: 12, padding: 11 },
  successCard: {
    backgroundColor: colors.cb,
    borderWidth: 1.5,
    borderColor: colors.bd,
    borderRadius: 14,
    padding: 14,
    width: "100%",
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.bd,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.cb,
  },
  filterChipActive: { backgroundColor: colors.gd, borderColor: colors.gd },
  filterChipText: { fontSize: 11, fontWeight: "500", color: colors.ts },
  filterChipTextActive: { color: "#fff" },
});
