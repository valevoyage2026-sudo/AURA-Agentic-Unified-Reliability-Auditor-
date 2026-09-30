import React from 'react';

export const HeroGraph: React.FC = () => {
  return (
    <svg 
      className="w-full h-full bg-slate-950 font-sans" 
      viewBox="0 0 640 520" 
      preserveAspectRatio="xMidYMid slice" 
      role="img" 
      aria-hidden="true"
    >
      <defs>
        <pattern id="hg" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" stroke="rgba(51, 65, 85, 0.45)" fill="none" />
        </pattern>
        <style dangerouslySetInnerHTML={{ __html: `
          .l { stroke: #334155; fill: none; stroke-width: 1.5px; }
          .a { stroke: #06b6d4; fill: none; stroke-width: 1.5px; }
          .cf { stroke: #f59e0b; fill: none; stroke-width: 1.5px; stroke-dasharray: 4 4; }
          .pa { fill: rgba(15, 23, 42, 0.9); stroke: #334155; stroke-width: 1px; }
          .p { fill: #0f172a; stroke: #1e293b; stroke-width: 1px; }
          .fa { fill: #06b6d4; }
          .fg { fill: #10b981; }
          .fc { fill: #f59e0b; }
          .fw { fill: #a855f7; }
          .t { fill: #94a3b8; font-size: 11px; font-weight: 500; }
          .t-title { fill: #f8fafc; font-size: 12px; font-weight: 600; }
        `}} />
      </defs>
      <rect width="640" height="520" fill="url(#hg)"/>
      <path className="l" d="M208 168h224v154H208z" strokeDasharray="4 4"/>
      <path className="l" d="M224 184h192v122H224z" strokeDasharray="2 6"/>
      
      <path className="a" d="M240 245H88V116"/>
      <path className="a" d="M400 245H488V116"/>
      <path className="a" d="M240 270H72V330"/>
      <path className="a" d="M320 290V380"/>
      <path className="a" d="M400 270H548V300"/>
      <path className="a" d="M320 200V80"/>
      <path className="a" d="M548 352V420"/>
      <path className="cf" d="M264 406H72V382"/>
      
      <rect className="fa" x="157" y="242" width="7" height="7"/>
      <rect className="fa" x="428" y="242" width="7" height="7"/>
      <rect className="fa" x="317" y="330" width="7" height="7"/>
      <rect className="fa" x="317" y="130" width="7" height="7"/>
      <rect className="fa" x="545" y="384" width="7" height="7"/>
      <rect className="fc" x="150" y="403" width="7" height="7"/>

      {/* Nodes */}
      {/* Mission */}
      <rect className="pa" x="260" y="28" width="120" height="52"/>
      <text className="t-title" x="270" y="46">Mission</text>
      <text className="t" x="270" y="64">Salary trends</text>
      <rect className="fg" x="364" y="36" width="6" height="6"/>

      {/* Researcher */}
      <rect className="pa" x="32" y="64" width="112" height="52"/>
      <text className="t-title" x="42" y="82">Researcher</text>
      <text className="t" x="42" y="100">Find sources</text>
      <rect className="fg" x="128" y="72" width="6" height="6"/>

      {/* Analyst */}
      <rect className="pa" x="432" y="64" width="112" height="52"/>
      <text className="t-title" x="442" y="82">Analyst</text>
      <text className="t" x="442" y="100">Extract claims</text>
      <rect className="fg" x="528" y="72" width="6" height="6"/>

      {/* Searcher */}
      <rect className="pa" x="16" y="330" width="112" height="52"/>
      <text className="t-title" x="26" y="348">Searcher</text>
      <text className="t" x="26" y="366">Query graph</text>
      <rect className="fg" x="112" y="338" width="6" height="6"/>

      {/* Verifier */}
      <rect className="pa" x="264" y="380" width="112" height="52"/>
      <text className="t-title" x="274" y="398">Verifier</text>
      <text className="t" x="274" y="416">Check claims</text>
      <rect className="fc" x="360" y="388" width="6" height="6"/>

      {/* Writer */}
      <rect className="pa" x="492" y="300" width="112" height="52"/>
      <text className="t-title" x="502" y="318">Writer</text>
      <text className="t" x="502" y="336">Draft report</text>
      <rect className="fw" x="588" y="308" width="6" height="6"/>

      {/* Orchestrator */}
      <rect className="pa" x="240" y="200" width="160" height="90"/>
      <text className="t-title" x="256" y="232" style={{fontSize: '13px'}}>Orchestrator</text>
      <text className="t" x="256" y="250">Routing · Planning</text>
      <rect className="fg" x="256" y="268" width="6" height="6"/>
      <text className="t" x="268" y="274">Active</text>

      {/* Report Box */}
      <rect className="l" x="476" y="440" width="132" height="68"/>
      <rect className="p" x="464" y="430" width="132" height="68"/>
      <rect className="pa" x="452" y="420" width="132" height="68"/>
      <path className="l" d="M466 434h56"/>
      <rect className="fa" x="466" y="460" width="12" height="16"/>
      <rect className="fa" x="486" y="446" width="12" height="30"/>
      <rect className="fa" x="506" y="454" width="12" height="22"/>
      <rect className="fa" x="526" y="438" width="12" height="38"/>
      <path className="l" d="M462 476h108"/>
      
      <text className="t" x="84" y="450" style={{fill: '#f59e0b'}}>Needs more evidence</text>
    </svg>
  );
};
