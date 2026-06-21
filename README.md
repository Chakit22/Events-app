# Simple Event RSVP Platform

A learning project for practising React, TypeScript, local state, custom hooks, and a small Express API through a simple event RSVP app.

The app lets a mocked user view events, RSVP as attending or not attending, filter events by RSVP status, and lets an admin create, edit, and delete events. The backend provides a minimal Express API with local SQLite persistence for learning frontend-backend data flow.

## What This Project Practises

- TypeScript models for users, events, and RSVP records
- Presentational React components with typed props
- Controlled forms and form validation
- Immutable create, edit, and delete state updates
- Conditional rendering for mocked admin and user roles
- RSVP state with one RSVP per user per event
- Derived state for RSVP status, counts, and filtered lists
- `useMemo` for cached derived calculations
- `useCallback` for stable function props
- `React.memo` for memoized child components
- Custom hooks for event, RSVP, and user state
- Express route basics with request params, request body data, and status codes
- SQLite tables, constraints, and local persistence
- Frontend fetching from `GET /events`
- Simple loading and error states for API data

## Running The App

Install frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Install backend dependencies:

```bash
cd server
npm install
```

Build and start the backend:

```bash
npm run build
npm start
```

The backend runs on:

```txt
http://localhost:3000
```

The frontend fetches events from:

```txt
GET http://localhost:3000/events
```

## Backend API

The backend stores events and RSVPs in a local SQLite database at:

```txt
server/data/events.sqlite
```

Available routes:

```txt
GET    /events
POST   /events
PATCH  /events/:id
DELETE /events/:id
GET    /rsvps
POST   /events/:eventId/rsvp
PUT    /events/:eventId/rsvp
GET    /health
```

`POST /events` expects:

```json
{
  "title": "Backend Practice",
  "description": "Practise routes and status codes",
  "date": "2026-08-01",
  "time": "10:30",
  "location": "Melbourne"
}
```

Successful creates return `201`. Missing event ids return `404`. Invalid request bodies return `400`.

`PUT /events/:eventId/rsvp` expects:

```json
{
  "status": "attending"
}
```

The RSVP status must be either `"attending"` or `"not_attending"`. The database enforces one RSVP per mocked user per event.

## Local Database

Inspect the database:

```bash
cd server
sqlite3 data/events.sqlite
```

Useful SQLite commands:

```sql
.tables
SELECT * FROM events;
SELECT * FROM rsvps;
```

Reset the local database:

```bash
cd server
rm -f data/events.sqlite data/events.sqlite-*
npm run build
npm start
```

The next server start recreates the database and seeds the starter events.

## Intentional Omissions

Authentication is mocked. There is no real login, registration, password hashing, session handling, or JWT flow yet.

Production concerns are intentionally omitted for now, including protected routes, deployment configuration, advanced API validation, authorization checks, and full frontend-backend mutation syncing.

Those omissions are deliberate: this project focuses on learning the fundamentals before adding production architecture.
