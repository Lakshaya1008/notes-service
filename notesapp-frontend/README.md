Notes App Frontend

A minimal, production-style React frontend for a JWT-based Multi-Tenant Notes Service.
The application demonstrates authentication, tenant isolation, role-based access control, and subscription-aware UI behavior while keeping the frontend intentionally simple and backend-driven.

Tech Stack

React 19

Vite 7

React Router DOM 7

Vanilla CSS (no UI frameworks)

Core Principles

Backend is the single source of truth

No hardcoded URLs or business rules

No security logic re-implemented on the frontend

All API communication goes through a centralized client

UI reacts to backend responses (not assumptions)

Features
Authentication

User Login and Register

JWT returned as text/plain

Token stored in localStorage

JWT decoded client-side to read:

userId

tenantId

role

Automatic logout on:

Token expiry

HTTP 401 Unauthorized

Notes Management

Create, read, update notes

Notes are tenant-isolated (handled by backend)

Cross-tenant access is never possible

Role-Based Access Control (RBAC)
Role	Permissions
MEMBER	Create, read, update notes
ADMIN	Create, read, update and delete notes

Delete action is visible only to ADMIN users

Forbidden actions are hidden in UI before backend rejection

Subscription Awareness
Plan	Limit
FREE	Maximum 3 notes
PRO	Unlimited notes

Subscription limits are not enforced client-side

On reaching the FREE plan limit:

Backend returns HTTP 403

Frontend shows:

A toast with the backend message

An informational banner (no action button)

Note: Tenant upgrade is a backend-only operation.
The frontend intentionally does not expose any upgrade API or UI.

Error Handling

All errors are handled centrally and surfaced via toasts:

Status	Behavior
400	Validation error toast
401	Force logout + toast
403	Toast + subscription banner
404	Toast
500	Generic error toast

Each error triggers exactly one toast.

Project Structure
src/
├── main.jsx              # Application entry point
├── App.jsx               # Routing and providers
├── api/                  # API layer
│   ├── httpClient.js     # Centralized HTTP client
│   ├── authApi.js        # Authentication APIs
│   └── notesApi.js       # Notes CRUD APIs
├── auth/
│   ├── AuthContext.jsx   # Auth state & helpers
│   └── authUtils.js      # JWT utilities
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Notes.jsx
├── components/
│   ├── NoteForm.jsx
│   ├── NoteList.jsx
│   ├── NoteItem.jsx
│   ├── UpgradeBanner.jsx # Info-only banner
│   └── ProtectedRoute.jsx
├── ui/
│   ├── Toast.jsx
│   └── ToastContainer.jsx
├── hooks/
│   └── useToast.jsx
├── constants/
│   └── roles.js
└── styles/
└── main.css

Environment Variables

Create a .env file at the project root:
VITE_API_BASE_URL=https://your-backend-api-url

Rules:

No trailing slash

Must point to the deployed backend

Never hardcode API URLs in code

An example file is provided as .env.example.

Setup & Run
1. Install dependencies
   npm install

2. Configure environment
   cp .env.example .env
# Edit .env and set VITE_API_BASE_URL

3. Start development server
   npm run dev


The app will be available at:

http://localhost:5173

Available Scripts

npm run dev – Start development server

npm run build – Build for production

npm run preview – Preview production build

npm run lint – Run ESLint

Design Notes

Tenant upgrade is intentionally excluded from frontend

Frontend reacts to backend errors instead of predicting outcomes

Minimal UI by design to focus on correctness and architecture

Suitable for demos, assignments, and interviews

Status

✅ Fully functional
✅ Contract-accurate
✅ Production-style architecture
✅ No known issues