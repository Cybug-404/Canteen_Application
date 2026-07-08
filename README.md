# STQC Canteen - Android Application

Multi-role canteen management app for **STQC** (Software Technology Parks of India - Quality Council). Built with **React Native + Expo**, packaged as a native Android app (`com.stqc.canteen`).

## System overview

```mermaid
flowchart TB
  subgraph auth [Authentication]
    Login[Login / Sign up]
    Login --> Role{Email + password}
  end
  Role -->|customer@*| User[Employee / User]
  Role -->|chef@stqc.gov.in| Chef[Chef]
  Role -->|admin@stqc.gov.in| Admin[Administrator]
  Role -->|purchaser@stqc.gov.in| Purchaser[Purchaser]
  User --> Book[Food booking]
  User --> Wallet[Wallet recharge]
  User --> Coupons[Coupons]
  Chef --> Lists[Daily booking lists]
  Chef --> Stock[Kitchen stock]
  Stock -->|sync| Purchaser
  Purchaser --> Procure[Procurement requests]
  Admin --> Recharge[Approve recharges]
  Admin --> Finance[Expenditure / Income / Balance]
```

### Roles and demo credentials

| Role | Email | Password |
|------|-------|----------|
| **Employee** | any email (e.g. `customer@stqc.gov.in`) | any password |
| **Chef** | `chef@stqc.gov.in` | `chef123` |
| **Admin** | `admin@stqc.gov.in` | `admin123` |
| **Purchaser** | `purchaser@stqc.gov.in` | `purchaser123` |

### Employee workflow

1. **Home** - wallet balance (250 demo), book Lunch / Tea / Snacks / Egg.
2. **Booking** - April 2025 calendar, quantity (1-5), total price; demo toggle simulates before/after 10:00 AM cutoff.
3. **Confirm** - booking ID, coupon deduction message.
4. **Coupons** - per-category remaining counts.
5. **Recharge** - amount, UTR, payment mode, screenshot (tap to attach demo image); admin reviews.
6. **Profile** - edit profile, history, logout.

### Chef workflow

1. **Chef home** - today's booking/taken stats per category.
2. **Category list** - calendar day, mark users taken/pending, **Final Submit List** locks the day.
3. **Kitchen stock** - add low/out items; syncs to purchaser requests.
4. **History** - filter by food category.

### Admin workflow

1. **Recharge requests** - approve/reject pending UPI/NEFT/cash/cheque submissions.
2. **Expenditure** - daily breakdown (qty  unit price).
3. **Income** - bookings vs recharges.
4. **Balance sheet** - summary totals.

### Purchaser workflow

1. **Dashboard** - pending vs purchased counts.
2. **Requests** - from chef stock: Accept  Purchased  Delivered.
3. **Purchase history** - completed deliveries.

## Project structure

| Path | Purpose |
|------|---------|
| `App.js` | Main navigation, state, user/admin/chef/purchaser screens |
| `components/RoleViews.js` | Chef, admin, purchaser UI components |
| `data/canteenData.js` | Colors, menu items, seed data, helpers |
| `android/` | Native Android project (Gradle, `MainActivity`, manifest) |
| `app.json` | Expo config - app name **STQC Canteen**, package `com.stqc.canteen` |
| `eas.json` | EAS Build profile for APK (`preview`) |

## Run on Android (development)

**Prerequisites:** Node.js 20+, [Android Studio](https://developer.android.com/studio) with SDK 36, JDK 17.

1. Install dependencies (use a working Node/npm, not a broken global npm shim):

   ```powershell
   cd "c:\Users\Acer\Music\Canteen (2)\Canteen"
   npm install
   ```

2. Point Gradle to your SDK - copy the example and edit the path:

   ```powershell
   copy android\local.properties.example android\local.properties
   # Edit sdk.dir=... to your Android SDK folder
   ```

   Typical path: `C:\Users\Acer\AppData\Local\Android\Sdk`

3. Start Metro and run on device/emulator:

   ```powershell
   npm run start
   npm run android
   ```

   Or use the helper script (auto-detects SDK if installed in the default location):

   ```powershell
   .\scripts\build-android.ps1 -RunOnDevice
   ```

## Build installable APK

### Option A - Local Gradle (debug APK, no signing setup)

```powershell
.\scripts\build-android.ps1
```

Output: `android\app\build\outputs\apk\debug\app-debug.apk`

Install on a connected phone (USB debugging on):

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

### Option B - EAS cloud build (release APK)

Requires [Expo account](https://expo.dev) and `eas login`:

```powershell
npx eas build -p android --profile preview
```

Downloads a signed preview APK from the Expo dashboard.

## Verify JavaScript bundle

```powershell
npx expo export --platform android
```

Successful export writes to `dist/` (gitignored).

## Data model notes

- All state is **in-memory** (demo/prototype). Restarting the app resets bookings unless you add persistence later.
- Chef booking DB keys: `{Category}-2025-04-{DD}` (see `makeChefKey` in `data/canteenData.js`).
- Kitchen stock additions push matching rows into purchaser `pRequests` via `syncPurchaserFromStock`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `SDK location not found` | Create `android/local.properties` with `sdk.dir=C:\\Users\\...\\Android\\Sdk` |
| `npm` / `Cannot find module npm-prefix.js` | Reinstall Node from [nodejs.org](https://nodejs.org) or use Android Studio's terminal |
| Gradle / JDK errors | Use JDK 17; set `JAVA_HOME` in System Environment Variables |
| Build slow first time | Gradle downloads dependencies; allow 5-15 minutes |

## Built APK (release)

After a successful local build, the installable file is:

- **`STQC-Canteen-release.apk`** (project root)
- **`output/STQC-Canteen-release.apk`** (copy)

Package: `com.stqc.canteen`  ~58 MB  signed with debug keystore (for testing).

## Vercel (web app only)

Vercel hosts the **web** export (`npm run vercel-build`), not the Android APK. Deploy:

```powershell
$env:VERCEL_TOKEN = "your_token_from_vercel.com/account/tokens"
.\deploy-vercel.ps1
```

Do not commit tokens to git. Rotate any token that was shared in chat.

## License

Internal STQC canteen prototype - demo data only.
