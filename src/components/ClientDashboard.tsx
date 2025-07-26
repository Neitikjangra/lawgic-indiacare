import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DeadlineTracker from './DeadlineTracker';
import { 
  Bot, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Send,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import lawgicLogo from '@/assets/lawgic-logo.png';

interface ClientDashboardProps {
  user: User;
  profile: any;
  onLogout: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeadlines();
    fetchProfessionals();
    initializeChatHistory();
  }, []);

  const initializeChatHistory = () => {
    setChatHistory([
      {
        id: 1,
        type: 'bot',
        message: `Hello ${profile.full_name}! I'm your AI legal assistant. I can help you with Indian laws, compliance questions, and legal guidance. What would you like to know?`,
        timestamp: new Date()
      }
    ]);
  };

  const fetchDeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setDeadlines(data || []);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select(`
          *,
          profiles (
            full_name,
            email,
            location,
            role
          )
        `)
        .eq('is_published', true);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const handleBookConsultation = async (professional: any) => {
    try {
      const consultationData = {
        title: `Consultation with ${professional.profiles.full_name}`,
        description: `${professional.practice_area} consultation`,
        client_id: user.id,
        professional_id: professional.user_id,
        professional_profile_id: professional.id,
        amount: professional.hourly_rate,
        duration_minutes: 15,
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
        status: 'pending'
      };

      const { error } = await supabase
        .from('consultations')
        .insert([consultationData]);

      if (error) throw error;

      alert('Consultation booked successfully! The professional will be notified.');
    } catch (error) {
      console.error('Error booking consultation:', error);
      alert('Failed to book consultation. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    setLoading(true);

    // Simulate AI response (you would integrate with Gemini API here)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: generateAIResponse(chatMessage),
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1500);
  };

  const generateAIResponse = (question: string) => {
    // Simple response generator - replace with actual Gemini API integration
    const responses = {
      gst: "GST filing deadlines are typically the 20th of the following month. For monthly filers, file GSTR-1 by 11th and GSTR-3B by 20th. Late filing attracts penalties starting from ₹50 per day.",
      itr: "ITR filing deadline for individuals is July 31st of the assessment year. For businesses, it's September 30th. E-filing is mandatory for most taxpayers with income above ₹2.5 lakhs.",
      compliance: "For startups, key compliances include: 1) Annual filing with MCA, 2) GST returns if registered, 3) TDS compliance if applicable, 4) ESI/PF if employees > threshold, 5) Income tax returns.",
      default: "I understand your question about Indian legal compliance. Based on current laws, I recommend consulting the specific provisions of the relevant act. For detailed guidance, you may want to book a consultation with one of our verified professionals."
    };

    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('gst')) return responses.gst;
    if (lowerQuestion.includes('itr') || lowerQuestion.includes('income tax')) return responses.itr;
    if (lowerQuestion.includes('compliance') || lowerQuestion.includes('startup')) return responses.compliance;
    return responses.default;
  };

  const addSampleDeadlines = async () => {
    const sampleDeadlines = [
      {
        title: 'GST Return Filing (GSTR-3B)',
        description: 'Monthly GST return filing for current month',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'tax',
        user_id: user.id
      },
      {
        title: 'ITR Filing Deadline',
        description: 'Annual Income Tax Return filing deadline',
        due_date: new Date('2024-07-31').toISOString(),
        category: 'tax',
        user_id: user.id
      },
      {
        title: 'Annual Compliance (MCA)',
        description: 'File Annual Return and Financial Statements with MCA',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'legal',
        user_id: user.id
      }
    ];

    try {
      const { error } = await supabase
        .from('deadlines')
        .insert(sampleDeadlines);

      if (error) throw error;
      
      toast({
        title: "Sample deadlines added!",
        description: "I've added some common compliance deadlines for you."
      });
      
      fetchDeadlines();
    } catch (error) {
      console.error('Error adding deadlines:', error);
      toast({
        title: "Error",
        description: "Failed to add sample deadlines",
        variant: "destructive"
      });
    }
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const upcoming = deadlines
      .filter(d => new Date(d.due_date) > now && !d.is_completed)
      .slice(0, 5);
    return upcoming;
  };

  const tabs = [
    { id: 'chat', label: 'Ask Lawgic', icon: <Bot className="w-4 h-4" /> },
    { id: 'deadlines', label: 'Deadlines', icon: <Calendar className="w-4 h-4" /> },
    { id: 'experts', label: 'Expert Connect', icon: <Users className="w-4 h-4" /> },
    { id: 'flows', label: 'Law Updates', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lawgicLogo} alt="Lawgic" className="w-8 h-8" />
            <h1 className="text-xl font-bold gradient-text">Lawgic</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{profile.full_name}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile.role.replace('_', ' ')}
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
            Welcome back, {profile.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Your AI-powered legal compliance dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getUpcomingDeadlines().length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{professionals.length}</p>
                  <p className="text-sm text-muted-foreground">Available Experts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {deadlines.filter(d => d.is_completed).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed Tasks</p>
                </div>
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
        {activeTab === 'chat' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Legal Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask questions about Indian laws, compliance, and legal procedures
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about GST, ITR, compliance..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={loading}
                    />
                    <Button onClick={handleSendMessage} disabled={loading || !chatMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "What are GST filing deadlines?",
                    "ITR filing requirements for startups",
                    "MCA compliance checklist",
                    "TDS rates for FY 2024-25"
                  ].map((question) => (
                    <Button
                      key={question}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setChatMessage(question)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'deadlines' && (
          <DeadlineTracker user={user} profile={profile} />
        )}

        {activeTab === 'experts' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Connect with Experts</h3>
            
            {professionals.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No experts available yet</h3>
                <p className="text-muted-foreground">
                  Professional profiles will appear here once they are verified and published.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((professional) => (
                  <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold">{professional.profiles?.full_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {professional.practice_area}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                              {professional.profiles?.role === 'ca' ? 'Chartered Accountant' : 'Lawyer'}
                            </Badge>
                            {professional.is_verified && (
                              <Badge variant="default">Verified</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p><strong>Experience:</strong> {professional.experience_years} years</p>
                          <p><strong>Rate:</strong> ₹{professional.hourly_rate}/15 min</p>
                          {professional.profiles?.location && (
                            <p><strong>Location:</strong> {professional.profiles.location}</p>
                          )}
                        </div>
                        
                        {professional.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {professional.bio}
                          </p>
                        )}
                        
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleBookConsultation(professional)}
                        >
                          Book Consultation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'flows' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Recent Law Changes & Updates</h3>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h4 className="font-semibold">AI-Powered Law Updates</h4>
                </div>
                <p className="text-muted-foreground mb-4">
                  Stay updated with the latest changes in Indian laws and regulations. 
                  Our AI monitors official sources and provides you with relevant updates.
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-2">No recent updates</h5>
                    <p className="text-sm text-muted-foreground">
                      When there are significant changes in laws relevant to your business type, 
                      they will appear here automatically.
                    </p>
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

export default ClientDashboard;