# User Management CRUD App

A full-stack user management application built with React, Node.js, Express, and MongoDB.

## Features
- Create, list, view by ID, update, and delete users
- Fields: name, email, age
- Required-field and email validation
- Unique email constraint
- Consistent API error responses and HTTP status codes
- React form with edit mode, table listing, success/error messages
- Backend split into config, models, controllers, and routes

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## 1. Configure and run the backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` and set `MONGODB_URI` to your MongoDB connection string.

```bash
npm install
npm run dev
```
Backend runs at `http://localhost:5000`. Health check: `GET http://localhost:5000/health`.

## 2. Run the frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

The Vite development proxy forwards `/api` requests to the backend.

## API
| Method | Endpoint | Description | Success |
|---|---|---|---|
| POST | `/users` | Create a user | 201 |
| GET | `/users` | List users | 200 |
| GET | `/users/:id` | Get one user | 200 |
| PUT | `/users/:id` | Update a user | 200 |
| DELETE | `/users/:id` | Delete a user | 200 |

All endpoints are prefixed with `/api` in this app, so use `/api/users` from the browser.

### Example request
```json
{
  "name": "Rakesh Kumar",
  "email": "rakesh@example.com",
  "age": 24
}
```

