import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Calculate Total Income (from paid invoices + income transactions if any)
        // For now, let's assume Invoices are the primary source of income
        const paidInvoices = await prisma.invoice.aggregate({
            where: { status: 'PAID' },
            _sum: { amount: true },
        });
        const totalIncome = paidInvoices._sum.amount || 0;

        // 2. Calculate Total Expenses
        const expenses = await prisma.expense.aggregate({
            _sum: { amount: true },
        });
        const totalExpenses = expenses._sum.amount || 0;

        // 3. Current Balance
        const balance = totalIncome - totalExpenses;

        // 4. Recent Transactions (Invoices and Expenses combined/sorted)
        // Fetch last 5 invoices
        const recentInvoices = await prisma.invoice.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            select: { id: true, clientName: true, amount: true, date: true, status: true }
        });

        // Fetch last 5 expenses
        const recentExpenses = await prisma.expense.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            select: { id: true, category: true, amount: true, date: true }
        });

        // Combine and sort
        const recentTransactions = [
            ...recentInvoices.map(i => ({ ...i, type: 'INCOME', description: `Invoice for ${i.clientName}` })),
            ...recentExpenses.map(e => ({ ...e, type: 'EXPENSE', description: e.category }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);


        // 5. Expense Breakdown by Category
        const expensesByCategory = await prisma.expense.groupBy({
            by: ['category'],
            _sum: {
                amount: true,
            },
        });

        // Format for frontend
        const expenseChartData = expensesByCategory.map(item => ({
            name: item.category,
            value: item._sum.amount
        }));

        res.json({
            totalIncome,
            totalExpenses,
            balance,
            recentTransactions,
            expenseChartData
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
