import { useEffect, useState } from 'react';
import axios from 'axios';
import MetricCard from '../components/MetricCard';
import { DollarSign, CreditCard, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        recentTransactions: [],
        expenseChartData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    const data = [
        { name: 'Income', value: stats.totalIncome, color: '#10B981' },
        { name: 'Expenses', value: stats.totalExpenses, color: '#EF4444' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Income"
                    value={`$${stats.totalIncome.toFixed(2)}`}
                    icon={DollarSign}
                    trend={12}
                />
                <MetricCard
                    title="Total Expenses"
                    value={`$${stats.totalExpenses.toFixed(2)}`}
                    icon={CreditCard}
                    trend={-5}
                />
                <MetricCard
                    title="Current Balance"
                    value={`$${stats.balance.toFixed(2)}`}
                    icon={Wallet}
                    trend={8}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left font-medium">
                            <thead>
                                <tr className="border-b border-gray-100 text-sm text-gray-500">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Description</th>
                                    <th className="py-3 px-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {stats.recentTransactions.map((tx) => (
                                    <tr key={tx.id || Math.random()} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-600">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-gray-800">{tx.description || tx.clientName || tx.category}</td>
                                        <td className={`py-3 px-4 text-right ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {stats.recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-4 text-center text-gray-500">No recent transactions</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 w-full text-left">Income vs Expenses</h2>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8">
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 w-full text-left">Expense Breakdown</h2>
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.expenseChartData || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {(stats.expenseChartData || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
