import { Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function AuthPage() {
  const [role, setRole] = useState<"STUDENT" | "FACULTY">("STUDENT");

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-[460px] bg-[#111111] border border-[#1E1E1E] rounded-[10px] p-12">
        <div className="text-center mb-8">
          <h1 className="font-syne text-[#C8F135] font-bold text-3xl uppercase mb-2">
            NEXUS
          </h1>
          <p className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase">
            CLEARANCE TERMINAL
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList 
            variant="line" 
            className="w-full flex border-b border-[#1E1E1E] rounded-none p-0 h-auto bg-transparent mb-8"
          >
            <TabsTrigger 
              value="login" 
              className="flex-1 py-4 uppercase font-dm-mono tracking-widest text-xs
                         text-[#555555] data-active:text-white
                         data-active:after:bg-[#C8F135] after:h-[2px] after:bottom-0 rounded-none bg-transparent hover:bg-transparent transition-none"
            >
              LOGIN
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="flex-1 py-4 uppercase font-dm-mono tracking-widest text-xs
                         text-[#555555] data-active:text-white
                         data-active:after:bg-[#C8F135] after:h-[2px] after:bottom-0 rounded-none bg-transparent hover:bg-transparent transition-none"
            >
              REGISTER
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0 outline-none flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase">
                STUDENT ID
              </label>
              <input 
                type="text" 
                placeholder="ENTER ID..." 
                className="w-full bg-[#141414] border border-[#1E1E1E] rounded-[6px] text-white font-dm-mono text-sm px-4 py-3 placeholder:text-[#555555] outline-none focus:border-[#C8F135] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase">
                  PASSWORD
                </label>
                <a href="#" className="font-dm-mono text-[#C8F135] text-xs tracking-widest uppercase">
                  FORGOT PASSWORD?
                </a>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-[#141414] border border-[#1E1E1E] rounded-[6px] text-white font-dm-mono text-sm px-4 py-3 outline-none focus:border-[#C8F135] placeholder:text-[#555555]"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555]">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button className="w-full bg-[#C8F135] text-[#0A0A0A] font-bold uppercase font-dm-mono tracking-widest rounded-[6px] py-4 mt-2">
              CONTINUE →
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-[#1E1E1E]"></div>
              <span className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase whitespace-nowrap">
                OR CONTINUE AS
              </span>
              <div className="flex-1 h-px bg-[#1E1E1E]"></div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-transparent border border-[#1E1E1E] text-white font-dm-mono uppercase text-sm rounded-[6px] py-3">
                FACULTY
              </button>
              <button className="flex-1 bg-transparent border border-[#1E1E1E] text-white font-dm-mono uppercase text-sm rounded-[6px] py-3">
                ADMIN
              </button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="mt-0 outline-none flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase">
                FULL NAME
              </label>
              <input 
                type="text" 
                placeholder="ENTER NAME..." 
                className="w-full bg-[#141414] border border-[#1E1E1E] rounded-[6px] text-white font-dm-mono text-sm px-4 py-3 placeholder:text-[#555555] outline-none focus:border-[#C8F135]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase">
                {role === "STUDENT" ? "STUDENT ID" : "FACULTY ID"}
              </label>
              <input 
                type="text" 
                placeholder={role === "STUDENT" ? "ENTER ID..." : "ENTER FACULTY ID..."} 
                className="w-full bg-[#141414] border border-[#1E1E1E] rounded-[6px] text-white font-dm-mono text-sm px-4 py-3 placeholder:text-[#555555] outline-none focus:border-[#C8F135]"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase">
                EMAIL
              </label>
              <input 
                type="email" 
                placeholder="ENTER EMAIL..." 
                className="w-full bg-[#141414] border border-[#1E1E1E] rounded-[6px] text-white font-dm-mono text-sm px-4 py-3 placeholder:text-[#555555] outline-none focus:border-[#C8F135]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase">
                PASSWORD
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-[#141414] border border-[#1E1E1E] rounded-[6px] text-white font-dm-mono text-sm px-4 py-3 outline-none focus:border-[#C8F135] placeholder:text-[#555555]"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555]">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-dm-mono text-[#555555] text-xs tracking-widest uppercase">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-[#141414] border border-[#1E1E1E] rounded-[6px] text-white font-dm-mono text-sm px-4 py-3 outline-none focus:border-[#C8F135] placeholder:text-[#555555]"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555]">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex w-full gap-2">
              <button 
                type="button"
                onClick={() => setRole("STUDENT")}
                className="flex-1 font-dm-mono text-xs tracking-widest uppercase py-3 rounded-[6px] bg-[#141414] border border-[#1E1E1E] text-[#555555]"
              >
                STUDENT
              </button>
              <button 
                type="button"
                onClick={() => setRole("FACULTY")}
                className={`flex-1 font-dm-mono text-xs tracking-widest uppercase py-3 rounded-[6px] border ${
                  role === "FACULTY" 
                    ? "bg-[#C8F135] border-[#C8F135] text-[#0A0A0A] font-bold" 
                    : "bg-[#141414] border-[#1E1E1E] text-[#555555]"
                }`}
              >
                FACULTY
              </button>
            </div>

            <button className="w-full bg-[#C8F135] text-[#0A0A0A] font-bold uppercase font-dm-mono tracking-widest rounded-[6px] py-4 mt-2">
              CREATE ACCOUNT →
            </button>
          </TabsContent>
        </Tabs>

        <p className="font-dm-mono text-[#555555] text-xs tracking-widest text-center uppercase mt-12">
          JWT-SECURED SESSION. CREDENTIALS ENCRYPTED LOCALLY.
        </p>
      </div>
    </div>
  );
}
