# BookingHub

BookingHub is a web application for online service booking. The platform allows clients to search for services, view available appointment slots and create bookings, while business users can manage services, employees, schedules, days off and reservations.

## Main Features

- Guest users can browse the home page, search services and view service details.
- Clients can register, log in, save favorite services, create bookings and manage their reservations.
- Business users can create and edit services, upload service images, manage staff members and configure regular weekly days off or specific vacation days.
- Administrators can review users, services and reports, and activate or deactivate profiles.
- The home page shows popular services ordered by the number of created bookings.
- Database schema changes are managed with Flyway migrations.

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Java, Spring Boot, Spring Data JPA, Spring Security
- Database: MySQL
- Migrations: Flyway
- Build tools: npm, Maven

## Project Structure

```text
bookinghub/
  backend/    Spring Boot REST API and Flyway migrations
  frontend/   React/Vite client application
  scripts/    Development helper scripts
```

## Requirements

- Java 21+
- Maven or the included Maven wrapper
- Node.js and npm
- MySQL

## Database Setup

Create a MySQL database named `bookinghub` and configure a user with access to it. The application reads database settings from environment variables, with local defaults defined in `backend/src/main/resources/application.properties`.

Useful environment variables:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/bookinghub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=bookinghub_app
SPRING_DATASOURCE_PASSWORD=your_password
APP_SEED_ADMIN_USERNAME=admin
APP_SEED_ADMIN_EMAIL=admin@bookinghub.dev
APP_SEED_ADMIN_PASSWORD=Admin12345
```

Flyway runs automatically when the backend starts. It checks the `flyway_schema_history` table and applies any pending migrations from `backend/src/main/resources/db/migration`.

## Email Setup

BookingHub sends emails for password reset links, reports, bans and service restrictions. In local development, email sending is disabled until SMTP credentials are provided.

For Gmail, create or use a dedicated Gmail account, enable 2-Step Verification, then create an App Password for the application. Use the generated app password, not the normal Gmail password.

Useful environment variables:

```bash
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=bookinghub.support@gmail.com
SPRING_MAIL_PASSWORD=your_gmail_app_password
APP_EMAIL_FROM=bookinghub.support@gmail.com
APP_SUPPORT_EMAIL=bookinghub.support@gmail.com
APP_FRONTEND_BASE_URL=http://localhost:3000
```

Do not commit real SMTP passwords to Git. Keep them in local environment variables or in your IDE run configuration.

For local development with `npm run dev`, you can also create a root `.env.local` file. It is ignored by Git and loaded automatically by `scripts/dev.mjs`.

```bash
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=bookinghub.support@gmail.com
SPRING_MAIL_PASSWORD=your_gmail_app_password
APP_EMAIL_FROM=bookinghub.support@gmail.com
APP_SUPPORT_EMAIL=bookinghub.support@gmail.com
APP_FRONTEND_BASE_URL=http://localhost:3000
```

## Running Locally

Install frontend dependencies:

```bash
npm run frontend:install
```

Start the full development setup:

```bash
npm run dev
```

Or start each part separately:

```bash
npm run frontend:start
```

```bash
cd backend
./mvnw spring-boot:run
```

The frontend runs on:

```text
http://localhost:3000
```

## Build and Test

Build the frontend:

```bash
cd frontend
npm run build
```

Run backend tests:

```bash
cd backend
./mvnw test
```

## Uploads

Uploaded files are stored locally in `backend/uploads/`. This folder is ignored by Git because it contains runtime user files and should not be committed to the repository.
