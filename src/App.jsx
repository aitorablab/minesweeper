import { useState, useEffect, useCallback, useRef } from "react";

// ─── Difficulties ─────────────────────────────────────────────────────────────
const DIFFICULTIES = {
  easy:   { label: "Fácil",   cols: 9,  rows: 9,  mines: 10 },
  medium: { label: "Medio",   cols: 14, rows: 14, mines: 35 },
  hard:   { label: "Difícil", cols: 22, rows: 14, mines: 55 },
};

// ─── SVG Icon Renderers ───────────────────────────────────────────────────────
const sz = "100%";

const Icons = {
  emoji: {
    label: "Emoji",
    Mine: () => <span style={{fontSize:"1.1em",lineHeight:1}}>💣</span>,
    Flag: () => <span style={{fontSize:"1.1em",lineHeight:1}}>🚩</span>,
    Num: ({n}) => <span style={{fontSize:"0.82em",fontWeight:800,color:["","#2563eb","#16a34a","#dc2626","#7c3aed","#b45309","#0891b2","#374151","#6b7280"][n],fontFamily:"'DM Sans',sans-serif",lineHeight:1,userSelect:"none"}}>{n}</span>,
    previewMine: "💣", previewFlag: "🚩",
  },

  minimal: {
    label: "Minimal",
    Mine: () => (
      <svg viewBox="0 0 20 20" width={sz} height={sz}>
        <circle cx="10" cy="10" r="5.5" fill="none" stroke="#374151" strokeWidth="1.8"/>
        <circle cx="10" cy="10" r="2" fill="#374151"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <line key={i} x1="10" y1="10"
            x2={10+Math.cos(a*Math.PI/180)*8.5}
            y2={10+Math.sin(a*Math.PI/180)*8.5}
            stroke="#374151" strokeWidth="1.4" strokeLinecap="round"/>
        ))}
      </svg>
    ),
    Flag: () => (
      <svg viewBox="0 0 20 20" width={sz} height={sz}>
        <line x1="5" y1="3" x2="5" y2="17" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"/>
        <polygon points="5,3 15,7 5,11" fill="#374151"/>
      </svg>
    ),
    Num: ({n}) => <span style={{fontSize:"0.82em",fontWeight:800,color:["","#2563eb","#16a34a","#dc2626","#7c3aed","#b45309","#0891b2","#374151","#6b7280"][n],fontFamily:"'DM Sans',sans-serif",lineHeight:1,userSelect:"none"}}>{n}</span>,
    previewMine: "◎", previewFlag: "⚑",
  },

  flatbold: {
    label: "Flat Bold",
    Mine: () => (
      <svg viewBox="0 0 20 20" width={sz} height={sz}>
        <circle cx="10" cy="10" r="5.5" fill="#ef4444"/>
        <circle cx="10" cy="10" r="2.2" fill="#7f1d1d"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <line key={i} x1={10+Math.cos(a*Math.PI/180)*5.5} y1={10+Math.sin(a*Math.PI/180)*5.5}
            x2={10+Math.cos(a*Math.PI/180)*9}
            y2={10+Math.sin(a*Math.PI/180)*9}
            stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
        ))}
        <circle cx="7.8" cy="8" r="1.2" fill="rgba(255,255,255,0.5)"/>
      </svg>
    ),
    Flag: () => (
      <svg viewBox="0 0 20 20" width={sz} height={sz}>
        <line x1="5.5" y1="2.5" x2="5.5" y2="17.5" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
        <rect x="5.5" y="2.5" width="9" height="7" rx="1.5" fill="#f59e0b"/>
        <rect x="5.5" y="2.5" width="9" height="3.5" rx="1.5" fill="#d97706"/>
      </svg>
    ),
    Num: ({n}) => <span style={{fontSize:"0.82em",fontWeight:900,color:["","#3b82f6","#22c55e","#ef4444","#a855f7","#f97316","#06b6d4","#475569","#94a3b8"][n],fontFamily:"'DM Sans',sans-serif",lineHeight:1,userSelect:"none"}}>{n}</span>,
    previewMine: null, previewFlag: null,
    PreviewMine: () => (
      <svg viewBox="0 0 20 20" width="20" height="20">
        <circle cx="10" cy="10" r="5.5" fill="#ef4444"/>
        <circle cx="10" cy="10" r="2.2" fill="#7f1d1d"/>
        {[0,90,180,270].map((a,i)=>(
          <line key={i} x1={10+Math.cos(a*Math.PI/180)*5.5} y1={10+Math.sin(a*Math.PI/180)*5.5}
            x2={10+Math.cos(a*Math.PI/180)*9} y2={10+Math.sin(a*Math.PI/180)*9}
            stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
        ))}
      </svg>
    ),
    PreviewFlag: () => (
      <svg viewBox="0 0 20 20" width="20" height="20">
        <line x1="5.5" y1="2.5" x2="5.5" y2="17.5" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
        <rect x="5.5" y="2.5" width="9" height="7" rx="1.5" fill="#f59e0b"/>
      </svg>
    ),
  },

  glass: {
    label: "Glass",
    Mine: () => (
      <svg viewBox="0 0 20 20" width={sz} height={sz}>
        <defs>
          <radialGradient id="gm" cx="38%" cy="35%">
            <stop offset="0%" stopColor="#f87171"/>
            <stop offset="100%" stopColor="#991b1b"/>
          </radialGradient>
        </defs>
        <circle cx="10" cy="10" r="6" fill="url(#gm)" opacity="0.92"/>
        {[30,75,120,165,210,255,300,345].map((a,i)=>(
          <line key={i}
            x1={10+Math.cos(a*Math.PI/180)*6} y1={10+Math.sin(a*Math.PI/180)*6}
            x2={10+Math.cos(a*Math.PI/180)*9.2} y2={10+Math.sin(a*Math.PI/180)*9.2}
            stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" opacity="0.8"/>
        ))}
        <circle cx="8" cy="7.5" r="1.8" fill="rgba(255,255,255,0.35)"/>
        <circle cx="10" cy="10" r="2.4" fill="rgba(0,0,0,0.25)"/>
      </svg>
    ),
    Flag: () => (
      <svg viewBox="0 0 20 20" width={sz} height={sz}>
        <defs>
          <linearGradient id="gf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="100%" stopColor="#1d4ed8"/>
          </linearGradient>
        </defs>
        <line x1="5.5" y1="2" x2="5.5" y2="18" stroke="rgba(100,116,139,0.7)" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M5.5 2.5 L15.5 6.5 L5.5 11 Z" fill="url(#gf)" opacity="0.9"/>
        <path d="M5.5 2.5 L15.5 6.5 L10 7.5 Z" fill="rgba(255,255,255,0.25)"/>
      </svg>
    ),
    Num: ({n}) => <span style={{fontSize:"0.82em",fontWeight:800,color:["","#3b82f6","#22c55e","#ef4444","#a855f7","#f97316","#06b6d4","#475569","#94a3b8"][n],fontFamily:"'DM Sans',sans-serif",lineHeight:1,userSelect:"none"}}>{n}</span>,
    previewMine: null, previewFlag: null,
    PreviewMine: () => (
      <svg viewBox="0 0 20 20" width="20" height="20">
        <defs><radialGradient id="gmp" cx="38%" cy="35%"><stop offset="0%" stopColor="#f87171"/><stop offset="100%" stopColor="#991b1b"/></radialGradient></defs>
        <circle cx="10" cy="10" r="6" fill="url(#gmp)" opacity="0.92"/>
        {[30,120,210,300].map((a,i)=>(
          <line key={i} x1={10+Math.cos(a*Math.PI/180)*6} y1={10+Math.sin(a*Math.PI/180)*6}
            x2={10+Math.cos(a*Math.PI/180)*9.2} y2={10+Math.sin(a*Math.PI/180)*9.2}
            stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" opacity="0.8"/>
        ))}
        <circle cx="8" cy="7.5" r="1.8" fill="rgba(255,255,255,0.35)"/>
      </svg>
    ),
    PreviewFlag: () => (
      <svg viewBox="0 0 20 20" width="20" height="20">
        <defs><linearGradient id="gfp" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#1d4ed8"/></linearGradient></defs>
        <line x1="5.5" y1="2" x2="5.5" y2="18" stroke="rgba(100,116,139,0.7)" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M5.5 2.5 L15.5 6.5 L5.5 11 Z" fill="url(#gfp)" opacity="0.9"/>
      </svg>
    ),
  },

  outlined: {
    label: "Outlined",
    Mine: () => (
      <svg viewBox="0 0 20 20" width={sz} height={sz}>
        <circle cx="10" cy="10" r="5" fill="none" stroke="#f43f5e" strokeWidth="1.8"/>
        <circle cx="10" cy="10" r="2" fill="#f43f5e"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <line key={i}
            x1={10+Math.cos(a*Math.PI/180)*5} y1={10+Math.sin(a*Math.PI/180)*5}
            x2={10+Math.cos(a*Math.PI/180)*8.8} y2={10+Math.sin(a*Math.PI/180)*8.8}
            stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round"/>
        ))}
      </svg>
    ),
    Flag: () => (
      <svg viewBox="0 0 20 20" width={sz} height={sz}>
        <line x1="5.5" y1="2.5" x2="5.5" y2="17.5" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
        <path d="M5.5 3 L15 6.8 L5.5 11" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M5.5 3 L15 6.8 L5.5 11 Z" fill="#10b981" opacity="0.18"/>
      </svg>
    ),
    Num: ({n}) => <span style={{fontSize:"0.82em",fontWeight:800,color:["","#3b82f6","#22c55e","#ef4444","#a855f7","#f97316","#06b6d4","#475569","#94a3b8"][n],fontFamily:"'DM Sans',sans-serif",lineHeight:1,userSelect:"none"}}>{n}</span>,
    previewMine: null, previewFlag: null,
    PreviewMine: () => (
      <svg viewBox="0 0 20 20" width="20" height="20">
        <circle cx="10" cy="10" r="5" fill="none" stroke="#f43f5e" strokeWidth="1.8"/>
        <circle cx="10" cy="10" r="2" fill="#f43f5e"/>
        {[0,90,180,270].map((a,i)=>(
          <line key={i} x1={10+Math.cos(a*Math.PI/180)*5} y1={10+Math.sin(a*Math.PI/180)*5}
            x2={10+Math.cos(a*Math.PI/180)*8.8} y2={10+Math.sin(a*Math.PI/180)*8.8}
            stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round"/>
        ))}
      </svg>
    ),
    PreviewFlag: () => (
      <svg viewBox="0 0 20 20" width="20" height="20">
        <line x1="5.5" y1="2.5" x2="5.5" y2="17.5" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
        <path d="M5.5 3 L15 6.8 L5.5 11 Z" fill="#10b981" opacity="0.18" stroke="#10b981" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
};

// ─── Palettes ─────────────────────────────────────────────────────────────────
const PALETTES = {
  classic:  { label: "Classic Grey",   hidden: "#b0b8bf", revealed: "#dde3e8", border: "#7e8f9a" },
  sage:     { label: "Muted Sage",     hidden: "#a8b5a2", revealed: "#e8ede6", border: "#7a9472" },
  slate:    { label: "Deep Slate",     hidden: "#8fa3b8", revealed: "#d8e3ee", border: "#587898" },
  sand:     { label: "Warm Sand",      hidden: "#c4b49a", revealed: "#f0e8da", border: "#9e8a6e" },
  lavender: { label: "Soft Lavender",  hidden: "#b4acd4", revealed: "#e8e4f8", border: "#8878b4" },
  rose:     { label: "Dusty Rose",     hidden: "#c8a0a8", revealed: "#f4e0e4", border: "#a06878" },
  forest:   { label: "Forest Night",   hidden: "#7a9e7e", revealed: "#c8dfca", border: "#4a7a50" },
  crimson:  { label: "Fire Crimson",   hidden: "#d4746a", revealed: "#fce8e6", border: "#b04840" },
  ocean:    { label: "Deep Ocean",     hidden: "#5a9ec4", revealed: "#c8e4f4", border: "#2a70a0" },
  gold:     { label: "Amber Gold",     hidden: "#d4a84a", revealed: "#faf0cc", border: "#a87820" },
};

// ─── Game logic ───────────────────────────────────────────────────────────────
function createBoard(rows, cols) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ r, c, mine: false, revealed: false, flagged: false, count: 0 }))
  );
}
function placeMines(board, rows, cols, mines, safeR, safeC) {
  const safe = new Set();
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const nr = safeR+dr, nc = safeC+dc;
    if (nr>=0&&nr<rows&&nc>=0&&nc<cols) safe.add(`${nr},${nc}`);
  }
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random()*rows), c = Math.floor(Math.random()*cols);
    if (!board[r][c].mine && !safe.has(`${r},${c}`)) { board[r][c].mine=true; placed++; }
  }
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    if (board[r][c].mine) continue;
    let count=0;
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const nr=r+dr,nc=c+dc;
      if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&board[nr][nc].mine) count++;
    }
    board[r][c].count=count;
  }
  return board;
}
function floodReveal(board, rows, cols, r, c) {
  const stack=[[r,c]];
  while (stack.length) {
    const [cr,cc]=stack.pop();
    if (cr<0||cr>=rows||cc<0||cc>=cols) continue;
    const cell=board[cr][cc];
    if (cell.revealed||cell.flagged||cell.mine) continue;
    cell.revealed=true;
    if (cell.count===0) for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) if(dr!==0||dc!==0) stack.push([cr+dr,cc+dc]);
  }
  return board;
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function IconPreview({ iconKey }) {
  const set = Icons[iconKey];
  const Mine = set.PreviewMine || null;
  const Flag = set.PreviewFlag || null;
  return (
    <div style={{ display:"flex", gap:4, alignItems:"center", justifyContent:"center" }}>
      {Mine ? (
        <div style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Mine />
        </div>
      ) : (
        <span style={{fontSize:18}}>{set.previewMine}</span>
      )}
      {Flag ? (
        <div style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Flag />
        </div>
      ) : (
        <span style={{fontSize:18}}>{set.previewFlag}</span>
      )}
    </div>
  );
}

function SettingsModal({ open, onClose, diff, iconSet, palette, onApply }) {
  const [localDiff, setLocalDiff]       = useState(diff);
  const [localIcon, setLocalIcon]       = useState(iconSet);
  const [localPalette, setLocalPalette] = useState(palette);
  useEffect(() => { if (open) { setLocalDiff(diff); setLocalIcon(iconSet); setLocalPalette(palette); } }, [open]);
  if (!open) return null;

  const SL = ({ children }) => (
    <p style={{ fontSize:10, fontWeight:700, color:"#999", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>
      {children}
    </p>
  );

  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:200,
      background:"rgba(8,8,18,0.52)",backdropFilter:"blur(8px)",
      display:"flex",alignItems:"center",justifyContent:"center",
      animation:"fadeIn 0.18s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#f5f1eb", borderRadius:24, padding:"28px 24px 22px",
        width:"min(500px,95vw)",
        boxShadow:"0 24px 64px rgba(0,0,0,0.28)",
        animation:"popUp 0.26s cubic-bezier(0.34,1.5,0.64,1)",
        maxHeight:"92vh", overflowY:"auto",
      }}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#1a1a2e",letterSpacing:"-0.03em"}}>Configuración</h2>
          <button onClick={onClose} style={{
            background:"rgba(0,0,0,0.08)",border:"none",borderRadius:8,
            width:30,height:30,cursor:"pointer",fontSize:15,color:"#777",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>✕</button>
        </div>

        {/* Difficulty */}
        <div style={{marginBottom:24}}>
          <SL>Dificultad</SL>
          <div style={{display:"flex",gap:8}}>
            {Object.entries(DIFFICULTIES).map(([k,d]) => {
              const active = localDiff===k;
              return (
                <button key={k} onClick={()=>setLocalDiff(k)} style={{
                  flex:1, padding:"11px 6px", borderRadius:13,
                  border:`2px solid ${active?"#1a1a2e":"transparent"}`,
                  background:active?"#1a1a2e":"rgba(0,0,0,0.06)",
                  color:active?"#fff":"#555",
                  cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                  fontWeight:700,fontSize:13,transition:"all 0.15s",
                }}>
                  <div>{d.label}</div>
                  <div style={{fontSize:10,opacity:0.55,marginTop:3,fontWeight:500}}>
                    {d.cols}×{d.rows} · {d.mines}💣
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Icons */}
        <div style={{marginBottom:24}}>
          <SL>Estilo de iconos</SL>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {Object.entries(Icons).map(([k,s]) => {
              const active = localIcon===k;
              return (
                <button key={k} onClick={()=>setLocalIcon(k)} style={{
                  flex:"1 1 calc(20% - 7px)", minWidth:78,
                  padding:"12px 6px", borderRadius:13,
                  border:`2px solid ${active?"#1a1a2e":"transparent"}`,
                  background:active?"#1a1a2e":"rgba(0,0,0,0.06)",
                  color:active?"#fff":"#555",
                  cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600,fontSize:11,transition:"all 0.15s",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                }}>
                  <IconPreview iconKey={k} />
                  <div style={{letterSpacing:"0.01em"}}>{s.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Palette */}
        <div style={{marginBottom:26}}>
          <SL>Color del tablero</SL>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:7}}>
            {Object.entries(PALETTES).map(([k,pal]) => {
              const active = localPalette===k;
              return (
                <button key={k} onClick={()=>setLocalPalette(k)} style={{
                  display:"flex",alignItems:"center",gap:10,
                  padding:"9px 12px",borderRadius:12,
                  border:`2px solid ${active?"#1a1a2e":"transparent"}`,
                  background:active?"rgba(26,26,46,0.07)":"rgba(0,0,0,0.04)",
                  cursor:"pointer",textAlign:"left",transition:"all 0.15s",
                }}>
                  {/* Two-tile preview: hidden + revealed */}
                  <div style={{display:"flex",gap:3,flexShrink:0}}>
                    {[pal.hidden, pal.revealed].map((bg,i)=>(
                      <div key={i} style={{
                        width:16,height:16,borderRadius:4,background:bg,
                        boxShadow:i===0
                          ?`inset -1.5px -1.5px 0 ${pal.border}, inset 1.5px 1.5px 0 rgba(255,255,255,0.42)`
                          :"inset 1px 1px 0 rgba(0,0,0,0.1)",
                      }}/>
                    ))}
                  </div>
                  <span style={{
                    fontSize:12,fontWeight:700,letterSpacing:"-0.01em",
                    color:active?"#1a1a2e":"#666",
                    fontFamily:"'DM Sans',sans-serif",
                  }}>{pal.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply */}
        <button onClick={()=>{onApply(localDiff,localIcon,localPalette);onClose();}} style={{
          width:"100%",padding:"14px",
          background:"#1a1a2e",color:"#fff",
          border:"none",borderRadius:14,
          fontFamily:"'DM Sans',sans-serif",
          fontWeight:800,fontSize:15,
          cursor:"pointer",letterSpacing:"0.01em",
          boxShadow:"0 4px 16px rgba(26,26,46,0.28)",
        }}>
          Aplicar y reiniciar
        </button>
      </div>
    </div>
  );
}

// ─── Cell ─────────────────────────────────────────────────────────────────────
function Cell({ cell, iconKey, palette, gameOver, onReveal, onFlag, shake }) {
  const pal = PALETTES[palette];
  const set = Icons[iconKey];
  const Mine = set.Mine;
  const Flag = set.Flag;
  const Num  = set.Num;

  let bg = pal.hidden;
  let shadow = `inset -2px -2px 0 ${pal.border}, inset 2px 2px 0 rgba(255,255,255,0.45)`;
  let content = null;

  const cellSize = "clamp(22px,3vw,34px)";

  if (cell.revealed) {
    bg = pal.revealed;
    shadow = `inset 1px 1px 0 rgba(0,0,0,0.09)`;
    if (cell.mine) {
      bg = "#fca5a5";
      content = <div style={{width:"60%",height:"60%",display:"flex",alignItems:"center",justifyContent:"center"}}><Mine /></div>;
    } else if (cell.count > 0) {
      content = <Num n={cell.count} />;
    }
  } else if (cell.flagged) {
    content = <div style={{width:"60%",height:"60%",display:"flex",alignItems:"center",justifyContent:"center"}}><Flag /></div>;
  } else if (gameOver && cell.mine) {
    bg = "#fde8e8"; shadow = `inset 1px 1px 0 rgba(0,0,0,0.08)`;
    content = <div style={{width:"60%",height:"60%",display:"flex",alignItems:"center",justifyContent:"center",opacity:0.4}}><Mine /></div>;
  }

  return (
    <div
      onMouseDown={e=>{ if(e.button===0&&!cell.flagged) onReveal(); if(e.button===2) onFlag(); }}
      onContextMenu={e=>{ e.preventDefault(); onFlag(); }}
      style={{
        width:cellSize, height:cellSize,
        background:bg, display:"flex", alignItems:"center", justifyContent:"center",
        borderRadius:5, boxShadow:shadow,
        cursor:gameOver?"default":"pointer",
        userSelect:"none", transition:"background 0.1s",
        animation:shake?"shake 0.3s ease":"none",
        flexShrink:0,
      }}
    >{content}</div>
  );
}

// ─── Refresh Icon SVG ─────────────────────────────────────────────────────────
function RefreshIcon({ color="#1a1a2e" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState("easy");
  const [iconSet, setIconSet]       = useState("emoji");
  const [palette, setPalette]       = useState("classic");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [board, setBoard]           = useState(null);
  const [status, setStatus]         = useState("idle");
  const [minesLeft, setMinesLeft]   = useState(0);
  const [time, setTime]             = useState(0);
  const [shakeCell, setShakeCell]   = useState(null);
  const [firstClick, setFirstClick] = useState(true);

  const timerRef = useRef(null);
  const diff  = DIFFICULTIES[difficulty];

  const resetGame = useCallback((d) => {
    clearInterval(timerRef.current);
    const dd = DIFFICULTIES[d];
    setBoard(createBoard(dd.rows, dd.cols));
    setStatus("idle"); setMinesLeft(dd.mines);
    setTime(0); setFirstClick(true); setShakeCell(null);
  }, []);

  useEffect(() => { resetGame(difficulty); }, []);

  useEffect(() => {
    if (status==="playing") { timerRef.current = setInterval(()=>setTime(t=>t+1),1000); }
    else { clearInterval(timerRef.current); }
    return ()=>clearInterval(timerRef.current);
  }, [status]);

  const reveal = useCallback((r,c) => {
    if (status==="won"||status==="lost") return;
    setBoard(prev=>{
      if (!prev) return prev;
      let next=prev.map(row=>row.map(cell=>({...cell})));
      if (next[r][c].flagged||next[r][c].revealed) return prev;
      if (firstClick) {
        next=placeMines(next,diff.rows,diff.cols,diff.mines,r,c);
        setFirstClick(false); setStatus("playing");
      }
      if (next[r][c].mine) {
        next[r][c].revealed=true; setStatus("lost");
        setShakeCell(`${r},${c}`); setTimeout(()=>setShakeCell(null),400);
        return next;
      }
      next=floodReveal(next,diff.rows,diff.cols,r,c);
      const unrevealed=next.flat().filter(cell=>!cell.revealed&&!cell.mine).length;
      if (unrevealed===0) {
        next.flat().forEach(cell=>{if(!cell.revealed)cell.flagged=true;});
        setStatus("won"); setMinesLeft(0);
      }
      return next;
    });
  }, [status,firstClick,diff]);

  const toggleFlag = useCallback((r,c)=>{
    if (status==="won"||status==="lost"||status==="idle") return;
    setBoard(prev=>{
      if (!prev||prev[r][c].revealed) return prev;
      const next=prev.map(row=>row.map(cell=>({...cell})));
      next[r][c].flagged=!next[r][c].flagged;
      setMinesLeft(m=>next[r][c].flagged?m-1:m+1);
      return next;
    });
  },[status]);

  const handleApply = (d,i,p) => {
    setDifficulty(d); setIconSet(i); setPalette(p); resetGame(d);
  };

  const fmtTime = t=>`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
  const maxW = difficulty==="hard"?840:difficulty==="medium"?560:400;

  const icons = Icons[iconSet];
  const FlagPreview = icons.PreviewFlag || null;
  const mineEmoji = icons.previewMine;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popUp{0%{opacity:0;transform:scale(0.88) translateY(14px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes pop{0%{transform:scale(0.93);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        button:active{opacity:0.75;}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.14);border-radius:3px}
      `}</style>

      <SettingsModal open={settingsOpen} onClose={()=>setSettingsOpen(false)}
        diff={difficulty} iconSet={iconSet} palette={palette} onApply={handleApply}/>

      <div style={{
        minHeight:"100vh",
        background:"linear-gradient(150deg,#eae5dc 0%,#ddd6ca 100%)",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",
        padding:"28px 16px 48px",fontFamily:"'DM Sans',sans-serif",
      }}>
        {/* Title */}
        <div style={{textAlign:"center",marginBottom:24,animation:"slideDown 0.4s ease"}}>
          <h1 style={{fontSize:"clamp(26px,5vw,42px)",fontWeight:800,color:"#1a1a2e",letterSpacing:"-0.04em",lineHeight:1}}>
            Buscaminas
          </h1>
          <p style={{fontSize:11,color:"#aaa",marginTop:5,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>
            Click · Revelar &nbsp;·&nbsp; Click derecho · Bandera
          </p>
        </div>

        {/* Top bar */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          width:"100%",maxWidth:maxW,marginBottom:12,gap:8,
          animation:"slideDown 0.45s ease",
        }}>
          {/* Mines counter */}
          <div style={{
            background:"rgba(255,255,255,0.68)",backdropFilter:"blur(8px)",
            borderRadius:12,padding:"7px 16px",
            fontFamily:"'DM Mono',monospace",fontWeight:500,
            fontSize:15,color:"#1a1a2e",
            boxShadow:"0 1px 6px rgba(0,0,0,0.07)",
            minWidth:74,textAlign:"center",
            display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          }}>
            {FlagPreview
              ? <div style={{width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center"}}><FlagPreview /></div>
              : <span>{mineEmoji}</span>
            }
            {minesLeft}
          </div>

          {/* Center buttons */}
          <div style={{display:"flex",gap:8}}>
            {/* New game button */}
            <button onClick={()=>resetGame(difficulty)} style={{
              background: status==="won"?"#16a34a":status==="lost"?"#ef4444":"rgba(255,255,255,0.85)",
              border:"none",borderRadius:12,padding:"8px 16px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,
              color:(status==="won"||status==="lost")?"#fff":"#1a1a2e",
              cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.09)",
              transition:"all 0.18s",
              display:"flex",alignItems:"center",gap:7,
            }}>
              {status==="won"
                ? <><span>🎉</span> Nueva</>
                : status==="lost"
                  ? <><RefreshIcon color="#fff"/> Reintentar</>
                  : <><RefreshIcon/> Nueva partida</>
              }
            </button>

            <button onClick={()=>setSettingsOpen(true)} style={{
              background:"rgba(255,255,255,0.85)",
              border:"none",borderRadius:12,padding:"8px 14px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,
              color:"#1a1a2e",cursor:"pointer",
              boxShadow:"0 2px 8px rgba(0,0,0,0.09)",
              transition:"all 0.18s",
              display:"flex",alignItems:"center",gap:6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Configurar
            </button>
          </div>

          {/* Timer */}
          <div style={{
            background:"rgba(255,255,255,0.68)",backdropFilter:"blur(8px)",
            borderRadius:12,padding:"7px 16px",
            fontFamily:"'DM Mono',monospace",fontWeight:500,
            fontSize:15,color:"#1a1a2e",
            boxShadow:"0 1px 6px rgba(0,0,0,0.07)",
            minWidth:74,textAlign:"center",
          }}>
            ⏱ {fmtTime(time)}
          </div>
        </div>

        {/* Banner */}
        {(status==="won"||status==="lost") && (
          <div style={{
            background:status==="won"?"#dcfce7":"#fee2e2",
            color:status==="won"?"#15803d":"#b91c1c",
            borderRadius:12,padding:"8px 28px",
            fontWeight:800,fontSize:14,marginBottom:10,
            animation:"pop 0.28s ease",
            boxShadow:"0 2px 10px rgba(0,0,0,0.08)",
          }}>
            {status==="won"?"🎉 ¡Ganaste!":"💥 ¡Boom! Inténtalo de nuevo"}
          </div>
        )}

        {/* Board */}
        <div style={{
          background:"rgba(255,255,255,0.42)",backdropFilter:"blur(10px)",
          borderRadius:18,padding:"clamp(8px,2vw,14px)",
          boxShadow:"0 4px 28px rgba(0,0,0,0.1)",
          overflowX:"auto",maxWidth:"100%",
          animation:"pop 0.35s cubic-bezier(0.34,1.3,0.64,1)",
        }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:`repeat(${diff.cols}, clamp(22px,3vw,34px))`,
            gap:3,
          }}>
            {board && board.flat().map(cell=>(
              <Cell
                key={`${cell.r},${cell.c}`}
                cell={cell} iconKey={iconSet} palette={palette}
                gameOver={status==="lost"||status==="won"}
                onReveal={()=>reveal(cell.r,cell.c)}
                onFlag={()=>toggleFlag(cell.r,cell.c)}
                shake={shakeCell===`${cell.r},${cell.c}`}
              />
            ))}
          </div>
        </div>

        <p style={{marginTop:14,fontSize:11,color:"#bbb",fontWeight:600,letterSpacing:"0.04em"}}>
          {diff.rows}×{diff.cols} · {diff.mines} minas · {PALETTES[palette].label} · {Icons[iconSet].label}
        </p>
      </div>
    </>
  );
}