import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Earnings = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data - in real app, this would come from API
  const earningsData = {
    month: {
      total: 2840,
      completed: 18,
      pending: 320,
      chart: [1200, 1800, 2100, 2840]
    },
    quarter: {
      total: 7840,
      completed: 52,
      pending: 680,
      chart: [2100, 2900, 7840]
    },
    year: {
      total: 28400,
      completed: 189,
      pending: 2400,
      chart: [18400, 21000, 24000, 28400]
    }
  };

  const recentTransactions = [
    {
      id: 1,
      task: 'House Cleaning - Downtown',
      client: 'Sarah Johnson',
      amount: 80,
      status: 'completed',
      date: '2024-01-15',
      fee: 8
    },
    {
      id: 2,
      task: 'Plumbing Repair - West Side',
      client: 'Mike Chen',
      amount: 150,
      status: 'completed',
      date: '2024-01-14',
      fee: 15
    },
    {
      id: 3,
      task: 'Electrical Work - North Area',
      client: 'Lisa Park',
      amount: 200,
      status: 'pending',
      date: '2024-01-13',
      fee: 20
    },
    {
      id: 4,
      task: 'Garden Maintenance',
      client: 'David Wilson',
      amount: 120,
      status: 'completed',
      date: '2024-01-12',
      fee: 12
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const periods = [
    { id: 'month', label: 'This Month', data: earningsData.month },
    { id: 'quarter', label: 'This Quarter', data: earningsData.quarter },
    { id: 'year', label: 'This Year', data: earningsData.year }
  ];

  const currentPeriod = periods.find(p => p.id === selectedPeriod);

  return (
    <div className="page-container">
      <div className="section-container">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings Dashboard</h1>
              <p className="text-gray-600">
                Track your income and financial performance as a service provider
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Service Category</p>
              <p className="text-lg font-medium text-gray-900 capitalize">
                {user?.serviceCategory || 'General'}
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Earnings Overview</h2>
            <div className="flex space-x-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold">${currentPeriod.total.toLocaleString()}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Completed Tasks</p>
                  <p className="text-3xl font-bold">{currentPeriod.completed}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Payment</p>
                  <p className="text-3xl font-bold">${currentPeriod.pending.toLocaleString()}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">Showing {currentPeriod.label} data</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Task</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Platform Fee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">{transaction.task}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{transaction.client}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">${transaction.amount}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-500">${transaction.fee}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Fee Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Platform Fee Rate</span>
                <span className="text-sm font-medium text-gray-900">10%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Platform Fees</span>
                <span className="text-sm font-medium text-gray-900">$55</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Earnings</span>
                <span className="text-sm font-medium text-green-600">$2,785</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Task Value</span>
                <span className="text-sm font-medium text-gray-900">$158</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-medium text-gray-900">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Rating</span>
                <span className="text-sm font-medium text-gray-900">4.8/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
