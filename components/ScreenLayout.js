import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useTheme } from "./ThemeContext";

function getInsets() {
  const top = Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;
  const bottom = Platform.OS === "android" ? 10 : 18;
  return { top, bottom, left: 0, right: 0 };
}

export function STQCLogo() {
  const { colors } = useTheme();
  return (
    <View style={[styles.logoMark, { borderColor: colors.gm }]}>
      <View style={[styles.logoCircle, { borderColor: colors.gm }]}>
        <Text style={[styles.logoGlyph, { color: colors.gm }]}>🍴</Text>
      </View>
      <Text style={[styles.logoLeaf, { color: colors.gm }]}>◥</Text>
    </View>
  );
}

export function AppSafeProvider({ children }) {
  const { colors, isDarkMode } = useTheme();
  const { width, height } = useWindowDimensions();
  const isWide = width > 520;

  const rootBg = isWide
    ? isDarkMode
      ? "#0A0F1D"
      : "#EEF1F4"
    : colors.cream;

  const containerStyle = isWide
    ? {
        width: 440,
        maxWidth: "96%",
        height: Math.min(height * 0.96, 852),
        borderRadius: 28,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.bd,
        shadowColor: isDarkMode ? "#000" : "#9AA3AE",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.28,
        shadowRadius: 30,
        elevation: 12,
        backgroundColor: colors.cream,
      }
    : {
        flex: 1,
        width: "100%",
      };

  return (
    <View style={[styles.root, { backgroundColor: rootBg }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.cream}
        translucent={false}
      />
      <View style={containerStyle}>{children}</View>
    </View>
  );
}

export function useScreenMetrics() {
  const insets = getInsets();
  const { width } = useWindowDimensions();
  const effectiveWidth = width > 520 ? 440 : width;
  const pagePad = effectiveWidth >= 700 ? 28 : 16;
  const gap = 10;
  const columns = effectiveWidth >= 700 ? 3 : 2;
  const cardWidth = Math.floor((effectiveWidth - pagePad * 2 - gap * (columns - 1)) / columns);

  const calCardPad = 12;
  const calGridGap = 3;
  const calWidth = effectiveWidth - pagePad * 2 - calCardPad * 2;
  const calCellWidth = Math.floor((calWidth - calGridGap * 6) / 7);

  return {
    insets,
    width: effectiveWidth,
    cardWidth: Math.max(132, cardWidth),
    pagePad,
    bottomPad: Math.max(insets.bottom, 12),
    calCellWidth,
  };
}

export function AuthLayout({ children, showBranding = false }) {
  const { insets } = useScreenMetrics();
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.authRoot, { paddingTop: insets.top, backgroundColor: colors.cream }]}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={[styles.authScrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showBranding ? (
            <View style={styles.authBrand}>
              <STQCLogo />
              <Text style={[styles.authTitle, { color: isDarkMode ? colors.gm : colors.gd }]}>STQC{"\n"}CANTEEN</Text>
              <Text style={[styles.authSub, { color: colors.ts }]}>Food Coupon System</Text>
            </View>
          ) : (
            <View style={styles.authBrandCompact}>
              <STQCLogo />
            </View>
          )}
          <View style={[styles.authCard, { backgroundColor: colors.cb, borderColor: colors.bd }]}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function PageLayout({ header, children, footer }) {
  const { insets, bottomPad } = useScreenMetrics();
  const { colors } = useTheme();

  return (
    <View style={[styles.pageRoot, { paddingTop: insets.top, backgroundColor: colors.cream }]}>
      {header}
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={[styles.pageScroll, { paddingBottom: bottomPad + (footer ? 8 : 24) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footerWrap, { paddingBottom: insets.bottom, borderTopColor: colors.bd, backgroundColor: colors.cb }]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
  flex1: { flex: 1 },
  authRoot: { flex: 1 },
  authScrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 18, gap: 20 },
  authBrand: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  authBrandCompact: { alignItems: "center", paddingTop: 8, paddingBottom: 8 },
  logoMark: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: {
    fontSize: 39,
    fontWeight: "900",
    includeFontPadding: false,
  },
  logoLeaf: {
    position: "absolute",
    right: 8,
    bottom: 14,
    fontSize: 28,
    fontWeight: "900",
    transform: [{ rotate: "-18deg" }],
  },
  authTitle: {
    fontSize: 30,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
    lineHeight: 36,
  },
  authSub: { fontSize: 14, marginTop: 8, textAlign: "center" },
  authCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  pageRoot: { flex: 1, minHeight: 0 },
  pageScroll: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  footerWrap: { borderTopWidth: 1 },
});
