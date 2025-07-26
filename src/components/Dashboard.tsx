import React from 'react';
import { User } from '@supabase/supabase-js';
import ClientDashboard from './ClientDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';

interface DashboardProps {
  user: User;
  profile: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, profile, onLogout }) => {
  const isProfessional = profile.role === 'ca' || profile.role === 'lawyer';

  if (isProfessional) {
    return (
      <ProfessionalDashboard 
        user={user} 
        profile={profile} 
        onLogout={onLogout}
      />
    );
  }

  return (
    <ClientDashboard 
      user={user} 
      profile={profile} 
      onLogout={onLogout}
    />
  );
};

export default Dashboard;