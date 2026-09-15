# AMBULANCE TRACKER
### AI-Powered Emergency Ambulance Discovery System

An enterprise-ready, life-critical emergency ambulance discovery platform designed to connect people in medical emergencies with nearby available ambulances within seconds.

---

## 1. Project Overview & Concept

When a medical emergency strikes, every second dictates patient survival. Traditional dispatch systems often rely on centralized dispatch call centers with manual queuing. **Ambulance Tracker** is a direct peer-to-peer discovery system allowing callers to:
1. Instantly pin their GPS coordinates or specify an emergency location manually.
2. Filter by nature of emergency (Cardiac, Trauma, Respiratory, Maternity, General).
3. Discover verified nearby available ambulances on a real-time OpenStreetMap radar.
4. Benefit from an AI-assisted multi-criteria suitability engine (evaluating proximity, traffic-calibrated ETA, vehicle equipment tier, and readiness).
5. Directly dial the ambulance driver with **one tap** (`tel:` link) while automatically logging the dispatch record and audit trail.

---

## 2. Emergency Safety Disclaimer

> [!IMPORTANT]
> **CRITICAL MEDICAL DISCLAIMER**: Ambulance Tracker is an emergency-support technology platform for direct ambulance discovery and driver communication. It is **NOT** a replacement for official municipal emergency dispatch centers (e.g. 911 / 112 / 108). In life-threatening emergencies, callers should always dial national emergency numbers simultaneously. The platform does not make medical diagnoses or guarantee ambulance arrival times.

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **UI Architecture**: Vanilla CSS with custom medical-grade tokens (strict zero generic AI templates, zero emojis, 100% SVG/Lucide icons)
- **Map Engine**: Leaflet + OpenStreetMap with custom vehicle beacons and user location beacon
- **PWA (Progressive Web App)**: Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`) with offline caching, mobile installation prompt
- **Routing & State**: React Router v6, React Context API (`AuthContext`, `LocationContext`)

### Backend
- **Framework**: Python 3.11, FastAPI (RESTful API Gateway)
- **Validation**: Pydantic v2 schemas
- **Database & ORM**: PostgreSQL / SQLite auto-fallback, SQLAlchemy 2.0 ORM
- **Database Migrations**: Alembic
- **Security**: JWT Access and Refresh tokens (HMAC-SHA256), direct Bcrypt password hashing, Role-Based Access Control (RBAC)

### AI / Machine Learning Engine
- **Framework**: Python, Scikit-learn, NumPy, Joblib
- **Suitability Scoring Engine**: Multi-factor decision matrix (Distance 40%, ETA Response Time 25%, Availability 20%, Emergency Service Match 15%) normalized to a 0–100 index
- **ETA Predictor**: Scikit-learn RandomForest regression pipeline (`eta_model.joblib`) calibrated with urban rush-hour traffic factors, paired with a deterministic physical speed heuristic fallback

---

## 4. System Architecture

```text
               +----------------------------------+
               |        React 18 + Vite PWA       |
               |  (Leaflet OSM / Lucide / Icons)  |
               +-----------------+----------------+
                                 |
                          HTTPS REST API
                                 |
                                 v
               +----------------------------------+
               |         FastAPI Gateway          |
               |   (JWT Auth / RBAC Middleware)   |
               +-----------------+----------------+
                                 |
         +-----------------------+-----------------------+
         |                       |                       |
         v                       v                       v
+-----------------+     +-----------------+     +-----------------+
|  Emergency &    |     |  AI Ranking &   |     |  Driver Fleet & |
|  Dispatch Svc   |     |  ETA Predictor  |     |  GPS Telemetry  |
+--------+--------+     +--------+--------+     +--------+--------+
         |                       |                       |
         +-----------------------+-----------------------+
                                 |
                                 v
               +----------------------------------+
               |      PostgreSQL / SQLAlchemy     |
               |       (Alembic Migrations)       |
               +----------------------------------+
```

---

## 5. Three Role-Based Workflows

### A. Emergency User
- Instant GPS geolocation detection with manual coordinate fallback.
- Emergency condition selector (Cardiac, Trauma, Respiratory, Pregnancy, General).
- Real-time interactive radar displaying only online, verified ambulances.
- AI suitability score (0–100) breakdown and estimated arrival minutes.
- One-tap direct call to driver and automated dispatch logging.
- Emergency dispatch history tracker.

### B. Ambulance Driver / Fleet Provider
- Dedicated Driver Console with prominent **ONLINE / AVAILABLE** vs **OFFLINE / UNAVAILABLE** master switch.
- Automatic GPS location broadcaster streaming coordinates every 15s when active.
- Ambulance registration (vehicle plate, ambulance type: BLS, ALS, ICU, Patient Transport, equipment summary).
- Emergency call records and patient dispatch log.

### C. System Administrator
- Executive Dashboard with fleet KPIs: total users, registered drivers, registered ambulances, live available ambulances, active dispatches, completed calls, and average response latency.
- Ambulance Verification Queue: Approve or reject vehicle onboarding applications.
- Security Audit Log: Real-time chronological audit trail of logins, status toggles, and dispatches.

---

## 6. Directory Structure

```text
ambulance-tracker/
├── frontend/
│   ├── public/
│   │   ├── ambulance-icon.svg
│   │   ├── favicon.svg
│   │   ├── manifest.webmanifest
│   │   └── sw.js
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── auth.js
│   │   │   ├── emergency.js
│   │   │   ├── driver.js
│   │   │   └── admin.js
│   │   ├── components/
│   │   │   ├── common/Navbar.jsx, Footer.jsx
│   │   │   ├── map/AmbulanceMap.jsx
│   │   │   ├── emergency/AmbulanceCard.jsx, EmergencyTypePicker.jsx
│   │   │   └── pwa/InstallPrompt.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── LocationContext.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── EmergencyPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── UserHistoryPage.jsx
│   │   │   ├── driver/DriverDashboard.jsx
│   │   │   └── admin/AdminDashboard.jsx
│   │   ├── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── ranking_engine.py
│   │   │   ├── eta_predictor.py
│   │   │   ├── train_model.py
│   │   │   └── eta_model.joblib
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── emergency.py
│   │   │   ├── ambulances.py
│   │   │   ├── drivers.py
│   │   │   ├── admin.py
│   │   │   └── ai.py
│   │   ├── auth/
│   │   │   ├── jwt_handler.py
│   │   │   └── permissions.py
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── seed_data.py
│   │   ├── models/
│   │   │   ├── user.py, driver.py, ambulance.py, location.py, emergency.py, audit.py
│   │   ├── schemas/
│   │   │   ├── auth.py, user.py, driver.py, ambulance.py, emergency.py, admin.py, ai.py
│   │   ├── services/
│   │   │   ├── geo_service.py
│   │   │   └── call_logger.py
│   │   ├── config.py
│   │   └── main.py
│   ├── migrations/
│   │   ├── env.py
│   │   └── versions/
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_emergency.py
│   │   ├── test_drivers.py
│   │   └── test_ai_ranking.py
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 7. Installation & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

### Quickstart (Local Development)

#### 1. Clone the repository
```bash
git clone <repo-url>
cd "AMBULANCE TRACKER"
```

#### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt

# Run migrations:
alembic upgrade head

# Seed initial emergency grid data:
python -m app.database.seed_data

# Start FastAPI server:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will be live at `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://127.0.0.1:5173` in your browser.

---

## 8. Demo Accounts

The database seeder automatically initializes the following verified test accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **System Admin** | `admin@ambulance.org` | `AdminPassword123` | Full admin & verification privileges |
| **Driver (ICU)** | `driver.rajesh@ambulance.org` | `DriverPassword123` | Vehicle `KA-01-EA-1001` (ICU, Online) |
| **Driver (ALS)** | `driver.suresh@ambulance.org` | `DriverPassword123` | Vehicle `KA-01-EA-1002` (Advanced Life Support, Online) |
| **Driver (BLS)** | `driver.priya@ambulance.org` | `DriverPassword123` | Vehicle `KA-01-EA-1003` (Basic Life Support, Online) |
| **Emergency User** | `patient@ambulance.org` | `UserPassword123` | Regular caller account |

---

## 9. Automated Test Suite

Run unit and integration tests with pytest:
```bash
cd backend
.\.venv\Scripts\python -m pytest tests -v
```

Test coverage includes:
- JWT authentication and token expiration handling.
- Role-Based Access Control (RBAC) security barriers.
- Emergency request creation and spatial nearby discovery.
- One-tap calling records and dispatch persistence.
- Driver availability toggle and GPS coordinate broadcasting.
- AI suitability score mathematical bounds (0–100) and ranking order consistency.

---

## 10. Docker Deployment

Deploy all services (PostgreSQL, FastAPI Backend, React Nginx Frontend) with a single command:
```bash
docker-compose up --build -d
```
- **Web App**: `http://localhost:3000`
- **FastAPI Gateway**: `http://localhost:8000`
- **PostgreSQL Database**: Port `5432`

To shut down:
```bash
docker-compose down -v
```

---

## 11. Progressive Web App (PWA)

Ambulance Tracker implements the PWA specification:
- **Web App Manifest**: Configured for `standalone` display with dedicated medical theme color (`#dc2626`).
- **Service Worker**: Cache-first strategy for static assets and network-first for live telemetry.
- **Offline Safe Fallback**: If network is disconnected, callers are instantly provided with direct emergency numbers (112, 108) rather than displaying false data.

---

## 12. Future Scope & Roadmap

- **Live Turn-by-Turn Routing**: Real-time vehicle path rendering using OSRM / Google Maps Directions API.
- **Hospital Bed & ER Integration**: Pre-arrival telemetry streaming (patient vitals, ECG) directly to the receiving hospital trauma center.
- **Automated SOS Broadcast**: Automatic SMS and WhatsApp dispatch notifications to emergency family contacts with live location pins.
- **Accident & Crash Detection**: Integration with vehicle IoT telemetry / smartphone accelerometer signals.
- **Native Android & iOS Apps**: Capacitor / React Native wrappers leveraging the existing backend API.
