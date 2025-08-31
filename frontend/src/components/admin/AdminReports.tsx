import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Users, DollarSign, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const AdminReports: React.FC = () => {
  const [generating, setGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  const generateReport = async (reportType: string) => {
    try {
      setGenerating(reportType);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: `${reportType} report has been generated successfully.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  const reports = [
    {
      id: 'user-summary',
      title: 'User Summary Report',
      description: 'Complete overview of user registrations, activity, and engagement',
      icon: Users,
      color: 'bg-blue-500',
      features: ['User registrations', 'Active users', 'User engagement', 'Geographic distribution']
    },
    {
      id: 'revenue-report',
      title: 'Revenue Report',
      description: 'Detailed financial analysis including subscriptions and payments',
      icon: DollarSign,
      color: 'bg-green-500',
      features: ['Total revenue', 'Subscription analytics', 'Payment methods', 'Revenue trends']
    },
    {
      id: 'usage-analytics',
      title: 'Usage Analytics Report',
      description: 'Feature usage statistics and user behavior analysis',
      icon: Activity,
      color: 'bg-purple-500',
      features: ['Feature usage', 'User behavior', 'Performance metrics', 'Usage trends']
    },
    {
      id: 'monthly-summary',
      title: 'Monthly Summary',
      description: 'Comprehensive monthly overview of all key metrics',
      icon: Calendar,
      color: 'bg-orange-500',
      features: ['Monthly KPIs', 'Growth metrics', 'User activity', 'System performance']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and view detailed reports</p>
      </div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Report includes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {report.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => generateReport(report.title)}
                    disabled={generating === report.title}
                    className="w-full"
                  >
                    {generating === report.title ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Previously generated reports and exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">User Summary Report - December 2024</p>
                  <p className="text-sm text-gray-500">Generated 2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Revenue Report - November 2024</p>
                  <p className="text-sm text-gray-500">Generated 1 day ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Usage Analytics - Q4 2024</p>
                  <p className="text-sm text-gray-500">Generated 3 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports; 