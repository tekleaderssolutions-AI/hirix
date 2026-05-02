import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function JobsListPage() {
  const navigate = useNavigate();
  const { org } = useAuth();
  const companyName = org?.name || 'spotshops';

  return (
    <div className="jobs-page">
      <div className="jobs-header-minimal">
        <div className="jobs-company-title">
          {companyName}
          <span className="jobs-external-icon">
            <ExternalLink size={18} />
          </span>
        </div>
        <button className="btn-create-job" onClick={() => navigate('/jobs/new')}>
          Create a new job
        </button>
      </div>

      <div className="jobs-empty-state">
        <div className="jobs-empty-illustration">
          <img 
            src="/C:/Users/pvsmo/.gemini/antigravity/brain/625f262e-41ff-4260-8231-53c25e59ffd2/jobs_empty_illustration_1777720297853.png" 
            alt="No jobs illustration" 
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
        
        <h2 className="jobs-empty-title">Find candidates for job openings at your company</h2>
        
        <p className="jobs-empty-desc">
          <a href="#">Create a job</a> to write your job post, publish to online job boards and source candidates that match the job's requirements.
        </p>

        <a href="#" className="jobs-empty-link">
          <ExternalLink size={16} />
          How to create a job on Hirix
        </a>
      </div>
    </div>
  );
}
