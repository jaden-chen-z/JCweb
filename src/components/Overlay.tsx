import React from 'react';
import { motion } from 'framer-motion';
import { PROJECT_LIST, INTERESTS } from '../constants';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  verticalAlign?: 'center' | 'end' | 'start';
  noPadding?: boolean;
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  className = "",
  align = 'left', 
  verticalAlign = 'center',
  noPadding = false
}) => {
  const horizontalAlignClass = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';
  
  // 垂直对齐逻辑
  const verticalAlignClass = verticalAlign === 'end' ? 'justify-end' : verticalAlign === 'start' ? 'justify-start' : 'justify-center';
  
  // 内边距控制：noPadding 模式下移除默认 padding，用于全宽卡片
  const paddingClass = noPadding ? 'p-0' : 'p-8 md:p-20';
  
  const textAlignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  
  // 容器宽度：全宽模式下移除最大宽度限制
  const containerWidthClass = noPadding ? 'w-full max-w-none' : 'max-w-2xl';
  
  return (
    <section className={`h-screen w-screen flex flex-col ${verticalAlignClass} ${horizontalAlignClass} ${paddingClass} pointer-events-none ${className}`}>
      <div className={`${containerWidthClass} pointer-events-auto ${textAlignClass}`}>
        {children}
      </div>
    </section>
  );
};

export const Overlay: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, margin: "-10%" },
    transition: { duration: 0.8, ease: "easeOut" as const }
  };

  return (
    <div className="w-full">
      {/* Section 1: Hero - Clean Layout without Glass Box */}
      <Section align="center" verticalAlign="end" noPadding>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full px-6 pb-8 md:pb-16"
        >
          <div className="max-w-3xl mx-auto flex flex-col items-center">

            {/* Scroll Indicator - 仅保留箭头 */}
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <svg className="w-15 h-14 text-slate-700 drop-shadow-md" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </Section>

      {/* Section 2: Intro */}
      <Section align="center">
        {/* Glassmorphism Card */}
        <motion.div 
          {...fadeInUp} 
          className="bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 flex flex-col items-center text-center w-full max-w-lg mx-auto"
        >
          {/* Title - Name */}
          <h3 className="text-4xl font-bold text-slate-800 mb-2 drop-shadow-sm">Jaden Chen</h3>
          <div className="w-32 h-1.5 bg-emerald-500 rounded-full mb-8"></div>
          
          <div className="space-y-6 text-lg text-slate-700 w-full flex flex-col items-center justify-center">
            
            {/* Tags with Enhanced Dynamic Metallic Laser Style */}
            {/* Updated to a rich, colorful rainbow metallic gradient */}
            <div className="text-xl md:text-2xl font-black bg-[linear-gradient(90deg,#f97316,#fdba74,#fff7ed,#fdba74,#f97316)] bg-clip-text text-transparent drop-shadow-sm animate-laser leading-relaxed">
               Tags: Investor / Creative Director<br />AI Explorer
            </div>
            
            {/* Role */}
            <div className="mt-6 relative inline-block group">
              <a 
                href="https://cn.chinanhd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center hover:scale-105 transform transition-transform duration-300"
              >
                <span className="font-bold text-2xl text-slate-800 tracking-[0.2em] group-hover:text-emerald-600 transition-colors duration-300">
                  江苏新宏大集团
                </span>
                <span className="text-lg text-slate-600 font-medium tracking-normal mt-1 group-hover:text-emerald-500 transition-colors duration-300">
                  China New Hongda Group
                </span>
              </a>
              
              {/* Click Icon - Positioned at bottom right of the block with mask-based Laser Effect */}
              {/* Uses a sharp Mouse Cursor Arrow shape for clarity */}
              <div className="absolute -bottom-7 -right-7 animate-bounce pointer-events-none">
                <div 
                  className="w-8 h-8 bg-[linear-gradient(90deg,#f97316,#fdba74,#fff7ed,#fdba74,#f97316)] bg-[length:200%_auto] animate-laser"
                  style={{
                    maskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z' fill='black'/%3E%3C/svg%3E")`,
                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z' fill='black'/%3E%3C/svg%3E")`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat'
                  }}
                />
              </div>
            </div>
            
          </div>
        </motion.div>
      </Section>

      {/* Section 3: PE Investment */}
      <Section align="right">
        <motion.div {...fadeInUp}>
          <h3 className="text-5xl font-bold text-slate-800 mb-4 drop-shadow-sm">
            <span className="text-emerald-600">PE</span> Investments
          </h3>
          <p className="text-2xl text-slate-600 mb-8 font-medium bg-white/50 inline-block px-2 rounded-lg backdrop-blur-sm">
          成功投资股权项目 <strong className="text-slate-900">10+</strong><br />Successfully invested in <strong className="text-slate-900">10+</strong> equity projects
          </p>
          
          <div className="flex flex-wrap justify-end gap-3">
            {PROJECT_LIST.map((project, index) => (
              <span 
                key={index} 
                className="px-5 py-2.5 bg-white/90 text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200/60 backdrop-blur-sm hover:scale-105 transition-transform cursor-default"
              >
                {project}
              </span>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* Section 4: Public Market */}
      <Section align="left">
        <motion.div {...fadeInUp} className="relative p-6 bg-gradient-to-r from-white/90 to-transparent rounded-xl border-l-4 border-blue-500 backdrop-blur-sm">
           <h3 className="text-4xl font-bold text-slate-800 mb-4">Secondary Market</h3>
           <p className="text-lg text-slate-700 leading-relaxed max-w-md font-medium">
           Actively focused on China’s stock market, specializing in discretionary long-only strategies.<br />主观多头策略 / 积极做多A股。
           </p>
        </motion.div>
      </Section>

      {/* Section 5: Interests */}
      <Section align="center">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full"
        >
           {/* Title Tag with Glass Effect */}
           <h3 className="text-4xl font-bold text-slate-800 mb-12 text-center">
             Passions & Lifestyle
           </h3>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
             {INTERESTS.map((item, index) => (
               <motion.div
                 key={index}
                 whileHover={{ scale: 1.05, y: -5 }}
                 className="flex flex-col items-center justify-center p-5 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 hover:bg-white/40 hover:shadow-2xl transition-all duration-300"
               >
                 <span className="text-4xl mb-3 filter drop-shadow-md">{item.icon}</span>
                 <span className="font-bold text-slate-800 drop-shadow-sm">{item.name}</span>
               </motion.div>
             ))}
           </div>
        </motion.div>
      </Section>

      {/* Section 6: Contact */}
      <Section align="center" className="pb-20">
        <motion.div {...fadeInUp} className="text-center w-full px-4">
          <h2 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-8 drop-shadow-sm">
            Let's Collaborate.
          </h2>
          <p className="text-xl md:text-3xl text-slate-600 mb-12 font-medium">
            "Looking forward to creating value in reality or the metaverse."
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center">
             <a href="mailto:jadenttk@gmail.com" className="px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
               Get in Touch
             </a>
             <a 
               href="https://xhslink.com/m/4hRLqnR6IYa" 
               target="_blank" 
               rel="noopener noreferrer"
               className="px-10 py-5 bg-white/80 backdrop-blur-md text-slate-900 border border-slate-200 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
             >
               小红书：@Jaden杰登
             </a>
          </div>
          
          <footer className="mt-24 text-slate-400 text-sm font-semibold tracking-wide">
            © {new Date().getFullYear()} Ziyang Chen (Jaden). All Rights Reserved.
          </footer>
        </motion.div>
      </Section>
    </div>
  );
};