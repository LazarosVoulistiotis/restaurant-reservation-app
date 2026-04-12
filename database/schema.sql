-- Create database for the restaurant reservation application
CREATE DATABASE IF NOT EXISTS restaurant_reservation_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE restaurant_reservation_app;

-- Drop existing tables to allow clean re-creation during development
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

-- Store registered users
CREATE TABLE users (
                       user_id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(150) NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT uq_users_email UNIQUE (email)
);

-- Store available restaurants
CREATE TABLE restaurants (
                             restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
                             name VARCHAR(120) NOT NULL,
                             location VARCHAR(120) NOT NULL,
                             description TEXT,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store reservations made by users
CREATE TABLE reservations (
                              reservation_id INT AUTO_INCREMENT PRIMARY KEY,
                              user_id INT NOT NULL,
                              restaurant_id INT NOT NULL,
                              reservation_date DATE NOT NULL,
                              reservation_time TIME NOT NULL,
                              people_count INT NOT NULL,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              CONSTRAINT fk_reservations_user
                                  FOREIGN KEY (user_id) REFERENCES users(user_id)
                                      ON DELETE CASCADE
                                      ON UPDATE CASCADE,
                              CONSTRAINT fk_reservations_restaurant
                                  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
                                      ON DELETE CASCADE
                                      ON UPDATE CASCADE,
                              CONSTRAINT chk_people_count CHECK (people_count > 0)
);

-- Indexes to improve search and reservation queries
CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_location ON restaurants(location);
CREATE INDEX idx_reservations_user_date_time
    ON reservations(user_id, reservation_date, reservation_time);
CREATE INDEX idx_reservations_restaurant_date
    ON reservations(restaurant_id, reservation_date);