# Orbit HRMS

A full-stack Human Resource Management System built with the MERN stack. Covers authentication & role-based access, employee management, employment types with configurable leave policies, attendance tracking with automatic working-hours calculation, and a leave application/approval workflow.

**Stack:** React + Material UI (Context API for state) · Node.js + Express · MongoDB (Mongoose) · JWT Authentication

---

## Live Demo

| | URL |
|---|---|
| **Frontend** | https://orbit-hrms.vercel.app |
| **Backend API** | https://orbit-hrms-bmj0.onrender.com/api |

### Demo Credentials

**Admin**
```
Email:    admin@hrms.com
Password: Admin@123
```

**Employee**
> Log in as Admin first, then create an employee from the **Employees** page — this generates a login for that employee which you can use to explore the Employee side of the app.


## Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB database — either a local `mongod` instance, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (recommended)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/orbit-hrms.git
cd orbit-hrms
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Open `backend/.env` and set:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
```
Then:
```bash
npm run seed   # creates the first Admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env
npm run dev     # starts the API on http://localhost:5000
```

### 3. Frontend setup
Open a second terminal:
```bash
cd frontend
npm install
npm run dev      # starts the app on http://localhost:5173
```
No extra config needed for local dev — `vite.config.js` proxies `/api` requests straight to `http://localhost:5000`.

### 4. Use the app
Go to `http://localhost:5173`, log in with the admin credentials you set in `.env` (defaults to `admin@hrms.com` / `Admin@123`), then create employment types and employees from the Admin dashboard.

---

## Environment Variables

**`backend/.env`**
| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CLIENT_URL` | Frontend origin, used for CORS — **must be a full URL including `https://`**, no trailing slash |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by `npm run seed` to create the first admin account |

**`frontend/.env`** (only needed for production deployment; not required for local dev)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of the deployed backend API, including `/api` (e.g. `https://your-backend.onrender.com/api`) |




## License

This project was built as a technical assignment and is provided as-is for demonstration purposes.
