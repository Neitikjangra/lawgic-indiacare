import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Building, 
  UserCheck, 
  Calculator, 
  Gavel,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import lawgicLogo from '@/assets/lawgic-logo.png';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onBack: () => void;
  onAuthSuccess: (user: any) => void;
}

type UserRole = 'startup' | 'small_business' | 'freelancer' | 'ca' | 'lawyer';

const AuthPage: React.FC<AuthPageProps> = ({ mode, onBack, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const roles = [
    {
      value: 'startup' as UserRole,
      icon: <Building className="w-6 h-6" />,
      title: 'Startup',
      description: 'Growing business with innovative solutions'
    },
    {
      value: 'small_business' as UserRole,
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Small Business',
      description: 'Established business operations'
    },
    {
      value: 'freelancer' as UserRole,
      icon: <UserCheck className="w-6 h-6" />,
      title: 'Freelancer',
      description: 'Independent professional services'
    },
    {
      value: 'ca' as UserRole,
      icon: <Calculator className="w-6 h-6" />,
      title: 'Chartered Accountant',
      description: 'Professional accounting services'
    },
    {
      value: 'lawyer' as UserRole,
      icon: <Gavel className="w-6 h-6" />,
      title: 'Lawyer',
      description: 'Legal consultation and services'
    }
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && !selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role to continue.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        onAuthSuccess({ ...data.user, profile });
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in."
        });

      } else {
        // Signup
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              role: selectedRole,
              phone: phone,
              location: location
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Update profile with role and additional info
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              role: selectedRole,
              full_name: fullName,
              phone: phone,
              location: location
            })
            .eq('user_id', data.user.id);

          if (profileError) {
            console.error('Profile update error:', profileError);
          }

          onAuthSuccess(data.user);
          
          toast({
            title: "Account created!",
            description: "Welcome to Lawgic. Your account has been created successfully."
          });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={lawgicLogo} alt="Lawgic" className="w-8 h-8" />
              <h1 className="text-xl font-bold gradient-text">Lawgic</h1>
            </div>
          </div>
          
          <div>
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Sign in to your Lawgic account' 
                : 'Join thousands of professionals using Lawgic'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-3">
                <Label>Select Your Role</Label>
                <div className="grid gap-3">
                  {roles.map((role) => (
                    <div
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedRole === role.value
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedRole === role.value ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{role.title}</h3>
                            {selectedRole === role.value && (
                              <Badge variant="secondary" className="text-xs">Selected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" variant="ai" disabled={loading}>
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;