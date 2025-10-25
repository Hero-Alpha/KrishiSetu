import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS components ONCE
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesTrendChart = ({ data, chartType = 'bar', period = '30d' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No sales data available for this period
      </div>
    );
  }

  // Format data based on period
  const formatLabels = () => {
    return data.map(item => {
      const date = new Date(item.date);
      switch (period) {
        case '7d':
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        case '30d':
          return date.getDate().toString();
        case '90d':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case '1y':
          return date.toLocaleDateString('en-US', { month: 'short' });
        default:
          return date.getDate().toString();
      }
    });
  };

  const chartData = {
    labels: formatLabels(),
    datasets: [
      {
        label: 'Daily Revenue (₹)',
        data: data.map(item => item.revenue || 0),
        backgroundColor: chartType === 'bar' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        fill: chartType === 'line',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `Sales Trend - Last ${period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Revenue: ₹${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₹)'
        },
        ticks: {
          callback: function(value) {
            return '₹' + value;
          }
        }
      },
      x: {
        title: {
          display: true,
          text: period === '7d' ? 'Days' : period === '30d' ? 'Dates' : period === '90d' ? 'Dates' : 'Months'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    }
  };

  return (
    <div className="h-64 w-full">
      {chartType === 'line' ? (
        <Line data={chartData} options={options} key={`line-${period}`} />
      ) : (
        <Bar data={chartData} options={options} key={`bar-${period}`} />
      )}
    </div>
  );
};

export default SalesTrendChart;