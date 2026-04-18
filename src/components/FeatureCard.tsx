import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-[10px] p-8 flex-1 flex flex-col items-start w-full">
      <div className="w-10 h-10 bg-[#1A1A1A] rounded-[6px] flex items-center justify-center mb-6">
        <Icon className="text-white w-5 h-5" />
      </div>
      <h3 className="font-dm-mono text-white uppercase tracking-widest text-sm font-bold mb-2">
        {title}
      </h3>
      <p className="text-[#9A9A9A] text-sm font-normal">
        {description}
      </p>
    </div>
  );
}
