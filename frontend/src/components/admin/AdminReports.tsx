import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and view detailed reports</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Report generation functionality coming soon...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">This section will contain report generation features.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports; 