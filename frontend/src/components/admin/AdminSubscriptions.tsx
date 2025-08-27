import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminSubscriptions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Monitor subscriptions and revenue</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            Subscription management functionality coming soon...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">This section will contain subscription management features.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions; 