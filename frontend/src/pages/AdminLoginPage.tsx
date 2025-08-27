import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.login({ email, password });
      
      if (result.status === 'success' && result.access_token) {
        // Store the token and user data
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('supabase_refresh_token', result.refresh_token || '');
        localStorage.setItem('supabase_session_id', result.session_id || '');
        localStorage.setItem('supabase_user_id', result.user_id || '');
          
        // Store user data
        const userData = {
          uid: result.user_id || '',
          email: email,
          displayName: result.name || email.split('@')[0],
          photoURL: null
        };
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Check if user is admin
        if (result.user_role === 'admin') {
          toast({
            title: "Admin Access Granted",
            description: "Welcome to the administrative panel",
          });
          navigate('/admin');
        } else {
          // User is not admin, clear session and show error
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('supabase_refresh_token');
          localStorage.removeItem('supabase_session_id');
          localStorage.removeItem('supabase_user_id');
          
          toast({
            title: "Access Denied",
            description: "Administrative privileges required",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Authentication Failed",
          description: result.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Authentication Failed",
        description: "An error occurred during authentication",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Administrative Access</CardTitle>
            <CardDescription className="text-gray-300">
              Secure administrative portal for MealLens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Administrator Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter administrator email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter administrator password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Access Administrative Panel
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium">Restricted Access</p>
                  <p className="text-xs mt-1">This portal is restricted to authorized administrators only.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white"
              >
                ← Return to User Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage; 