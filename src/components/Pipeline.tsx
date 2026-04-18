import { motion } from 'framer-motion';

const departments = [
  { name: 'Library', status: 'Cleared', active: false },
  { name: 'Laboratory', status: 'Cleared', active: false },
  { name: 'Accounts', status: 'Processing', active: true },
  { name: 'Department', status: 'Pending', active: false },
  { name: 'Alumni Office', status: 'Pending', active: false },
];

const Pipeline = () => {
  return (
    <section className="pipeline">
      <div className="container">
        <div className="pipeline-header">
          <div>
            <span className="label" style={{ color: 'var(--accent-color)' }}>Global Sync Status</span>
            <h2 className="serif italic" style={{ fontSize: '3.5rem', marginTop: '10px' }}>Institutional Pipeline</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="label">Efficiency Rating</span>
            <div style={{ fontSize: '2rem', fontWeight: 300, fontFamily: 'Newsreader' }}>99.42%</div>
          </div>
        </div>

        <div className="pipeline-track">
          {departments.map((dept, index) => (
            <motion.div 
              key={index} 
              className={`pipeline-node ${dept.active ? 'active' : ''} ${dept.status === 'Cleared' ? 'cleared' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="node-indicator">
                {dept.active && (
                  <motion.div 
                    className="node-pulse" 
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }} 
                    transition={{ repeat: Infinity, duration: 2 }} 
                  />
                )}
                {dept.active && <div className="node-dot" />}
              </div>
              <div className="node-info">
                <span className="label node-name">{dept.name}</span>
                <span className="node-status">{dept.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pipeline;
