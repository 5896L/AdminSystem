import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ id: '', password: '', permission: '', ip: '' });
  const [searchField, setSearchField] = useState('ip');
  const [searchValue, setSearchValue] = useState('');

  const fetchUsers = async (query = {}) => {
    try {
      const params = {};
      if (query.field && query.value) {
        if (query.field === 'ip') params.ip = query.value;
        else if (query.field === 'permission') params.permission = query.value;
      }
      const res = await axios.get('/api/users2', { params });
      setUsers(res.data || []);
    } catch (err) {
      alert('加载用户失败');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      permission: user.permission,
      ip: user.ip
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/users/${editingId}`, editData);
      setEditingId(null);
      setEditData({});
      fetchUsers();
    } catch {
      alert('保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`确定删除用户 ${id} 吗？`)) {
      try {
        await axios.delete(`/api/users/${id}`);
        fetchUsers();
      } catch {
        alert('删除失败');
      }
    }
  };

  const handleNewUserChange = (field, value) => {
    setNewUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddUser = async () => {
    const { id, password, permission, ip } = newUserData;
    if (!id || !password || !permission || !ip) {
      alert('请完整填写所有新增用户信息');
      return;
    }
    try {
      await axios.post('/api/users', newUserData);
      setEditingId(null);  // ✅ 确保编辑状态清空
      setEditData({});
      setShowAddModal(false);
      setNewUserData({ id: '', password: '', permission: '', ip: '' });
      fetchUsers();        // ✅ 然后再刷新数据
    } catch {
      alert('新增用户失败');
    }
  };

  const handleSearch = () => {
    fetchUsers({ field: searchField, value: searchValue.trim() });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">用户管理</h1>

      {/* 查询 + 新增按钮区域 */}
      <div className="flex items-center gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={searchField}
          onChange={e => setSearchField(e.target.value)}
        >
          <option value="ip">IP地址</option>
          <option value="permission">权限</option>
        </select>
        <input
          className="border p-2 rounded flex-grow"
          placeholder={`请输入要查询的${searchField === 'ip' ? 'IP地址' : '权限'}`}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleSearch}
        >
          查询用户
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto"
          onClick={() => setShowAddModal(true)}
        >
          新增用户
        </button>
      </div>

      {/* 用户表格 */}
      <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm text-center border-collapse">
            <thead style={{ backgroundColor: '#1a2a6c', color: 'white' }}>
              <tr>
                <th className="p-2 border border-gray-300">ID</th>
                <th className="p-2 border border-gray-300">IP地址</th>
                <th className="p-2 border border-gray-300">创建时间</th>
                <th className="p-2 border border-gray-300">权限</th>
                <th className="p-2 border border-gray-300">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 font-semibold text-gray-500">暂无用户数据</td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const isEditing = String(editingId) === String(user.id);
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  return (
                    <tr key={user.id} className={`${rowBg} hover:bg-gray-100`}>
                      <td className="p-2 border border-gray-200">{user.id}</td>
                      <td className="p-2 border border-gray-200">
                        {isEditing ? (
                          <input
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                            value={editData.ip || ''}
                            onChange={e => handleChange('ip', e.target.value)}
                          />
                        ) : (
                          user.ip
                        )}
                      </td>
                      <td className="p-2 border border-gray-200">{user.create_time}</td>
                      <td className="p-2 border border-gray-200">
                        {isEditing ? (
                          <input
                            className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700"
                            value={editData.permission || ''}
                            onChange={e => handleChange('permission', e.target.value)}
                          />
                        ) : (
                          user.permission
                        )}
                      </td>
                      <td className="p-2 border border-gray-200 space-x-2">
                        {isEditing ? (
                          <>
                            <button className="text-green-600 hover:underline" onClick={handleSave}>保存</button>
                            <button className="text-gray-600 hover:underline" onClick={handleCancel}>取消</button>
                          </>
                        ) : (
                          <>
                            <button className="text-indigo-800 hover:underline" onClick={() => handleEdit(user)}>修改</button>
                            <button className="text-red-600 hover:underline" onClick={() => handleDelete(user.id)}>删除</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

      </div>


      
{/* 图表区 */}
<div className="mt-10">
  <h2 className="text-2xl font-bold mb-6" style={{ color: '#1a2a6c' }}>用户统计图表</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* 权限分布饼图 */}
    <div>
      <h3 className="text-xl font-semibold mb-3" style={{ color: '#1a2a6c' }}>权限分布（饼图）</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={Object.entries(users.reduce((acc, cur) => {
              acc[cur.permission] = (acc[cur.permission] || 0) + 1;
              return acc;
            }, {})).map(([name, value]) => ({ name, value }))}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {['#1a2a6c', '#6b7280', '#9ca3af', '#3b82f6', '#d1d5db'].map((color, idx) => (
              <Cell key={`cell-${idx}`} fill={color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db', color: '#1a2a6c' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* IP分布柱状图 */}
    <div>
      <h3 className="text-xl font-semibold mb-3" style={{ color: '#1a2a6c' }}>不同IP用户数量（柱状图）</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={Object.entries(users.reduce((acc, cur) => {
            acc[cur.ip] = (acc[cur.ip] || 0) + 1;
            return acc;
          }, {})).map(([ip, count]) => ({ ip, count }))}
          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        >
          <XAxis 
            dataKey="ip" 
            tick={{ fontSize: 12, fill: '#1a2a6c' }} 
            interval={0} 
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
          <Bar dataKey="count" fill="#1a2a6c" name="用户数量" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>




      
      {/* 新增用户弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">新增用户</h2>
            <input className="border p-2 mb-3 w-full" placeholder="用户ID" value={newUserData.id} onChange={e => handleNewUserChange('id', e.target.value)} />
            <input type="password" className="border p-2 mb-3 w-full" placeholder="密码" value={newUserData.password} onChange={e => handleNewUserChange('password', e.target.value)} />
            <input className="border p-2 mb-3 w-full" placeholder="IP地址 / 地区" value={newUserData.ip} onChange={e => handleNewUserChange('ip', e.target.value)} />
            <input className="border p-2 mb-3 w-full" placeholder="权限" value={newUserData.permission} onChange={e => handleNewUserChange('permission', e.target.value)} />
            <div className="flex justify-end gap-4">
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddUser}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
