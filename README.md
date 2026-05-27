# Project Advisor Management System

## Live Demo
🚀 https://project-advisor-system.netlify.app/

## Overview

The **Project Advisor Management System** is a full-stack role-based academic management platform developed for university project workflows. The system centralizes project creation, advisor assignment, student applications, announcements, and administrative operations into a single secure digital environment.

Instead of handling project coordination through manual communication methods such as e-mail or messaging applications, the platform provides an organized workflow where:

* Students can create projects, apply to projects, and request advisors
* Advisors can manage advising requests and availability
* Administrators can manage users, categories, and announcements

The application was developed as part of the Software Engineering course project at Üsküdar University.

---

# Project Information

### University

Üsküdar University – Faculty of Engineering and Natural Sciences

### Department

Software Engineering

### Project Date

May 2026

---

# Key Features

## Student Features

* Secure authentication and role-based access
* Create course projects or other project types
* Browse open projects created by other students
* Apply to projects
* Accept or reject incoming applications as project owner
* Track application statuses persistently
* Search advisors by department or expertise
* Send advisor requests
* View notifications and announcements
* Manage personal profile information
* View joined projects and owned projects

---

## Advisor Features

* Advisor-specific dashboard
* Manage advising availability
* Accept or reject advisor requests
* View student and project details
* Track accepted projects
* Manage profile information and expertise
* Advisor quota management
* Persistent advising status system

---

## Admin Features

* User management system
* Activate or deactivate users
* Project category management
* Announcement publishing system
* Dynamic project rules configuration
* Category-based project organization
* Admin dashboard for system control

---

# Technologies Used

## Backend

* Java 21
* Spring Boot 3.2.5
* Spring Security
* Spring Data JPA
* Hibernate
* JWT Authentication
* Maven
* PostgreSQL
* Swagger / OpenAPI

## Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap

## Development Tools

* Git & GitHub
* VS Code / IntelliJ IDEA
* Postman / Swagger

---

# System Architecture

The project follows a layered full-stack architecture.

## Backend Architecture

The backend is developed using Spring Boot and organized into:

### Controllers

Responsible for handling HTTP requests and REST API endpoints.

### Services

Contains all business logic and workflow operations.

### Repositories

Handles database communication through Spring Data JPA.

### Entities

Represents relational database tables and relationships.

---

## Frontend Architecture

The frontend is separated into role-based pages:

* Student pages
* Advisor pages
* Admin pages

JavaScript is used for:

* API communication
* Dynamic rendering
* Modal management
* Filtering
* Notification updates
* Persistent button states

JWT tokens are stored in localStorage and attached to API requests through the Authorization header.

---

# Authentication & Security

The system uses JWT-based authentication and Spring Security.

## Security Features

* Role-based authorization
* Protected API endpoints
* JWT token authentication
* Secure login system
* Inactive user restrictions
* Admin-only operations
* Endpoint access control using Spring Security

### Roles

* ROLE_STUDENT
* ROLE_ADVISOR
* ROLE_ADMIN

---

# Database Design

The application uses PostgreSQL with relational entity mapping.

## Main Entities

### Users

Stores authentication and account data.

### Students

Stores student-specific profile information.

### Advisors

Stores advisor expertise, quota, and availability.

### Projects

Stores project information and ownership.

### ProjectCategory

Stores admin-defined project categories.

### ProjectApplication

Stores student applications to projects.

### AdvisorRequest

Stores advisor request workflows.

### Announcements

Stores system-wide announcements.

### Notifications

Stores user notifications and responses.

---

# Functional Workflow

## Student Workflow

1. Login to the system
2. Create a project
3. Browse open projects
4. Apply to projects
5. Receive notifications
6. Search for advisors
7. Send advisor requests
8. Manage project applications

---

## Advisor Workflow

1. Login as advisor
2. Manage advisor profile
3. View advisor requests
4. Accept or reject requests
5. Track accepted projects

---

## Admin Workflow

1. Login as admin
2. Manage project categories
3. Publish announcements
4. Manage users
5. Configure system rules

---

# REST API Structure

## Authentication

```http
/api/auth
```

## Projects

```http
/api/projects
```

## Advisors

```http
/api/advisors
```

## Advisor Requests

```http
/api/advisor-requests
```

## Notifications

```http
/api/notifications
```

## Announcements

```http
/api/announcements
```

## Admin Operations

```http
/api/admin
```

---

# Important Features Implemented

## Persistent Application States

Application statuses remain saved after:

* Page refresh
* Logout/login
* Browser restart

---

## Dynamic Button States

Buttons update automatically depending on:

* Pending requests
* Accepted requests
* Rejected requests
* Advisor availability

---

## Advisor Availability System

Advisors can:

* Become active/inactive
* Control quota availability
* Prevent new requests when unavailable

---

## Notification System

Students receive notifications for:

* Project applications
* Application responses
* Advisor responses
* Announcement updates

---

# UI/UX Features

* Role-based dashboards
* Shared sidebar and topbar structure
* Responsive layouts
* Dynamic modals
* Category filters
* Status indicators
* Persistent interface states
* User-friendly navigation

---

# Testing

The project includes workflow-based manual testing scenarios.

## Tested Modules

* Project category management
* Announcement publishing
* Advisor profile management
* Advisor request handling
* Student project creation
* Project application system
* Student request approvals
* Advisor search
* Advisor request sending
* Student profile management

---

# Example System Scenarios

## Project Application Scenario

1. A student creates a project
2. Other students browse open projects
3. A student applies to the project
4. The project owner receives a notification
5. The owner accepts or rejects the request
6. Application status updates persistently

---

## Advisor Request Scenario

1. A student searches for advisors
2. The student sends an advisor request
3. The advisor reviews project details
4. The advisor accepts or rejects the request
5. Advisor quota updates automatically

---

# Project Structure

```bash
project-advisor-system/
│
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   ├── security/
│   └── configuration/
│
├── frontend/
│   ├── html/
│   ├── css/
│   ├── js/
│   └── assets/
│
└── database/
```

---

# Installation Guide

## Clone Repository

```bash
git clone <repository-url>
cd project-advisor-system
```

---

## Backend Setup

### Navigate to backend

```bash
cd backend
```

### Configure PostgreSQL

Update your `application.properties` file:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/project_management
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

---

### Run Backend

```bash
./mvnw spring-boot:run
```

or

```bash
mvn spring-boot:run
```

---

## Frontend Setup

Open frontend files using:

* Live Server
* VS Code
* Any static web server

Main entry:

```bash
index.html
```

---

# Swagger API Documentation

After running the backend:

```bash
http://localhost:8080/swagger-ui/index.html
```

---

# Future Improvements

Possible future enhancements:

* Real-time WebSocket notifications
* Email notification system
* File upload support
* Advanced analytics dashboard
* AI-based project recommendations
* Advisor workload analysis
* Chat system between users
* Mobile application support

---

# What This Project Demonstrates

This project demonstrates practical experience in:

* Full-stack web development
* REST API development
* Spring Boot architecture
* JWT authentication
* Role-based authorization
* Relational database design
* Frontend-backend integration
* Agile software development
* Software testing workflows
* Real-world academic workflow management

---

# Screenshots

You can add screenshots here:

```md
![Login Page](images/login.png)
![Student Dashboard](images/student-dashboard.png)
![Advisor Requests](images/advisor-requests.png)
![Admin Panel](images/admin-panel.png)
```

---

# Conclusion

The Project Advisor Management System successfully digitizes academic project coordination by providing a centralized, secure, and user-friendly platform for students, advisors, and administrators.

The system improves workflow organization, reduces manual communication problems, and creates a scalable foundation for future university project management systems.

Through persistent data management, dynamic UI behavior, and role-based operations, the project reflects a real-world software engineering application developed with modern full-stack technologies.

---

# License

This project was developed for educational and academic purposes.

