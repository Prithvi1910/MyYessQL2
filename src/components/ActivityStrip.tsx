import React from 'react';

interface ActivityStripProps {
  statusCase: 1 | 2 | 3 | 4;
}

const ActivityStrip: React.FC<ActivityStripProps> = ({ statusCase }) => {
  const renderContent = () => {
    switch (statusCase) {
      case 1:
        return {
          text: 'No documents uploaded yet.',
          sub: 'Start by uploading your ID card, lab manual, and library receipt.',
          badge: null,
          action: 'Go to Documents →'
        };
      case 2:
        return {
          text: '3 documents submitted — awaiting admin review.',
          sub: 'Last uploaded: Lab Manual · 2 hours ago',
          badge: 'UNDER REVIEW',
          badgeClass: 'under-review',
          action: null
        };
      case 3:
        return {
          text: 'All documents verified and approved.',
          sub: 'Submitted on: 14 April 2025',
          badge: 'APPROVED',
          badgeClass: 'approved',
          action: null
        };
      case 4:
        return {
          text: '1 document requires resubmission.',
          sub: 'Library Receipt was rejected. Reason: Illegible scan.',
          badge: 'ACTION REQUIRED',
          badgeClass: 'action-required',
          action: 'Resubmit Document →'
        };
      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <div className="activity-strip">
      <div className="activity-info">
        <span className="activity-text">{content.text}</span>
        <span className="activity-sub">{content.sub}</span>
      </div>
      
      <div className="activity-actions">
        {content.badge && (
          <span className={`status-badge ${content.badgeClass}`}>
            {content.badge}
          </span>
        )}
        {content.action && (
          <a href="#" className="label" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
            {content.action}
          </a>
        )}
      </div>
    </div>
  );
};

export default ActivityStrip;
