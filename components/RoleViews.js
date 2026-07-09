import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CHEF_NAME,
  TODAY_DAY,
  categoryIcons,
  chefUsers,
  formatDateIN,
  greeting,
  items,
  makeChefKey,
  quickStockItems,
} from "../data/canteenData";
import { useTheme } from "./ThemeContext";
import { CustomIcon, ColoredIcon } from "./AppIcons";
import { PageLayout, useScreenMetrics } from "./ScreenLayout";

export function FilterChips({ options, value, onChange, styles }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.filterChip, value === opt.key && styles.filterChipActive]}
          onPress={() => onChange(opt.key)}
        >
          <Text style={[styles.filterChipText, value === opt.key && styles.filterChipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function ChefHome({
  styles,
  goTo,
  chefStats,
  onOpenList,
  onOpenDrawer,
  cardWidth,
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenDrawer}>
          <CustomIcon name="menu" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Chef Home</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => goTo("chef-kitchen-stock")}>
          <CustomIcon name="food" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.flexScroll} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.greetingCard}>
          <Text style={styles.greetTitle}>{greeting()}, {CHEF_NAME}</Text>
          <Text style={styles.greetSub}>{formatDateIN()}</Text>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.walletLbl}>Today's Bookings</Text>
              <Text style={styles.walletBadge}>{chefStats.total}</Text>
            </View>
            <View>
              <Text style={styles.walletLbl}>Taken</Text>
              <Text style={styles.walletBadge}>{chefStats.taken}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.sectionLabel}>Category lists - Today</Text>
        <View style={styles.grid2}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[styles.card, cardWidth ? { width: cardWidth } : null]}
              onPress={() => onOpenList(item.name, item.icon)}
            >
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardPrice}>{chefStats.counts[item.name] || 0} booked</Text>
              <Text style={styles.available}>Open list</Text>
            </TouchableOpacity>
          ))}
        </View>
        <PrimaryBtn title="Booking History" onPress={() => goTo("chef-history")} color={colors.gm} styles={styles} />
        <PrimaryBtn title="Kitchen Stock" onPress={() => goTo("chef-kitchen-stock")} styles={styles} />
      </ScrollView>
    </View>
  );
}

export function ChefListView({
  styles,
  goTo,
  chefCurCat,
  chefCurIcon,
  chefCurDay,
  setChefCurDay,
  chefFilterMode,
  setChefFilterMode,
  chefBookingDB,
  submittedKeys,
  onToggleTaken,
  onSubmitList,
  listStats,
  filteredRecs,
}) {
  const { colors } = useTheme();
  const { calCellWidth } = useScreenMetrics();
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <View style={styles.page}>
      <View style={styles.bookingHeader}>
        <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("chef-home")}>
          <CustomIcon name="chevron" size={18} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.bhTitle}>{chefCurIcon} {chefCurCat} List</Text>
          <Text style={styles.bhSub}>{chefCurDay} April 2025</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarGrid}>
            {days.map((day) => {
              const k = makeChefKey(chefCurCat, day);
              const recs = chefBookingDB[k] || [];
              const selected = day === chefCurDay;
              const past = day < TODAY_DAY;
              return (
                <TouchableOpacity
                  key={day}
                  disabled={past}
                  onPress={() => setChefCurDay(day)}
                  style={[
                    styles.dayCell,
                    { width: calCellWidth },
                    selected && styles.daySelected,
                    !selected && recs.length > 0 && styles.dayBooked,
                  ]}
                >
                  <Text style={[styles.dayText, past && styles.dayPast, selected && { color: "#fff" }]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <FilterChips
          styles={styles}
          value={chefFilterMode}
          onChange={setChefFilterMode}
          options={[
            { key: "all", label: "All" },
            { key: "taken", label: "Taken" },
            { key: "pending", label: "Pending" },
          ]}
        />
        <View style={styles.grid2}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{listStats.booked}</Text>
            <Text style={styles.statLbl}>Booked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{listStats.taken}</Text>
            <Text style={styles.statLbl}>Taken</Text>
          </View>
        </View>
        {filteredRecs.length === 0 ? (
          <Text style={styles.subtle}>No entries for this filter.</Text>
        ) : (
          filteredRecs.map((rec) => {
            const u = chefUsers.find((x) => x.id === rec.userId) || {
              name: "Unknown",
              mobile: "",
              avatar: "U",
            };
            const key = makeChefKey(chefCurCat, chefCurDay);
            const locked = submittedKeys.has(key);
            return (
              <View key={rec.userId} style={styles.couponCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Text style={{ fontSize: 28 }}>{u.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{u.name}</Text>
                    <Text style={styles.cardPrice}>{u.mobile}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  disabled={locked}
                  onPress={() => onToggleTaken(key, rec.userId)}
                  style={[
                    styles.remaining,
                    rec.taken && { backgroundColor: colors.gm },
                    locked && { opacity: 0.5 },
                  ]}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>{rec.taken ? "Y" : "N"}</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        {listStats.locked ? (
          <View style={[styles.msgBox, { backgroundColor: colors.gl, borderColor: colors.gm }]}>
            <Text style={{ color: colors.gm, fontWeight: "500" }}>List submitted and locked.</Text>
          </View>
        ) : (
          chefCurDay === TODAY_DAY &&
          listStats.booked > 0 && (
            <PrimaryBtn title="Final Submit List" onPress={onSubmitList} color={colors.gm} styles={styles} />
          )
        )}
      </ScrollView>
    </View>
  );
}

export function ChefKitchenStock({
  styles,
  goTo,
  ksStockList,
  ksTab,
  setKsTab,
  ksStatus,
  setKsStatus,
  ksFilter,
  setKsFilter,
  ksForm,
  setKsForm,
  onAddItem,
  onDeleteItem,
  onQuickAdd,
}) {
  const { colors } = useTheme();
  const filtered =
    ksFilter === "all" ? ksStockList
      : ksStockList.filter((i) => i.status === ksFilter);

  return (
    <View style={styles.page}>
      <View style={styles.bookingHeader}>
        <TouchableOpacity style={styles.iconBtnSmall} onPress={() => goTo("chef-home")}>
          <CustomIcon name="chevron" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bhTitle}>Kitchen Stock</Text>
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, ksTab === "add" && styles.tabBtnActive]}
          onPress={() => setKsTab("add")}
        >
          <Text style={[styles.tabText, ksTab === "add" && styles.tabTextActive]}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, ksTab === "list" && styles.tabBtnActive]}
          onPress={() => setKsTab("list")}
        >
          <Text style={[styles.tabText, ksTab === "list" && styles.tabTextActive]}>
            List ({ksStockList.length})
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {ksTab === "add" ? (
          <>
            <Field
              label="Item Name *"
              value={ksForm.name}
              onChangeText={(v) => setKsForm((f) => ({ ...f, name: v }))}
              styles={styles}
            />
            <Field
              label="Quantity *"
              value={ksForm.qty}
              onChangeText={(v) => setKsForm((f) => ({ ...f, qty: v }))}
              keyboardType="number-pad"
              styles={styles}
            />
            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.modeGrid}>
              {["low", "out"].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.amountBtn, ksStatus === s && styles.amountBtnActive]}
                  onPress={() => setKsStatus(s)}
                >
                  <Text style={[styles.amountBtnText, ksStatus === s && { color: "#fff" }]}>
                    {s === "low" ? "Low" : "Out"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Field
              label="Notes"
              value={ksForm.notes}
              onChangeText={(v) => setKsForm((f) => ({ ...f, notes: v }))}
              styles={styles}
            />
            <PrimaryBtn title="+ Add to Stock List" onPress={onAddItem} color={colors.gm} styles={styles} />
            <Text style={styles.sectionLabel}>Quick Add</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {quickStockItems.map((q) => (
                <TouchableOpacity key={q.name} style={styles.amountBtn} onPress={() => onQuickAdd(q.name)}>
                  <Text style={styles.amountBtnText}>
                    {q.emoji} {q.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <FilterChips
              styles={styles}
              value={ksFilter}
              onChange={setKsFilter}
              options={[
                { key: "all", label: "All" },
                { key: "low", label: "Low" },
                { key: "out", label: "Out" },
              ]}
            />
            {filtered.length === 0 ? (
              <Text style={styles.subtle}>No stock items match this filter.</Text>
            ) : (
              filtered.map((item) => (
                <View key={item.id} style={styles.couponCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>
                      {item.status === "out" ? "Out" : "Low"} ? {item.name}
                    </Text>
                    <Text style={styles.cardPrice}>
                      {item.qty} {item.unit} ? {item.addedAt}
                    </Text>
                    {item.notes ? <Text style={styles.cardPrice}>{item.notes}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => onDeleteItem(item.id)}>
                    <Text style={{ fontSize: 18 }}>X</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ManageCard({ title, val, sub, icon, theme, onPress, valColor, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: colors.cb,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.bd,
        padding: 14,
        flex: 1,
        minWidth: "45%",
        position: "relative",
      }}
    >
      <Text style={{ position: "absolute", top: 12, right: 14, color: colors.ts, fontSize: 14 }}>›</Text>
      <View style={{ alignSelf: "flex-start", marginBottom: 12 }}>
        <ColoredIcon name={icon} colorTheme={theme} size={18} />
      </View>
      <Text style={{ color: colors.ts, fontSize: 13, fontWeight: "500" }}>{title}</Text>
      <Text style={{ color: valColor, fontSize: 18, fontWeight: "bold", marginVertical: 4 }}>{val}</Text>
      <Text style={{ color: colors.ts, fontSize: 11 }}>{sub}</Text>
    </TouchableOpacity>
  );
}

export function AdminHome({ styles, goTo, pendingCount, onOpenDrawer }) {
  const { colors } = useTheme();

  const categories = [
    { name: "Lunch", icon: "🍛", val: "1,800", percentage: 57, dotColor: "#D97706", barColor: "#D97706" },
    { name: "Tea", icon: "☕", val: "600", percentage: 19, dotColor: "#1D4ED8", barColor: "#1D4ED8" },
    { name: "Snacks", icon: "🥟", val: "480", percentage: 15, dotColor: "#F59E0B", barColor: "#F59E0B" },
    { name: "Egg", icon: "🥚", val: "270", percentage: 9, dotColor: "#10B981", barColor: "#10B981" },
  ];

  return (
    <PageLayout
      header={
        <View style={{ backgroundColor: colors.gd, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: 18, paddingTop: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <TouchableOpacity onPress={onOpenDrawer} style={{ padding: 4 }}>
              <CustomIcon name="menu" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <CustomIcon name="bell" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Good Afternoon, Admin 👋</Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>Thursday, 9 July 2026</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "500" }}>🔐 Administrator</Text>
            </View>
            <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "500" }}>STQC Canteen</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => goTo("adm-recharge")}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 14,
              padding: 14,
              marginTop: 16,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>Pending Recharges</Text>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{pendingCount}</Text>
          </TouchableOpacity>
        </View>
      }
      footer={<AdminBottomNav active="adm-home" goTo={goTo} styles={styles} />}
    >
      <Text style={[styles.sectionLabel, { marginTop: 16, marginBottom: 12, paddingHorizontal: 4 }]}>Manage</Text>
      <View style={{ gap: 10, paddingHorizontal: 4 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ManageCard
            title="Recharge"
            val="₹ 4,200"
            sub="This month"
            icon="wallet"
            theme="amber"
            valColor="#D97706"
            onPress={() => goTo("adm-recharge")}
            colors={colors}
          />
          <ManageCard
            title="Expenditure"
            val="₹ 3,150"
            sub="This month"
            icon="expenditure"
            theme="red"
            valColor="#DC2626"
            onPress={() => goTo("adm-expenditure")}
            colors={colors}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ManageCard
            title="Income"
            val="₹ 5,800"
            sub="This month"
            icon="income_chart"
            theme="green"
            valColor="#168A3A"
            onPress={() => goTo("adm-income")}
            colors={colors}
          />
          <ManageCard
            title="Balance"
            val="₹ 2,650"
            sub="Net this month"
            icon="scales"
            theme="purple"
            valColor="#7C3AED"
            onPress={() => goTo("adm-balance")}
            colors={colors}
          />
        </View>
      </View>

      <View style={{
        backgroundColor: colors.cb,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: colors.bd,
        padding: 16,
        marginTop: 20,
        marginHorizontal: 4,
        marginBottom: 10,
      }}>
        <Text style={{ color: colors.tp, fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>📊 Monthly Expenses by Category</Text>
        {categories.map((c) => (
          <View key={c.name} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.dotColor }} />
                <Text style={{ fontSize: 18 }}>{c.icon}</Text>
                <Text style={{ color: colors.tp, fontSize: 13, fontWeight: "500" }}>{c.name}</Text>
              </View>
              <Text style={{ color: colors.tp, fontSize: 14, fontWeight: "600" }}>₹ {c.val}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: colors.bd, borderRadius: 3, overflow: "hidden" }}>
              <View style={{ height: "100%", width: `${c.percentage}%`, backgroundColor: c.barColor, borderRadius: 3 }} />
            </View>
          </View>
        ))}
        <View style={{ height: 1.5, backgroundColor: colors.bd, marginVertical: 12 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.ts, fontSize: 14, fontWeight: "500" }}>Total</Text>
          <Text style={{ color: "#EF4444", fontSize: 16, fontWeight: "bold" }}>₹ 3,150</Text>
        </View>
      </View>
    </PageLayout>
  );
}

export function AdminRechargeList({
  styles,
  goTo,
  requests,
  filter,
  setFilter,
  onApprove,
  onReject,
}) {
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = React.useState(null);
  const list =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);
  return (
    <PageLayout
      header={renderTopBar(styles, "Recharge Requests", () => goTo("adm-home"))}
      footer={<AdminBottomNav active="adm-recharge" goTo={goTo} styles={styles} />}
    >
      <FilterChips
        styles={styles}
        value={filter}
        onChange={setFilter}
        options={[
          { key: "all", label: "All" },
          { key: "Pending", label: "Pending" },
          { key: "Approved", label: "Approved" },
          { key: "Rejected", label: "Rejected" },
        ]}
      />
      <View style={{ gap: 10, paddingHorizontal: 4 }}>
        {list.length === 0 ? (
          <Text style={styles.subtle}>No requests found.</Text>
        ) : (
          list.map((r) => {
            const idx = requests.indexOf(r);
            const isExpanded = expandedId === r.id;
            return (
              <View key={r.id} style={[styles.couponCard, { flexDirection: "column", alignItems: "stretch" }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedId(isExpanded ? null : r.id)}
                  style={{ flexDirection: "row", gap: 10, alignItems: "center", width: "100%" }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gl, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18 }}>{r.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{r.user}</Text>
                    <Text style={styles.cardPrice}>{r.email}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.cardName, { color: colors.gd }]}>₹{r.amount}</Text>
                    <Text style={{ fontSize: 12, color: colors.ts }}>{isExpanded ? "▲" : "▼"}</Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: colors.bd, paddingTop: 8 }}>
                    <Text style={[styles.cardPrice, { marginBottom: 2 }]}>ID: {r.id} • {r.mode} • {r.date}</Text>
                    <Text style={[styles.cardPrice, { marginBottom: 4 }]}>UTR: {r.utr}</Text>
                    {r.status === "Pending" ? (
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                        <TouchableOpacity
                          style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.gm, paddingVertical: 8 }]}
                          onPress={() => onApprove(idx)}
                        >
                          <Text style={styles.primaryBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.outlineBtn, { flex: 1, borderColor: colors.rd, paddingVertical: 8 }]}
                          onPress={() => onReject(idx)}
                        >
                          <Text style={[styles.outlineBtnText, { color: colors.rd }]}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text
                        style={{
                          marginTop: 6,
                          fontWeight: "500",
                          color: r.status === "Approved" ? colors.gm : colors.rd,
                        }}
                      >
                        {r.status}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </PageLayout>
  );
}

export function PurchaserDashboard({ styles, goTo, stats, onOpenDrawer }) {
  const { colors } = useTheme();
  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenDrawer}>
          <CustomIcon name="menu" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Purchaser</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => goTo("prequests")}>
          <CustomIcon name="bell" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetTitle}>{greeting()}, Rajan</Text>
          <Text style={styles.greetSub}>{formatDateIN()}</Text>
        </View>
        <View style={styles.grid2}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.pending}</Text>
            <Text style={styles.statLbl}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.purchased}</Text>
            <Text style={styles.statLbl}>Purchased</Text>
          </View>
        </View>
        <PrimaryBtn title="View Requests" onPress={() => goTo("prequests")} styles={styles} />
        <PrimaryBtn title="Purchase History" onPress={() => goTo("phistory")} color={colors.gm} styles={styles} />
      </ScrollView>
    </View>
  );
}

export function PurchaserRequests({
  styles,
  goTo,
  requests,
  filter,
  setFilter,
  onAccept,
  onMarkDelivered,
}) {
  const { colors } = useTheme();
  const list = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  return (
    <View style={styles.page}>
      {renderTopBar(styles, "Procurement Requests", () => goTo("pdashboard"))}
      <ScrollView contentContainerStyle={styles.scroll}>
        <FilterChips
          styles={styles}
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "purchased", label: "Purchased" },
            { key: "delivered", label: "Delivered" },
          ]}
        />
        {list.length === 0 ? (
          <Text style={styles.subtle}>No requests. Chef kitchen stock syncs here.</Text>
        ) : (
          list.map((r) => {
            const idx = requests.findIndex((x) => x.id === r.id);
            return (
              <View key={r.id} style={styles.couponCard}>
                <Text style={styles.cardName}>
                  {r.id} ? {r.name}
                </Text>
                <Text style={styles.cardPrice}>
                  Qty: {r.qty} ? {r.priority} ? {r.status}
                </Text>
                {r.notes ? <Text style={styles.cardPrice}>{r.notes}</Text> : null}
                <View style={{ flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {r.status === "pending" && (
                    <TouchableOpacity
                      style={[styles.primaryBtn, { paddingVertical: 8, paddingHorizontal: 10 }]}
                      onPress={() => onAccept(idx)}
                    >
                      <Text style={styles.primaryBtnText}>Accept</Text>
                    </TouchableOpacity>
                  )}
                  {r.status === "purchased" && (
                    <TouchableOpacity
                      style={[styles.primaryBtn, { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: colors.gm }]}
                      onPress={() => onMarkDelivered(idx)}
                    >
                      <Text style={styles.primaryBtnText}>Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function renderTopBar(styles, title, onBack) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
        <CustomIcon name="chevron" size={20} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.topTitle}>{title}</Text>
      <TouchableOpacity style={styles.iconBtn}>
        <CustomIcon name="bell" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, styles, half }) {
  return (
    <View style={half ? { flex: 1, minWidth: 0 } : { width: "100%" }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={styles.inputLabel.color || "#6B7280"}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export function PrimaryBtn({ title, onPress, color, compact, disabled, styles }) {
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

export function ProfileRow({ icon, iconName, colorTheme = "grey", label, onPress, danger, styles }) {
  const { colors } = useTheme();
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

export function RoleDrawer({
  visible,
  onClose,
  title,
  subtitle,
  wallet,
  rows,
  styles,
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.drawerOverlay} onPress={onClose}>
        <TouchableOpacity style={styles.drawer} activeOpacity={1}>
          <View style={[styles.drawerHead, { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }]}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 32 }}>U</Text>
            </View>
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>{title}</Text>
            <Text style={{ color: "rgba(255,255,255,.75)", fontSize: 13 }}>{subtitle}</Text>
            {wallet ? <Text style={styles.drawerWallet}>{wallet}</Text> : null}
          </View>
          <View style={{ paddingVertical: 12, gap: 4 }}>
            {rows.map((row) => (
              <ProfileRow key={row.label} {...row} styles={styles} />
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function ChefHistoryView({ styles, goTo, entries, filter, setFilter }) {
  const { colors } = useTheme();
  const list = filter === "all" ? entries : entries.filter((e) => e.cat === filter);
  return (
    <View style={styles.page}>
      {renderTopBar(styles, "Chef History", () => goTo("chef-home"))}
      <ScrollView contentContainerStyle={styles.scroll}>
        <FilterChips
          styles={styles}
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: "All" },
            ...items.map((i) => ({ key: i.name, label: i.name })),
          ]}
        />
        {list.length === 0 ? (
          <Text style={styles.subtle}>No history yet.</Text>
        ) : (
          list.map((a, i) => (
            <View key={`${a.cat}-${a.day}-${a.user.name}-${i}`} style={styles.couponCard}>
              <Text style={styles.cardName}>
                {a.icon} {a.user.name}
              </Text>
              <Text style={styles.cardPrice}>
                {a.day} April - {a.cat} - {a.taken ? "Taken" : "Booked"}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

export function AdminBottomNav({ active, goTo, styles }) {
  const { colors } = useTheme();
  const tabs = [
    { key: "adm-home", label: "Home", icon: "home" },
    { key: "adm-recharge", label: "Recharge", icon: "wallet" },
    { key: "adm-balance", label: "Finance", icon: "scales" },
    { key: "adm-profile", label: "Profile", icon: "profile" }
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => goTo(tab.key)}
          >
            <CustomIcon
              name={tab.icon}
              size={20}
              color={isActive ? colors.gm : colors.ts}
            />
            <Text style={[styles.navLabel, isActive && styles.navActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AdminInventoryView({
  styles,
  goTo,
  inventory,
  setInventory,
  onUpdate,
}) {
  const { colors } = useTheme();
  const mealItems = [
    { name: "Lunch", icon: "🍛" },
    { name: "Tea", icon: "☕" },
    { name: "Snacks", icon: "🥟" },
    { name: "Egg", icon: "🥚" },
  ];

  const handleAdjust = (name, amount) => {
    setInventory((prev) => ({
      ...prev,
      [name]: Math.max(0, prev[name] + amount),
    }));
  };

  return (
    <PageLayout
      header={
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => goTo("adm-home")}>
            <CustomIcon name="chevron" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Coupon Inventory</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <CustomIcon name="bell" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      }
      footer={<AdminBottomNav active="adm-inventory" goTo={goTo} styles={styles} />}
    >
      <View style={{ gap: 10, paddingHorizontal: 4 }}>
        {mealItems.map((item) => {
          const qty = inventory[item.name] || 0;
          return (
            <View key={item.name} style={styles.couponCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.gl, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={[styles.cardPrice, { color: colors.gm, fontWeight: "500", marginTop: 2 }]}>Available</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleAdjust(item.name, -5)}
                >
                  <Text style={{ color: colors.gm, fontSize: 18, fontWeight: "500" }}>−</Text>
                </TouchableOpacity>
                <Text style={{ color: colors.tp, fontSize: 16, fontWeight: "600", minWidth: 32, textAlign: "center" }}>
                  {qty}
                </Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleAdjust(item.name, 5)}
                >
                  <Text style={{ color: colors.gm, fontSize: 18, fontWeight: "500" }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ marginTop: 20 }}>
          <PrimaryBtn title="Update Inventory" onPress={onUpdate} color={colors.gm} styles={styles} />
        </View>
      </View>
    </PageLayout>
  );
}

export { categoryIcons, renderTopBar };
