import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all expenses
export const getExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

// Create expense
export const createExpense = async (req, res) => {
    try {
        const { category, amount, date, description } = req.body;
        const newExpense = await prisma.expense.create({
            data: {
                category,
                amount: parseFloat(amount),
                date: date ? new Date(date) : new Date(),
                description
            }
        });
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create expense' });
    }
};

// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expense.delete({
            where: { id }
        });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};
