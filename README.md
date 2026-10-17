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

Make sure you have the following installed:

- Python 3
- MySQL Server
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Shourya-Thakur/fee-management-system.git
   cd fee-management-system
   ```

2. Install the Python dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Configure your MySQL database and local database connection settings.

4. Start the Flask application using the appropriate command for your project configuration.

> **Note:** Database setup instructions and the exact application startup command can be added once the project configuration is documented.

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