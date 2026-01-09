
This project is a simplified **Job Scheduler & Automation Dashboard** that allows users to create background jobs, run them, track their status, and trigger outbound webhooks when jobs complete.

---

## 🚀 Features

* Create background jobs with priority and JSON payload
* Track job status: `pending → running → completed`
* Run jobs manually with simulated async execution
* Filter jobs by status and priority
* Trigger outbound webhook on job completion
* Clean, responsive UI built with Tailwind CSS
* RESTful backend with MySQL database

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express
* Prisma ORM

### Database

* MySQL

### Tooling

* Docker (for MySQL)
* Git & GitHub

---

## 📁 Project Structure

```
dotix-job-scheduler/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── routes/
│   │   ├── prisma.ts
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── JobsDashboard.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── App.tsx
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema

### `jobs` table

| Field       | Type     | Description                   |
| ----------- | -------- | ----------------------------- |
| id          | Int (PK) | Job ID                        |
| taskName    | String   | Task name                     |
| payload     | JSON     | Job payload                   |
| priority    | Enum     | low / medium / high           |
| status      | Enum     | pending / running / completed |
| createdAt   | DateTime | Created time                  |
| updatedAt   | DateTime | Last updated                  |
| completedAt | DateTime | Completion time               |

---

## 🔄 Job Lifecycle

1. User creates a job → status = `pending`
2. User clicks **Run Job**
3. Backend sets status → `running`
4. Simulates processing (3 seconds)
5. Status updated → `completed`
6. Webhook triggered with job details

---

## 🌐 API Endpoints

### Create Job

```http
POST /jobs
```

```json
{
  "taskName": "Send welcome email",
  "priority": "high",
  "payload": {
    "email": "user@example.com"
  }
}
```

---

### List Jobs

```http
GET /jobs
```

Query params (optional):

* `status`
* `priority`

---

### Job Detail

```http
GET /jobs/:id
```

---

### Run Job

```http
POST /jobs/run-job/:id
```

---

## 🔔 Webhook Integration

When a job completes, an outbound webhook is triggered.

### Webhook URL

```
https://webhook.site/<your-id>
```

### Payload

```json
{
  "jobId": 1,
  "taskName": "Send welcome email",
  "priority": "high",
  "payload": {
    "email": "user@example.com"
  },
  "completedAt": "2026-01-09T12:00:00Z"
}
```

Webhook requests and responses are logged in the backend console.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <repo-url>
cd dotix-job-scheduler
```

---

### 2️⃣ Start MySQL (Docker)

```bash
docker run --name dotix-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=dotix_scheduler \
  -p 3307:3306 \
  -d mysql:8
```

---

### 3️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
DATABASE_URL="mysql://root:root@localhost:3307/dotix_scheduler"
PORT=4000
```

Run migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start backend:

```bash
npm run dev
```

---

### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Start frontend:

```bash
npm run dev
```

Open: **[http://localhost:5173](http://localhost:5173)**

---

## 🧠 Architecture Overview

* Frontend communicates with backend via REST APIs
* Backend handles job creation and state transitions
* Prisma ORM manages database access
* Async job simulation uses timers
* Webhook triggered after job completion

```
React UI
   ↓
REST API (Express)
   ↓
MySQL (Prisma)
   ↓
Job Runner
   ↓
Outbound Webhook
```

---

## 🤖 AI Usage Disclosure

AI tools were used as permitted in the assignment.

### Tools Used

* ChatGPT (OpenAI)

### Model

* GPT-4 / GPT-4-Turbo

### How AI Helped

* Environment & setup troubleshooting
* Prisma + MySQL guidance
* UI/UX refinement suggestions
* Debugging TypeScript and build issues
* Documentation structure

All architectural decisions, logic flow, and final implementation were understood and implemented by me.

---



## ✅ Assignment Status

✔ All required features implemented
✔ Clean UI and architecture
✔ Webhook integration working
✔ Production-ready structure

---

## 🙌 Thank You

Thank you for reviewing my submission.
I look forward to your feedback!

---



Just tell me 👍
