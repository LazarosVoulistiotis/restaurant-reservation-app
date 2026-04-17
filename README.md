# Restaurant Reservation App

A three-tier mobile restaurant reservation application developed for the **CN6035 – Mobile & Distributed Systems** module.

The project follows a **frontend + backend + database** architecture and has been implemented step by step to satisfy the coursework requirements for:

- user authentication
- restaurant browsing and search
- reservation management
- mobile client integration

---

## Overview

The **Restaurant Reservation App** allows users to:

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

## Coursework Alignment

This project is designed to align with the CN6035 coursework requirements, which emphasize:

- clean and functional **frontend UI/UX**
- correct **frontend-backend communication**
- **JWT-based authentication**
- proper **database integration**
- clear **installation instructions** and **functional description** in the README
- presentation-ready evidence such as screenshots or live demo

---

## Tech Stack

### Frontend
- React Native
- Expo
- React Navigation
- Axios
- AsyncStorage
- react-native-gesture-handler
- react-native-screens
- react-native-safe-area-context

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
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ navigation/
│  │  ├─ screens/
│  │  ├─ services/
│  │  └─ utils/
│  ├─ assets/
│  ├─ App.js
│  ├─ app.json
│  ├─ index.js
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

## Current Implementation Status

### Completed

- **Day 1:** architecture, repository structure, database schema, seed data, backend/frontend scaffolding
- **Day 2:** backend core implementation completed
  - register/login
  - JWT protection
  - restaurants endpoint
  - reservations CRUD endpoints
  - Postman-tested backend flows
- **Day 3:** frontend authentication and restaurant browsing completed
  - Welcome screen
  - Register screen
  - Login screen
  - persisted JWT session with AsyncStorage
  - Restaurants list screen
  - search by name/location
  - loading, empty, and error states
  - polished UI for web/mobile preview
- **Day 4:** reservation flow and profile / my reservations completed
  - reservation form with validation
  - create reservation from frontend
  - reservation history screen
  - upcoming / past reservation separation
  - edit future reservations
  - delete future reservations with confirmation
  - logout button
  - basic token-expiration handling

### Next Step

- **Day 5:** final testing, README polish, screenshots, presentation material, and demo readiness

---

## Implemented Functionality

## Backend

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
- past reservations remain visible only as history

## Frontend

### Authentication UI
- Welcome screen
- Register screen with validation and success/error feedback
- Login screen with validation and error feedback
- authenticated navigation based on JWT session state
- persisted login session using **AsyncStorage**
- basic token-expiration handling with automatic auth reset on invalid / expired token responses

### Restaurants UI
- restaurants list fetched from backend
- restaurant cards showing:
  - name
  - location
  - short description
  - **Book now** button
- search by restaurant **name** or **location**
- loading state
- empty state
- error handling
- pull-to-refresh support

### Reservation UI
- reservation form screen
- selected restaurant summary
- date, time, and people count fields
- client-side validation before submit
- success / error feedback after submission
- create and edit support from the same form screen

### Profile / My Reservations UI
- authenticated reservation history screen
- reservation cards displaying:
  - restaurant name
  - location
  - reservation date
  - reservation time
  - people count
- visual separation between **Upcoming** and **Past** reservations
- edit button for future reservations
- delete button for future reservations
- delete confirmation dialog
- empty state when no reservations exist
- logout action from the profile flow

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
- **db access** → SQL queries through the MariaDB connection pool
- **middleware** → JWT auth and global error handling
- **utils** → shared helpers such as custom errors and JWT generation

This structure supports readability, maintainability, and alignment with the coursework rubric.

---

## Frontend Architecture

The frontend follows a modular structure:

- **screens** → user-facing screens such as Welcome, Register, Login, Restaurants, ReservationForm, and Profile
- **navigation** → root stack flow for public and authenticated screens
- **context** → shared authentication state through `AuthContext`
- **services** → shared API client configuration using Axios plus reservation service helpers
- **utils** → helpers such as token persistence through AsyncStorage

This keeps authentication, API communication, screen rendering, and navigation responsibilities clearly separated.

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

The frontend provides user-facing feedback for key actions such as:

- registration validation errors
- duplicate email or login failure messages
- loading indicators during requests
- empty-state feedback when no restaurants are found
- reservation form validation messages
- success/error feedback for create, update, and delete actions

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
- `GET /restaurants`

### 6. Install frontend dependencies

Open a second terminal and run:

```bash
cd frontend
npm install
npx expo install react-native-gesture-handler @react-native-async-storage/async-storage react-native-screens react-native-safe-area-context react-dom react-native-web
npm install @react-navigation/native @react-navigation/native-stack axios
```

### 7. Configure the frontend API base URL

Open:

```text
frontend/src/services/api.js
```

and set the correct backend URL.

Examples:

- **Expo web / desktop browser:**

```javascript
const API_BASE_URL = 'http://localhost:5000';
```

- **Expo Go on a physical device:**

```javascript
const API_BASE_URL = 'http://YOUR_PC_LOCAL_IP:5000';
```

- **Android emulator:**

```javascript
const API_BASE_URL = 'http://10.0.2.2:5000';
```

### 8. Run the frontend

```bash
cd frontend
npx expo start
```

Useful options:
- press `w` to open the app in the web browser
- press `a` to open Android emulator
- scan the QR code with Expo Go for device testing

---

## Suggested End-to-End Test Flow

A quick test flow for the implemented application:

1. Start the backend
2. Start the frontend with Expo
3. Register a new user
4. Verify redirect to Login and email prefill
5. Log in and verify navigation to Restaurants
6. Search by restaurant name or location
7. Open **Book now** from a restaurant card
8. Enter a valid future date, time, and people count
9. Submit the reservation and verify redirect to **Profile / My Reservations**
10. Confirm that the reservation appears under **Upcoming**
11. Edit the future reservation and verify the updated values
12. Delete the future reservation and verify it is removed from the list
13. Confirm that past reservations appear only as history
14. Refresh the app after login and confirm the session is restored

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
- update/delete attempts for non-future reservations

---

## Documentation Assets

Project documentation is stored under `docs/`.

Examples:
- `docs/diagrams/` → architecture material
- `docs/screenshots/` → API evidence and UI screenshots
- `docs/presentation/` → presentation material

Suggested screenshots for the current stage:
- Welcome screen
- Register screen
- Login screen
- Restaurants list
- Search result
- Empty search state
- Reservation form
- Reservation success / profile notice
- My Reservations screen
- Edit future reservation
- Delete confirmation
- Architecture diagram

---

## Repository Goal

This project is being developed as a coursework submission for CN6035 and aims to demonstrate:

- three-tier system design
- REST API development
- secure authentication with JWT
- relational database integration with MariaDB
- structured implementation and testing workflow
- presentation-ready progress with screenshots and demo material

---

## Current Outcome

At the current stage, the project supports an end-to-end user flow from:

**register / login → browse restaurants → create reservation → view history → edit/delete future bookings**

This means the application now covers the core business use cases required by the coursework.

---

## Next Phase

The next phase focuses on final submission readiness:

- full regression testing
- README final polish
- screenshot collection
- presentation slides
- demo preparation

---

## Notes

- Full reservation creation and reservation-history management are now implemented on both backend and frontend.
- The current authenticated default landing screen after app reload is `Restaurants`, while the login session remains persisted.
- Search currently matches the seeded restaurant data values stored in the database.
