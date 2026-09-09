# AI Face Recognition Attendance System

An intelligent, full-stack attendance management platform designed for colleges to automate student attendance using artificial intelligence and face recognition technology. The system provides dedicated interfaces for administrators, teachers, and students, with secure role-based access and centralized attendance management.

The platform combines a modern React.js frontend, a Node.js and Express.js backend, a Python FastAPI-based AI service, and a MySQL database. It enables administrators to manage the academic structure and users, teachers to conduct automated attendance sessions through camera-based face recognition, and students to monitor their attendance records and academic attendance performance.

## Overview

Traditional attendance systems are often time-consuming and require manual data entry. This project addresses that problem by introducing an AI-assisted attendance workflow in which a teacher can start an attendance session and identify registered students through a camera. The student's face is converted into a numerical face encoding by the AI service and compared with registered encodings stored in the database. When a valid match is identified, the student's attendance can be recorded automatically.

The application is designed around three primary roles. Administrators have complete control over the academic and user management system. Teachers can access only their assigned subjects and classes and can conduct attendance sessions for those assignments. Students have access only to their own attendance information, including overall attendance, subject-wise attendance, and attendance history.

## Core Capabilities

The administrative module provides functionality for managing departments, classes, students, teachers, subjects, and teacher-subject assignments. Administrators can also register student faces directly through the camera without requiring image-file uploads.

The teacher module provides assigned-subject and class management, attendance session creation, camera-based face recognition, automatic attendance marking, session management, and attendance history with session-level statistics.

The student module provides a personalized dashboard containing overall attendance, attendance percentage, subject-wise attendance, and attendance history. Student data is isolated so that a student can access only their own attendance records.

The system supports three attendance states: PRESENT, ABSENT, and LATE. Present and Late records are considered attended when calculating attendance percentages.

## Face Recognition Workflow

Student face registration is performed directly through the camera. An administrator selects a student, opens the camera, captures the student's face, and sends the image to the AI service. The AI service detects the face and generates a 128-dimensional face encoding. The encoding is then stored in the student's database record for future recognition.

During an attendance session, the teacher opens the camera and captures a student's face. The image is processed by the AI service, which generates a new face encoding. The backend compares the generated encoding against registered encodings belonging to students in the selected class. If a suitable match is found, the student is identified and attendance can be recorded.

This workflow can be represented as:

Camera → AI Face Detection → Face Encoding → Backend Comparison → Student Identification → Attendance Recording

## System Architecture

The application follows a modular full-stack architecture:

Frontend: React.js and Vite provide the user interface and role-specific dashboards.

Backend: Node.js and Express.js provide REST APIs, authentication, authorization, attendance management, user management, and communication with the database and AI service.

AI Service: Python and FastAPI provide face detection and face encoding generation using computer vision and face-recognition technologies.

Database: MySQL stores users, academic information, assignments, attendance sessions, attendance records, and registered face encodings.

The overall architecture is:

React.js Frontend
        ↓
Node.js + Express.js Backend
        ↓
 ┌───────────────┬────────────────┐
 ↓               ↓                ↓
MySQL        AI Service       Authentication
Database     FastAPI          JWT + bcrypt
             Python

## Technology Stack

Frontend:
React.js, Vite, JavaScript, HTML, CSS

Backend:
Node.js, Express.js, REST APIs, JWT, bcryptjs, MySQL2, CORS, dotenv

Artificial Intelligence:
Python, FastAPI, face-recognition, dlib, NumPy, Pillow, OpenCV, Uvicorn

Database:
MySQL and MySQL Workbench

Development:
Visual Studio Code, Git, GitHub, PowerShell, Node.js, and Python

## Database Design

The system uses a relational MySQL database consisting of interconnected entities for users, academic organization, assignments, attendance sessions, and attendance records.

The primary tables are:

users — stores authentication and role information.

departments — stores academic departments.

classes — stores year, section, and academic-year information.

students — stores student information and registered face encodings.

teachers — stores teacher information.

subjects — stores subject information.

student_classes — associates students with their classes.

teacher_subjects — associates teachers with subjects and classes.

attendance_sessions — stores attendance session information.

attendance — stores individual student attendance records.

The database design separates user authentication from academic records while using relationships between students, teachers, classes, subjects, and attendance sessions.

## Security

Security is an important part of the application. Authentication is implemented using JSON Web Tokens, while passwords are protected using bcrypt hashing. Backend APIs are protected using authentication middleware and role-based authorization.

Administrators can access administrative functionality, teachers can access only their assigned attendance functionality, and students can access only their own attendance information.

The application has been tested to verify that students cannot access administrator-only APIs, teachers cannot access administrator-only APIs, students cannot access another student's attendance records, and protected APIs reject requests without valid authentication credentials.

Attendance sessions are also protected so that teachers cannot use attendance sessions belonging to other teachers.

## Project Structure

The project is organized into independent frontend, backend, AI-service, and database components.

ai-attendance-system/

    frontend/
        src/
        public/
        package.json
        vite.config.js

    backend/
        config/
        middleware/
        routes/
        server.js
        package.json

    ai-service/
        main.py
        requirements.txt

    database/

    .gitignore
    README.md

This structure keeps the user interface, business logic, AI processing, and database components separated, making the application easier to maintain and extend.

## Running the Project Locally

The project requires Node.js, npm, Python, and MySQL.

First, clone the repository:

    git clone https://github.com/Pavanthota45/ai-attendance-system.git

    cd ai-attendance-system

For the frontend, open a terminal in the frontend directory, install the required packages, and start the development server:

    cd frontend
    npm install
    npm run dev

The frontend is normally available at:

    http://localhost:5173

For the backend, open another terminal and install the dependencies:

    cd backend
    npm install

Create a `.env` file inside the backend directory and configure the MySQL connection, database name, server port, and JWT secret.

Example configuration:

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=YOUR_MYSQL_PASSWORD
    DB_NAME=ai_attendance
    DB_PORT=3306
    PORT=5000
    JWT_SECRET=YOUR_SECRET_KEY

Start the backend using:

    node server.js

For development with Nodemon:

    npx nodemon server.js

The backend is normally available at:

    http://localhost:5000

For the AI service, open another terminal:

    cd ai-service
    python -m venv venv

On Windows, activate the environment:

    venv\Scripts\activate

Install the required Python packages:

    pip install -r requirements.txt

Start the AI service:

    python -m uvicorn main:app --reload --port 8000

The AI service is normally available at:

    http://localhost:8000

FastAPI documentation is available at:

    http://localhost:8000/docs

The MySQL database must also be running and configured with the application's database schema before using the complete system.

## Application Workflow

The application begins with user authentication. After login, the system identifies the user's role and displays the appropriate dashboard.

The administrator manages the academic structure, users, subjects, and teacher assignments and registers student faces through the camera.

The teacher accesses assigned subjects and classes, starts an attendance session, uses the camera to recognize students, and records attendance. The teacher can also review previous attendance sessions and statistics.

The student accesses a personalized dashboard where overall attendance, subject-wise attendance, and attendance history are displayed.

This role-based workflow provides a clear separation of responsibilities while allowing all three roles to work with the same centralized database.

## Testing and Validation

The system has been tested across its major functional modules, including authentication, MySQL connectivity, student management, teacher management, department management, class management, subject management, teacher-subject assignment, attendance session creation, attendance session ending, camera-based face registration, face recognition, automatic attendance marking, attendance calculation, subject-wise attendance, attendance history, multiple teachers, and multiple subjects.

Security validation has also been performed for JWT authentication, role-based authorization, protected APIs, student data isolation, and attendance-session ownership.

The face registration workflow has been tested successfully from camera capture through AI encoding generation and storage in MySQL. The face recognition workflow has also been tested successfully for automatic student identification and attendance recording.

## Privacy and Responsible Use

This project is intended primarily for educational and academic purposes. Face recognition involves biometric-related information and therefore requires responsible handling.

A production deployment should implement appropriate privacy protections, user consent, secure storage, encryption where appropriate, access auditing, retention policies, liveness detection, anti-spoofing mechanisms, and compliance with applicable data-protection requirements.

The `.env` file and other sensitive configuration files should never be committed to the repository. Database passwords, JWT secrets, API keys, access tokens, and other confidential information must remain outside source control.

## Future Scope

The project can be extended with real-time multi-face recognition, liveness detection, anti-spoofing protection, improved recognition accuracy, attendance analytics, graphical dashboards, Excel and PDF report generation, email notifications, password-reset functionality, enhanced student and teacher profiles, cloud database integration, mobile optimization, and production deployment.

Additional improvements can include advanced attendance reporting, real-time classroom monitoring, automated notifications for low attendance, and improved AI performance for different lighting and camera conditions.

## Project Objective

The primary objective of this project is to demonstrate how artificial intelligence, computer vision, and full-stack web development can be combined to create a practical automated attendance management platform.

The project demonstrates practical implementation of frontend development, backend API development, database design, authentication, authorization, artificial intelligence, computer vision, face recognition, camera integration, and automated attendance management within a single integrated application.

## Author

Pavan Thota

GitHub:
https://github.com/Pavanthota45/ai-attendance-system

## License

This project is developed for educational and academic purposes.