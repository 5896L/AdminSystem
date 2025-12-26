import React, { useEffect } from 'react';

export default function DashboardHome() {
  useEffect(() => {
    // 挂载时给 body 设置渐变背景
    document.body.style.margin = '0';
    document.body.style.height = '100%';
    document.body.style.background = 'linear-gradient(to bottom right, #3b82f6, #60a5fa, #bfdbfe)';
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.body.style.color = '#1e293b'; // 深蓝灰色文字

    // 清理函数，组件卸载时恢复默认（可选）
    return () => {
      document.body.style.background = '';
      document.body.style.margin = '';
      document.body.style.height = '';
      document.body.style.fontFamily = '';
      document.body.style.color = '';
    };
  }, []);

  return (
    // 外层div不设置背景，透明显示body背景
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-10">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
          管理员系统首页
        </h1>

        <p className="text-center text-gray-700 text-lg mb-10 leading-relaxed">
          欢迎使用本管理员系统！本系统专为平台管理人员设计，提供全面的管理功能，保障平台稳定与内容健康。
        </p>

        {/* 核心模块 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">核心模块</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card title="用户管理">
              支持管理员对用户账号的创建、删除及权限分配，确保平台安全有序。
            </Card>
            <Card title="文章管理">
              提供对平台文章的发布、编辑和删除功能，帮助维护内容质量。
            </Card>
            <Card title="评论管理">
              审核并管理用户评论，防止违规内容出现，维护社区和谐。
            </Card>
            <Card title="日志查看">
              实时监控系统操作日志和安全日志，提升管理透明度和安全性。
            </Card>
          </div>
        </section>

        {/* 系统优势 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-blue-800 mb-3">系统优势</h2>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-gray-700 leading-relaxed shadow-sm">
            本系统采用模块化设计，操作简便，界面直观，支持多管理员分工协作。
            所有操作均有日志记录，保障数据安全与追溯。
          </div>
        </section>

        {/* 使用须知 */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-800 mb-3">使用须知</h2>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-gray-700 leading-relaxed shadow-sm space-y-4">
            <p>
              请妥善保管管理员账号信息，避免泄露。建议定期更换密码，确保账户安全。
              遇到系统异常，请及时联系技术支持。
            </p>
            <p>
              通过左侧菜单栏，您可以快速切换到各管理模块，开始您的管理工作。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
    </div>
  );
}
