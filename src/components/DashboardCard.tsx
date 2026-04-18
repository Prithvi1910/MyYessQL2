import React from 'react';

interface DashboardCardProps {
  label: string;
  title: string;
  body: string;
  status: React.ReactNode;
  cta: string;
  href?: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ label, title, body, status, cta, href, onClick }) => {
  const CardWrapper = onClick ? 'button' : 'a';
  
  return (
    <CardWrapper 
      href={href} 
      className="dashboard-card" 
      onClick={onClick}
      style={onClick ? { textAlign: 'left', width: '100%', cursor: 'pointer', background: 'none' } : {}}
    >
      <span className="card-label label">{label}</span>
      <h3 className="card-title serif italic">{title}</h3>
      <p className="card-body">{body}</p>
      <div className="card-status">
        {status}
      </div>
      <span className="card-cta">{cta}</span>
    </CardWrapper>
  );
};

export default DashboardCard;
