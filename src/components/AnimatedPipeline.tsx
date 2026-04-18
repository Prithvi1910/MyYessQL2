import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { id: 'LAB', status: 'done' },
  { id: 'LIBRARY', status: 'fail' },
  { id: 'ACCOUNTS', status: 'done' },
  { id: 'HOD', status: 'current' },
  { id: 'PRINCIPAL', status: 'pending' },
];

const AnimatedPipeline = () => {
  return (
    <div className="animated-pipeline" style={{ padding: '0 10px', height: '60px', display: 'flex', alignItems: 'center' }}>
      <div className="steps-wrapper" style={{ width: '100%', position: 'relative' }}>
        {/* Track Background */}
        <div style={{ 
          position: 'absolute', 
          top: '5px', 
          left: '5%', 
          right: '5%', 
          height: '1px', 
          background: 'rgba(255,255,255,0.1)', 
          zIndex: 0 
        }} />
        
        <div className="steps-container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          position: 'relative', 
          zIndex: 1 
        }}>
          {steps.map((step, index) => {
            const isDone = step.status === 'done';
            const isFail = step.status === 'fail';
            const isCurrent = step.status === 'current';
            
            let color = 'rgba(255, 255, 255, 0.15)';
            if (isDone) color = '#4ade80'; // Success Emerald
            if (isFail) color = '#f87171'; // Muted Rose
            if (isCurrent) color = 'var(--accent-color)';

            return (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                {/* Dot Container */}
                <div style={{ height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: color,
                      boxShadow: isCurrent ? `0 0 15px ${color}` : 'none',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: color,
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                    )}
                  </motion.div>
                </div>
                
                {/* Label */}
                <span style={{ 
                  marginTop: '12px',
                  fontSize: '0.55rem', 
                  fontWeight: isCurrent ? 800 : 500, 
                  color: isCurrent ? 'var(--text-primary)' : 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.1em',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {step.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnimatedPipeline;
