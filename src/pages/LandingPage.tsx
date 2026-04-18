import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";
import { Workflow, RefreshCw, Award } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-16">
        <div className="flex flex-col items-center text-center">
          <div className="font-dm-mono text-[#C8F135] text-xs tracking-widest uppercase mb-6">
            GRADUATION CLEARANCE PROTOCOL
          </div>
          
          <h1 className="font-syne text-white font-bold text-6xl md:text-7xl leading-tight mb-8">
            Your No–Dues.<br/>
            Digitized. Done.
          </h1>
          
          <p className="text-[#9A9A9A] max-w-xl text-base font-normal mb-10">
            Track approvals, upload documents, and receive your clearance certificate — entirely online.
          </p>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/auth" 
              className="bg-[#C8F135] text-[#0A0A0A] font-bold uppercase font-dm-mono tracking-widest rounded-[6px] px-6 py-3 text-sm cursor-pointer"
            >
              GET STARTED →
            </Link>
            <Link 
              to="/auth" 
              className="border border-white text-white uppercase font-dm-mono tracking-widest rounded-[6px] px-6 py-3 text-sm cursor-pointer"
            >
              SEE HOW IT WORKS
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Cards Section */}
      <section className="w-full px-8 py-[80px]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6">
          <FeatureCard 
            icon={Workflow}
            title="MULTI-STAGE APPROVALS"
            description="Sequential digital sign-off from Lab → HOD → Principal."
          />
          <FeatureCard 
            icon={RefreshCw}
            title="LIVE STATUS HEATMAP"
            description="Color-coded progress: Green, Yellow, Red."
          />
          <FeatureCard 
            icon={Award}
            title="INSTANT CERTIFICATE"
            description="PDF generated on final approval. Download immediately."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center border-t border-[#1E1E1E] p-6">
        <p className="text-[#555555] font-dm-mono text-xs tracking-widest uppercase">
          © 2025 NEXUS · BUILT FOR STUDENTS, BY STUDENTS.
        </p>
      </footer>
    </div>
  );
}
