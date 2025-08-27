import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">View detailed analytics and insights</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Analytics functionality coming soon...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">This section will contain analytics and insights.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics; 