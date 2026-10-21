'use client';

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useGetAllPaymentsDatForAnalyticsQuery } from '@/src/redux/features/adminManagement/payment';
import { FaMoneyBillWave } from 'react-icons/fa';
import { TPayment } from '@/src/types';
import TableSkeleton from '@/src/components/ui/skeleton/tableSkeleton';
import ResentPaymentTable from './resentPaymentTable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MarketingAnalytics() {
  const { data: paymentsData, isLoading: loadingPayments } =
    useGetAllPaymentsDatForAnalyticsQuery(undefined);

  const { totalSales, totalProfit } = useMemo(() => {
    if (paymentsData?.data) {
      return calculateTotals(paymentsData.data);
    }

    return { totalSales: 0, totalProfit: 0 };
  }, [paymentsData]);

  // Chart Data definition
  const chartData = useMemo(
    () => ({
      labels: paymentsData?.data.map((payment: TPayment) => {
        const date = new Date(payment.createdAt);

        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: 'Total Sales',
          data: paymentsData?.data.map(
            (payment: TPayment) => payment.amount + payment.amount
          ),
          fill: false,
          borderColor: '#F687B3',
          tension: 0.1,
        },
        {
          label: 'Total Profit',
          data: paymentsData?.data.map(
            (payment: TPayment) => payment.amount - 300 + payment.amount - 300
          ),
          fill: false,
          borderColor: '#63B3ED',
          tension: 0.1,
        },
      ],
    }),
    [paymentsData]
  );

  return (
    <div className="space-y-5">
      <div className="bg-default-50 p-3 rounded-lg mt-5">
        <h3 className="text-xl font-bold mb-4 text-sage-500 dark:text-sage-400">
          Marketing Analytics
        </h3>
        {loadingPayments && <TableSkeleton />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:5 mb-5">
          <div className="bg-gradient-to-br from-sage-700/90 to-sage-600/90 px-5 py-6 text-center text-lg font-semibold rounded-xl shadow-md text-white flex items-center justify-center">
            <FaMoneyBillWave className="text-lg md:text-3xl mr-1" />
            <p className="text-s">Total Sales: ${totalSales}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/90 to-blue-300/80 px-5 py-6 text-center text-lg font-semibold rounded-xl shadow-md text-white flex items-center justify-center">
            <FaMoneyBillWave className="text-lg md:text-3xl mr-1" />
            <p className="text-s"> Total Profit: ${totalProfit}</p>
          </div>
        </div>
        <div className="chart-container mt-4">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Sales and Profit Overview',
                },
              },
            }}
          />
        </div>
      </div>
      <div className="bg-default-50 p-3 rounded-lg mt-5">
        <h3 className="text-xl font-bold mb-4 text-sage-500 dark:text-sage-400">
          Recent Payments
        </h3>
        {loadingPayments && <TableSkeleton />}
        <ResentPaymentTable
          payments={paymentsData?.data.slice(0, 5) || []}
          isLoading={loadingPayments}
        />
      </div>
    </div>
  );
}

// Utility function to calculate total sales and profit
function calculateTotals(payments: TPayment[]) {
  let totalSales = 0;
  let totalProfit = 0;

  payments.forEach((payment) => {
    totalSales += payment.amount || 0;
    totalProfit += payment.amount - 300 || 0;
  });

  return { totalSales, totalProfit };
}
