# BMW Car Showroom Project

A full-stack showroom web app with role-based flows for customers, salesmen, and admins.

- Customer portal: browse cars, register/login, book test drives, track booking status, and submit reviews
- Salesman dashboard: manage test-drive requests, approve/reject bookings, reply to reviews, and view personal profile/performance
- Admin dashboard: manage car inventory, monitor platform stats, view users, and update salesman salary

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express
- Database: Supabase (PostgreSQL)
- File upload: Multer (uploads saved in local `uploads/`)

## Project Structure

```
.
|-- index.html
|-- admin.html
|-- salesman.html
|-- script.js
|-- styles.css
|-- server/
|   |-- server.js
|   |-- supabase.js
|   |-- schema.sql
|   |-- seed.js
|   `-- routes/
|       |-- auth.js
|       |-- customer.js
|       |-- salesman.js
|       `-- admin.js
`-- uploads/
```

## Prerequisites

- Node.js 18+
- npm
- Supabase project (URL + service role key)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALLOWED_ORIGIN=http://localhost:3000
PORT=3000
```

Notes:
- `SUPABASE_KEY` is also accepted as a fallback, but `SUPABASE_SERVICE_ROLE_KEY` is preferred.
- Never commit real secrets.

## Database Setup (Supabase)

1. Open your Supabase Dashboard.
2. Go to SQL Editor.
3. Run the SQL from `server/schema.sql`.

This creates tables and seed data (users, cars).

Optional helper command:

```bash
npm run seed
```

This command prints setup instructions and demo credentials in the console.

## Run the App

Start server:

```bash
npm start
```

Default URLs:
- Customer: http://localhost:3000/index.html
- Admin: http://localhost:3000/admin.html
- Salesman: http://localhost:3000/salesman.html

## Demo Login Credentials

- Admin: `admin@gmail.com` / `admin123`
- Salesman: `sales@gmail.com` / `sales123`
- Customer: `user@gmail.com` / `user123`

## API Overview

Base path: `/api`

Auth:
- `POST /login`
- `POST /register`

Customer:
- `POST /book-test-drive`
- `GET /my-test-drives?user_id=...`
- `POST /review`

Salesman:
- `GET /salesman-profile?id=...`
- `POST /salesman-profile-pic`
- `GET /test-drives`
- `PUT /test-drive/:id`
- `GET /reviews`
- `POST /review-reply`

Admin:
- `POST /add-car`
- `GET /cars`
- `DELETE /car/:id`
- `GET /admin-stats`
- `GET /all-users`
- `PUT /update-salary`

## Security Notes

See `DEPLOYMENT_SECURITY.md` before deploying.

Important points:
- Rotate any previously exposed keys.
- Set production env vars in your hosting provider.
- Restrict CORS with exact `ALLOWED_ORIGIN`.
- Do not expose service role keys to frontend code.

## Scripts

- `npm start` - starts Express server (`server/server.js`)
- `npm run seed` - prints Supabase SQL seeding instructions and demo credentials

## License

For educational/demo use unless you add your own project license.
