import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './pages/RequireAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import UserManage from './pages/UserManage';
import ArticleManage from './pages/ArticleManage';
import UserLog from './pages/UserLog';
import CommentManage from './pages/CommentManage';


export default function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard/*"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<UserManage />} />
          <Route path="articles" element={<ArticleManage />} />
          <Route path="comments" element={<CommentManage />} />
          <Route path="logs" element={<UserLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
