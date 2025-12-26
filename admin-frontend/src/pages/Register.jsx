import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa'; // 引入图标

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      setErrorMsg('请输入用户名和密码');
      return;
    }
    try {
      await axios.post('/api/register', { username, password });
      setErrorMsg('');
      alert('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || '注册失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-teal-500 flex justify-center items-center">
      <div className="max-w-sm w-full p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">管理员注册</h2>

        {errorMsg && <div className="text-red-600 mb-4 text-center">{errorMsg}</div>}

        <div className="mb-6">
          <label htmlFor="username" className="block text-gray-700 font-medium mb-2">用户名</label>
          <div className="flex items-center border p-4 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition duration-300">
            <FaUser className="text-gray-500 mr-3" />
            <input
              id="username"
              type="text"
              className="w-full focus:outline-none text-gray-800 placeholder-gray-400"
              placeholder="请输入用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">密码</label>
          <div className="flex items-center border p-4 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition duration-300">
            <FaLock className="text-gray-500 mr-3" />
            <input
              id="password"
              type="password"
              className="w-full focus:outline-none text-gray-800 placeholder-gray-400"
              placeholder="请输入密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

          <button
            className="w-full p-4 bg-blue-600 text-white rounded-lg font-semibold transition duration-300 hover:bg-blue-700"
            onClick={handleRegister}
          >
            注册
          </button>


        <p className="mt-6 text-center text-gray-600">
          已有账号？<Link to="/login" className="text-blue-600 hover:text-blue-800">登录</Link>
        </p>
      </div>
    </div>
  );
}
