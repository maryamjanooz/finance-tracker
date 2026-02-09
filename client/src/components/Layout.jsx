import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Receipt, CreditCard, Menu, X, Moon, Sun, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, currentUser } = useAuth(); // Helper to access auth state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Receipt, label: 'Invoices', path: '/invoices' },
        { icon: CreditCard, label: 'Expenses', path: '/expenses' },
    ];

    return (
        <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none",
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-r border-gray-200",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="h-full flex flex-col">
                    <div className={clsx("p-6 border-b", darkMode ? "border-gray-700" : "border-gray-100")}>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            FinTrack
                        </h1>
                        {currentUser && (
                            <p className={clsx("text-xs mt-1 truncate", darkMode ? "text-gray-400" : "text-gray-500")}>
                                {currentUser.name || currentUser.email}
                            </p>
                        )}
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                            : (darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")
                                    )}
                                >
                                    <Icon size={20} className={isActive ? "text-indigo-600" : (darkMode ? "text-gray-500" : "text-gray-400")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className={clsx("p-4 border-t space-y-2", darkMode ? "border-gray-700" : "border-gray-100")}>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 font-medium",
                                darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-400" />}
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 font-medium text-red-500 hover:bg-red-50",
                                darkMode ? "hover:bg-red-900/20" : ""
                            )}
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={clsx("flex-1 overflow-y-auto w-full transition-colors duration-200", darkMode ? "bg-gray-900 text-white" : "")}>
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
