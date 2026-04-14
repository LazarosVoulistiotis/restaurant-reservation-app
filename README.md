# Restaurant Reservation App

A three-tier mobile restaurant reservation application developed for the **CN6035 – Mobile & Distributed Systems** module.

The project follows a **frontend + backend + database** architecture and is being implemented step by step to satisfy the coursework requirements for:
- user authentication
- restaurant browsing and search
- reservation management
- mobile client integration

---

## Overview

The Restaurant Reservation App allows users to:
- register and log in securely
- browse available restaurants
- search restaurants by **name** or **location**
- create table reservations
- view their own reservations
- update or delete their **future** reservations

The system is implemented as a distributed three-tier application:
- **Frontend:** React Native with Expo
- **Backend:** Node.js with Express REST API
- **Database:** MariaDB

---

## Tech Stack

### Frontend
- React Native
- Expo

### Backend
- Node.js
- Express
- bcrypt
- jsonwebtoken (JWT)
- mysql2
- cors
- dotenv

### Database
- MariaDB

### Testing / Tooling
- Postman
- Git
- GitHub

---

## Project Structure

```text
restaurant-reservation-app/
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ db/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ utils/
│  │  └─ app.js
│  ├─ .env.example
│  ├─ package.json
│  └─ server.js
├─ frontend/
│  ├─ assets/
│  ├─ App.js
│  ├─ app.json
│  └─ package.json
├─ database/
│  ├─ schema.sql
│  └─ seed.sql
├─ docs/
│  ├─ diagrams/
│  ├─ presentation/
│  └─ screenshots/
└─ README.md
```

---

## Implemented Functionality

### Authentication
- `POST /register`
- `POST /login`
- password hashing with **bcrypt**
- JWT token generation
- input validation
- duplicate email handling

### Restaurants
- `GET /restaurants`
- optional query parameters:
  - `name`
  - `location`
- supports both full list retrieval and search filtering

### Reservations
- `POST /reservations`
- `GET /user/reservations`
- `PUT /reservations/:id`
- `DELETE /reservations/:id`

### Reservation Rules
- only authenticated users can access reservation endpoints
- each user can view only their own reservations
- each user can update or delete only their own **future** reservations

---

## REST API Endpoints

### Public Endpoints
- `GET /health`
- `GET /db-test`
- `POST /register`
- `POST /login`
- `GET /restaurants`

### Protected Endpoints
These require a valid JWT token in the header:

```http
Authorization: Bearer <your_token>
```

Protected routes:
- `POST /reservations`
- `GET /user/reservations`
- `PUT /reservations/:id`
- `DELETE /reservations/:id`

---

## Database Design

The application uses three main tables:

### `users`
Stores registered users.
- `user_id`
- `name`
- `email`
- `password_hash`

### `restaurants`
Stores restaurant information.
- `restaurant_id`
- `name`
- `location`
- `description`

### `reservations`
Stores reservation records.
- `reservation_id`
- `user_id`
- `restaurant_id`
- `reservation_date`
- `reservation_time`
- `people_count`

The schema includes primary keys, foreign keys, and seeded restaurant data.

Database files:
- `database/schema.sql`
- `database/seed.sql`

---

## Backend Architecture

The backend follows a clean layered structure:

- **routes** → endpoint mapping
- **controllers** → request handling and response shaping
- **services** → business logic
- **db access** → SQL queries through MariaDB pool
- **middleware** → JWT auth and error handling
- **utils** → shared helpers such as custom errors and JWT generation

This structure supports readability, maintainability, and alignment with the coursework rubric.

---

## Error Handling

The API returns clear JSON responses for common cases:
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

Example:

```json
{
  "message": "Authorization token is required"
}
```

---

## How to Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/LazarosVoulistiotis/restaurant-reservation-app.git
cd restaurant-reservation-app
```

### 2. Set up the database

Create the MariaDB database, then run:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

Alternatively, import the SQL files manually through your MariaDB client.

### 3. Configure backend environment variables

Inside `backend/`, create a `.env` file based on `.env.example`.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=restaurant_reservation_app
JWT_SECRET=replace_with_a_long_secure_secret
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Run the backend server

```bash
npm run dev
```

The API should run on:

```text
http://localhost:5000
```

Useful test endpoints:
- `GET /health`
- `GET /db-test`

### 6. Frontend setup

The frontend Expo project skeleton is already included in `frontend/`.

To install dependencies and start it:

```bash
cd frontend
npm install
npm start
```

> Note: frontend implementation is continued in the next development phase. The backend API is already operational and testable through Postman.

---

## Postman Testing

The backend has been tested through Postman for:
- register success and validation cases
- login success and invalid credentials
- restaurant listing and search
- reservation create / read / update / delete
- JWT-protected access control

Example tested scenarios include:
- duplicate email
- invalid email format
- missing fields
- no token provided
- invalid restaurant id
- past reservation date

---

## Documentation Assets

Project documentation is stored under `docs/`.

Examples:
- `docs/diagrams/` → architecture material
- `docs/screenshots/` → API test evidence and UI screenshots
- `docs/presentation/` → presentation material

---

## Current Status

### Completed
- Day 1: architecture, database design, backend/frontend scaffolding
- Day 2: backend core implementation completed
  - authentication
  - JWT protection
  - restaurants endpoint
  - reservations CRUD
  - Postman-tested backend flows

### Next Step
- Day 3: frontend authentication screens and restaurant browsing UI

---

## Repository Goal

This project is being developed as a coursework submission for CN6035 and aims to demonstrate:
- three-tier system design
- REST API development
- secure authentication with JWT
- relational database integration with MariaDB
- structured implementation and testing workflow

