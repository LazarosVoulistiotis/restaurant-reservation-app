# Architecture Draft — Restaurant Reservation App

## Architecture Style
The system follows a three-tier architecture:

- Frontend: React Native with Expo
- Backend: Node.js with Express REST API
- Database: MariaDB

## Frontend Layer
The mobile application will provide:
- Register Screen
- Login Screen
- Restaurants Screen
- Reservation Form Screen
- My Reservations / Profile Screen

The frontend is responsible for:
- user interaction
- form input
- navigation
- token handling
- loading, success, and error feedback
- communication with the backend API

## Backend Layer
The backend follows a modular Express structure with:
- routes
- controllers
- services
- middleware
- database access layer

The backend is responsible for:
- authentication
- request handling
- business logic
- reservation validation rules
- communication with MariaDB

## Database Layer
The database contains three main tables:
- users
- restaurants
- reservations

The database is responsible for:
- persistent data storage
- relationships between entities
- CRUD support
- indexing for efficient queries

## Data Flow
1. The user interacts with the React Native mobile app.
2. The frontend sends an HTTP request to the Express API.
3. Express routes the request to the appropriate controller and service.
4. The service reads or writes data in MariaDB.
5. The backend returns a JSON response.
6. The UI displays the result to the user with appropriate feedback.