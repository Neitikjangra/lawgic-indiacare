import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';

type AuthMode = 'landing' | 'login' | 'signup';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when logged in
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          professional_profiles (*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser);
    setAuthMode('landing');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setAuthMode('landing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user && userProfile) {
    return (
      <Dashboard 
        user={user} 
        profile={userProfile} 
        onLogout={handleLogout}
      />
    );
  }

  // Show auth pages
  if (authMode === 'login') {
    return (
      <AuthPage 
        mode="login" 
        onBack={() => setAuthMode('landing')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (authMode === 'signup') {
    return (
      <AuthPage 
        mode="signup" 
        onBack={() => setAuthMode('landing')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // Show landing page
  return (
    <LandingPage 
      onLogin={() => setAuthMode('login')}
      onSignup={() => setAuthMode('signup')}
    />
  );
};

export default Index;