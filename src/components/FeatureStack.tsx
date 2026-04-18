import { motion } from 'framer-motion';
import { Link as LinkIcon, Shield, CreditCard } from 'lucide-react';

const features = [
  {
    title: "Chain of Custody",
    subtitle: "Immutable Ledger",
    description: "Every signature is a cryptographic proof. Our proprietary sync engine ensures that once an authority clears you, it is recorded forever on the university backbone.",
    icon: <LinkIcon size={40} strokeWidth={1.5} />,
    bgText: "CUSTODY"
  },
  {
    title: "Document Vault",
    subtitle: "Encrypted Registry",
    description: "All your academic credentials, verified and accessible in a single, secure digital environment. From transcripts to degree certifications.",
    icon: <Shield size={40} strokeWidth={1.5} />,
    bgText: "VAULT"
  },
  {
    title: "Payment Sandbox",
    subtitle: "Zero Latency",
    description: "Settle all outstanding fees in a single click. No bank queues, no manual receipt verification. A frictionless financial exit.",
    icon: <CreditCard size={40} strokeWidth={1.5} />,
    bgText: "PAYMENTS"
  }
];

const FeatureStack = () => {
  return (
    <section className="features">
      {features.map((feature, i) => (
        <div key={i} className="feature-section">
          <div className="container feature-container" style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
            <div className="feature-text-wrapper">
              <motion.h3 
                className="bg-text"
                initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 0.05, x: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3 }}
              >
                {feature.bgText}
              </motion.h3>
              <motion.div 
                className="feature-content"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="icon-wrap">{feature.icon}</div>
                <span className="label subtitle">{feature.subtitle}</span>
                <h4 className="serif title">{feature.title}</h4>
                <p className="desc">{feature.description}</p>
              </motion.div>
            </div>
            
            <motion.div 
              className="feature-visual"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <div className="glass-card feature-card">
                <div className="card-inner">
                  <div className="card-line" />
                  <div className="card-line-top" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FeatureStack;
