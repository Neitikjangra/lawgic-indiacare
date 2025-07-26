import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  User as UserIcon,
  Settings, 
  LogOut,
  Edit,
  Save,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  Award,
  Eye,
  EyeOff,
  Plus,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import lawgicLogo from '@/assets/lawgic-logo.png';

interface ProfessionalDashboardProps {
  user: User;
  profile: any;
  onLogout: () => void;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ user, profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [professionalProfile, setProfessionalProfile] = useState({
    practice_area: '',
    experience_years: 0,
    certification_number: '',
    bio: '',
    hourly_rate: 500,
    is_published: false,
    available_slots: []
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfessionalProfile();
    fetchConsultations();
  }, []);

  const fetchProfessionalProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfessionalProfile({
          practice_area: data.practice_area || '',
          experience_years: data.experience_years || 0,
          certification_number: data.certification_number || '',
          bio: data.bio || '',
          hourly_rate: data.hourly_rate || 500,
          is_published: data.is_published || false,
          available_slots: Array.isArray(data.available_slots) ? data.available_slots : []
        });
      }
    } catch (error) {
      console.error('Error fetching professional profile:', error);
    }
  };

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          profiles!consultations_client_id_fkey (
            full_name,
            email
          )
        `)
        .eq('professional_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        profile_id: profile.id,
        ...professionalProfile
      };

      const { data: existingProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        const { error } = await supabase
          .from('professional_profiles')
          .update(professionalProfile)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('professional_profiles')
          .insert(profileData);

        if (error) throw error;
      }

      setEditingProfile(false);
      toast({
        title: "Profile updated!",
        description: "Your professional profile has been saved successfully."
      });
      
      fetchProfessionalProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async () => {
    try {
      const newStatus = !professionalProfile.is_published;
      
      const { error } = await supabase
        .from('professional_profiles')
        .update({ is_published: newStatus })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfessionalProfile(prev => ({ ...prev, is_published: newStatus }));
      
      toast({
        title: newStatus ? "Profile published!" : "Profile unpublished",
        description: newStatus 
          ? "Your profile is now visible to clients" 
          : "Your profile is now hidden from clients"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive"
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Manager', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'consultations', label: 'Consultations', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <Award className="w-4 h-4" /> }
  ];

  const hasCompleteProfile = professionalProfile.practice_area && 
                            professionalProfile.experience_years > 0 && 
                            professionalProfile.bio;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lawgicLogo} alt="Lawgic" className="w-8 h-8" />
            <h1 className="text-xl font-bold gradient-text">Lawgic</h1>
            <Badge variant="secondary">Professional</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{profile.full_name}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile.role === 'ca' ? 'Chartered Accountant' : 'Lawyer'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {profile.role === 'ca' ? 'CA' : 'Advocate'} {profile.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Manage your professional profile and connect with clients
          </p>
        </div>

        {/* Profile Status Card */}
        <div className="mb-8">
          <Card className={hasCompleteProfile && professionalProfile.is_published ? 'border-success' : 'border-warning'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {professionalProfile.is_published ? (
                    <Eye className="w-6 h-6 text-success" />
                  ) : (
                    <EyeOff className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="font-medium">
                      Profile Status: {professionalProfile.is_published ? 'Published' : 'Draft'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {professionalProfile.is_published 
                        ? 'Your profile is visible to clients' 
                        : hasCompleteProfile 
                          ? 'Complete your profile to start accepting clients'
                          : 'Complete your profile to publish it'
                      }
                    </p>
                  </div>
                </div>
                
                {hasCompleteProfile && (
                  <Switch
                    checked={professionalProfile.is_published}
                    onCheckedChange={togglePublishStatus}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Professional Profile</h3>
              {!editingProfile ? (
                <Button onClick={() => setEditingProfile(true)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setEditingProfile(false)} variant="ghost">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Update your professional details and credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="practice_area">Practice Area</Label>
                    <Input
                      id="practice_area"
                      placeholder="e.g., Corporate Law, Tax Consulting"
                      value={professionalProfile.practice_area}
                      onChange={(e) => setProfessionalProfile(prev => ({ 
                        ...prev, 
                        practice_area: e.target.value 
                      }))}
                      disabled={!editingProfile}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={professionalProfile.experience_years}
                      onChange={(e) => setProfessionalProfile(prev => ({ 
                        ...prev, 
                        experience_years: parseInt(e.target.value) || 0 
                      }))}
                      disabled={!editingProfile}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certification_number">
                      {profile.role === 'ca' ? 'CA Membership Number' : 'Bar Council Registration'}
                    </Label>
                    <Input
                      id="certification_number"
                      placeholder={profile.role === 'ca' ? 'CA Membership Number' : 'Bar Council Number'}
                      value={professionalProfile.certification_number}
                      onChange={(e) => setProfessionalProfile(prev => ({ 
                        ...prev, 
                        certification_number: e.target.value 
                      }))}
                      disabled={!editingProfile}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Consultation Rate (₹ per 15 minutes)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="100"
                      step="50"
                      value={professionalProfile.hourly_rate}
                      onChange={(e) => setProfessionalProfile(prev => ({ 
                        ...prev, 
                        hourly_rate: parseInt(e.target.value) || 500 
                      }))}
                      disabled={!editingProfile}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bio & Description</CardTitle>
                  <CardDescription>
                    Tell clients about your expertise and approach
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Describe your expertise, specializations, and approach to client service..."
                      rows={8}
                      value={professionalProfile.bio}
                      onChange={(e) => setProfessionalProfile(prev => ({ 
                        ...prev, 
                        bio: e.target.value 
                      }))}
                      disabled={!editingProfile}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Preview */}
            {hasCompleteProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Preview</CardTitle>
                  <CardDescription>
                    This is how your profile will appear to clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-muted/30 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg">{profile.full_name}</h4>
                        <p className="text-muted-foreground">{professionalProfile.practice_area}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {profile.role === 'ca' ? 'Chartered Accountant' : 'Lawyer'}
                          </Badge>
                          <Badge variant="default">Verified</Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <p><strong>Experience:</strong> {professionalProfile.experience_years} years</p>
                        <p><strong>Rate:</strong> ₹{professionalProfile.hourly_rate}/15 min</p>
                        {profile.location && (
                          <p><strong>Location:</strong> {profile.location}</p>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {professionalProfile.bio}
                      </p>
                      
                      <Button className="w-full" variant="outline" disabled>
                        Book Consultation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Consultation Requests</h3>
            
            {consultations.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No consultations yet</h3>
                <p className="text-muted-foreground">
                  Once you publish your profile, client consultation requests will appear here.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {consultations.map((consultation) => (
                  <Card key={consultation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{consultation.title}</h4>
                            <Badge variant="secondary">{consultation.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {consultation.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              <span>{consultation.profiles?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(consultation.scheduled_at).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>₹{consultation.amount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Performance Analytics</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{consultations.length}</p>
                      <p className="text-sm text-muted-foreground">Total Consultations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        ₹{consultations.reduce((sum, c) => sum + c.amount, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {professionalProfile.is_published ? 'Active' : 'Inactive'}
                      </p>
                      <p className="text-sm text-muted-foreground">Profile Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>
                  Complete all sections to maximize your visibility to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Practice Area</span>
                    <Badge variant={professionalProfile.practice_area ? "default" : "secondary"}>
                      {professionalProfile.practice_area ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Experience & Credentials</span>
                    <Badge variant={professionalProfile.experience_years > 0 ? "default" : "secondary"}>
                      {professionalProfile.experience_years > 0 ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Professional Bio</span>
                    <Badge variant={professionalProfile.bio ? "default" : "secondary"}>
                      {professionalProfile.bio ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Published Status</span>
                    <Badge variant={professionalProfile.is_published ? "default" : "secondary"}>
                      {professionalProfile.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;