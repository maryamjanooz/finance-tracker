Overview
This is a full-stack Finance Tracker application built with the following technologies:

Frontend: React, Vite, Tailwind CSS, Recharts
Backend: Node.js, Express, Prisma (SQLite)
Features
Dashboard: View key financial metrics (Income, Expenses, Balance), recent transactions, and visualize income vs expenses with charts.
Invoices: Create, view, update, and delete invoices. Includes capabilities to filter/search invoices and print the list as a PDF.
Expenses: Track expenses with categories and descriptions.
Responsive Design: Works on desktop and mobile.
Prerequisites
Node.js (v18 or higher)
npm
Setup & Run Instructions
1. Backend Setup
The backend server runs on port 3001. It uses a local SQLite database (dev.db).

Navigate to the server directory:
bash
cd server
Install dependencies:
bash
npm install
Initialize the database:
bash
npx prisma generate
npx prisma db push
Start the server:
bash
npm start
You should see: Server is running on port 3001
2. Frontend Setup
The frontend client runs on Vite (default port 5173, but may fallback if busy).

Navigate to the client directory (in a new terminal):
bash
cd client
Install dependencies:
bash
npm install
Start the development server:
bash
npm run dev
You should see a URL like http://localhost:5173 (or 5174/5175). Open this in your browser.
