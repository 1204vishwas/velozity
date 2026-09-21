# Velozity Global Solutions — Technical Hiring Assessment
# Real-Time Client Project Dashboard with Role-Based Access & Live Activity Feed

> **Role Assessed**: Full Stack Developer  
> **Submission Deadline**: 12/09/2026, 11:59 PM IST  
> **Tech Stack**: React 18 (TypeScript), Node.js / Express (TypeScript), PostgreSQL 16 (Prisma ORM), Socket.io (WebSockets), node-cron (Background Schedulers), Tailwind CSS.

---

## ⚡ Quick Start: Running with `npm run dev`

You can run both services independently or together using `npm run dev`:

### 1. Run Everything Concurrently (From Project Root)
```bash
npm install
npm run dev
```
> This uses `concurrently` to start both the **Backend API** (port `5000`) and the **Frontend SPA** (port `5173`) in a single terminal with color-coded logs.

---

### 2. Run Backend Alone (Port 5000)
```bash
cd backend
npm install
npm run dev
```
> Runs `tsx watch src/server.ts` with hot reloading.

---

### 3. Run Frontend Alone (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
> Runs Vite development server (`vite`) with instant HMR.

---

### 4. Or Run with Docker Compose (Single Command)
```bash
docker compose up --build
```
> Spawns PostgreSQL 16 on port `5432`, Express Backend on port `5000`, and React Frontend on port `3000`.

---

## 📑 Table of Contents
1. [Official Assessment Response (150–250 Words)](#1-official-assessment-response-150250-words)
2. [Demo Accounts & 1-Click Evaluation Guide](#2-demo-accounts--1-click-evaluation-guide)
3. [Environment Configuration (.env Files)](#3-environment-configuration-env-files)
4. [Step-by-Step Local Setup Guide](#4-step-by-step-local-setup-guide)
5. [Role-Based Access Control (RBAC) System](#5-role-based-access-control-rbac-system)
6. [Real-Time Activity Feed & WebSocket Architecture](#6-real-time-activity-feed--websocket-architecture)
7. [Automated Overdue Task Scheduler](#7-automated-overdue-task-scheduler)
8. [Database Schema & Indexing Rationale](#8-database-schema--indexing-rationale)
9. [Architectural Decisions & Technical Justifications](#9-architectural-decisions--technical-justifications)
10. [REST API Endpoint Reference](#10-rest-api-endpoint-reference)
11. [Known Limitations & Production Roadmap](#11-known-limitations--production-roadmap)

---

## 1. Official Assessment Response (150–250 Words)

> **Assessment Prompt**: In the Explanation field (150–250 words): explain the hardest problem you solved, how you handled the real-time role-filtered feed, and one thing you'd do differently.

```
The most demanding challenge was architecting the real-time role-filtered feed 
while ensuring strict data isolation without leaky abstractions or broadcast 
amplification. Simply emitting updates to a global socket room would breach 
role boundaries and expose confidential project metadata to unauthorized 
developers. 

To solve this, I decoupled the real-time layer into targeted, role-scoped 
Socket.io rooms combined with transactional persistence. When a task status 
transitions, the event is first recorded in the PostgreSQL ActivityLog table. 
The WebSocket service then broadcasts selectively: emitting to 'role:ADMIN' 
for the global agency feed, to the specific project manager's user room 
('user:managerId'), to the assigned developer's room ('user:devId'), and 
finally to the project viewing room ('project:projectId') for live Kanban 
synchronization. Offline catchup queries PostgreSQL directly using compound 
indexes (e.g., [projectId, createdAt DESC]) scoped by the authenticated 
user's JWT role, guaranteeing that missed events are identical to live events.

If I were to build this differently in a distributed production deployment, 
I would swap the in-process node-cron and local socket maps for a distributed 
Redis architecture (Redis Streams or BullMQ with a Redis Pub/Sub adapter for 
Socket.io). This would allow horizontal scaling across multiple backend worker 
nodes while providing distributed locking to prevent duplicate cron executions 
and cross-server presence synchronization.
```
*(Word count: 208 words)*

---

## 2. Demo Accounts & 1-Click Evaluation Guide

The database seed script automatically creates all required users, clients, projects, tasks, overdue states, and activity logs.

### Master Credentials (Default Password: `Password123!`)

| Role | Name | Email | Scoped Permissions & Boundaries |
| :--- | :--- | :--- | :--- |
| **Admin** | Ravi Sharma | `admin@velozity.com` | **Full access**: All clients, all projects, all tasks, global activity feed, and live presence telemetry. |
| **Project Manager 1** | Sarah Jenkins | `pm1@velozity.com` | **Managed projects only**: Owns Projects 1 & 2. Cannot view or edit Project 3. |
| **Project Manager 2** | Michael Chang | `pm2@velozity.com` | **Managed projects only**: Owns Project 3. Cannot view or edit Projects 1 & 2. |
| **Developer 1** | Alex Rivera | `dev1@velozity.com` | **Assigned tasks only**: Can view & update status of assigned tasks. Cannot access PM data. |
| **Developer 2** | Elena Rostova | `dev2@velozity.com` | **Assigned tasks only**: Assigned tasks across Projects 1, 2, and 3. |
| **Developer 3** | David Kim | `dev3@velozity.com` | **Assigned tasks only**: Assigned tasks across Projects 1, 2, and 3. |
| **Developer 4** | Priya Patel | `dev4@velozity.com` | **Assigned tasks only**: Assigned tasks across Projects 2 and 3. |

### 🚀 Evaluator Convenience Features:
1. **1-Click Login on `/login`**: Click any of the pre-configured buttons (**👑 Admin**, **📋 PM 1**, **📋 PM 2**, **💻 Dev 1**) to log in instantly without typing.
2. **Instant "Switch Role" Navbar Dropdown**: When logged in, use the **Switch Role** button in the top navigation bar to seamlessly transition between user identities and test cross-role authorization barriers on the fly.
3. **Google & Facebook Social Sign-In**: Click **"Continue with Google"** or **"Continue with Facebook"** on the login page to authenticate instantly with simulated social OAuth profiles, with choice of role (Developer or Project Manager).
4. **Account Registration (Sign Up)**: Switch to the **Create Account** tab on `/login` to register new users with customized roles, bcrypt password hashing, and instant session initialization.

---

## 3. Environment Configuration (.env Files)

Both `.env` and `.env.example` files are pre-configured for instant operation.

### Backend `.env` (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/velozity?schema=public
JWT_ACCESS_SECRET=velozity_jwt_access_secret_super_secure_key_2026_xyz!
JWT_REFRESH_SECRET=velozity_jwt_refresh_secret_super_secure_key_2026_abc!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
COOKIE_SECRET=velozity_secure_cookie_secret_2026_123!
```

### Frontend `.env` (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 4. Step-by-Step Local Setup Guide

### Prerequisites:
- **Node.js**: v18+ or v20+ or v22+
- **PostgreSQL**: Running locally on port `5432`, or via Docker (`docker run --name pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=velozity -p 5432:5432 -d postgres:16-alpine`)

### Step 1: Install Dependencies
```bash
# From workspace root:
npm install

# Or in each folder:
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Push Database Schema & Run Seed Script
```bash
cd backend
npm run prisma:push
npm run seed
```

This creates:
- 1 Admin, 2 Project Managers, 4 Developers
- 3 Clients (Acme Corp, Nova Fintech, Zenith Retail)
- 3 Projects with 6 tasks each (18 total tasks across all 4 statuses)
- **2 tasks in overdue state** with past due dates (`isOverdue: true`)
- **13 rich activity log entries** formatted for immediate feed visualization
- Initial in-app notifications

### Step 3: Run the Application
In your root terminal:
```bash
npm run dev
```
Or in two separate terminals:
- **Terminal 1 (Backend)**: `cd backend && npm run dev`
- **Terminal 2 (Frontend)**: `cd frontend && npm run dev`

Open your browser at **`http://localhost:5173`**.

---

## 5. Role-Based Access Control (RBAC) System

Security is enforced at the **HTTP and database middleware level**, not merely by hiding UI buttons.

```
                           Incoming Client Request
                                     │
                        ┌────────────▼────────────┐
                        │  authenticate (JWT)     │ ──> Missing/Invalid -> 401 Unauthorized
                        └────────────┬────────────┘
                                     │ User Attached (req.user)
                        ┌────────────▼────────────┐
                        │  requireRole(ADMIN, PM) │ ──> Unauthorized Role -> 403 Forbidden
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │  checkProjectAccess /   │ ──> Accessing other PM's Project /
                        │  checkTaskAccess        │     Dev accessing other's Task -> 403 Forbidden
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │  Controller & Prisma    │
                        └─────────────────────────┘
```

### Verification Scenarios:
1. **Direct API Tampering Test**: If Developer 1 (`dev1`) takes the ID of a task assigned to Developer 2 and sends `PATCH /api/tasks/:id/status`, the middleware inspects `task.assignedToId === user.userId`. It rejects the request with:
   ```json
   {
     "success": false,
     "error": {
       "code": "FORBIDDEN",
       "message": "Forbidden: You are not authorized to view or modify other developers’ tasks"
     }
   }
   ```
2. **Cross-PM Isolation Test**: If PM 2 attempts to view Project 1 (`managerId = PM1`), `checkProjectAccess` intercepts the query and rejects it:
   ```json
   {
     "success": false,
     "error": {
       "code": "FORBIDDEN",
       "message": "Forbidden: You do not have permission to access another Project Manager’s project"
     }
   }
   ```
3. **Developer Scope Limitation**: Developers can only update task status. Any attempt to modify title, priority, due date, or delete tasks returns `403 Forbidden: Developers are only permitted to update task status`.

---

## 6. Real-Time Activity Feed & WebSocket Architecture

### 1. Connection Handshake
- Sockets connect with `auth: { token: accessToken }`.
- `SocketService` verifies the JWT signature before establishing connection.
- Connected users are tracked in memory (`userSockets: Map<string, Set<string>>`), supporting multi-tab browsing without double-counting presence.

### 2. Presence Tracking
- Broadcasts `presence:update` whenever users connect or disconnect.
- Admin dashboard displays active online users with live pulsing indicators.

### 3. Live Room Segmentation:
- **`role:ADMIN`**: Receives all agency activities across every client and project.
- **`user:{managerId}`**: Receives activity events on projects managed by that PM.
- **`user:{devId}`**: Receives activity events on tasks assigned to that developer.
- **`project:{projectId}`**: Users currently viewing a project join this room. When any task status changes, the room receives `task:status_changed`, instantly updating Kanban boards without a page refresh.

### 4. Human-Readable Feed Messages:
Every activity record follows the required formatting standard:
- `"Alex Rivera moved Task #3 from In Progress → In Review · 2 mins ago"`
- `"Elena Rostova moved Task #12 from In Progress → Done · 3 hrs ago"`
- `"System flagged Task #6 'Configure SSL termination...' as Overdue · 15 mins ago"`

### 5. Offline Catchup (Last 20 Events from DB):
Upon reconnecting or refreshing the page, the frontend calls `GET /api/activity?limit=20`. The server queries the database table `ActivityLog` with indexed descending timestamps (`createdAt DESC`), filtering by the user's role.

---

## 7. Automated Overdue Task Scheduler

Assessment Requirement: *"Tasks past their due date must be automatically flagged as Overdue — this must happen via a scheduled background job, not on page load."*

### Implementation (`backend/src/services/cron.service.ts`):
- Uses `node-cron` scheduled to run every minute (`* * * * *`).
- Executes an atomic SQL query:
  ```sql
  SELECT * FROM "Task"
  WHERE "dueDate" < NOW()
    AND "status" != 'DONE'
    AND "isOverdue" = false;
  ```
- For each overdue task:
  1. Updates `isOverdue = true`.
  2. Creates an `ActivityLog` entry: `"System flagged Task #{taskNumber} as Overdue"`.
  3. Broadcasts real-time WebSocket events to Admin, PM, and Developer rooms.
  4. Dispatches in-app notifications to the assigned developer and project manager.

---

## 8. Database Schema & Indexing Rationale

### Entity Relationship Diagram:
```
+---------------+         1:N         +---------------+
|     User      | ───────────────────<│    Project    |
| (Admin/PM/Dev)|                     |  (Client Rel) |
+---------------+                     +---------------+
        │                                     │
        │ 1:N (Assigned)                      │ 1:N
        ▼                                     ▼
+---------------+         1:N         +---------------+
|     Task      | >───────────────────│  ActivityLog  |
|  (4 Statuses) |                     |  (Audit Trail)|
+---------------+                     +---------------+
        │                                     │
        │ 1:N                                 │
        ▼                                     ▼
+---------------+                     +---------------+
| Notification  |                     | RefreshToken  |
| (In-App Notif)|                     | (Revocable)   |
+---------------+                     +---------------+
```

### High-Performance Indexing Strategy:
| Table | Indexed Columns | Justification & Query Optimization |
| :--- | :--- | :--- |
| `Task` | `(projectId, status)` | Powers Kanban column queries (`status IN (...)`) and project board rendering in `< 2ms`. |
| `Task` | `(assignedToId, priority, dueDate)` | Accelerates the Developer dashboard query: retrieves assigned tasks pre-sorted by priority and upcoming deadline. |
| `Task` | `(isOverdue)` & `(dueDate)` | Allows the `node-cron` background sweeper to scan overdue candidates via B-tree index seeks rather than sequential table scans. |
| `ActivityLog` | `(projectId, createdAt DESC)` | Enables instant retrieval for project audit feeds and offline catchup queries. |
| `ActivityLog` | `(userId, createdAt DESC)` | Scopes developer-specific activity events without table scans. |
| `Notification`| `(userId, isRead, createdAt DESC)` | Optimizes unread count badge calculation (`COUNT(*) WHERE userId = X AND isRead = false`). |
| `RefreshToken`| `(token)` | O(1) hash-like index search for token rotation and revocation. |

---

## 9. Architectural Decisions & Technical Justifications

### 1. WebSocket Library: Socket.io vs. Native WebSocket
- **Chosen**: **Socket.io**.
- **Justification**: Socket.io provides first-class support for **room multiplexing** (`socket.join('project:123')`), transparent **auto-reconnection with exponential backoff**, native **handshake middleware** for JWT authentication, and cross-browser fallback protocols. Native `ws` requires re-inventing room registries, reconnection logic, and heartbeat timers from scratch.

### 2. Job Queue Choice: node-cron vs. Bull Queue
- **Chosen**: **node-cron**.
- **Justification**: For the required task of sweeping overdue tasks once a minute and triggering events, `node-cron` provides an efficient, lightweight, dependency-free in-process scheduler. Introducing Bull queue would mandate an external Redis cluster, increasing infrastructure overhead without operational need for this service layer. (Redis + BullMQ is documented as the horizontal scaling upgrade path).

### 3. Token Storage: HttpOnly Cookie vs. LocalStorage
- **Chosen**: **Dual-token JWT architecture with HttpOnly cookie**.
- **Justification**: Storing authentication tokens in browser `localStorage` leaves users vulnerable to token theft via Cross-Site Scripting (XSS). In this architecture:
  - Short-lived Access Token (15m) resides purely in React client memory.
  - Long-lived Refresh Token (7d) is stored in a secure, `HttpOnly`, `SameSite=Lax` cookie inaccessible to JavaScript.
  - Axios response interceptors silently catch `401 Unauthorized` responses and invoke `/api/auth/refresh` to maintain continuous sessions without UX interruptions.

---

## 10. REST API Endpoint Reference

All endpoints return a standardized, structured JSON format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description"
}
```
Error responses never expose raw stack traces:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "dueDate", "message": "Valid due date is required" }]
  }
}
```

### Key Endpoints:
- `POST /api/auth/login`: Authenticate and set HttpOnly refresh cookie.
- `POST /api/auth/signup`: Register new account with name, email, password, and role.
- `POST /api/auth/social-login`: Authenticate with Google or Facebook OAuth profile.
- `POST /api/auth/refresh`: Silently exchange refresh cookie for a new access token.
- `POST /api/auth/logout`: Revoke refresh token and clear cookie.
- `GET  /api/auth/me`: Retrieve authenticated user profile.
- `GET  /api/projects`: Get role-scoped projects list.
- `GET  /api/projects/:id`: Get project details and tasks (enforces ownership).
- `POST /api/projects`: Create project (Admin & PM only).
- `GET  /api/tasks?status=...&priority=...&dueStart=...`: Get tasks matching query parameters (synced to shareable URLs).
- `PATCH /api/tasks/:id/status`: Update task status (triggers real-time WebSocket broadcast & activity log).
- `GET  /api/activity?limit=20`: Fetch last 20 activity records for offline catchup.
- `GET  /api/notifications`: Get user notifications and unread badge count.
- `PATCH /api/notifications/read-all`: Mark all notifications as read.
- `GET  /api/analytics/dashboard`: Get tailored metrics for Admin, PM, or Developer.

---

## 11. Known Limitations & Production Roadmap

1. **Multi-Node WebSocket Clustering**:
   - In single-instance setups, Socket.io manages connections in memory. For horizontal scaling across multiple container replicas, install `@socket.io/redis-adapter` to distribute messages across instances via Redis Pub/Sub.
2. **Distributed Lock for Background Schedulers**:
   - Running multiple backend instances requires distributed locking (e.g. Redlock) to prevent duplicate execution of the 60-second overdue task sweep.
3. **Asset & File Attachments**:
   - Add AWS S3 pre-signed upload URLs for attaching design mockups and documentation to project tasks.

---

## ✅ Assessment Rubric Compliance Summary

- [x] **Role-Based Access Control**: Enforced at the API level with middleware (`requireRole`, `checkProjectAccess`, `checkTaskAccess`).
- [x] **Real-Time Live Feed**: Socket.io implementation with role-partitioned rooms, formatted text, and DB-backed missed event catchup.
- [x] **Database Design**: PostgreSQL schema with foreign keys, cascading rules, and compound query indexes.
- [x] **Code Architecture**: Clean separation of concerns (controllers, services, routes, middleware, validators) with 100% strict TypeScript.
- [x] **Seed Script & Environment**: Complete seed script (`1 Admin, 2 PMs, 4 Devs, 3 Projects, 18 Tasks, 2 Overdue`) and documented `.env` files.
- [x] **Running Command**: Runs with `npm run dev` in `backend/`, `frontend/`, and root workspace.

---
*Created for the Velozity Global Solutions Technical Hiring Assessment.*
