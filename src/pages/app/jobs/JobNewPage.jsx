import React, { useState } from 'react';
import { ChevronDown, Trash2, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui';
import { 
  INDUSTRIES, 
  JOB_FUNCTIONS, 
  JOB_TYPES, 
  EXPERIENCE_LEVELS, 
  EDUCATION_LEVELS 
} from '@/lib/constants';
import { useCreateJob, useNextJobCode } from '@/hooks/useJobs';
import useUiStore from '@/store/uiStore';
import { useNavigate } from 'react-router-dom';

export default function JobNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Job details');
  const [creationMode, setCreationMode] = useState(null); // null, 'manual', 'upload'
  const createJob = useCreateJob();
  const { data: nextCode } = useNextJobCode();
  const addToast = useUiStore(s => s.addToast);

  const [formData, setFormData] = useState({
    title: '',
    job_code: '',
    department: 'Engineering',
    workplace_type: 'On-site',
    location: '',
    description: '',
    requirements: '',
    benefits: '',
    industry: 'Technology',
    job_function: 'Engineering',
    employment_type: 'Full-time',
    experience_level: 'Entry Level',
    education_level: "Bachelor's Degree",
    keywords: '',
    salary_min: 0,
    salary_max: 0,
    salary_currency: 'INR',
    status: 'draft'
  });

  const [uploadFile, setUploadFile] = useState(null);

  // Pre-fill job code when fetched
  React.useEffect(() => {
    if (nextCode) {
      // Handle both { code: "..." } and direct string "..." or { next_code: "..." }
      const codeValue = nextCode.code || nextCode.next_code || (typeof nextCode === 'string' ? nextCode : null);
      if (codeValue) {
        setFormData(prev => ({ ...prev, job_code: codeValue }));
      }
    }
  }, [nextCode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (isDraft = true) => {
    try {
      const workplaceMap = {
        'On-site': 'on_site',
        'Hybrid': 'hybrid',
        'Remote': 'remote'
      };

      // Transform and provide strict defaults to prevent backend Enum crashes
      const dataToSave = { 
        title: formData.title || 'Untitled Job',
        job_code: formData.job_code || 'JOB-' + Math.floor(Math.random() * 1000),
        department: formData.department || 'Engineering',
        workplace_type: workplaceMap[formData.workplace_type] || 'on_site',
        location: formData.location || 'Remote',
        description: formData.description || 'Job description...',
        requirements: formData.requirements || 'Job requirements...',
        benefits: formData.benefits || 'Job benefits...',
        industry: formData.industry || 'Technology',
        job_function: formData.job_function || 'Engineering',
        employment_type: formData.employment_type || 'Full-time',
        experience_level: formData.experience_level || 'Entry Level',
        education_level: formData.education_level || "Bachelor's Degree",
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        salary_min: Number(formData.salary_min) || 0,
        salary_max: Number(formData.salary_max) || 0,
        salary_currency: formData.salary_currency || 'INR',
        status: isDraft ? 'draft' : 'open'
      };
      
      const response = await createJob.mutateAsync(dataToSave);
      
      // Update formData with any server-returned fields (like id)
      if (response && response.id) {
        setFormData(prev => ({ ...prev, id: response.id }));
      }
      
      addToast({
        title: isDraft ? 'Draft saved' : 'Job published',
        message: 'Job has been successfully ' + (isDraft ? 'saved as draft' : 'published'),
        variant: 'success'
      });

      if (!isDraft && !response?.id) {
        navigate('/jobs');
      }
    } catch (error) {
      const errorData = error.response?.data?.detail;
      let message = 'Failed to save job';

      if (Array.isArray(errorData)) {
        // Handle FastAPI/Pydantic validation errors
        message = errorData.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData && typeof errorData === 'object') {
        // Handle objects like { detail: "error message" } or similar
        message = errorData.message || errorData.detail || JSON.stringify(errorData);
      } else if (error.message) {
        message = error.message;
      }

      addToast({
        title: 'Error',
        message: message,
        variant: 'danger'
      });
    }
  };

  const tabs = [
    'Job details',
    'Application form',
    'Find candidates',
    'Team members',
    'Workflow'
  ];

  const fullName = user?.first_name ? `${user.first_name} ${user.last_name}` : 'caveta N';
  const email = user?.email || 'caveta8872@spotshops.com';

  const renderJobDetails = () => (
    <div className="job-details-form-layout">
      <div className="job-details-form-main">
        {/* Job title and department */}
        <div className="form-section-card">
          <h3 className="form-section-title">Job title and department</h3>
          
          <div className="form-field">
            <label className="form-label-custom"><span>*</span>Job title</label>
            <input 
              type="text" 
              className="form-input-custom" 
              placeholder="e.g. AI Engineer"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label-custom">Job code</label>
            <input 
              type="text" 
              className="form-input-custom" 
              placeholder="e.g. 2202"
              value={formData.job_code}
              onChange={(e) => handleChange('job_code', e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div className="form-section-card">
          <h3 className="form-section-title">Location</h3>
          
          <div className="form-field">
            <label className="form-label-custom"><span>*</span>Workplace</label>
            <div className="workplace-options">
              {['On-site', 'Hybrid', 'Remote'].map(type => (
                <label key={type} className="workplace-option">
                  <input 
                    type="radio" 
                    name="workplace" 
                    checked={formData.workplace_type === type}
                    onChange={() => handleChange('workplace_type', type)}
                  />
                  <span className="workplace-label-text">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label-custom"><span>*</span>Office location</label>
            <input 
              type="text" 
              className="form-input-custom" 
              placeholder="e.g. New York, NY, United States"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-section-card">
          <button className="ai-generate-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            Generate with AI
          </button>
          <h3 className="form-section-title">Description</h3>
          
          <div className="form-field">
            <label className="form-label-custom"><span>*</span>About the role</label>
            <div className="description-editor-container">
              <div className="description-editor-toolbar">
                <button style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>B</button>
                <button style={{ background: 'none', border: 'none', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                <button style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>U</button>
              </div>
              <textarea 
                className="description-editor-textarea" 
                placeholder="Enter the job description here..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label-custom">Requirements</label>
            <textarea 
              className="description-editor-textarea" 
              placeholder="Enter the job requirements here..."
              style={{ minHeight: '120px' }}
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label-custom">Benefits</label>
            <textarea 
              className="description-editor-textarea" 
              placeholder="Enter the job benefits here..."
              style={{ minHeight: '100px' }}
              value={formData.benefits}
              onChange={(e) => handleChange('benefits', e.target.value)}
            />
          </div>
        </div>

        {/* Company industry and Job function */}
        <div className="form-section-card">
          <h3 className="form-section-title">Company industry and Job function</h3>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label-custom">Company industry</label>
              <select 
                className="form-input-custom"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label-custom">Job function</label>
              <select 
                className="form-input-custom"
                value={formData.job_function}
                onChange={(e) => handleChange('job_function', e.target.value)}
              >
                <option value="">Select function...</option>
                {JOB_FUNCTIONS.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Employment details */}
        <div className="form-section-card">
          <h3 className="form-section-title">Employment details</h3>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label-custom">Employment type</label>
              <select 
                className="form-input-custom"
                value={formData.employment_type}
                onChange={(e) => handleChange('employment_type', e.target.value)}
              >
                <option value="">Select type...</option>
                {JOB_TYPES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label-custom">Experience</label>
              <select 
                className="form-input-custom"
                value={formData.experience_level}
                onChange={(e) => handleChange('experience_level', e.target.value)}
              >
                <option value="">Select experience...</option>
                {EXPERIENCE_LEVELS.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label-custom">Education</label>
              <select 
                className="form-input-custom"
                value={formData.education_level}
                onChange={(e) => handleChange('education_level', e.target.value)}
              >
                <option value="">Select education...</option>
                {EDUCATION_LEVELS.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label-custom">Keywords</label>
              <input 
                type="text" 
                className="form-input-custom" 
                placeholder="e.g. React, Python"
                value={formData.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Salary details */}
        <div className="form-section-card">
          <h3 className="form-section-title">Salary details</h3>
          <div className="form-grid-3">
            <div className="form-field">
              <label className="form-label-custom">Min salary</label>
              <input 
                type="number" 
                className="form-input-custom" 
                placeholder="0"
                value={formData.salary_min}
                onChange={(e) => handleChange('salary_min', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label-custom">Max salary</label>
              <input 
                type="number" 
                className="form-input-custom" 
                placeholder="0"
                value={formData.salary_max}
                onChange={(e) => handleChange('salary_max', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label-custom">Currency</label>
              <select 
                className="form-input-custom"
                value={formData.salary_currency}
                onChange={(e) => handleChange('salary_currency', e.target.value)}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="btn-group-footer">
          <button 
            className="btn-save-continue" 
            onClick={() => handleSave(false)}
            disabled={createJob.isPending}
          >
            {createJob.isPending ? 'Saving...' : 'Save & continue'}
          </button>
          <button 
            className="btn-save-draft" 
            onClick={() => handleSave(true)}
            disabled={createJob.isPending}
          >
            Save draft
          </button>
        </div>
      </div>

      {/* Tips Sidebar */}
      <div className="job-details-tips-sidebar">
        <div className="tip-section">
          <h4 className="tip-title">Tips</h4>
          <div className="tip-content">
            <div className="tip-item">Use common job titles for searchability.</div>
            <div className="tip-item">Advertise for just one job e.g. 'Nurse', not 'Nurses'.</div>
            <div className="tip-item">No general opportunities or events.</div>
          </div>
        </div>

        <div className="tip-section">
          <div className="tip-content">
            <div className="tip-item">Use a location to attract the most appropriate candidates.</div>
            <div className="tip-item">Some job boards require a location.</div>
          </div>
        </div>

        <div className="tip-section">
          <div className="tip-content">
            <div className="tip-item">Format with sections and bullets to improve readability.</div>
            <div className="tip-item">Avoid targeting specific demographics e.g. gender, nationality and age.</div>
            <div className="tip-item">No need to add a link to apply (one is added automatically).</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelectionScreen = () => (
    <div className="creation-mode-selection">
      <div className="selection-container">
        <h2 className="selection-title">How would you like to create this job?</h2>
        <p className="selection-subtitle">Select a method to start setting up your new position.</p>
        
        <div className="selection-grid">
          <div className="selection-card" onClick={() => setCreationMode('manual')}>
            <div className="selection-icon-wrapper manual">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <h3 className="selection-card-title">Manual Creation</h3>
            <p className="selection-card-desc">Enter all job details manually using our step-by-step editor.</p>
            <button className="selection-btn">Start Manual</button>
          </div>

          <div className="selection-card" onClick={() => setCreationMode('upload')}>
            <div className="selection-icon-wrapper upload">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <h3 className="selection-card-title">Document Uploading</h3>
            <p className="selection-card-desc">Upload a PDF or Word document. Our AI will automatically extract details.</p>
            <button className="selection-btn">Upload Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUploadMode = () => (
    <div className="upload-mode-container">
      <div className="job-content-card">
        <div className="job-content-header">
          <h3>Upload Job Description</h3>
        </div>
        <div className="job-content-body">
          <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
            <input 
              type="file" 
              id="fileInput" 
              hidden 
              accept=".pdf,.doc,.docx"
              onChange={(e) => setUploadFile(e.target.files[0])}
            />
            <div className="upload-icon-large">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00756a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <p className="upload-text">Click to upload or drag and drop</p>
            <p className="upload-hint">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
            {uploadFile && (
              <div className="selected-file-badge">
                {uploadFile.name}
              </div>
            )}
          </div>

          <div className="form-field" style={{ marginTop: '24px', maxWidth: '300px' }}>
            <label className="form-label-custom">Job code (Auto-generated)</label>
            <input 
              type="text" 
              className="form-input-custom" 
              value={formData.job_code}
              readOnly
            />
          </div>

          <div className="btn-group-footer" style={{ marginTop: '40px' }}>
            <button 
              className="btn-save-continue"
              disabled={!uploadFile}
              onClick={() => addToast({ title: 'Processing', message: 'AI is extracting details from your document...', variant: 'info' })}
            >
              Save & continue
            </button>
            <button className="btn-save-draft" onClick={() => setCreationMode(null)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!creationMode) {
    return renderSelectionScreen();
  }

  return (
    <div className="job-create-container">
      {/* Header section */}
      <div className="job-create-header">
        <div className="job-create-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setCreationMode(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#666' }}
              title="Back to selection"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div>
              <h1 className="job-draft-title">
                {(formData.id && creationMode === 'manual') ? (
                  <>
                    {formData.title} <span className="job-draft-label">({formData.job_code})</span>
                  </>
                ) : 'New Job'}
              </h1>
              {formData.id && creationMode === 'manual' && (
                <div className="job-create-meta">
                  {formData.workplace_type} • {formData.location}
                </div>
              )}
            </div>
          </div>
          
          <div className="job-create-actions">
            <button 
              className="btn-preview" 
              onClick={() => handleSave(true)}
              disabled={createJob.isPending}
            >
              Save draft
            </button>
            <button 
              className="btn-save-continue" 
              onClick={() => handleSave(false)}
              disabled={createJob.isPending}
            >
              {createJob.isPending ? 'Saving...' : 'Save & continue'}
            </button>
          </div>
        </div>

        <div className="job-create-tabs" style={{ display: 'flex', justifyContent: 'space-between' }}>
          {tabs.map(tab => (
            <div 
              key={tab} 
              className={`job-tab ${activeTab === tab ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content section */}
      <div className="job-create-content">
        {creationMode === 'manual' ? (
          <>
            {activeTab === 'Job details' && renderJobDetails()}

            {activeTab === 'Team members' && (
              <div className="job-content-card">
                <div className="job-content-header">
                  <h3>Team members</h3>
                  <HelpCircle size={16} color="#ccc" />
                </div>
                
                <div className="job-content-body">
                  <div className="member-row">
                    <div className="member-info">
                      <Avatar name={fullName} size="sm" />
                      <span className="member-name">{fullName}</span>
                      <span className="member-email">{email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                      <span className="member-role-text">You're an Admin for this job</span>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '32px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Other members
                    </div>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      You can add other account members to your team or invite people to join Workable to collaborate on this job.
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn-invite-member">
                        Invite a new member
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Find candidates' && (
              <div className="find-candidates-container">
                {/* Option 1: Document Uploading */}
                <div className="sourcing-option-section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="option-number">Option 1</div>
                      <h2 className="option-title" style={{ marginBottom: 0 }}>Document Uploading</h2>
                    </div>
                    
                    <button 
                      className="btn-save-continue"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                      disabled={!uploadFile}
                      onClick={() => addToast({ title: 'Processing', message: 'AI is extracting details from your document...', variant: 'info' })}
                    >
                      Save & continue
                    </button>
                  </div>
                  
                  <div className="upload-area secondary" onClick={() => document.getElementById('candidateUpload').click()}>
                    <input 
                      type="file" 
                      id="candidateUpload" 
                      hidden 
                      multiple
                      accept=".pdf,.doc,.docx,.zip"
                    />
                    <div className="upload-icon-medium">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00756a" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <p className="upload-text">Upload candidate resumes or a ZIP folder</p>
                    <p className="upload-hint">Supported formats: PDF, DOCS, ZIP</p>
                  </div>
                </div>

                <div className="option-divider">
                  <span>OR</span>
                </div>

                {/* Option 2: Multi-channel Sourcing */}
                <div className="sourcing-option-section" style={{ marginTop: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                    <div className="option-number">Option 2</div>
                    <h2 className="option-title">Multi-channel Sourcing</h2>
                  </div>

                  {/* Step 1 */}
                  <div className="sourcing-step">
        <div className="step-marker">1</div>
        <div className="step-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 className="step-title" style={{ marginBottom: 0 }}>Get off to the right start</h3>
            <span className="coming-soon-badge">Coming Soon</span>
          </div>
          <p className="step-subtitle">Get the most quality candidates quickly - these actions are our top performers.</p>
          
          <div className="sourcing-grid">
            <div className="sourcing-card">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg></div>
              <h4>Premium job boards</h4>
              <p>Use premium job boards to increase visibility and collect more candidates.</p>
              <button className="sourcing-link">Boost visibility</button>
            </div>

            <div className="sourcing-card">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></div>
              <h4>Referrals</h4>
              <p>Send an email to your employees inviting them to submit referrals.</p>
              <button className="sourcing-link">Edit Referrals settings</button>
            </div>

            <div className="sourcing-card muted">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <h4>Passive candidates</h4>
              <p>Profiles matching your job in our global database.</p>
              <button className="sourcing-link disabled">Preview candidates</button>
            </div>

            <div className="sourcing-card muted">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg></div>
              <h4>Resurfaced candidates</h4>
              <p>Past candidates who match this new job.</p>
              <button className="sourcing-link disabled">Preview candidates</button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="sourcing-step">
        <div className="step-marker">2</div>
        <div className="step-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 className="step-title" style={{ marginBottom: 0 }}>More options to consider</h3>
            <span className="coming-soon-badge">Coming Soon</span>
          </div>
          <p className="step-subtitle">These inbound and outbound sourcing features provide a wide range of ways to find your next hire.</p>
          
          <div className="sourcing-grid">
            <div className="sourcing-card">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg></div>
              <h4>Free job boards</h4>
              <p>Post your job to our network of free job boards to start receiving applications.</p>
              <button className="sourcing-link">View boards</button>
            </div>

            <div className="sourcing-card">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg></div>
              <h4>Invite Recruiters</h4>
              <p>Add external recruiters to your job and allow them to add candidates.</p>
              <button className="sourcing-link">Invite now</button>
            </div>

            <div className="sourcing-card">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div>
              <h4>Share on Social Media</h4>
              <div className="social-icons">
                <span className="social-circle fb">f</span>
                <span className="social-circle in">in</span>
                <span className="social-circle tw">𝕏</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="sourcing-step">
        <div className="step-marker">3</div>
        <div className="step-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 className="step-title" style={{ marginBottom: 0 }}>Finally, a few smaller actions you can take</h3>
            <span className="coming-soon-badge">Coming Soon</span>
          </div>
          <p className="step-subtitle">Actions that ensure you're receiving candidates from everywhere in your recruiting mix.</p>
          
          <div className="sourcing-grid">
            <div className="sourcing-card">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
              <h4>Website Connect</h4>
              <p>Embed your jobs on your website. We provide the code and update automatically.</p>
              <button className="sourcing-link">Connect</button>
            </div>

            <div className="sourcing-card">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
              <h4>Job Shortlink</h4>
              <div className="sourcing-input-box">https://apply.workable.com/j/7AA...</div>
              <button className="sourcing-link">Copy to clipboard</button>
            </div>

            <div className="sourcing-card">
              <div className="sourcing-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <h4>Job Mailbox</h4>
              <div className="sourcing-input-box">7AA6F6E414@jobs.workablemail...</div>
              <button className="sourcing-link">Copy to clipboard</button>
            </div>
          </div>
        </div>
      </div>

        <div className="sourcing-step last">
          <div className="step-marker">4</div>
          <div className="step-content">
            <h3 className="step-title">Happy recruiting! Good luck.</h3>
          </div>
        </div>
                </div>
              </div>
            )}
          </>
        ) : (
          renderUploadMode()
        )}
      </div>
    </div>
  );
}
