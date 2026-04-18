import React from 'react';
import { motion } from 'framer-motion';

const notifications = [
  {
    id: 1,
    type: 'red',
    title: 'Library dues flagged',
    description: '₹180 pending. Clear dues to proceed.',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'yellow',
    title: 'HOD approval pending',
    description: 'Your application is awaiting HOD review.',
    time: '1 day ago'
  },
  {
    id: 3,
    type: 'green',
    title: 'Accounts cleared',
    description: 'Accounts department has approved your clearance.',
    time: '3 days ago'
  }
];

const NotificationPanel = () => {
  return (
    <motion.div 
      className="notification-panel"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="panel-header">
        <h3 className="panel-title">NOTIFICATIONS</h3>
      </div>
      
      <div className="notification-list">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification-item">
            <div className={`status-dot ${notif.type}`} />
            <div className="notif-content">
              <span className="notif-title">{notif.title}</span>
              <p className="notif-desc">{notif.description}</p>
              <span className="notif-time">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="panel-footer">
        <a href="#" className="view-all">VIEW ALL NOTIFICATIONS →</a>
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
