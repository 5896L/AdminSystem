import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function ArticleManage() {
  const [articles, setArticles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticleData, setNewArticleData] = useState({
    likeNum: 0,
    commentsLen: 0,
    reposts_count: 0,
    region: '',
    content: '',
    create_time: '',
    type: '',
    detailUrl: '',
    author_name: '',
    authorDetail: ''
  });

  const [searchField, setSearchField] = useState('author_name');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = articles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articles.length / itemsPerPage);

  const fieldPlaceholders = {
    likeNum: '点赞数',
    commentsLen: '评论数',
    reposts_count: '转发数',
    region: '地区',
    content: '内容',
    create_time: '创建时间',
    type: '类型',
    detailUrl: '原文链接',
    author_name: '作者名称',
    authorDetail: '作者详情'
  };

  const fetchArticles = async (query = {}) => {
    try {
      const params = {};
      if (query.field && query.value) {
        if (query.field === 'author_name') params.author = query.value;
        else if (query.field === 'region') params.region = query.value;
      }
      const res = await axios.get('/api/articles', { params });
      setArticles(res.data.data || []);
    } catch {
      alert('加载文章失败');
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleEdit = (article) => {
    setEditingId(article.id);
    setEditData({ ...article });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/articles/${editingId}`, editData);
      setEditingId(null);
      setEditData({});
      fetchArticles();
    } catch {
      alert('保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`确定删除文章 ${id} 吗？`)) {
      try {
        await axios.delete(`/api/articles/${id}`);
        fetchArticles();
      } catch {
        alert('删除失败');
      }
    }
  };

  const handleNewArticleChange = (field, value) => {
    setNewArticleData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddArticle = async () => {
    try {
      const preparedData = {
        ...newArticleData,
        likeNum: Number(newArticleData.likeNum) || 0,
        commentsLen: Number(newArticleData.commentsLen) || 0,
        reposts_count: Number(newArticleData.reposts_count) || 0,
      };

      await axios.post('/api/articles', preparedData);
      setShowAddModal(false);
      setNewArticleData({
        likeNum: '',
        commentsLen: '',
        reposts_count: '',
        region: '',
        content: '',
        create_time: '',
        type: '',
        detailUrl: '',
        author_name: '',
        authorDetail: ''
      });
      fetchArticles();
    } catch {
      alert('新增文章失败');
    }
  };

  const handleSearch = () => {
    fetchArticles({ field: searchField, value: searchValue.trim() });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">文章管理</h1>

      <div className="flex items-center gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={searchField}
          onChange={e => setSearchField(e.target.value)}
        >
          <option value="author_name">作者</option>
          <option value="region">地区</option>
        </select>
        <input
          className="border p-2 rounded flex-grow"
          placeholder="请输入查询值"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleSearch}
        >
          查询文章
        </button>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto"
          onClick={() => setShowAddModal(true)}
        >
          新增文章
        </button>
      </div>

      <div className="overflow-x-auto border rounded">
       <table className="w-full text-center border-collapse text-sm">
        <thead style={{ backgroundColor: '#1a2a6c', color: 'white' }}>
          <tr>
            {['作者', '创建时间', '地区', '类型', '情感', '点赞数', '评论数', '转发数', '原文链接', '操作'].map(text => (
              <th key={text} className="p-2 border border-gray-300">
                {text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!Array.isArray(currentArticles) || currentArticles.length === 0 ? (
            <tr>
              <td colSpan="10" className="py-4 font-semibold text-gray-500">
                暂无文章数据
              </td>
            </tr>
          ) : (
            currentArticles.map((article, idx) => {
              const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
              const isEditing = editingId === article.id;
              return (
                <tr key={article.id} className={`${rowBg} hover:bg-gray-100`}>
                  {isEditing ? (
                    <>
                      <td className="p-2 border border-gray-200">
                        <input
                          type="text"
                          value={editData.author_name}
                          onChange={e => setEditData({ ...editData, author_name: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                        />
                      </td>
                      <td className="p-2 border border-gray-200">
                        <input
                          type="text"
                          value={editData.create_time}
                          onChange={e => setEditData({ ...editData, create_time: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                        />
                      </td>
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
                          value={editData.type}
                          onChange={e => setEditData({ ...editData, type: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                        />
                      </td>
                      <td className="p-2 border border-gray-200">{article.emotion}</td>
                      <td className="p-2 border border-gray-200">
                        <input
                          type="number"
                          value={editData.likeNum}
                          onChange={e => setEditData({ ...editData, likeNum: Number(e.target.value) })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                        />
                      </td>
                      <td className="p-2 border border-gray-200">
                        <input
                          type="number"
                          value={editData.commentsLen}
                          onChange={e => setEditData({ ...editData, commentsLen: Number(e.target.value) })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                        />
                      </td>
                      <td className="p-2 border border-gray-200">
                        <input
                          type="number"
                          value={editData.reposts_count}
                          onChange={e => setEditData({ ...editData, reposts_count: Number(e.target.value) })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                        />
                      </td>
                      <td className="p-2 border border-gray-200">
                        <input
                          type="text"
                          value={editData.detailUrl}
                          onChange={e => setEditData({ ...editData, detailUrl: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                        />
                      </td>
                      <td className="p-2 border border-gray-200 space-x-2">
                        <button className="text-green-600 hover:underline" onClick={handleSave}>
                          保存
                        </button>
                        <button className="text-gray-600 hover:underline" onClick={handleCancel}>
                          取消
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 border border-gray-200">{article.author_name}</td>
                      <td className="p-2 border border-gray-200">{article.create_time}</td>
                      <td className="p-2 border border-gray-200">{article.region}</td>
                      <td className="p-2 border border-gray-200">{article.type}</td>
                      <td className="p-2 border border-gray-200">{article.emotion}</td>
                      <td className="p-2 border border-gray-200">{article.likeNum}</td>
                      <td className="p-2 border border-gray-200">{article.commentsLen}</td>
                      <td className="p-2 border border-gray-200">{article.reposts_count}</td>
                      <td className="p-2 border border-gray-200">{article.detailUrl}</td>
                      <td className="p-2 border border-gray-200 space-x-2">
                        <button
                          className="text-indigo-800 hover:underline"
                          onClick={() => handleEdit(article)}
                        >
                          修改
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(article.id)}
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

      {articles.length > itemsPerPage && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            上一页
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            下一页
          </button>
        </div>
      )}


{/* 图表展示区域 */}
<div className="mt-12">

  <div className="grid grid-cols-2 gap-8">
    {/* 1. 文章类型分布饼图 */}
    <div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: '#1a2a6c' }}>文章类型分布</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={Object.entries(
              articles.reduce((acc, cur) => {
                acc[cur.type] = (acc[cur.type] || 0) + 1;
                return acc;
              }, {})
            ).map(([name, value]) => ({ name, value }))}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {['#1a2a6c', '#3b82f6', '#6b7280', '#9ca3af', '#ef4444', '#10b981'].map((color, idx) => (
              <Cell key={idx} fill={color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db', color: '#1a2a6c' }}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#1a2a6c' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* 3. 评论数趋势折线图 */}
    <div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: '#1a2a6c' }}>评论数趋势（按创建日期）</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={Object.entries(
            articles.reduce((acc, cur) => {
              const date = cur.create_time?.slice(0, 10) || '未知';
              acc[date] = (acc[date] || 0) + cur.commentsLen;
              return acc;
            }, {})
          )
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({ date, count }))}
          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        >
        <XAxis
        dataKey="date"
        tick={{ fontSize: 12, fill: '#1a2a6c' }}
        interval={3}
        angle={-45}
        textAnchor="end"
        axisLine={{ stroke: '#6b7280' }}
        tickLine={false}
        />
          <YAxis stroke="#6b7280" tick={{ fill: '#1a2a6c' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db', color: '#1a2a6c' }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#1a2a6c' }} />
          <Bar dataKey="count" fill="#1a2a6c" name="评论数" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>



      {/* 新增文章弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">新增文章</h2>
            {Object.keys(newArticleData).map(field => (
                <input
                  type={['likeNum', 'commentsLen', 'reposts_count'].includes(field) ? 'number' : 'text'}
                  key={field}
                  name={field}
                  className="border p-2 mb-3 w-full"
                  placeholder={fieldPlaceholders[field] || field}
                  value={newArticleData[field]}
                  onChange={e => handleNewArticleChange(field, e.target.value)}
                />
              ))}
            <div className="flex justify-end gap-4">
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddArticle}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}