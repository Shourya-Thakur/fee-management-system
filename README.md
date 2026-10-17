# Fees Management System

A web-based Fees Management System designed to simplify college fee administration, payment tracking, and student fee records.

## Overview

The Fees Management System is a web application built to help students, accountants, and administrators manage fee-related activities through role-based dashboards.

## Features

- **Student Dashboard** — View fee details, paid and pending balances, and payment requests.
- **Accountant Dashboard** — Monitor fee collection, pending payments, and student fee records.
- **Admin Dashboard** — View system statistics and manage users and fee-related activities.
- **Payment Requests** — Submit and track student payment requests.
- **Fee Tracking** — Keep track of total fees, paid amounts, and outstanding balances.
- **Recent Activity** — Display recent system activities.
- **Role-Based Access** — Separate interfaces for students, accountants, and administrators.

## Technologies Used

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Python
- Flask

**Database**
- MySQL

## Project Structure

```text
fee-management-system/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── js/
│   │   └── main.js
│   ├── accountant.html
│   ├── admin.html
│   ├── dashboard.html
│   ├── login.html
│   └── student.html
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3
- MySQL Server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Shourya-Thakur/fee-management-system.git
cd fee-management-system
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install -r backend/requirements.txt
```

### 4. Configure MySQL

1. Start your MySQL server.
2. Create a database named `fee_management`.
3. Configure the database connection in your local `backend/db.py` file.
4. Configure any additional settings required by `backend/config.py`.

These configuration files are excluded from the public repository. Set them up locally before starting the application, and never publish real database passwords or credentials.

### 5. Run the backend

From the root project directory:

```bash
cd backend
python app.py
```

The Flask application runs in debug mode for local development. Do not use debug mode in production.

### 6. Open the frontend

Open the appropriate HTML page in the `frontend` directory using your browser or a local web server.

Ensure the frontend's API URL matches the address and port used by your Flask backend.

## Troubleshooting

- **Database connection errors:** Check that MySQL is running, the database exists, and your local connection settings are correct.
- **Missing modules:** Activate your virtual environment and install the dependencies again.
- **API errors:** Confirm that the Flask backend is running and the frontend uses the correct API URL.

## Security

- Keep database passwords and other secrets out of version control.
- Store sensitive configuration locally and use environment variables where appropriate.
- Never commit real credentials or private student information.

## Future Improvements

- Improve input validation and error handling.
- Enhance reporting and fee receipt generation.
- Add automated tests.
- Improve deployment and setup documentation.

## Author

**Shourya Thakur**

GitHub: [Shourya-Thakur](https://github.com/Shourya-Thakur)

---

This project is being developed and improved incrementally.