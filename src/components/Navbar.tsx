import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#0A0A0A] border-b border-[#1E1E1E] flex items-center justify-between px-8 py-4">
      <div className="font-dm-mono text-white font-bold text-sm">
        NEXUS
      </div>
      <div className="flex items-center gap-6">
        <Link 
          to="/auth" 
          className="text-white font-dm-mono uppercase text-xs tracking-widest cursor-pointer"
        >
          LOGIN
        </Link>
        <Link 
          to="/auth" 
          className="text-white font-dm-mono uppercase text-xs tracking-widest cursor-pointer"
        >
          REGISTER
        </Link>
        <Link 
          to="/auth" 
          className="border border-[#C8F135] text-[#C8F135] font-dm-mono uppercase text-xs tracking-widest px-4 py-2 rounded-[6px] cursor-pointer"
        >
          PORTAL ACCESS
        </Link>
      </div>
    </nav>
  );
}
