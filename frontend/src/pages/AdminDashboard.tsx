import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminSubscriptions from '@/components/admin/AdminSubscriptions';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminReports from '@/components/admin/AdminReports';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/overview" element={<AdminOverview />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard; 