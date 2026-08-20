export const Icon = ({name, size=20}:{name:string,size?:number}) => {
 const common={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const}
 const p:any={
  menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
  arrow:<><path d="M5 12h14M13 6l6 6-6 6"/></>,
  shield:<><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></>,
  spark:<><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></>,
  wallet:<><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M15 11h6v5h-6a2.5 2.5 0 010-5z"/></>,
  trend:<><path d="M4 17l5-5 4 3 7-8"/><path d="M15 7h5v5"/></>,
  chat:<><path d="M21 15a4 4 0 01-4 4H8l-5 3 1.5-4A7 7 0 013 12a7 7 0 017-7h4a7 7 0 017 7v3z"/></>,
  plus:<><path d="M12 5v14M5 12h14"/></>,
  send:<><path d="M22 2L9 15"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></>,
 }
 return <svg {...common}>{p[name] || p.spark}</svg>
}
