import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FaCode,
  FaHome,
  FaUsers,
  FaFileAlt,
  FaComments,
  FaClipboardList,
  FaBars,
  FaChevronLeft,
} from 'react-icons/fa';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';

  const activeClass =
    'flex items-center gap-3 text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-lg shadow transition-colors duration-300';
  const normalClass =
    'flex items-center gap-3 text-gray-200 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition-colors duration-300';

  const menuItems = [
    { to: '/dashboard', label: '首页', icon: <FaHome /> },
    { to: '/dashboard/users', label: '用户管理', icon: <FaUsers /> },
    { to: '/dashboard/articles', label: '文章管理', icon: <FaFileAlt /> },
    { to: '/dashboard/comments', label: '评论管理', icon: <FaComments /> },
    { to: '/dashboard/logs', label: '日志查看', icon: <FaClipboardList /> },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900">
      <aside
        className={`${sidebarWidth} p-4 bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg flex flex-col justify-between relative transition-width duration-300`}
        style={{ minWidth: collapsed ? '80px' : '256px' }} // 兼容性保证宽度
      >
        <div>
          {/* 顶部 */}
          <div className={`flex items-center justify-between mb-8 ${collapsed ? 'pr-2' : ''}`}>
            <div
              className={`flex items-center space-x-2 transition-opacity duration-300 ${
                collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <FaCode className="text-white text-3xl" />
              <h1 className="text-white text-2xl font-bold tracking-wide whitespace-nowrap">
                管理员系统
              </h1>
            </div>

            {/* 折叠按钮 */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
              title={collapsed ? '展开侧边栏' : '收起侧边栏'}
              className={`text-white p-1 rounded-md hover:bg-blue-700 transition
                ${
                  collapsed
                    ? 'absolute top-4 right-[-0.2rem] z-50 shadow-lg bg-blue-800'
                    : ''
                }
              `}
              style={collapsed ? { width: '36px', height: '36px' } : undefined}
            >
              {collapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
            </button>
          </div>

          {/* 分割线 */}
          <div className="border-t border-gray-700 mb-6" />

          {/* 菜单 */}
          <nav className="flex flex-col gap-3">
            {menuItems.map(({ to, label, icon }) => (
              <NavLink
                to={to}
                key={to}
                end={to === '/dashboard'}
                className={({ isActive }) => (isActive ? activeClass : normalClass)}
                title={collapsed ? label : undefined}
              >
                <span className="text-lg">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* 底部版权 */}
        <div
          className={`text-sm text-gray-500 text-center mt-6 transition-opacity duration-300 ${
            collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          &copy; 2025 广告位招租
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-white via-gray-100 to-blue-50">
        {/* 顶部栏 */}
        <header className="flex justify-between items-center p-4 bg-white bg-opacity-90 shadow-md">
          <div className="text-gray-700 font-medium select-none">
            当前页面：
            <span className="font-semibold">{menuItems.find(m => m.to === location.pathname)?.label || '未知页面'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            退出登录
          </button>
        </header>

        {/* 内容区 */}
        <section className="flex-1 p-8 overflow-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
