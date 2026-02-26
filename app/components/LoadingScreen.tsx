import React from 'react';


export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001e3c] via-[#003366] to-[#001e3c] flex items-center justify-center overflow-hidden relative">
      {/* SAP-inspired geometric grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, #0070D2 1px, transparent 1px),
            linear-gradient(0deg, #0070D2 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-[#F0AB00] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-[#F0AB00] opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      
      <div className="relative z-10">
        {/* SAP-style hexagonal background elements */}
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-80 h-80 opacity-10">
            <svg viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '20s' }}>
              <polygon points="50,5 90,25 90,65 50,85 10,65 10,25" fill="none" stroke="#0070D2" strokeWidth="0.5" />
              <polygon points="50,15 80,30 80,60 50,75 20,60 20,30" fill="none" stroke="#F0AB00" strokeWidth="0.5" />
              <polygon points="50,25 70,35 70,55 50,65 30,55 30,35" fill="none" stroke="#0070D2" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        {/* Main loading content */}
        <div className="flex flex-col items-center gap-10 px-8">
          {/* SAP-inspired spinner */}
          <div className="relative w-28 h-28">
            {/* Outer ring - SAP Blue */}
            <div className="absolute inset-0">
              <svg className="w-full h-full animate-spin" style={{ animationDuration: '2s' }} viewBox="0 0 50 50">
                <circle 
                  cx="25" 
                  cy="25" 
                  r="20" 
                  fill="none" 
                  stroke="#0070D2" 
                  strokeWidth="2" 
                  strokeDasharray="80, 200" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* Middle ring - SAP Gold */}
            <div className="absolute inset-3">
              <svg className="w-full h-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} viewBox="0 0 50 50">
                <circle 
                  cx="25" 
                  cy="25" 
                  r="20" 
                  fill="none" 
                  stroke="#F0AB00" 
                  strokeWidth="2" 
                  strokeDasharray="60, 200" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* Inner hexagon */}
            <div className="absolute inset-6 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
                <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#0070D2" opacity="0.3" />
              </svg>
            </div>
          </div>

          {/* Professional loading text */}
          <div className="text-center space-y-4">
            <div className="flex items-center gap-3 justify-center">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#F0AB00]"></div>
              <h2 className="text-3xl font-light tracking-wide text-white">
                <span className="font-semibold">SAP</span> Experience
              </h2>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#F0AB00]"></div>
            </div>
            
            <p className="text-[#F0AB00] text-sm font-medium tracking-wider uppercase">
              Loading the Page
            </p>
            
            {/* Professional progress dots */}
            <div className="flex gap-2 justify-center pt-2">
              <div className="w-2 h-2 rounded-full bg-[#0070D2] animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-[#0070D2] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#0070D2] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#F0AB00] animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>

          {/* SAP-style progress bar */}
          <div className="w-80 space-y-2">
            <div className="h-1 bg-[#003366] rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#0070D2] via-[#F0AB00] to-[#0070D2] rounded-full animate-shimmer"
                style={{
                  backgroundSize: '200% 100%',
                }}
              ></div>
            </div>
            <p className="text-center text-slate-400 text-xs font-light tracking-wide">
              Loading enterprise solutions...
            </p>
          </div>

          {/* SAP tagline */}
          <div className="pt-6 border-t border-slate-700/30 w-80">
            <p className="text-center text-slate-500 text-xs tracking-wider">
              
            </p>
          </div>
        </div>

        {/* Professional floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: i % 3 === 0 ? '#0070D2' : i % 3 === 1 ? '#F0AB00' : '#ffffff',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.2,
                animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) translateX(15px) scale(1.2);
            opacity: 0.4;
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
