# 💰 SpendWise — Full Stack Mobile App

React Native (Expo) + Node.js/Express + MongoDB

---

## 📁 Project Structure

```
SpendWise/
├── backend/                  ← Node.js + Express API
│   ├── config/db.js          ← MongoDB connection
│   ├── middleware/auth.js     ← JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── budgets.js
│   │   └── users.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/                 ← React Native (Expo)
    ├── src/
    │   ├── components/
    │   │   ├── UI.js              ← Shared UI components
    │   │   ├── TransactionItem.js
    │   │   └── TransactionModal.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── navigation/
    │   │   └── AppNavigator.js
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── HomeScreen.js
    │   │   ├── TransactionsScreen.js
    │   │   ├── BudgetScreen.js
    │   │   └── ProfileScreen.js
    │   ├── services/
    │   │   └── api.js             ← Axios API calls
    │   ├── styles/
    │   │   └── theme.js           ← Colors, constants
    │   └── utils/
    │       └── helpers.js         ← Date/currency formatting
    ├── App.js
    ├── app.json
    ├── babel.config.js
    └── package.json
```

---

## ✅ Prerequisites

Install the following before starting:

| Tool | Install |
|------|---------|
| Node.js (v18+) | https://nodejs.org |
| MongoDB Community | https://www.mongodb.com/try/download/community |
| VS Code | https://code.visualstudio.com |
| Expo CLI | `npm install -g expo-cli` |
| Android Studio (emulator) or Expo Go app (physical device) | https://expo.dev/go |

---

## 🚀 Step-by-Step Setup Guide

---

### STEP 1 — Set Up the Backend

In your first terminal, navigate to backend:

```bash
cd backend
```

**1a. Install dependencies:**
```bash
npm install
```
**1b. Start the backend server:**
```bash
npm run dev
```

You should see:
```
✅ Server running on port 5000 in development mode
✅ MongoDB Connected: localhost
```

**1d. Test the API (optional):**
Open your browser and go to: `http://localhost:5000`
You should see: `{ "message": "SpendWise API is running 🚀" }`

---

### STEP 2 — Set Up the Frontend

In your second terminal, navigate to frontend:

```bash
cd frontend
```

**4a. Install dependencies:**
```bash
npm install
```

**4b. Configure the API base URL:**

Open `frontend/src/services/api.js` and update `BASE_URL`:

```js
// Android Emulator:
const BASE_URL = 'http://10.0.2.2:5000/api';

// iOS Simulator:
const BASE_URL = 'http://localhost:5000/api';

// Physical device (find your PC's local IP first):
const BASE_URL = 'http://192.168.1.XX:5000/api';
```

> To find your local IP on Windows: run `ipconfig` in cmd  
> To find your local IP on macOS/Linux: run `ifconfig` in terminal

**4c. Start Expo:**
```bash
npx expo start
```

You will see a QR code and options in the terminal.

---

### STEP 5 — Run on Device or Emulator

**Option A: Android Emulator (Android Studio)**
1. Open Android Studio → AVD Manager → Start an emulator
2. Press `a` in the Expo terminal to open on Android emulator

**Option B: iOS Simulator (Mac only)**
1. Make sure Xcode is installed
2. Press `i` in the Expo terminal to open on iOS simulator

**Option C: Physical Device (easiest)**
1. Install **Expo Go** from App Store or Google Play
2. Scan the QR code shown in the Expo terminal
3. Make sure your phone and PC are on the **same Wi-Fi network**
4. Use your PC's local IP in `BASE_URL` (see Step 4b)

---

### STEP 6 — Create Your First Account

1. App opens on the **Login** screen
2. Tap **Register** to create a new account
3. Enter your name, email, and a password (min 8 chars)
4. You'll be taken to the **Home** dashboard
5. Tap **+** to add your first transaction!

---

## 🔌 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all (supports ?category=food&type=expense) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/summary` | Monthly income/expense/balance |
| GET | `/api/transactions/chart` | 6-month chart data |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get budgets with spending % |
| POST | `/api/budgets` | Create or update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/profile` | Update name/email |
| PUT | `/api/users/password` | Change password |

---

## 🔧 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Network request failed` | Check BASE_URL in api.js matches your backend IP/port |
| `MongoDB connection failed` | Ensure MongoDB is running or Atlas URI is correct |
| `Cannot find module` | Run `npm install` in the relevant folder |
| `Port 5000 already in use` | Change `PORT` in `.env` to 5001 and update BASE_URL |
| App stuck on white screen | Check Expo terminal for errors; try `npx expo start --clear` |
| QR code not working | Ensure phone and PC are on the same Wi-Fi; use tunnel mode: `npx expo start --tunnel` |

---

## 🛠️ VS Code Recommended Extensions

Install these from the Extensions panel (Ctrl+Shift+X):

- **ES7+ React/Redux/React-Native snippets** — code shortcuts
- **Prettier** — auto-format code
- **MongoDB for VS Code** — browse your database visually
- **Thunder Client** — test API endpoints inside VS Code
- **React Native Tools** — debugging support

---

## 🏗️ Building for Production

### Backend (deploy to Railway / Render / Heroku)
1. Push `backend/` to a GitHub repo
2. Connect to Railway.app or Render.com
3. Set environment variables in their dashboard
4. Deploy — your API URL will be something like `https://spendwise-api.railway.app`

### Frontend (build APK / IPA)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

Update `BASE_URL` in `api.js` to your deployed backend URL before building.

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| HTTP Client | Axios |
| Local Storage | AsyncStorage (JWT token) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Validation | express-validator |
