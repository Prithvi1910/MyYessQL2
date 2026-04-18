
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-left">
          <div className="logo serif italic" style={{ fontSize: '1.25rem', opacity: 0.5 }}>NEXUS</div>
          <span className="label footer-copy">© MMXXIV NEXUS UNIVERSITY. ALL RIGHTS RESERVED.</span>
        </div>
        <div className="footer-links">
          <a href="#" className="label">Privacy</a>
          <a href="#" className="label">Protocol</a>
          <a href="#" className="label">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
