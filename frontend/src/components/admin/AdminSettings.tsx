import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-2">Configure admin panel settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Admin settings functionality coming soon...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">This section will contain admin settings and configuration.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings; 