// src/components/Dashboard.tsx
import { Button } from '@nextui-org/button';
import { Card } from '@nextui-org/card';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { format, subDays } from 'date-fns'; // Import date-fns functions

// Function to generate dynamic data for the portfolio chart
const generateChartData = () => {
  const currentDate = new Date();
  const data = [];

  // Create data points for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = subDays(currentDate, i); // Subtract days from the current date
    const formattedDate = format(date, 'MMM d'); // Format as 'Jan 1', 'Jan 2', etc.
    const value = Math.floor(Math.random() * 10000) + 35000; // Random value for demonstration

    data.push({ date: formattedDate, value });
  }

  return data.reverse(); // Reverse to show data from earliest to latest
};

const MyDashboard = () => {
  const [lineChartData, setLineChartData] = useState<any[]>([]);

  useEffect(() => {
    // Set the generated data when the component mounts
    setLineChartData(generateChartData());
  }, []);

  return (
    <div className="bg-default-50 border border-default-200 p-4 col-span-full space-y-5 rounded-md">
      {/* Exchange Section */}
      <Card className="bg-default-50 border border-default-200 p-4">
        <h2 className="text-xl font-semibold">Exchange</h2>
        {/* Exchange Details */}
        <Button className="w-full bg-sage-600 text-white hover:bg-sage-800 mt-3 ">
          Exchange
        </Button>
      </Card>

      {/* Calendar Section */}
      <Card className="bg-default-50 border border-default-200 p-4">
        <h2 className="text-xl font-semibold">{format(new Date(), 'MMM d')}</h2>
        {/* Calendar Grid */}
      </Card>

      {/* Portfolio Section */}
      <Card className="bg-default-50 border border-default-200 p-4">
        <h2 className="text-xl font-semibold">My Portfolio</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineChartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default MyDashboard;
