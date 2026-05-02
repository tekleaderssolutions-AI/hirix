import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, Bot, UserCircle,
  Calendar, BarChart3, FolderOpen, Inbox, Settings,
  ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import useUiStore from '@/store/uiStore';

const navSections = [
  {
    title: 'Main',
    links: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/jobs', icon: Briefcase, label: 'Jobs' },
      { to: '/candidates', icon: Users, label: 'Candidates' },
      { to: '/copilot', icon: Bot, label: 'AI Copilot' },
    ],
  },
  {
    title: 'Organization',
    links: [
      { to: '/people', icon: UserCircle, label: 'People' },
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
      { to: '/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
  {
    title: 'Workspace',
    links: [
      { to: '/files', icon: FolderOpen, label: 'Files' },
      { to: '/inbox', icon: Inbox, label: 'Inbox' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, collapseSidebar } = useUiStore();
  const location = useLocation();

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <Sparkles size={28} style={{ color: 'var(--color-primary-light)' }} />
        <h1>Hirix</h1>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive || location.pathname.startsWith(link.to) ? 'active' : ''}`
                }
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={collapseSidebar} style={{ width: '100%' }}>
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          <span>{sidebarCollapsed ? '' : 'Collapse'}</span>
        </button>
      </div>
    </aside>
  );
}
