Finance Tracker
Project Overview

Finance Tracker is a full-stack web application that helps users manage their finances efficiently. Users can track income, expenses, and invoices, view key financial metrics on a dashboard, and visualize data with interactive charts. The app is responsive, working seamlessly on both desktop and mobile devices.

Features Implemented

Dashboard: View financial metrics (Income, Expenses, Balance), recent transactions, and charts for income vs expenses.

Invoices: Create, view, update, and delete invoices. Filter/search invoices and print as PDF.

Expenses: Track expenses with categories and descriptions.

Responsive Design: Optimized for desktop and mobile screens.

Bonus Features:

Expense Breakdown Chart (Pie chart)

Individual Invoice View/Print

Dark Mode toggle

CSV export for invoices and expenses

User authentication (Login/Register)

Recurring invoices with duplication feature

Technology Stack

Frontend: React, Vite, Tailwind CSS, Recharts

Backend: Node.js, Express

Database: SQLite (via Prisma ORM)

API: RESTful endpoints

Installation & Setup Instructions
Prerequisites

Node.js v18 or higher

npm

Backend Setup

Navigate to the server directory:

cd server


Install dependencies:

npm install


Initialize the database:

npx prisma generate
npx prisma db push


Start the backend server:

npm start


Server runs on port 3001 (check terminal if conflicts occur).

Frontend Setup

Open a new terminal and navigate to the client directory:

cd client


Install dependencies:

npm install


Start the development server:

npm run dev


Open the URL displayed (e.g., http://localhost:5173
) in your browser.

Assumptions / Design Decisions

Each invoice must belong to a client.

Email and form validation is implemented on both frontend and backend.

RESTful API endpoints handle CRUD operations for invoices and expenses.

Dashboard updates dynamically when invoices or expenses are added.

Known Issues / Limitations

No production deployment yet.

Some advanced filters for expenses may require further testing.

Future Improvements

Deploy the application online for live access.

Add advanced analytics and charts.

Implement notifications or reminders for recurring invoices.

Integrate user role management for multi-user access.

Verification Checklist

Dashboard loads with mock/empty data initially.

Adding an Invoice or Expense updates the dashboard stats and charts.

“Print List” opens print dialog on the Invoices page.

Search bar filters invoices by client name or status.

Dark mode toggle works.

CSV export works for Invoices and Expenses.

User authentication protects all routes.

Recurring invoices can be duplicated successfully.

Troubleshooting

Port Conflicts: If ports 3000 or 5173 are in use, check terminal output for updated URLs.

Database Issues: If SQLite errors occur, delete server/prisma/dev.db and run:

npx prisma db push
