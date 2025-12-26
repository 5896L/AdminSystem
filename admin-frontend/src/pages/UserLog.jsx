import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#1a2a6c', '#b21f1f', '#00bcd4', '#ffc658', '#8884d8', '#4caf50', '#f06292'];

// 时间格式化函数
function formatDateTime(datetimeStr) {
  if (!datetimeStr) return '无';
  const date = new Date(datetimeStr);
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function UserLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    axios.get('http://localhost:5000/api/logs')
      .then(res => {
        if (res.data.code === 200) setLogs(res.data.data);
        else setError('获取日志失败：' + res.data.msg);
      })
      .catch(() => setError('网络错误：无法获取日志'))
      .finally(() => setLoading(false));
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1) page = 1;
    else if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const exportToCSV = () => {
    const headers = ['ID,用户操作,时间'];
    const rows = logs.map(log =>
      `${log.id},"${log.operation}","${formatDateTime(log.time)}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '用户系统日志.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOperationStats = () => {
    const statMap = {};
    logs.forEach(log => {
      statMap[log.operation] = (statMap[log.operation] || 0) + 1;
    });
    return Object.entries(statMap).map(([operation, count]) => ({ operation, count }));
  };

  const getHourlyStats = () => {
    const hourMap = Array(24).fill(0);
    logs.forEach(log => {
      const date = new Date(log.time);
      hourMap[date.getHours()]++;
    });
    return hourMap.map((count, hour) => ({ hour: `${hour}:00`, count }));
  };

  const getDailyTrend = () => {
    const map = {};
    logs.forEach(log => {
      const date = new Date(log.time).toISOString().split('T')[0];
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#1a2a6c]">用户系统日志</h2>
        <button
          onClick={exportToCSV}
          className="ml-auto px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
        >
          导出用户日志
        </button>
      </div>

      {loading && <p>加载中...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>暂无日志记录。</p>}

      {!loading && !error && logs.length > 0 && (
        <>
          <div className="overflow-x-auto border rounded shadow">
            <table className="w-full text-sm text-center border-collapse">
              <thead style={{ backgroundColor: '#1a2a6c', color: 'white' }}>
                <tr>
                  <th className="p-2 border border-gray-300">ID</th>
                  <th className="p-2 border border-gray-300">用户操作</th>
                  <th className="p-2 border border-gray-300">时间</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, idx) => (
                  <tr key={log.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 border border-gray-200">{log.id}</td>
                    <td className="p-2 border border-gray-200">{log.operation}</td>
                    <td className="p-2 border border-gray-200">{formatDateTime(log.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页按钮 */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  className={`px-3 py-1 border rounded ${page === currentPage ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              下一页
            </button>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1a2a6c]">用户操作频次统计</h3>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={getOperationStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="operation"  angle={60}          // 标签倾斜45度
                      textAnchor="start"  // 文字左对齐
                      interval={0}        // 显示所有标签，不自动省略
                      height={150} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1a2a6c" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1a2a6c]">活跃时间（按小时）</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getHourlyStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00bcd4" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1a2a6c]">操作类型占比</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={getOperationStats()}
                    dataKey="count"
                    nameKey="operation"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {getOperationStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1a2a6c]">每日操作趋势</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getDailyTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#f06292" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
