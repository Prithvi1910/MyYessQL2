import { motion } from 'framer-motion';

const Hero = ({ isAuthenticated }: { isAuthenticated?: boolean }) => {
  return (
    <section className="hero">
      <div className="container hero-content">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="label" style={{ color: 'var(--accent-color)' }}>
            Institutional Protocol v1.4
          </span>
          <h1 className="hero-title">
            Your Exit.<br />
            <span className="italic font-light">Your Terms.</span>
          </h1>
          <p className="hero-sub">
            Nexus digitizes the complex tapestry of graduation clearance into a single,
            sovereign digital ledger. No queues. No stamps. Just proof.
          </p>
          {!isAuthenticated && (
            <div className="hero-btns">
              <button className="btn-primary">Establish Connection</button>
              <button className="btn-secondary">Authority Entry</button>
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="ticker-bar">
        <div className="ticker-track">
            {['LIBRARY CLEARANCE: 98%', 'LAB PROTOCOL: ACTIVE', 'ACCOUNTS OFFICE: NO LATENCY', 'REGISTRAR: SYNCED', 'DEPT OF ARCHITECTURE: AUDITING', 'SPORTS COMPLEX: CLOSED'].map((item, i) => (
                <span key={i} className="ticker-item label">{item}</span>
            ))}
            {['LIBRARY CLEARANCE: 98%', 'LAB PROTOCOL: ACTIVE', 'ACCOUNTS OFFICE: NO LATENCY', 'REGISTRAR: SYNCED', 'DEPT OF ARCHITECTURE: AUDITING', 'SPORTS COMPLEX: CLOSED'].map((item, i) => (
                <span key={`dup-${i}`} className="ticker-item label">{item}</span>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
