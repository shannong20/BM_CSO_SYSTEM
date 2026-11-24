# CSO-Track: Official SP Accredited CSO Registry (Term 2025–2028)
### Province of La Union · Sangguniang Panlalawigan

A modern, responsive web application for managing and displaying the official Civil Society Organization (CSO) registry of the Province of La Union, designed in accordance with the 2025–2028 legislative term guidelines.

---

## 🏛️ Features

### 1. Forest Green Sidebar Navigation
- **CSOTrack** branding with Provincial seal badge and subtitle: `SP REGISTRY · 2025–2028`.
- Navigation items: **Dashboard**, **CSO Directory**, **Accreditations** *(Soon)*, and **Reports** *(Soon)*.
- Integrated help card: *"Need help? Review the data guide for registration and accreditation."*
- Provincial footer mark: `PROVINCE OF LA UNION`.

### 2. Dashboard View (`/`)
- **SP Accreditation Overview Banner:** Hero welcome with gradient forest green styling.
- **Metric Cards:**
  - **CSOs in registry** (Total count across 20 LGUs).
  - **SP accredited** (Count & percentage with official status).
  - **Women-led CSOs** (Count & percentage).
- **Interactive Analytics:**
  - **Sector Distribution:** Dynamic bar chart representing counts across sectors (Fisherfolks, Farmers, Youth, Women, Persons with Disabilities, Transport, etc.).
  - **Accreditation Status:** Breakdown of Accredited and Pending organizations.
- **Latest Registry Entries:** Preview table with quick view drawers.

### 3. CSO Directory (`/directory`)
- **Header:** "SP Accredited CSO Registry" with **Export** and **+ Register CSO** actions.
- **Live Search & Filter Toolbar:**
  - Real-time text search across organization name, advocacy, representative, address, and resolution number.
  - Dropdown filters for **All LGUs** (19 Municipalities + City of San Fernando).
  - Dropdown filters for **All Sectors**.
  - Dropdown filters for **All Statuses** (Accredited, Pending).
- **Official 15-Column Data Table:**
  - `NO.`
  - `SP ACCREDITED` (Status badge)
  - `ADVOCACY`
  - `SECTOR`
  - `NAME OF ORGANIZATION`
  - `NAME OF REPRESENTATIVE`
  - `POSITION`
  - `ADDRESS`
  - `LGU REPRESENTED`
  - `CONTACT NUMBER`
  - `EMAIL ADDRESS`
  - `ACCREDITING AGENCY` (DOLE, CDA, SEC, DILG, etc.)
  - `CHECK IF CSO IS LED WOMEN` (Yes/No badge)
  - `RESOLUTION NO.`
  - `DATE ACCREDITED`
- **CSV Data Export:** One-click instant export of all filtered records to `.csv` spreadsheet.
- **Demo Data Toggle:** Seeded with the 8 authentic La Union organizations from the Figma design.

### 4. 3-Step "Add an SP Accreditation Record" Form (`/register` & Modal Overlay)
- **Step 1: Organization profile** (Name, LGU Represented, Sector, Address, Advocacy, Women-led Checkbox).
- **Step 2: Authorized representative** (Name, Position, Contact Number, Email Address).
- **Step 3: Accreditation details** (Accrediting Agency, Resolution No., Date Accredited, SP Status).

### 5. Firebase Firestore & API
- Firebase Firestore collection `cso_records`.
- Full offline fallback & local storage cache ensuring the app works out-of-the-box.
- RESTful API route at `/api/cso` for programmatic JSON queries and registration.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. (Optional) Connect to Real Firebase Firestore
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your Firebase project credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
3. Restart `npm run dev`. The app will now read and write directly to your Firestore database collection `cso_records`!
