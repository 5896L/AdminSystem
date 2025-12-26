import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';

// 时间格式化函数
function formatDateTime(datetimeStr) {
  if (!datetimeStr) return '无';
  const date = new Date(datetimeStr);
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function CommentManage() {
  const [comments, setComments] = useState([]);
  const [editingid, setEditingid] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newComment, setNewComment] = useState({
    region: '',
    content: '',
    authorName: '',
    authorAddress: '',
  });
  const [searchField, setSearchField] = useState('authorName');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 加载数据
  const fetchComments = async (query = {}) => {
    try {
      const params = {};
      if (query.field && query.value) {
        params.field = query.field;
        params.value = query.value;
      }
      const res = await axios.get('/api/comments2', { params });
      setComments(res.data.data || []);
      setCurrentPage(1);
    } catch {
      alert('加载评论失败');
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleEdit = (comment) => {
    setEditingid(comment.id);
    setEditData({ ...comment });
  };
  const handleCancel = () => {
    setEditingid(null);
    setEditData({});
  };
  const handleSave = async () => {
    try {
      await axios.put(`/api/comments/${editingid}`, editData);
      setEditingid(null);
      setEditData({});
      fetchComments();
    } catch {
      alert('保存失败');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm(`确定删除评论 ${id} 吗？`)) {
      try {
        await axios.delete(`/api/comments/${id}`);
        fetchComments();
      } catch {
        alert('删除失败');
      }
    }
  };
  const handleAddSubmit = async () => {
    if (!newComment.content.trim()) {
      alert('内容不能为空');
      return;
    }
    const payload = {
      ...newComment,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      likes_counts: parseInt(newComment.likes_counts || 0, 10),
    };
    try {
      await axios.post('/api/comments', payload);
      setShowAdd(false);
      setNewComment({
        region: '',
        content: '',
        authorName: '',
        authorGender: '',
        authorAddress: '',
        articleId: '',
        likes_counts: 0,
      });
      fetchComments();
    } catch {
      alert('新增失败');
    }
  };
  const handleSearch = () => {
    fetchComments({ field: searchField, value: searchValue.trim() });
  };

  // 分页
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const currentPageData = comments.slice(startIdx, endIdx);
  const totalPages = Math.ceil(comments.length / pageSize);

  // 图表数据处理
  // 按地区统计
  const regionStats = {};
  // 按情感统计
  const sentimentStats = {};
  // 按日期统计新增评论数（YYYY-MM-DD）
  const dateStats = {};

  comments.forEach(c => {
    if (c.region) {
      regionStats[c.region] = (regionStats[c.region] || 0) + 1;
    }
    if (c.sentiment) {
      sentimentStats[c.sentiment] = (sentimentStats[c.sentiment] || 0) + 1;
    }
    if (c.created_at) {
      const day = c.created_at.slice(0, 10);
      dateStats[day] = (dateStats[day] || 0) + 1;
    }
  });

  const regionData = Object.entries(regionStats).map(([region, count]) => ({ region, count }));
  const sentimentData = Object.entries(sentimentStats).map(([sentiment, count]) => ({ name: sentiment, value: count }));
  const dateData = Object.entries(dateStats).sort((a,b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));

  // 饼图颜色（多选几种藏蓝系色）
  const pieColors = ['#1a2a6c', '#0096c7', '#e63946', '#f4a261', '#4338CA'];

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-indigo-900">评论管理</h1>

      {/* 顶部查询 + 新增按钮 */}
      <div className="flex items-center gap-4 mb-6">
        <select
          className="border border-indigo-700 text-indigo-900 p-2 rounded"
          value={searchField}
          onChange={e => setSearchField(e.target.value)}
        >
          <option value="authorName">作者</option>
          <option value="region">地区</option>
        </select>

        <input
          className="border border-indigo-700 text-indigo-900 p-2 rounded flex-grow"
          placeholder="请输入查询值"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
        />

        <button
          className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800"
          onClick={handleSearch}
        >
          查询评论
        </button>

        <button
          className="bg-indigo-900 text-white px-4 py-2 rounded hover:bg-indigo-950 ml-auto"
          onClick={() => setShowAdd(true)}
        >
          新增评论
        </button>
      </div>

      {/* 新增评论弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-semibold mb-4 text-indigo-900">新增评论</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="文章 ID"
                value={newComment.articleId || ''}
                onChange={e => setNewComment({ ...newComment, articleId: e.target.value })}
                className="w-full border border-indigo-700 rounded px-2 py-1 text-indigo-900"
              />
              <input
                type="text"
                placeholder="地区"
                value={newComment.region}
                onChange={e => setNewComment({ ...newComment, region: e.target.value })}
                className="w-full border border-indigo-700 rounded px-2 py-1 text-indigo-900"
              />
              <input
                type="text"
                placeholder="内容"
                value={newComment.content}
                onChange={e => setNewComment({ ...newComment, content: e.target.value })}
                className="w-full border border-indigo-700 rounded px-2 py-1 text-indigo-900"
              />
              <input
                type="text"
                placeholder="作者"
                value={newComment.authorName}
                onChange={e => setNewComment({ ...newComment, authorName: e.target.value })}
                className="w-full border border-indigo-700 rounded px-2 py-1 text-indigo-900"
              />
              <input
                type="text"
                placeholder="作者性别"
                value={newComment.authorGender || ''}
                onChange={e => setNewComment({ ...newComment, authorGender: e.target.value })}
                className="w-full border border-indigo-700 rounded px-2 py-1 text-indigo-900"
              />
              <input
                type="text"
                placeholder="作者地址"
                value={newComment.authorAddress}
                onChange={e => setNewComment({ ...newComment, authorAddress: e.target.value })}
                className="w-full border border-indigo-700 rounded px-2 py-1 text-indigo-900"
              />
              <input
                type="number"
                placeholder="点赞数"
                value={newComment.likes_counts || ''}
                onChange={e => setNewComment({ ...newComment, likes_counts: e.target.value })}
                className="w-full border border-indigo-700 rounded px-2 py-1 text-indigo-900"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

{/* 评论表格 */}
<div className="overflow-x-auto border border-gray-300 rounded shadow">
  <table className="w-full text-center border-collapse text-sm">
    <thead style={{ backgroundColor: '#1a2a6c', color: 'white' }}>
      <tr>
        {['评论id', '创建时间', '地区', '评论内容', '作者', '作者地址', '情感', '操作'].map(text => (
          <th key={text} className="p-2 border border-gray-300">
            {text}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {!Array.isArray(comments) || comments.length === 0 ? (
        <tr>
          <td colSpan="8" className="py-4 font-semibold text-gray-500">
            暂无评论数据
          </td>
        </tr>
      ) : (
        currentPageData.map((comment, idx) => {
          const isEditing = editingid === comment.id;
          const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';

          return (
            <tr key={comment.id} className={`${rowBg} hover:bg-gray-100`}>
              {isEditing ? (
                <>
                  <td className="p-2 border border-gray-200">{comment.id}</td>
                  <td className="p-2 border border-gray-200">{comment.created_at}</td>
                  <td className="p-2 border border-gray-200">
                    <input
                      type="text"
                      value={editData.region}
                      onChange={e => setEditData({ ...editData, region: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                    />
                  </td>
                  <td className="p-2 border border-gray-200">
                    <input
                      type="text"
                      value={editData.content}
                      onChange={e => setEditData({ ...editData, content: e.target.value })}
                      className="w-32 border border-gray-300 rounded px-2 py-1 text-gray-700"
                    />
                  </td>
                  <td className="p-2 border border-gray-200">
                    <input
                      type="text"
                      value={editData.authorName}
                      onChange={e => setEditData({ ...editData, authorName: e.target.value })}
                      className="max-w-xs w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                    />
                  </td>
                  <td className="p-2 border border-gray-200">
                    <input
                      type="text"
                      value={editData.authorAddress}
                      onChange={e => setEditData({ ...editData, authorAddress: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                    />
                  </td>
                  <td className="p-2 border border-gray-200">{comment.sentiment}</td>
                  <td className="p-2 border border-gray-200 space-x-2">
                    <button
                      className="text-green-600 hover:underline"
                      onClick={handleSave}
                    >
                      保存
                    </button>
                    <button
                      className="text-gray-600 hover:underline"
                      onClick={handleCancel}
                    >
                      取消
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2 border border-gray-200">{comment.id}</td>
                  <td className="p-2 border border-gray-200">{comment.created_at}</td>
                  <td className="p-2 border border-gray-200">{comment.region}</td>
                  <td className="p-2 border border-gray-200">{comment.content}</td>
                  <td className="p-2 border border-gray-200">{comment.authorName}</td>
                  <td className="p-2 border border-gray-200">{comment.authorAddress}</td>
                  <td className="p-2 border border-gray-200">{comment.sentiment}</td>
                  <td className="p-2 border border-gray-200 space-x-2">
                    <button
                      className="text-indigo-800 hover:underline"
                      onClick={() => handleEdit(comment)}
                    >
                      修改
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(comment.id)}
                    >
                      删除
                    </button>
                  </td>
                </>
              )}
            </tr>
          );
        })
      )}
    </tbody>
  </table>

</div>


      {/* 分页控件 */}
      {comments.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-indigo-200 rounded disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          <span className="text-indigo-900 font-semibold">
            第 {currentPage} 页 / 共 {totalPages} 页
          </span>
          <button
            className="px-4 py-2 bg-indigo-200 rounded disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            下一页
          </button>
        </div>
      )}

        {/* 图表展示区 */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-indigo-900">
          {/* 地区统计柱状图 */}
          <div className="rounded shadow p-4">
            <h3 className="text-lg font-semibold mb-2 text-center">评论数按地区统计</h3>
            {regionData.length === 0 ? (
              <p className="text-center text-indigo-400">暂无数据</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={regionData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="region" tick={{ fill: '#3730a3' }} />
                  <YAxis tick={{ fill: '#3730a3' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4338CA" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 情感分类饼图 */}
          <div className="rounded shadow p-4">
            <h3 className="text-lg font-semibold mb-2 text-center">评论情感分类比例</h3>
            {sentimentData.length === 0 ? (
              <p className="text-center text-indigo-400">暂无数据</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        {/* 新增评论趋势折线图 */}
        <div className="rounded shadow p-4">
          <h3 className="text-lg font-semibold mb-2 text-center">每日新增评论趋势</h3>
          {dateData.length === 0 ? (
            <p className="text-center text-indigo-400">暂无数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dateData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="date" tick={{ fill: '#3730a3' }} />
                <YAxis tick={{ fill: '#3730a3' }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>


   
    </div>
  );
}
