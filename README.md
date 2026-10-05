# InfraSense – Predictive Maintenance Platform for Public Infrastructure

InfraSense is a full-stack civic-tech SaaS platform designed for citizens to report public infrastructure hazards and receive transparent, multi-signal predictive risk assessments.

By synthesizing six distinct real-time data streams—historical maintenance records, public complaint frequency, sensor readings, environmental climate stressors, reported severity, and baseline asset health—InfraSense calculates deterministic risk scores and maintenance urgency likelihood without relying on GPS or live location tracking.

---

## 1. Project Overview

Municipal public works departments often struggle with reactive, complaint-driven repair queues. InfraSense bridges the citizen-to-government divide by:
- Providing citizens with a 6-step guided reporting intake.
- Utilizing manual, privacy-preserving location entry (City, Locality, Road/Street, Landmark).
- Performing automated visual inspection (Mock CV pipeline ready for YOLOv8/PyTorch).
- Generating transparent 6-factor risk analysis (0–100 score, Low/Moderate/High/Critical levels).
- Correlating local area clusters for similar complaints to identify recurring structural stress.
- Allowing citizens to track work orders through 5 municipal progression stages and rate resolution quality.

---

## 2. Features

* **Manual Location Input**: No GPS, maps, or background tracking. Citizens enter City, Area/Locality, Street/Road, and optional landmarks.
* **6 Infrastructure Categories**:
  * **Roads**: Potholes, asphalt cracks, damaged surfaces, flooding, obstructions.
  * **Bridges**: Structural fissures, joint deterioration, lighting, safety barriers.
  * **Streetlights**: Luminaire outages, dark corridors, pole damage, exposed wiring.
  * **Water Pipelines**: Pressurized leaks, burst mains, low pressure, contamination.
  * **Public Buildings**: Foundation damage, electrical faults, plumbing, accessibility.
  * **Drainage Systems**: Catch-basin silt blockages, waterlogging, backwater flooding.
* **6-Step Guided Report Flow**:
  1. Infrastructure Category & dynamic problem types
  2. Manual Location Entry with live confirmation card
  3. Problem Details & Severity (Low, Moderate, High, Critical) with contextual civic guidance
  4. Evidence Upload (Multer) with mock computer vision analysis preview
  5. Pre-submission Review
  6. Multi-Factor Risk Assessment Output
* **Predictive Risk Assessment Screen**:
  * Composite Risk Score (0–100)
  * Categorized Risk Level (`Low`, `Moderate`, `High`, `Critical`)
  * Maintenance Urgency Likelihood percentage
  * 6 citizen-friendly risk factor breakdown cards
  * Similar complaints area alert (last 30 days)
* **My Reports Dashboard**:
  * Key metrics: Total Reports, Under Review, In Progress, Resolved
  * Dynamic filtering by Status, Category, and Risk Level
  * Live search query across localities and problems
* **Report Detail & Resolution Timeline**:
  * 5-stage status timeline: `SUBMITTED` → `UNDER_REVIEW` → `MAINTENANCE_SCHEDULED` → `IN_PROGRESS` → `RESOLVED`
  * Status advancement button for hackathon demonstration
  * 1–5 star rating and comment feedback on resolved issues
* **Infrastructure Insights Dashboard**:
  * Overall municipal health index
  * Asset condition ratings for all 6 categories
  * Interactive Recharts for historical risk trends, report volume by category, common defects, and resolution status
  * Environmental telemetry: temperature, rainfall precipitation, relative humidity, flood risk index
  * Community participation and response turnaround metrics
* **Citizen Notification Center**:
  * Alerts for submission confirmations, risk assessments, similarity detections, dispatch updates, and resolution notices
* **Profile & Preferences**:
  * Notification channel toggles (Email, In-App Push, Emergency SMS)

---

## 3. Tech Stack

### Frontend
- **Framework**: React (JavaScript `.jsx`, Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router (`react-router-dom`)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Data Visualization**: Recharts

### Backend
- **Runtime**: Node.js & Express.js (ESM JavaScript `.js`)
- **Database**: MongoDB & Mongoose (with automated in-memory dual-layer fallback if no local daemon is running)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Uploads**: Multer
- **Validation**: Zod

---

## 4. Folder Structure

```text
infrasense/
├── index.html
├── metadata.json
├── package.json
├── server.js                        # Full-stack Express server + Vite dev middleware
├── .env.example
├── README.md
│
├── server/
│   ├── config/
│   │   └── db.js                    # MongoDB / In-memory connection manager
│   ├── models/
│   │   ├── modelFactory.js          # Dual-mode Mongoose & Memory proxy
│   │   ├── memoryStore.js           # In-memory persistence engine
│   │   ├── User.js
│   │   ├── Report.js
│   │   ├── Infrastructure.js
│   │   ├── MaintenanceRecord.js
│   │   ├── PublicComplaint.js
│   │   ├── SensorData.js
│   │   ├── ClimateData.js
│   │   ├── RiskAssessment.js
│   │   ├── Notification.js
│   │   └── Feedback.js
│   ├── services/
│   │   ├── risk.service.js          # 6-factor weighted calculation engine
│   │   ├── ml.service.js            # Future Python ML integration gateway
│   │   ├── similarity.service.js    # Area & problem similarity clustering
│   │   └── image-analysis.service.js# Computer vision inspection simulation
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT Bearer token authentication
│   │   ├── upload.middleware.js     # Multer file storage & validation
│   │   ├── validation.middleware.js # Zod schemas for request payloads
│   │   └── error.middleware.js      # Centralized error handler
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── report.controller.js
│   │   ├── insights.controller.js
│   │   └── notification.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── report.routes.js
│   │   ├── insights.routes.js
│   │   └── notification.routes.js
│   └── seed/
│       └── seed.js                  # Realistic civic dataset seeder
│
└── src/
    ├── main.jsx                     # Client entry point
    ├── App.jsx                      # Route configuration & layouts
    ├── index.css                    # Tailwind CSS configuration
    ├── context/
    │   └── AuthContext.jsx          # User authentication context & state
    ├── services/
    │   └── api.js                   # Centralized Axios API client
    ├── components/
    │   ├── Navbar.jsx               # Top bar navigation
    │   ├── RiskBadge.jsx            # Semantic risk level tag
    │   ├── StatusBadge.jsx          # Municipal lifecycle badge
    │   ├── RiskFactorCard.jsx       # Citizen-friendly factor breakdown
    │   ├── ProgressStepper.jsx      # Multi-step intake indicator
    │   ├── StatusTimeline.jsx       # 5-stage repair progression
    │   ├── LoadingSpinner.jsx
    │   └── EmptyState.jsx
    └── pages/
        ├── HomePage.jsx             # Citizen landing & category hub
        ├── LoginPage.jsx            # Sign in with one-click demo option
        ├── RegisterPage.jsx         # Citizen registration
        ├── ReportIssuePage.jsx      # 6-step guided problem reporting
        ├── MyReportsPage.jsx        # Citizen submitted reports & filter
        ├── ReportDetailPage.jsx     # Detail view, status progression & feedback
        ├── InsightsPage.jsx         # Recharts analytics & environmental metrics
        ├── NotificationsPage.jsx    # Alert feed
        ├── ProfilePage.jsx          # User settings & notification toggles
        └── HelpPage.jsx             # Documentation, FAQ & emergency hotline
```

---

## 5. Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Default variables:
```env
PORT=3000
MONGODB_URI="mongodb://localhost:27017/infrasense"
JWT_SECRET="infrasense-jwt-super-secret-key-2026"
CLIENT_URL="http://localhost:3000"
UPLOAD_DIR="uploads"
```

### 3. Database Configuration
InfraSense contains a **hybrid dual-layer database architecture**:
- If `MONGODB_URI` points to an active MongoDB instance (local or Atlas), Mongoose connects directly.
- If no MongoDB instance is running, InfraSense activates an in-memory data store with identical Mongoose semantics and automatically populates the realistic demo dataset.

### 4. Running the Application
```bash
# Start full-stack server (Node.js/Express + Vite on Port 3000)
npm run dev
```

### 5. Running the Seed Script Manually
```bash
npm run seed
```

---

## 6. Pre-Configured Demo Credentials

For quick evaluation during demos and hackathons:
- **Email**: `anuv@example.com`
- **Password**: `password123`
- *Or simply click the "One-Click Login" button on the Sign In page.*

---

## 7. API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new citizen account
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/auth/me` — Retrieve current authenticated citizen profile
- `PATCH /api/auth/preferences` — Update notification preferences

### Reports & Hazards
- `POST /api/reports` — Submit new report with evidence (Multer upload)
- `GET /api/reports/my` — Get user reports with filters (status, category, risk)
- `GET /api/reports/:id` — Get full report, risk factors, and feedback
- `POST /api/reports/:id/analyze-image` — Run computer vision defect detection
- `POST /api/reports/:id/feedback` — Submit citizen satisfaction rating (1–5 stars)
- `POST /api/reports/:id/advance-status` — Advance report status (demo review)

### Insights & Environmental Analytics
- `GET /api/insights/overview` — Overall health score and category condition ratings
- `GET /api/insights/trends` — Recharts historical trends, volume by category, common defects
- `GET /api/insights/environment` — Micro-climate and precipitation variables
- `GET /api/insights/community` — Community reporting participation statistics

### Notifications
- `GET /api/notifications` — Fetch user notification feed
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `POST /api/notifications/read-all` — Mark all notifications as read

---

## 8. Risk Calculation Engine

InfraSense uses a deterministic 6-factor weighted calculation:

$$\text{Risk Score} = \sum (\text{Factor Score}_i \times \text{Weight}_i)$$

| Factor | Weight | Source | Description |
| :--- | :---: | :--- | :--- |
| **Historical Maintenance** | 20% | `MaintenanceRecord` | Past repair frequency and recurrent subgrade/joint failures |
| **Similar Complaints** | 20% | `SimilarityService` | Number of matching reports in the locality within 30 days |
| **Current Severity** | 20% | User Input | Low (25), Moderate (50), High (75), Critical (95) |
| **Sensor Data Telemetry** | 15% | `SensorData` | Subsurface strain, ultrasonic flow, pipe pressure anomaly |
| **Climate & Environmental** | 15% | `ClimateData` | Rainfall precipitation and flood risk saturation index |
| **Infrastructure Condition** | 10% | `Infrastructure` | Municipal asset age and baseline structural condition |

### Risk Level Categorization
- **0–30**: Low Risk (Standard scheduled maintenance)
- **31–60**: Moderate Risk (Monitor and queue for servicing)
- **61–80**: High Risk (Field inspection required within 48 hours)
- **81–100**: Critical Risk (Immediate emergency dispatch)

---

## 9. Future Machine Learning Integration

The system architecture separates the risk calculation contract into `server/services/ml.service.js`.

### Current Flow
```text
Report Data ───► MLService ───► RiskService (Statistical Engine) ───► Risk Score
```

### Future Flow (Microservice Handoff)
```text
Report Data ───► MLService ───► Python FastAPI / PyTorch Model ───► Risk Score
                                  (XGBoost / Random Forest)
```
Setting `ML_API_URL="http://localhost:8000"` in `.env` automatically forwards the inference payload to an external model endpoint with seamless fallback if unavailable.
