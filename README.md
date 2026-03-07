# DICHIR HIS Documentation Portal

A collaborative documentation platform for managing Hospital Information System (HIS) modules, requirements, screens, database schemas, reports, and user guides.

## Features

- **Multi-module support**: Registration (MP), Core (CO), Outpatient (OP), and more
- **Real-time collaboration**: Multiple team members can edit simultaneously via Firebase
- **Screen Layout Designer**: Auto-generated from field definitions with inline editing
- **Database Schema Manager**: Full DDL generator for 6 SQL engines
- **Excel Import/Export**: Upload requirements, screens, and reports from Excel
- **Audit Columns**: Auto-included on every database table

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ installed
- A [Firebase](https://console.firebase.google.com) account (free tier is sufficient)

### 1. Install Dependencies

```bash
cd his-portal
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a project** → name it `his-documentation-portal`
3. Go to **Build → Firestore Database** → Click **Create database** → Start in **test mode**
4. Go to **Project Settings** (gear icon) → **General** → scroll to **Your apps** → Click **Web** (</> icon)
5. Register the app, then copy the config values
6. Open `src/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",          // Your actual key
  authDomain:        "his-docs.firebaseapp.com",
  projectId:         "his-docs",
  storageBucket:     "his-docs.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc..."
};
```

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000 — the portal loads with all HIS data.

### 4. Deploy

#### Option A: Vercel (Recommended — free, instant)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Your portal will be live at `https://his-portal.vercel.app`.

#### Option B: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting    # select dist as public directory, SPA: yes
npm run build
firebase deploy
```

Live at `https://his-docs.web.app`.

#### Option C: Netlify

```bash
npm run build
# Drag the 'dist' folder to https://app.netlify.com/drop
```

#### Option D: Internal Server (Nginx)

```bash
npm run build
# Copy dist/ to your server
# Nginx config:
#   location / {
#     root /var/www/his-portal/dist;
#     try_files $uri /index.html;
#   }
```

## Team Access

Once deployed, share the URL with your team. Everyone editing the same Firebase project sees changes in real-time.

### Adding Authentication (Optional)

For production, enable Firebase Authentication:

1. Firebase Console → Authentication → Sign-in method → Enable Email/Password
2. Update Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Add login UI to the portal (or use Firebase UI library)

## Project Structure

```
his-portal/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Vite build config
├── src/
│   ├── main.jsx            # React mount point
│   ├── App.jsx             # Full portal component (all UI + logic)
│   └── firebase.js         # Firebase config + read/write/subscribe
└── public/
    └── favicon.svg         # App icon
```

## Data Architecture

All portal data is stored in a single Firestore document (`portal/his-data`) containing:

```json
{
  "modules": [...],
  "screens": { "mp": [...], "op": [...] },
  "requirements": { "mp": [...], "op": [...] },
  "dbCollections": { "mp": [...], "co": [...], "op": [...] },
  "reports": { "mp": [...], "op": [...] },
  "userGuides": { "mp": [...], "op": [...] }
}
```

## Module Prefixes

| Module       | ID  | Table Prefix |
|-------------|-----|-------------|
| Registration | mp  | MP_         |
| Core         | co  | CO_         |
| Outpatient   | op  | OP_         |
| ER           | er  | ER_         |
| Billing      | bl  | BL_         |
| Clinical     | cl  | CL_         |
| Pharmacy     | ph  | PH_         |
| Lab          | lb  | LB_         |
| Radiology    | rd  | RD_         |

## License

Proprietary — DICHIR Healthcare Solutions
