import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, trend, className }) => {
    return (
        <div className={clsx("bg-white p-6 rounded-xl shadow-sm border border-gray-100", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                    <Icon className="h-6 w-6 text-indigo-600" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    {trend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : trend < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                        <Minus className="h-4 w-4 text-gray-400 mr-1" />
                    )}
                    <span
                        className={clsx(
                            "font-medium",
                            trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500"
                        )}
                    >
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-gray-400 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default MetricCard;
