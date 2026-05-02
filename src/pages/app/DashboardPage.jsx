import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MoreVertical, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const initials = user?.first_name && user?.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'CN';
    
  const fullName = user?.first_name ? `${user.first_name} ${user.last_name}` : 'caveta N';
  const email = user?.email || 'caveta8872@spotshops.com';
  const firstName = user?.first_name || 'caveta';

  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      
      {/* Left Column: Profile Card */}
      <div className="dashboard-left-col">
        <div className="dashboard-profile-card">
          <div className="dashboard-avatar-large">
            {initials}
          </div>
          <div className="dashboard-profile-name">{fullName}</div>
          <div className="dashboard-profile-email">{email}</div>
        </div>
      </div>

      {/* Right Column: Main Content */}
      <div className="dashboard-right-col">
        <h1 className="dashboard-greeting">Hello {firstName}!</h1>

        {/* Jobs Card */}
        <div className="dashboard-jobs-card">
          <div className="dashboard-jobs-header">
            <div className="dashboard-jobs-title">
              <Briefcase size={20} color="var(--color-text-muted)" />
              Jobs
            </div>
            <button className="dashboard-btn-solid" onClick={() => navigate('/jobs/new')}>
              Create job
            </button>
          </div>

          {/* Jobs will be dynamically loaded from backend */}
          {/* <div className="dashboard-job-item">
            <div>
              <div className="dashboard-job-name">AI Engineer</div>
              <div className="dashboard-job-meta">2202 · On-site · Haiderabad, Uttar Pradesh, India</div>
            </div>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <MoreVertical size={16} />
            </button>
          </div> */}

          <div className="dashboard-jobs-footer">
            See other jobs on your account <a href="/jobs" style={{ fontWeight: 600, marginLeft: 4 }}>View all jobs</a>
          </div>

          <div className="dashboard-jobs-webinar">
            <div>
              <strong>Optimize your jobs:</strong> Watch our webinar about how to format your jobs to attract more candidates.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <a href="#" style={{ fontWeight: 600 }}>View webinar</a>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
