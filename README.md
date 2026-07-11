# HRMS — Human Resource Management System (MERN Stack)

A complete HRMS with two roles (Admin / Employee) covering authentication, employee management,
employment types & leave policies, attendance (punch in/out with calendar), leave management,
holidays, and payroll with downloadable PDF salary slips.

**Stack:** React + Material UI (Context API, no Redux) · Node.js + Express · MongoDB (Mongoose) · JWT

```
hrms/
├── backend/     ← Node/Express API
└── frontend/    ← React app
```

---

## 1. Requirements
- Node.js 18+
- A MongoDB database — either:
  - **Local**: install MongoDB and run it (`mongod`), or
  - **Cloud (recommended)**: a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster — just copy its connection string

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and set:
```
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=any_long_random_string
```
Everything else in `.env` can be left as-is (defaults work out of the box).

Then:
```bash
npm run seed      # creates the first Admin login from ADMIN_EMAIL/ADMIN_PASSWORD in .env
npm run dev        # starts the API on http://localhost:5000
```

Default seeded admin login: **admin@hrms.com / Admin@123** (change these in `.env` before seeding if you want different credentials).

## 3. Frontend Setup

Open a **second terminal**:
```bash
cd frontend
npm install
npm run dev         # starts the app on http://localhost:5173
```

The frontend is pre-configured (`vite.config.js`) to proxy `/api` requests to `http://localhost:5000`, so no extra setup is needed for local development.

## 4. Using the App
1. Go to `http://localhost:5173`
2. Log in as Admin using the seeded credentials above
3. As Admin, first create **Employment Types** (e.g. Full Time, Intern, Contractual) with their leave policies — this is required before adding employees, since every employee needs an employment type
4. Add employees — this creates their login accounts too (email + password you set)
5. Log out and log back in with an employee's email/password to see the Employee side (punch in/out, apply for leave, view payroll)

---

## Project Structure

### Backend (`backend/`)
```
config/db.js              MongoDB connection
models/                   User, Employee, EmploymentType, LeaveRequest, AttendanceLog, Holiday, Payroll, Counter
controllers/               Business logic per module
routes/                    Express routes per module
middleware/                 JWT auth (protect), role-based access (authorize), error handling
utils/                     Token generation, leave balance calc, payroll engine, PDF generation, seed script
server.js                  App entry point
```

### Frontend (`frontend/`)
```
src/api/axios.js                   Axios instance, attaches JWT to every request
src/context/AuthContext.jsx        Global auth state (Context API — no Redux)
src/components/ProtectedRoute.jsx  Route guard by login + role
src/components/layout/AppLayout.jsx Sidebar + top bar shell
src/pages/auth/Login.jsx           Single login form for both roles
src/pages/admin/*                  Dashboard, Employees, Employment Types, Attendance, Leaves, Holidays, Payroll
src/pages/employee/*               Dashboard (punch in/out + calendar), Leaves, Holidays, Payroll
```

## Key Business Logic (backend/utils/)
- **`leaveBalance.js`** — computes Available/Used/Remaining per leave type from the employee's employment-type policy and their approved leave history for the year.
- **`payrollCalculator.js`** — for a given employee + month: builds the set of working days (excludes Sundays and holidays), classifies each day as Present / Half Day / Paid Leave / Unpaid Leave / Absent from attendance + approved leave records, applies the late-mark rule (every 3 late marks = 0.5 day deduction), covers Absent days from available Paid Leave balance before falling back to a salary deduction, and computes gross/net salary at `monthlySalary / workingDays` per-day rate.
- **`pdfGenerator.js`** — streams a salary slip PDF using `pdfkit`.

## API Overview
| Module | Base route |
|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Employees | `GET/POST /api/employees`, `GET/PUT/DELETE /api/employees/:id` |
| Employment Types | `GET/POST /api/employment-types`, `PUT /api/employment-types/:id/leave-policy` |
| Attendance | `POST /api/attendance/punch-in`, `POST /api/attendance/punch-out`, `GET /api/attendance/my-history`, `GET /api/attendance` (admin) |
| Leaves | `POST /api/leaves`, `GET /api/leaves/my`, `GET /api/leaves/my/balance`, `GET /api/leaves` (admin), `PUT /api/leaves/:id/status` |
| Holidays | `GET/POST /api/holidays`, `PUT/DELETE /api/holidays/:id` |
| Payroll | `POST /api/payroll/run`, `GET /api/payroll`, `GET /api/payroll/my`, `GET /api/payroll/:id/slip` (PDF) |

All routes except `/api/auth/login` require a `Bearer` JWT; admin-only routes are additionally role-checked.

## Deployment Notes
- **Backend**: deploy to Render/Railway/etc. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend's URL, for CORS) as environment variables there.
- **Frontend**: deploy to Vercel/Netlify. Set `VITE_API_URL` to your deployed backend's `/api` URL (see `frontend/.env.example`) — without it, the app only works locally via the dev proxy.
