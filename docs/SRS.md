# Software Requirements Specification (SRS)
## 1. Introduction
### 1.1 Purpose
The purpose of this document is to define the requirements for the University Management System (UMS). This system will manage student enrollment, course registration, faculty management, and administrative tasks within a university environment.

### 1.2 Scope
The UMS is a web-based application designed to streamline the academic and administrative processes of a university. It provides portals for students, faculty, and administrators. 

### 1.3 Technology Stack
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
*   **Backend (Core Services & APIs):** Java (e.g., Spring Boot)
*   **Backend (Data Analytics & Utility Scripts):** Python
*   **Database:** Relational Database (e.g., PostgreSQL or MySQL)

## 2. Overall Description
### 2.1 Product Perspective
The system will follow a modular architecture consisting of a centralized database, a set of backend REST APIs powered by Java and Python, and a responsive frontend user interface. 

### 2.2 User Classes and Characteristics
*   **Students:** Can view courses, register for classes, check grades, and view their schedules.
*   **Faculty:** Can manage course content, assign grades, and view enrolled students.
*   **Administrators:** Can manage users (students/faculty), courses, departments, and system settings.

### 2.3 Operating Environment
The UMS will be accessible via standard modern web browsers (Chrome, Firefox, Safari, Edge). The backend services will be hosted on standard cloud infrastructure (e.g., AWS, GCP, or Azure).

## 3. System Features
### 3.1 Authentication and Authorization
*   Secure login portal for all user types.
*   Role-Based Access Control (RBAC) to restrict access to features based on the user's role.

### 3.2 Student Management
*   Enrollment and registration.
*   Profile management.
*   Grade and transcript generation.

### 3.3 Course Management
*   Creation and updating of course catalogs.
*   Prerequisite tracking.
*   Scheduling and classroom assignment.

### 3.4 Faculty Management
*   Assignment of courses to faculty members.
*   Salary and payroll integration (optional extension).

## 4. Non-Functional Requirements
### 4.1 Performance Requirements
*   The system shall load pages within 2 seconds under normal load.
*   APIs shall respond within 500ms.

### 4.2 Security Requirements
*   All user passwords must be hashed and salted.
*   Data transmitted between the frontend and backend must be encrypted using HTTPS.

### 4.3 Reliability
*   The system shall have an uptime of 99.9%.

## 5. Folder Structure Mapping
This project follows a separated architecture to organize the distinct technologies effectively:

*   `docs/`: Contains project documentation, such as this `SRS.md`, and any UML diagrams in `docs/uml_diagrams/`.
*   `frontend/`: Contains all user interface code.
    *   `frontend/html/`: HTML files for page structure (e.g., `index.html`, `login.html`, `dashboard.html`).
    *   `frontend/css/`: Stylesheets (e.g., `styles.css`, `layout.css`).
    *   `frontend/js/`: Client-side logic for API integration.
    *   `frontend/assets/images/`: Logos, icons, and static images.
*   `backend/java_service/`: The core backend application, managing heavy business logic and primary database interactions.
    *   `src/main/java/`: Java source files (Controllers, Services, Repositories).
    *   `src/main/resources/`: Configuration files (e.g., `application.properties`).
*   `backend/python_service/`: Python modules utilized for data processing, reporting, or auxiliary APIs.
    *   `src/`: Python source files (e.g., `app.py`, `data_processor.py`).
    *   `tests/`: Unit tests for Python code.
*   `database/`: 
    *   `migrations/`: SQL scripts for schema creation and versioning (e.g., `V1__init.sql`).
*   `tests/`: 
    *   `integration/`: Cross-service integration and end-to-end testing scripts.
*   `scripts/`: Utility shell or batch scripts for building, running, or deploying the system locally.
