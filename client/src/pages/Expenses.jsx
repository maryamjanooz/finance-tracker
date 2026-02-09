import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash, Filter, X } from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Filter State
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const fetchExpenses = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/expenses');
            setExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/expenses', formData);
            setShowForm(false);
            setFormData({
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
            fetchExpenses();
        } catch (error) {
            console.error('Error creating expense:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            try {
                await axios.delete(`http://localhost:3001/api/expenses/${id}`);
                fetchExpenses();
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }
    };

    // Filter Logic
    const filteredExpenses = expenses.filter(expense => {
        const matchesCategory = expense.category.toLowerCase().includes(categoryFilter.toLowerCase());
        const expenseDate = new Date(expense.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        const matchesStart = startDate ? expenseDate >= startDate : true;
        const matchesEnd = endDate ? expenseDate <= endDate : true;

        return matchesCategory && matchesStart && matchesEnd;
    });

    const clearFilters = () => {
        setCategoryFilter('');
        setDateRange({ start: '', end: '' });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    New Expense
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex items-center gap-2 text-gray-600">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium text-sm">Filters:</span>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <input
                        type="text"
                        placeholder="Filter by Category..."
                        className="border p-2 rounded-lg text-sm"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">From:</span>
                        <input
                            type="date"
                            className="border p-2 rounded-lg text-sm w-full"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">To:</span>
                        <input
                            type="date"
                            className="border p-2 rounded-lg text-sm w-full"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {(categoryFilter || dateRange.start || dateRange.end) && (
                        <button
                            onClick={clearFilters}
                            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
                        >
                            <X className="h-3 w-3" /> Clear
                        </button>
                    )}
                    <button
                        onClick={() => {
                            const headers = ['ID,Category,Date,Amount,Description'];
                            const csvContent = expenses.map(exp =>
                                `${exp.id},"${exp.category}","${new Date(exp.date).toLocaleDateString()}",${exp.amount},"${exp.description}"`
                            ).join('\n');
                            const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'expenses.csv';
                            a.click();
                        }}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        CSV
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Add New Expense</h2>
                        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Category (e.g. Office, Travel)"
                            className="border p-2 rounded"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            className="border p-2 rounded"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            className="border p-2 rounded"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium">
                                Save Expense
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-3 px-4 font-medium text-gray-500">Date</th>
                            <th className="py-3 px-4 font-medium text-gray-500">Category</th>
                            <th className="py-3 px-4 font-medium text-gray-500">Description</th>
                            <th className="py-3 px-4 font-medium text-gray-500 text-right">Amount</th>
                            <th className="py-3 px-4 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="py-3 px-4 font-medium">{expense.category}</td>
                                <td className="py-3 px-4 text-gray-500">{expense.description}</td>
                                <td className="py-3 px-4 text-right font-medium text-red-600">-${expense.amount.toFixed(2)}</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button onClick={() => handleDelete(expense.id)} className="text-red-500 hover:text-red-700">
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredExpenses.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">No expenses found matching filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Expenses;
