"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

/* ── GrahmOS Full Demo Dashboard ──
   "Kill the WiFi" demo: 20-minute three-act arc
   Act 1: Everything online, real-time CNC telemetry flowing
   Act 2: Kill the WiFi — dashboard keeps running via Service Worker + mesh
   Act 3: Reconnect — data syncs in <500ms, zero data loss
   
   Integration points visible:
   - NATS mesh topology (3 edge nodes, cross-node gossip)
   - MTConnect protocol (CNC data schema)
   - Vercel AI Gateway (predictive maintenance)
   - Service Worker offline layer
── */

const C = {
  bg: "#060A10", bgPanel: "#0C1219", bgCard: "#111921",
  bgHover: "#162030", border: "#1B2636", borderActive: "#2A3E58",
  text: "#E2E8F0", textSoft: "#94A3B8", textMuted: "#4A5C72",
  green: "#10B981", greenDim: "rgba(16,185,129,0.12)", greenGlow: "rgba(16,185,129,0.3)",
  red: "#EF4444", redDim: "rgba(239,68,68,0.12)", redGlow: "rgba(239,68,68,0.3)",
  amber: "#F59E0B", amberDim: "rgba(245,158,11,0.12)",
  blue: "#3B82F6", blueDim: "rgba(59,130,246,0.12)", blueGlow: "rgba(59,130,246,0.3)",
  purple: "#8B5CF6", purpleDim: "rgba(139,92,246,0.12)",
  cyan: "#06B6D4", cyanDim: "rgba(6,182,212,0.10)",
  haasRed: "#CE1126",
};

const STATES = ["IDLE", "SETUP", "RUNNING", "ALARM", "MAINTENANCE"];
const STATE_COLORS = { IDLE: C.textMuted, SETUP: C.amber, RUNNING: C.green, ALARM: C.red, MAINTENANCE: C.purple };
const STATE_LABELS = { IDLE: "Idle", SETUP: "Setup", RUNNING: "Running", ALARM: "Alarm", MAINTENANCE: "Maint." };

const TRANSITIONS = {
  IDLE: { IDLE: 0.90, SETUP: 0.10 },
  SETUP: { SETUP: 0.82, RUNNING: 0.18 },
  RUNNING: { RUNNING: 0.94, IDLE: 0.03, ALARM: 0.02, MAINTENANCE: 0.01 },
  ALARM: { ALARM: 0.45, IDLE: 0.25, MAINTENANCE: 0.30 },
  MAINTENANCE: { MAINTENANCE: 0.88, IDLE: 0.12 },
};

const MACHINES = [
  { id: "VF2-001", type: "Haas VF-2", node: 0, icon: "⚙️" },
  { id: "VF2-002", type: "Haas VF-2", node: 0, icon: "⚙️" },
  { id: "ST10-001", type: "Haas ST-10", node: 1, icon: "🔧" },
  { id: "UMC750", type: "Haas UMC-750", node: 1, icon: "🔩" },
  { id: "VF4SS", type: "Haas VF-4SS", node: 2, icon: "⚙️" },
];

const NODES = [
  { id: "edge-nyc-01", label: "Edge NYC-1", region: "NYC", machines: [0, 1] },
  { id: "edge-nyc-02", label: "Edge NYC-2", region: "NYC", machines: [2, 3] },
  { id: "edge-sfo-01", label: "Edge SFO-1", region: "SFO", machines: [4] },
];

function nextState(s: any) {
  const t: any = TRANSITIONS[s as keyof typeof TRANSITIONS]; let r = Math.random();
  for (const [st, p] of Object.entries(t)) { r -= (p as number); if (r <= 0) return st; }
  return s;
}

function genMetrics(state: any, prev: any) {
  const base: any = {
    IDLE: { rpm: 0, load: 0, feed: 0, vib: 0.15, temp: 22 },
    SETUP: { rpm: 600, load: 12, feed: 300, vib: 0.6, temp: 26 },
    RUNNING: { rpm: 12000, load: 62, feed: 5200, vib: 2.2, temp: 38 },
    ALARM: { rpm: 0, load: 0, feed: 0, vib: 5.8, temp: 42 },
    MAINTENANCE: { rpm: 0, load: 0, feed: 0, vib: 0.2, temp: 24 },
  };
  const b = base[state];
  const n = () => (Math.random() - 0.5) * 0.12;
  const l = (a: any, b: any, t: any) => a + (b - a) * t;
  return {
    spindleSpeed: Math.max(0, Math.round(l(prev?.spindleSpeed ?? b.rpm, b.rpm, 0.25) * (1 + n()))),
    spindleLoad: Math.max(0, +(l(prev?.spindleLoad ?? b.load, b.load, 0.25) * (1 + n())).toFixed(1)),
    feedRate: Math.max(0, Math.round(l(prev?.feedRate ?? b.feed, b.feed, 0.25) * (1 + n()))),
    vibration: Math.max(0, +(l(prev?.vibration ?? b.vib, b.vib, 0.2) * (1 + n())).toFixed(2)),
    coolantTemp: Math.max(15, +(l(prev?.coolantTemp ?? b.temp, b.temp, 0.15) * (1 + n())).toFixed(1)),
  };
}

// AI prediction simulator
function aiPredict(metrics: any, state: any) {
  const risks: any[] = [];
  if (metrics.vibration > 4.0) risks.push({ component: "Spindle Bearing", risk: "HIGH", confidence: 0.92, eta: "~24h" });
  else if (metrics.vibration > 3.0) risks.push({ component: "Spindle Bearing", risk: "MEDIUM", confidence: 0.74, eta: "~72h" });
  if (metrics.coolantTemp > 40) risks.push({ component: "Coolant System", risk: "MEDIUM", confidence: 0.81, eta: "~48h" });
  if (metrics.spindleLoad > 80) risks.push({ component: "Drive Belt", risk: "HIGH", confidence: 0.88, eta: "~36h" });
  if (state === "ALARM") risks.push({ component: "System Fault", risk: "CRITICAL", confidence: 0.97, eta: "Immediate" });
  return risks;
}

function Sparkline({ data, color = C.green, width = 120, height = 28 }: { data: any[], color?: string, width?: number, height?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v: any, i: any) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill={`url(#sg-${color.replace('#', '')})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StatusDot({ state }: { state: any }) {
  const color = (STATE_COLORS as any)[state];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 10,
      background: `${color}18`, fontSize: 11, fontWeight: 600,
      color: color,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: color,
        boxShadow: state === "RUNNING" ? `0 0 6px ${color}` : "none",
        animation: state === "RUNNING" ? "pulse 2s infinite" : "none",
      }} />
      {(STATE_LABELS as any)[state]}
    </span>
  );
}

function MeshTopology({ nodes, isOffline, meshMessages }: { nodes: any[], isOffline: boolean, meshMessages: any[] }) {
  const w = 340, h = 180;
  const positions = [
    { x: 70, y: 50 },  // NYC-1
    { x: 170, y: 130 }, // NYC-2
    { x: 270, y: 60 },  // SFO-1
  ];
  const cloudPos = { x: 170, y: 20 };

  return (
    <svg width={w} height={h} style={{ display: "block", margin: "0 auto" }}>
      {/* Cloud node */}
      {!isOffline && (
        <>
          {positions.map((p, i) => (
            <line key={`cl-${i}`} x1={cloudPos.x} y1={cloudPos.y} x2={p.x} y2={p.y}
              stroke={C.blue} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
          ))}
          <circle cx={cloudPos.x} cy={cloudPos.y} r={14} fill={C.blueDim} stroke={C.blue} strokeWidth="1" />
          <text x={cloudPos.x} y={cloudPos.y + 4} textAnchor="middle" fill={C.blue} fontSize="9" fontWeight="600">▲</text>
        </>
      )}
      {isOffline && (
        <>
          <line x1={cloudPos.x - 8} y1={cloudPos.y - 8} x2={cloudPos.x + 8} y2={cloudPos.y + 8} stroke={C.red} strokeWidth="2" />
          <line x1={cloudPos.x + 8} y1={cloudPos.y - 8} x2={cloudPos.x - 8} y2={cloudPos.y + 8} stroke={C.red} strokeWidth="2" />
          <circle cx={cloudPos.x} cy={cloudPos.y} r={14} fill={C.redDim} stroke={C.red} strokeWidth="1" opacity="0.5" />
        </>
      )}
      {/* Mesh connections between edge nodes */}
      {positions.map((p1, i) =>
        positions.slice(i + 1).map((p2, j) => (
          <line key={`m-${i}-${j}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={C.green} strokeWidth="1.5" opacity={isOffline ? "0.8" : "0.3"}
            strokeDasharray={isOffline ? "none" : "3,3"} />
        ))
      )}
      {/* Animated mesh packets */}
      {meshMessages.map((msg: any, i: any) => {
        const from = positions[msg.from], to = positions[msg.to];
        const progress = msg.progress;
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;
        return (
          <circle key={i} cx={x} cy={y} r={3} fill={isOffline ? C.green : C.blue} opacity={0.9}>
          </circle>
        );
      })}
      {/* Edge nodes */}
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={20} fill={C.bgCard} stroke={isOffline ? C.green : C.border} strokeWidth="1.5" />
          {isOffline && <circle cx={p.x} cy={p.y} r={20} fill="none" stroke={C.green} strokeWidth="1" opacity="0.3">
          </circle>}
          <text x={p.x} y={p.y - 4} textAnchor="middle" fill={C.text} fontSize="8" fontWeight="600">
            {nodes[i].label.split(" ")[1]}
          </text>
          <text x={p.x} y={p.y + 8} textAnchor="middle" fill={C.textMuted} fontSize="7">
            {nodes[i].machines.length} machines
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function GrahmOSDemo() {
  const [machines, setMachines] = useState<any[]>(() =>
    MACHINES.map(m => ({ ...m, state: "IDLE", metrics: genMetrics("IDLE", null), history: { rpm: [], load: [], vib: [] }, alerts: [] }))
  );
  const [isOffline, setIsOffline] = useState(false);
  const [offlineBuffer, setOfflineBuffer] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [meshMessages, setMeshMessages] = useState<any[]>([]);
  const [totalTicks, setTotalTicks] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const bufferRef = useRef<any[]>([]);

  // Main simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalTicks(t => t + 1);
      setMachines(prev => prev.map((m, idx) => {
        const newState = nextState(m.state);
        const newMetrics = genMetrics(newState, m.metrics);
        const newHistory = {
          rpm: [...m.history.rpm.slice(-29), newMetrics.spindleSpeed],
          load: [...m.history.load.slice(-29), newMetrics.spindleLoad],
          vib: [...m.history.vib.slice(-29), newMetrics.vibration],
        };

        // Generate events
        if (newState !== m.state) {
          const ev = { time: new Date().toLocaleTimeString(), machine: m.id, from: m.state, to: newState };
          setEvents(e => [ev, ...e.slice(0, 19)]);
          if (isOffline) {
            bufferRef.current = [...bufferRef.current, { ...ev, buffered: true }];
            setOfflineBuffer([...bufferRef.current]);
          }
        }

        // AI predictions
        const alerts = aiPredict(newMetrics, newState);

        return { ...m, state: newState, metrics: newMetrics, history: newHistory, alerts };
      }));

      // Mesh message simulation
      if (Math.random() > 0.6) {
        const from = Math.floor(Math.random() * 3);
        let to = Math.floor(Math.random() * 3);
        while (to === from) to = Math.floor(Math.random() * 3);
        setMeshMessages(prev => [...prev.slice(-5), { from, to, progress: 0 }]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isOffline]);

  // Animate mesh messages
  useEffect(() => {
    const anim = setInterval(() => {
      setMeshMessages(prev =>
        prev.map(m => ({ ...m, progress: Math.min(m.progress + 0.08, 1) }))
          .filter(m => m.progress < 1)
      );
    }, 50);
    return () => clearInterval(anim);
  }, []);

  // Kill / restore WiFi
  const toggleOffline = useCallback(() => {
    if (!isOffline) {
      setIsOffline(true);
      bufferRef.current = [];
      setOfflineBuffer([]);
      setSyncStatus(null);
      setEvents(e => [{ time: new Date().toLocaleTimeString(), machine: "SYSTEM", from: "ONLINE", to: "OFFLINE", system: true }, ...e.slice(0, 19)]);
    } else {
      setIsOffline(false);
      setSyncStatus("syncing");
      const buffered = bufferRef.current.length;
      setEvents(e => [{ time: new Date().toLocaleTimeString(), machine: "SYSTEM", from: "OFFLINE", to: "ONLINE", system: true }, ...e.slice(0, 19)]);
      // Simulate sync delay
      setTimeout(() => {
        setSyncStatus(`synced`);
        setEvents(e => [{
          time: new Date().toLocaleTimeString(), machine: "MESH", from: "SYNC", to: `${buffered} events recovered`,
          system: true, sync: true
        }, ...e.slice(0, 19)]);
        bufferRef.current = [];
        setOfflineBuffer([]);
        setTimeout(() => setSyncStatus(null), 4000);
      }, 340 + Math.random() * 200);
    }
  }, [isOffline]);

  // Run AI analysis
  const runAI = useCallback(() => {
    setShowAI(true);
    const results = machines.flatMap(m =>
      m.alerts.map((a: any) => ({ ...a, machine: m.id, type: m.type }))
    );
    setAiResults(results);
  }, [machines]);

  const fleetUtil = machines.filter(m => m.state === "RUNNING").length / machines.length * 100;
  const alarming = machines.filter(m => m.state === "ALARM").length;
  const allRisks = machines.flatMap(m => m.alerts);
  const highRisks = allRisks.filter(r => r.risk === "HIGH" || r.risk === "CRITICAL").length;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes syncFlash { 0% { background: ${C.greenDim}; } 50% { background: ${C.green}25; } 100% { background: ${C.greenDim}; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{
        background: C.bgPanel, borderBottom: `1px solid ${C.border}`,
        padding: "10px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, #1a1a2e, #16213e)`, border: `1px solid rgba(59,130,246,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <polygon points="20,11 15.5,18.8 6.5,18.8 2,11 6.5,3.2 15.5,3.2" stroke="#22c55e" strokeWidth="1.2" fill="none" opacity="0.7" />
                <circle cx="11" cy="11" r="2.5" fill="#3b82f6" />
                <line x1="11" y1="11" x2="20" y2="11" stroke="#22c55e" strokeWidth="0.8" opacity="0.6" />
                <line x1="11" y1="11" x2="15.5" y2="18.8" stroke="#22c55e" strokeWidth="0.8" opacity="0.6" />
                <line x1="11" y1="11" x2="6.5" y2="18.8" stroke="#22c55e" strokeWidth="0.8" opacity="0.6" />
                <line x1="11" y1="11" x2="2" y2="11" stroke="#22c55e" strokeWidth="0.8" opacity="0.6" />
                <line x1="11" y1="11" x2="6.5" y2="3.2" stroke="#22c55e" strokeWidth="0.8" opacity="0.6" />
                <line x1="11" y1="11" x2="15.5" y2="3.2" stroke="#22c55e" strokeWidth="0.8" opacity="0.6" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Grahm<span style={{ color: C.offline || "#22c55e" }}>OS</span></div>
              <div style={{ fontSize: "0.55rem", color: C.textSoft, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Demo Environment</div>
            </div>
          </div>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 10,
            background: isOffline ? C.redDim : C.greenDim,
            color: isOffline ? C.red : C.green,
            fontWeight: 600, letterSpacing: "0.06em",
          }}>
            {isOffline ? "⊘ OFFLINE" : "● ONLINE"}
          </span>
          {syncStatus === "syncing" && (
            <span style={{ fontSize: 10, color: C.amber, animation: "pulse 0.5s infinite" }}>
              ↻ Syncing...
            </span>
          )}
          {syncStatus === "synced" && (
            <span style={{ fontSize: 10, color: C.green }}>
              ✓ Synced ({offlineBuffer.length || "all"} events recovered in 340ms)
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* AI Button */}
          <button onClick={runAI} style={{
            padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.purple}50`,
            background: C.purpleDim, color: C.purple, cursor: "pointer",
            fontSize: 11, fontWeight: 600, fontFamily: "inherit",
          }}>
            🧠 Run AI Analysis
          </button>
          {/* KILL THE WIFI BUTTON */}
          <button onClick={toggleOffline} style={{
            padding: "6px 14px", borderRadius: 6, border: "none",
            background: isOffline ? C.green : C.red,
            color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700,
            fontFamily: "inherit", letterSpacing: "0.02em",
            boxShadow: isOffline ? `0 0 16px ${C.greenGlow}` : `0 0 16px ${C.redGlow}`,
          }}>
            {isOffline ? "↻ RESTORE WIFI" : "⚡ KILL THE WIFI"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 45px)" }}>
        {/* ── LEFT PANEL: Fleet Overview ── */}
        <div style={{
          width: 280, background: C.bgPanel, borderRight: `1px solid ${C.border}`,
          padding: 16, overflowY: "auto", flexShrink: 0,
        }}>
          {/* Fleet Stats */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 10 }}>
              FLEET STATUS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: C.bgCard, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.textMuted }}>Utilization</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: fleetUtil > 50 ? C.green : C.amber }}>{fleetUtil.toFixed(0)}%</div>
              </div>
              <div style={{ background: C.bgCard, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.textMuted }}>Machines</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{machines.length}</div>
              </div>
              <div style={{ background: C.bgCard, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.textMuted }}>Alarms</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: alarming > 0 ? C.red : C.textMuted }}>{alarming}</div>
              </div>
              <div style={{ background: C.bgCard, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.textMuted }}>AI Risks</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: highRisks > 0 ? C.amber : C.textMuted }}>{highRisks}</div>
              </div>
            </div>
          </div>

          {/* Machine List */}
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 8 }}>
            MACHINES
          </div>
          {machines.map((m, i) => (
            <div key={m.id} onClick={() => setSelectedMachine(selectedMachine === i ? null : i)} style={{
              padding: "10px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
              background: selectedMachine === i ? C.bgHover : "transparent",
              border: `1px solid ${selectedMachine === i ? C.borderActive : "transparent"}`,
              transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{m.icon} {m.id}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{m.type} · {NODES[m.node].label}</div>
                </div>
                <StatusDot state={m.state} />
              </div>
              {m.alerts.length > 0 && (
                <div style={{ marginTop: 4, fontSize: 10, color: C.amber }}>
                  ⚠ {m.alerts.length} prediction{m.alerts.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          ))}

          {/* Offline Buffer */}
          {isOffline && offlineBuffer.length > 0 && (
            <div style={{
              marginTop: 12, padding: 10, borderRadius: 8,
              background: C.amberDim, border: `1px solid ${C.amber}30`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.amber, marginBottom: 4 }}>
                OFFLINE BUFFER
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.amber }}>
                {offlineBuffer.length} events
              </div>
              <div style={{ fontSize: 10, color: C.textSoft }}>Stored locally, will sync on reconnect</div>
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>

          {/* Offline Banner */}
          {isOffline && (
            <div style={{
              padding: "12px 18px", borderRadius: 10, marginBottom: 16,
              background: `linear-gradient(135deg, ${C.redDim}, ${C.amberDim})`,
              border: `1px solid ${C.red}30`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ fontSize: 24 }}>📡</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>Internet Connection Lost</div>
                <div style={{ fontSize: 12, color: C.textSoft }}>
                  GrahmOS mesh network active. Edge nodes communicating via NATS. All telemetry buffered locally. Dashboard continues operating via Service Worker cache.
                </div>
              </div>
            </div>
          )}

          {/* Sync Success Banner */}
          {syncStatus === "synced" && (
            <div style={{
              padding: "12px 18px", borderRadius: 10, marginBottom: 16,
              background: C.greenDim, border: `1px solid ${C.green}30`,
              display: "flex", alignItems: "center", gap: 12,
              animation: "syncFlash 1s ease-out",
            }}>
              <div style={{ fontSize: 24 }}>✅</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>Data Synchronized — Zero Loss</div>
                <div style={{ fontSize: 12, color: C.textSoft }}>
                  All buffered events recovered and synced to cloud in 340ms. No data was lost during offline period.
                </div>
              </div>
            </div>
          )}

          {/* Mesh Topology + Selected Machine Detail */}
          <div style={{ display: "grid", gridTemplateColumns: selectedMachine !== null ? "1fr 1fr" : "1fr", gap: 16, marginBottom: 16 }}>
            {/* Mesh Viz */}
            <div style={{
              background: C.bgCard, border: `1px solid ${isOffline ? C.green + "40" : C.border}`,
              borderRadius: 12, padding: 16,
              boxShadow: isOffline ? `0 0 20px ${C.greenGlow}` : "none",
              transition: "all 0.3s",
            }}>
              <div style={{
                fontSize: 10, fontWeight: 600, color: isOffline ? C.green : C.textMuted,
                letterSpacing: "0.1em", marginBottom: 8,
              }}>
                {isOffline ? "⬡ MESH NETWORK — ACTIVE" : "⬡ NATS MESH TOPOLOGY"}
              </div>
              <MeshTopology nodes={NODES} isOffline={isOffline} meshMessages={meshMessages} />
              <div style={{
                display: "flex", gap: 16, marginTop: 8, justifyContent: "center",
              }}>
                <span style={{ fontSize: 10, color: C.textMuted }}>
                  <span style={{ color: isOffline ? C.green : C.blue }}>●</span> {isOffline ? "Mesh active" : "Cloud connected"}
                </span>
                <span style={{ fontSize: 10, color: C.textMuted }}>
                  <span style={{ color: C.green }}>—</span> Node gossip
                </span>
                {isOffline && <span style={{ fontSize: 10, color: C.red }}>✕ Cloud disconnected</span>}
              </div>
            </div>

            {/* Selected Machine Detail */}
            {selectedMachine !== null && (
              <div style={{
                background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 16, animation: "slideIn 0.2s ease-out",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                      {machines[selectedMachine].icon} {machines[selectedMachine].id}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{machines[selectedMachine].type}</div>
                  </div>
                  <StatusDot state={machines[selectedMachine].state} />
                </div>

                {/* Metrics grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "Spindle RPM", val: machines[selectedMachine].metrics.spindleSpeed.toLocaleString(), unit: "rpm", data: machines[selectedMachine].history.rpm, color: C.blue },
                    { label: "Spindle Load", val: machines[selectedMachine].metrics.spindleLoad, unit: "%", data: machines[selectedMachine].history.load, color: C.cyan },
                    { label: "Vibration", val: machines[selectedMachine].metrics.vibration, unit: "mm/s", data: machines[selectedMachine].history.vib, color: machines[selectedMachine].metrics.vibration > 3 ? C.red : C.green },
                    { label: "Coolant Temp", val: machines[selectedMachine].metrics.coolantTemp, unit: "°C", data: [], color: C.amber },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background: C.bgPanel, borderRadius: 8, padding: "8px 10px",
                      border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 2 }}>{m.label}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono'" }}>
                          {m.val}<span style={{ fontSize: 10, color: C.textMuted }}>{m.unit}</span>
                        </span>
                      </div>
                      {m.data.length > 2 && <Sparkline data={m.data} color={m.color} width={100} height={20} />}
                    </div>
                  ))}
                </div>

                {/* AI Alerts for this machine */}
                {machines[selectedMachine].alerts.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}>
                      AI PREDICTIONS
                    </div>
                    {machines[selectedMachine].alerts.map((a: any, i: number) => (
                      <div key={i} style={{
                        padding: "6px 10px", borderRadius: 6, marginBottom: 4,
                        background: a.risk === "CRITICAL" || a.risk === "HIGH" ? C.redDim : C.amberDim,
                        border: `1px solid ${a.risk === "CRITICAL" || a.risk === "HIGH" ? C.red : C.amber}25`,
                        fontSize: 11, color: C.textSoft,
                        display: "flex", justifyContent: "space-between",
                      }}>
                        <span>
                          <span style={{
                            fontWeight: 700,
                            color: a.risk === "CRITICAL" || a.risk === "HIGH" ? C.red : C.amber,
                          }}>{a.risk}</span> · {a.component}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.textMuted }}>
                          {a.confidence * 100}% · {a.eta}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Machine Cards Grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10, marginBottom: 16,
          }}>
            {machines.map((m, i) => (
              <div key={m.id} onClick={() => setSelectedMachine(selectedMachine === i ? null : i)} style={{
                background: C.bgCard, border: `1px solid ${selectedMachine === i ? C.borderActive : C.border}`,
                borderRadius: 10, padding: 14, cursor: "pointer",
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{m.icon} {m.id}</div>
                  <StatusDot state={m.state} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginBottom: 6 }}>
                  <span>RPM</span><span style={{ color: C.textSoft, fontFamily: "'JetBrains Mono'" }}>{m.metrics.spindleSpeed.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginBottom: 6 }}>
                  <span>Load</span><span style={{ color: C.textSoft, fontFamily: "'JetBrains Mono'" }}>{m.metrics.spindleLoad}%</span>
                </div>
                <Sparkline data={m.history.rpm} color={STATE_COLORS[m.state as keyof typeof STATE_COLORS]} width={170} height={24} />
              </div>
            ))}
          </div>

          {/* Event Log */}
          <div style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: 16,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: C.textMuted,
              letterSpacing: "0.1em", marginBottom: 10,
            }}>
              EVENT LOG {isOffline && <span style={{ color: C.amber }}>· BUFFERING LOCALLY</span>}
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {events.length === 0 && <div style={{ fontSize: 11, color: C.textMuted, padding: 10 }}>Waiting for events...</div>}
              {events.map((e, i) => (
                <div key={i} style={{
                  padding: "5px 8px", borderRadius: 4, marginBottom: 2,
                  background: e.sync ? C.greenDim : e.system ? C.bgHover : "transparent",
                  fontSize: 11, fontFamily: "'JetBrains Mono'", color: C.textSoft,
                  animation: i === 0 ? "slideIn 0.2s ease-out" : "none",
                  display: "flex", gap: 10,
                }}>
                  <span style={{ color: C.textMuted, minWidth: 65 }}>{e.time}</span>
                  <span style={{
                    color: e.system ? (e.to === "OFFLINE" ? C.red : C.green) : C.text,
                    fontWeight: e.system ? 600 : 400, minWidth: 70,
                  }}>
                    {e.machine}
                  </span>
                  <span>
                    <span style={{ color: (STATE_COLORS as any)[e.from] || C.textMuted }}>{e.from}</span>
                    {" → "}
                    <span style={{ color: (STATE_COLORS as any)[e.to] || C.green }}>{e.to}</span>
                  </span>
                  {e.buffered && <span style={{ color: C.amber, fontSize: 9 }}>● buffered</span>}
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Modal */}
          {showAI && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 200,
            }} onClick={() => setShowAI(false)}>
              <div onClick={e => e.stopPropagation()} style={{
                background: C.bgPanel, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: 24, width: "90%", maxWidth: 500,
                maxHeight: "80vh", overflowY: "auto",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                    🧠 AI Predictive Maintenance Report
                  </div>
                  <button onClick={() => setShowAI(false)} style={{
                    background: "transparent", border: "none", color: C.textMuted,
                    cursor: "pointer", fontSize: 18, fontFamily: "inherit",
                  }}>×</button>
                </div>
                <div style={{
                  fontSize: 10, color: C.purple, fontFamily: "'JetBrains Mono'",
                  padding: "6px 10px", background: C.purpleDim, borderRadius: 6,
                  marginBottom: 14, border: `1px solid ${C.purple}30`,
                }}>
                  Model: Claude Sonnet via Vercel AI Gateway · {new Date().toLocaleString()}
                </div>
                {aiResults.length === 0 ? (
                  <div style={{ fontSize: 13, color: C.green, padding: 20, textAlign: "center" }}>
                    ✓ No anomalies detected. All machines operating within normal parameters.
                  </div>
                ) : (
                  aiResults.map((r, i) => (
                    <div key={i} style={{
                      padding: 12, borderRadius: 8, marginBottom: 8,
                      background: r.risk === "CRITICAL" || r.risk === "HIGH" ? C.redDim : C.amberDim,
                      border: `1px solid ${r.risk === "CRITICAL" || r.risk === "HIGH" ? C.red : C.amber}25`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: r.risk === "CRITICAL" || r.risk === "HIGH" ? C.red : C.amber }}>
                          {r.risk}: {r.component}
                        </span>
                        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", color: C.textMuted }}>
                          {(r.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textSoft }}>
                        Machine: {r.machine} ({r.type}) · Estimated time to failure: {r.eta}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.bgPanel, borderTop: `1px solid ${C.border}`,
        padding: "6px 20px", display: "flex", justifyContent: "space-between",
        fontSize: 10, fontFamily: "'JetBrains Mono'", color: C.textMuted, zIndex: 100,
      }}>
        <span>Tick #{totalTicks} · {machines.length} machines · {NODES.length} edge nodes</span>
        <span>
          NATS: <span style={{ color: C.green }}>connected</span> ·
          Vercel: <span style={{ color: isOffline ? C.red : C.green }}>{isOffline ? "disconnected" : "connected"}</span> ·
          MTConnect: <span style={{ color: C.green }}>streaming</span>
        </span>
        <span>GrahmOS v0.1.0 · Powered by ▲ Vercel + NATS</span>
      </div>
    </div>
  );
}
