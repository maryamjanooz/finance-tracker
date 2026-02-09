import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all invoices
export const getInvoices = async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

// Get single invoice
export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id }
        });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
};

// Create invoice
export const createInvoice = async (req, res) => {
    try {
        const { clientName, clientEmail, amount, status, date, dueDate, items } = req.body;

        const newInvoice = await prisma.invoice.create({
            data: {
                clientName,
                clientEmail,
                amount: parseFloat(amount),
                status: status || 'PENDING',
                date: date ? new Date(date) : new Date(),
                dueDate: dueDate ? new Date(dueDate) : null,
                items: JSON.stringify(items) // Storing items as JSON string for simplicity
            }
        });
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

// Update invoice
export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientName, clientEmail, amount, status, date, dueDate, items } = req.body;

        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                clientName,
                clientEmail,
                amount: parseFloat(amount),
                status,
                date: date ? new Date(date) : undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                items: items ? JSON.stringify(items) : undefined
            }
        });
        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update invoice' });
    }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.invoice.delete({
            where: { id }
        });
        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
};
