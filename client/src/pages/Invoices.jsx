import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash, Edit, Search, Printer, X, Eye } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // View/Print State
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const invoicePrintRef = useRef();

    const handlePrintInvoice = useReactToPrint({
        content: () => invoicePrintRef.current,
        documentTitle: selectedInvoice ? `Invoice-${selectedInvoice.id}` : 'Invoice',
        onAfterPrint: () => console.log('Print success')
    });

    // Form State
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        isRecurring: false,
        recurringInterval: 'MONTHLY'
    });

    const [items, setItems] = useState([
        { id: 1, description: '', quantity: 1, price: 0 }
    ]);
    const [taxRate, setTaxRate] = useState(0);

    const componentRef = useRef();
    const handlePrintList = useReactToPrint({
        content: () => componentRef.current,
    });

    const fetchInvoices = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/invoices');
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Calculation Logic
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            amount: grandTotal,
            items: items // This will be stringified by the backend or we can do it here if needed, but backend controller handles it
        };

        try {
            await axios.post('http://localhost:3001/api/invoices', payload);
            setShowForm(false);
            // Reset Form
            setFormData({
                clientName: '',
                clientEmail: '',
                status: 'PENDING',
                date: new Date().toISOString().split('T')[0],
                dueDate: '',
                isRecurring: false,
                recurringInterval: 'MONTHLY'
            });
            setItems([{ id: Date.now(), description: '', quantity: 1, price: 0 }]);
            setTaxRate(0);
            fetchInvoices();
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            try {
                await axios.delete(`http://localhost:3001/api/invoices/${id}`);
                fetchInvoices();
            } catch (error) {
                console.error('Error deleting invoice:', error);
            }
        }
    };

    const handleDuplicate = (invoice) => {
        setFormData({
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail || '',
            status: 'PENDING',
            date: new Date().toISOString().split('T')[0],
            dueDate: '',
            isRecurring: invoice.isRecurring || false,
            recurringInterval: invoice.recurringInterval || 'MONTHLY'
        });

        // Parse items if they are a string (legacy support)
        let parsedItems = [];
        try {
            parsedItems = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
        } catch (e) {
            parsedItems = [];
        }

        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            setItems(parsedItems.map(item => ({ ...item, id: Date.now() + Math.random() })));
        } else {
            setItems([{ id: Date.now(), description: '', quantity: 1, price: 0 }]);
        }

        setShowForm(true);
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            const headers = ['ID,Client Name,Client Email,Date,Amount,Status'];
                            const csvContent = invoices.map(inv =>
                                `${inv.id},"${inv.clientName}","${inv.clientEmail}","${new Date(inv.date).toLocaleDateString()}",${inv.amount},${inv.status}`
                            ).join('\n');
                            const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'invoices.csv';
                            a.click();
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Export CSV
                    </button>
                    <button
                        onClick={handlePrintList}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200"
                    >
                        <Printer className="h-4 w-4" />
                        Print List
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        New Invoice
                    </button>
                </div>
            </div>

            {/* Create Invoice Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Create New Invoice</h2>
                        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Client Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Client Name"
                                className="border p-2 rounded"
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Client Email"
                                className="border p-2 rounded"
                                value={formData.clientEmail}
                                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                            />
                            <select
                                className="border p-2 rounded"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                                <option value="OVERDUE">Overdue</option>
                            </select>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    className="border p-2 rounded w-full"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="date"
                                    placeholder="Due Date"
                                    className="border p-2 rounded w-full"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Recurring Option */}
                        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">Recurring Invoice</label>
                            </div>

                            {formData.isRecurring && (
                                <select
                                    className="border p-1 rounded text-sm"
                                    value={formData.recurringInterval}
                                    onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                                >
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
                                </select>
                            )}
                        </div>

                        {/* Line Items */}
                        <div className="space-y-2">
                            <h3 className="font-medium text-gray-700">Line Items</h3>
                            {items.map((item, index) => (
                                <div key={item.id} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        className="border p-2 rounded flex-1"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        className="border p-2 rounded w-20"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="border p-2 rounded w-24"
                                        min="0"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                    <div className="w-24 text-right font-medium text-gray-600">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        disabled={items.length === 1}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" /> Add Item
                            </button>
                        </div>

                        {/* Totals */}
                        <div className="border-t pt-4 flex flex-col items-end space-y-2">
                            <div className="flex justify-between w-64 text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-64 items-center">
                                <span className="text-gray-600 text-sm">Tax Rate (%):</span>
                                <input
                                    type="number"
                                    className="border p-1 rounded w-16 text-right text-sm"
                                    min="0"
                                    max="100"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex justify-between w-64 text-sm">
                                <span className="text-gray-600">Tax Amount:</span>
                                <span className="font-medium">${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-64 text-lg font-bold border-t pt-2 mt-2">
                                <span>Grand Total:</span>
                                <span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium shadow-sm">
                                Save Invoice
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Individual Invoice Modal / View */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-lg font-bold">Invoice Details</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-2 hover:bg-indigo-700 text-sm"
                                >
                                    <Printer className="h-4 w-4" /> Print / Download PDF
                                </button>
                                <button onClick={() => setSelectedInvoice(null)} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8" ref={invoicePrintRef}>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-indigo-600">INVOICE</h1>
                                    <p className="text-gray-500">#{selectedInvoice.id}</p>
                                    {selectedInvoice.isRecurring && (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2 inline-block">
                                            Recurring: {selectedInvoice.recurringInterval}
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold text-gray-800">FinTrack App</h3>
                                    <p className="text-gray-600 text-sm">123 Finance Street</p>
                                    <p className="text-gray-600 text-sm">Business City, 54321</p>
                                </div>
                            </div>

                            <div className="flex justify-between mb-8">
                                <div>
                                    <h4 className="text-gray-500 text-sm font-medium mb-1">Bill To:</h4>
                                    <p className="font-bold text-gray-800">{selectedInvoice.clientName}</p>
                                    <p className="text-gray-600 text-sm">{selectedInvoice.clientEmail}</p>
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">
                                        <h4 className="text-gray-500 text-sm font-medium">Date:</h4>
                                        <p className="font-medium text-gray-800">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-500 text-sm font-medium">Due Date:</h4>
                                        <p className="font-medium text-gray-800">
                                            {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <table className="min-w-full text-left mb-8">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-2 px-2 font-medium text-gray-600 text-sm">Description</th>
                                        <th className="py-2 px-2 font-medium text-gray-600 text-sm text-right">Qty</th>
                                        <th className="py-2 px-2 font-medium text-gray-600 text-sm text-right">Price</th>
                                        <th className="py-2 px-2 font-medium text-gray-600 text-sm text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* Handle older invoices without items array or parse if string */}
                                    {(Array.isArray(selectedInvoice.items) ? selectedInvoice.items :
                                        typeof selectedInvoice.items === 'string' ? JSON.parse(selectedInvoice.items || '[]') :
                                            []
                                    ).map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 px-2 text-sm text-gray-800">{item.description}</td>
                                            <td className="py-2 px-2 text-sm text-gray-800 text-right">{item.quantity}</td>
                                            <td className="py-2 px-2 text-sm text-gray-800 text-right">${item.price ? Number(item.price).toFixed(2) : '0.00'}</td>
                                            <td className="py-2 px-2 text-sm text-gray-800 text-right font-medium">
                                                ${(item.quantity * Number(item.price || 0)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Fallback if no items found */}
                                    {(!selectedInvoice.items || (Array.isArray(selectedInvoice.items) && selectedInvoice.items.length === 0)) && (
                                        <tr>
                                            <td className="py-2 px-2 text-sm text-gray-800" colSpan="4">
                                                Main Service Charge (Legacy) - ${selectedInvoice.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="flex justify-end border-t pt-4">
                                <div className="w-48">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600 font-medium">Total:</span>
                                        <span className="text-2xl font-bold text-gray-800">${selectedInvoice.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 text-right mt-4">
                                        Status: <span className="font-bold uppercase">{selectedInvoice.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-b-xl border-t">
                            <p className="text-center text-xs text-gray-400">Thank you for your business!</p>
                        </div>
                    </div>
                </div>
            )}

            <div ref={componentRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                <div className="hidden print:block p-4 text-center text-xl font-bold">Invoice List - FinTrack</div>
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-3 px-4 font-medium text-gray-500">Client</th>
                            <th className="py-3 px-4 font-medium text-gray-500">Date</th>
                            <th className="py-3 px-4 font-medium text-gray-500">Amount</th>
                            <th className="py-3 px-4 font-medium text-gray-500">Status</th>
                            <th className="py-3 px-4 font-medium text-gray-500 text-right print:hidden">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        {invoice.clientName}
                                        {invoice.isRecurring && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded" title={`Recurring: ${invoice.recurringInterval}`}>
                                                Types: {invoice.recurringInterval && invoice.recurringInterval[0]}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-600">{new Date(invoice.date).toLocaleDateString()}</td>
                                <td className="py-3 px-4 font-medium">${invoice.amount.toFixed(2)}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold print:border print:border-gray-300
                    ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right space-x-2 print:hidden">
                                    <button
                                        onClick={() => handleDuplicate(invoice)}
                                        className="text-gray-500 hover:text-gray-700"
                                        title="Duplicate / Create Next"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </button>
                                    <button onClick={() => setSelectedInvoice(invoice)} className="text-indigo-600 hover:text-indigo-800">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(invoice.id)} className="text-red-500 hover:text-red-700">
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Invoices;
