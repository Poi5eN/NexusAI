import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function ReportCard({ report, isDark }) {
  if (!report) return null;

  return (
    <div className={`mt-8 rounded-[32px] overflow-hidden border transition-all duration-500 shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
      {/* Header */}
      <div className={`p-8 md:p-12 border-b transition-colors ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <LucideIcons.FileSearch className="w-6 h-6 text-amber-500" />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-amber-500/50' : 'text-amber-600/50'}`}>Analytical Report</span>
        </div>
        <h2 className={`text-3xl md:text-4xl font-black tracking-tight leading-tight transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
          {report.title}
        </h2>
      </div>

      <div className="p-8 md:p-12 space-y-12">
        {/* Executive Summary */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <LucideIcons.AlignLeft className="w-5 h-5 text-amber-500" />
            <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/40'}`}>Executive Summary</h3>
          </div>
          <p className={`text-lg leading-relaxed font-medium transition-colors ${isDark ? 'text-white/70' : 'text-black/90'}`}>
            {report.executive_summary}
          </p>
        </section>

        {/* Key Findings */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 mb-8">
            <LucideIcons.ListChecks className="w-5 h-5 text-amber-500" />
            <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/40'}`}>Key Findings</h3>
          </div>
          
          <div className="grid gap-6">
            {report.key_findings?.map((finding, idx) => (
              <div 
                key={idx} 
                className={`p-6 md:p-8 rounded-[24px] border transition-all duration-300 hover:translate-x-1 ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-black/[0.01] border-black/5 hover:bg-black/[0.02]'}`}
              >
                <h4 className={`text-lg font-black mb-3 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{finding.point}</h4>
                <p className={`text-sm leading-relaxed mb-6 transition-colors ${isDark ? 'text-white/50' : 'text-black/70'}`}>{finding.details}</p>
                
                {finding.sources?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {finding.sources.map((source, sIdx) => (
                      <a 
                        key={sIdx}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isDark ? 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white' : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black'}`}
                      >
                        <LucideIcons.Link className="w-3 h-3" />
                        Source {sIdx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        {report.conclusion && (
          <section className={`p-8 md:p-10 rounded-[24px] border transition-colors ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              <LucideIcons.Flag className="w-5 h-5 text-amber-500" />
              <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-amber-500/60' : 'text-amber-600/60'}`}>Conclusion</h3>
            </div>
            <p className={`text-base leading-relaxed font-bold transition-colors ${isDark ? 'text-white/80' : 'text-black'}`}>
              {report.conclusion}
            </p>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className={`p-8 border-t flex justify-between items-center transition-colors ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
        <div className="flex items-center gap-3">
          <LucideIcons.ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-black/20'}`}>Verified by Nexus Intelligence</span>
        </div>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white' : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black'}`}>
          <LucideIcons.Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>
    </div>
  );
}
