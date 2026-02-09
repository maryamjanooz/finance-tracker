import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoice.controller.js';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expense.controller.js';

const router = express.Router();

// Dashboard
router.get('/dashboard', getDashboardStats);

// Invoices
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);
router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.delete('/expenses/:id', deleteExpense);

export default router;
