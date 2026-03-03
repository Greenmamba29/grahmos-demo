"use client";
/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import GrahmOSDemo from "../components/GrahmOSDemo";

// ═══════════════════════════════════════════════════════════════
// ROST MACHINE NODE — DECENTRALIZED ADMIN CONTROL PANEL v2.0
// Offline-First Industrial Resilience Layer
// Operates 100% without internet — Cloud is the amplifier, not the dependency
// Haas MTConnect → Local Store → Local Dashboard → Mesh Sync → Cloud Sync
// ═══════════════════════════════════════════════════════════════

// ── MOCK DATA ENGINE ──────────────────────────────────────────

const TENANTS = [
  { id: "ten_allendale_01", name: "Allendale Machinery Systems", partner_id: "partner_allendale", region: "Northeast US", machines: 12, nodes: 4, status: "active" },
  { id: "ten_westcoast_02", name: "Pacific CNC Solutions", partner_id: "partner_pacific", region: "West Coast US", machines: 8, nodes: 3, status: "active" },
  { id: "ten_midwest_03", name: "Heartland Manufacturing Co", partner_id: "partner_heartland", region: "Midwest US", machines: 6, nodes: 2, status: "onboarding" },
];

const NODES = [
  {
    id: "node_aln_001", tenant_id: "ten_allendale_01", site: "Allendale HQ – Bay 1", ip: "10.0.1.50", status: "online", uptime_s: 864000, rost_version: "0.2.0", ros_distro: "jazzy", transport: "http_batch", wan: "online", lan: "online", latency_ms: 45, backlog: 0, last_ack: "2026-02-28T16:09:58Z", machines: ["machine_umc750_01", "machine_vf2_01", "machine_st10_01"],
    mesh: { peers: ["node_aln_002", "node_aln_003"], discovered: 3, synced: 2, crdt_version: 4812, last_mesh_sync: "2026-02-28T16:09:50Z" },
    local_ui: { active: true, port: 3000, sessions: 2, last_access: "2026-02-28T16:08:12Z" },
    edge_ai: { models_loaded: 3, inference_rate: 12.4, last_prediction: "2026-02-28T16:09:45Z", anomalies_24h: 1 },
    local_alerts: { active_rules: 8, fired_24h: 3, critical: 0, warning: 2, info: 1 },
  },
  {
    id: "node_aln_002", tenant_id: "ten_allendale_01", site: "Allendale HQ – Bay 2", ip: "10.0.1.51", status: "online", uptime_s: 432000, rost_version: "0.2.0", ros_distro: "jazzy", transport: "http_batch", wan: "online", lan: "online", latency_ms: 52, backlog: 12, last_ack: "2026-02-28T16:10:01Z", machines: ["machine_umc750_02", "machine_vf5_01"],
    mesh: { peers: ["node_aln_001", "node_aln_003"], discovered: 3, synced: 2, crdt_version: 4810, last_mesh_sync: "2026-02-28T16:09:48Z" },
    local_ui: { active: true, port: 3000, sessions: 1, last_access: "2026-02-28T16:05:30Z" },
    edge_ai: { models_loaded: 3, inference_rate: 11.8, last_prediction: "2026-02-28T16:09:40Z", anomalies_24h: 0 },
    local_alerts: { active_rules: 8, fired_24h: 1, critical: 0, warning: 1, info: 0 },
  },
  {
    id: "node_aln_003", tenant_id: "ten_allendale_01", site: "Allendale South – Floor A", ip: "10.0.2.10", status: "degraded", uptime_s: 86400, rost_version: "0.2.0", ros_distro: "jazzy", transport: "http_batch", wan: "offline", lan: "online", latency_ms: null, backlog: 1823, last_ack: "2026-02-28T12:02:01Z", machines: ["machine_vf2_02", "machine_vf2_03", "machine_st20_01", "machine_ec400_01"],
    mesh: { peers: ["node_aln_001", "node_aln_002"], discovered: 3, synced: 2, crdt_version: 4808, last_mesh_sync: "2026-02-28T16:09:55Z" },
    local_ui: { active: true, port: 3000, sessions: 3, last_access: "2026-02-28T16:10:00Z" },
    edge_ai: { models_loaded: 3, inference_rate: 10.2, last_prediction: "2026-02-28T16:09:51Z", anomalies_24h: 4 },
    local_alerts: { active_rules: 8, fired_24h: 7, critical: 1, warning: 4, info: 2 },
  },
  {
    id: "node_aln_004", tenant_id: "ten_allendale_01", site: "Allendale South – Floor B", ip: "10.0.2.11", status: "offline", uptime_s: 0, rost_version: "0.2.0", ros_distro: "jazzy", transport: "http_batch", wan: "offline", lan: "offline", latency_ms: null, backlog: 4210, last_ack: "2026-02-27T23:14:30Z", machines: ["machine_umc1000_01", "machine_vf6_01"],
    mesh: { peers: [], discovered: 0, synced: 0, crdt_version: 4790, last_mesh_sync: "2026-02-27T23:14:00Z" },
    local_ui: { active: false, port: 3000, sessions: 0, last_access: "2026-02-27T23:10:00Z" },
    edge_ai: { models_loaded: 0, inference_rate: 0, last_prediction: null, anomalies_24h: 0 },
    local_alerts: { active_rules: 8, fired_24h: 0, critical: 0, warning: 0, info: 0 },
  },
  {
    id: "node_pac_001", tenant_id: "ten_westcoast_02", site: "Pacific Main Shop", ip: "192.168.1.100", status: "online", uptime_s: 1728000, rost_version: "0.2.0", ros_distro: "jazzy", transport: "http_batch", wan: "online", lan: "online", latency_ms: 38, backlog: 0, last_ack: "2026-02-28T16:10:05Z", machines: ["machine_umc750_03", "machine_vf2_04", "machine_st10_02"],
    mesh: { peers: ["node_pac_002"], discovered: 2, synced: 1, crdt_version: 3201, last_mesh_sync: "2026-02-28T16:10:02Z" },
    local_ui: { active: true, port: 3000, sessions: 1, last_access: "2026-02-28T15:55:00Z" },
    edge_ai: { models_loaded: 2, inference_rate: 8.5, last_prediction: "2026-02-28T16:09:58Z", anomalies_24h: 0 },
    local_alerts: { active_rules: 6, fired_24h: 0, critical: 0, warning: 0, info: 0 },
  },
  {
    id: "node_pac_002", tenant_id: "ten_westcoast_02", site: "Pacific Overflow Bay", ip: "192.168.1.101", status: "online", uptime_s: 604800, rost_version: "0.2.0", ros_distro: "jazzy", transport: "mqtt", wan: "online", lan: "online", latency_ms: 61, backlog: 3, last_ack: "2026-02-28T16:09:55Z", machines: ["machine_vf5_02", "machine_ec400_02"],
    mesh: { peers: ["node_pac_001"], discovered: 2, synced: 1, crdt_version: 3199, last_mesh_sync: "2026-02-28T16:09:50Z" },
    local_ui: { active: true, port: 3000, sessions: 0, last_access: "2026-02-28T14:20:00Z" },
    edge_ai: { models_loaded: 2, inference_rate: 7.9, last_prediction: "2026-02-28T16:09:52Z", anomalies_24h: 1 },
    local_alerts: { active_rules: 6, fired_24h: 1, critical: 0, warning: 0, info: 1 },
  },
];

const MACHINES = [
  { id: "machine_umc750_01", node_id: "node_aln_001", model: "UMC-750", make: "haas", agent_url: "http://172.21.16.31:8082", status: "active", execution: "ACTIVE", mode: "AUTOMATIC", program: "O02341", spindle_speed: 8500, feed_rate: 120.5, position: { x: 125.432, y: -45.891, z: 50.0 }, last_sequence: 5430495, ai_health: 94 },
  { id: "machine_vf2_01", node_id: "node_aln_001", model: "VF-2", make: "haas", agent_url: "http://172.21.16.32:8082", status: "active", execution: "READY", mode: "AUTOMATIC", program: "O01890", spindle_speed: 0, feed_rate: 0, position: { x: 0, y: 0, z: 200 }, last_sequence: 2891044, ai_health: 97 },
  { id: "machine_st10_01", node_id: "node_aln_001", model: "ST-10", make: "haas", agent_url: "http://172.21.16.33:8082", status: "active", execution: "STOPPED", mode: "MANUAL", program: null, spindle_speed: 0, feed_rate: 0, position: { x: 0, y: null, z: 45.2 }, last_sequence: 1204556, ai_health: 88 },
  { id: "machine_umc750_02", node_id: "node_aln_002", model: "UMC-750", make: "haas", agent_url: "http://172.21.16.34:8082", status: "active", execution: "ACTIVE", mode: "AUTOMATIC", program: "O04512", spindle_speed: 12000, feed_rate: 200.0, position: { x: -30.1, y: 88.445, z: 25 }, last_sequence: 8832011, ai_health: 91 },
  { id: "machine_vf5_01", node_id: "node_aln_002", model: "VF-5", make: "haas", agent_url: "http://172.21.16.35:8082", status: "active", execution: "INTERRUPTED", mode: "AUTOMATIC", program: "O03221", spindle_speed: 0, feed_rate: 0, position: { x: 200, y: -100, z: 75 }, last_sequence: 3450122, ai_health: 72 },
  { id: "machine_vf2_02", node_id: "node_aln_003", model: "VF-2", make: "haas", agent_url: "http://172.21.16.40:8082", status: "unavailable", execution: "UNAVAILABLE", mode: "UNAVAILABLE", program: null, spindle_speed: null, feed_rate: null, position: null, last_sequence: 990321, ai_health: null },
];

const AI_MODELS = [
  { id: "mdl_tool_wear", name: "Tool Wear Predictor", version: "1.2.0", type: "regression", input: "vibration + spindle_load", output: "remaining_tool_life_pct", accuracy: 94.2, inference_ms: 12, status: "active" },
  { id: "mdl_anomaly", name: "Anomaly Detector", version: "2.0.1", type: "autoencoder", input: "multi-axis telemetry", output: "anomaly_score 0-1", accuracy: 96.8, inference_ms: 8, status: "active" },
  { id: "mdl_cycle_opt", name: "Cycle Optimizer", version: "0.9.0", type: "rl_policy", input: "feed_rate + spindle + material", output: "optimal_parameters", accuracy: 87.1, inference_ms: 22, status: "active" },
];

const EDGE_ALERTS = [
  { id: "alrt_001", node_id: "node_aln_003", machine_id: "machine_vf2_02", severity: "critical", rule: "machine_unavailable", message: "VF-2 #02 MTConnect agent unreachable for >5min", fired_at: "2026-02-28T15:42:00Z", source: "local", acked: false },
  { id: "alrt_002", node_id: "node_aln_003", machine_id: null, severity: "warning", rule: "wan_offline", message: "WAN connectivity lost — operating in offline mode", fired_at: "2026-02-28T12:02:30Z", source: "local", acked: true },
  { id: "alrt_003", node_id: "node_aln_001", machine_id: "machine_umc750_01", severity: "warning", rule: "ai_anomaly_detected", message: "Anomaly score 0.82 on UMC-750 spindle vibration — possible bearing wear", fired_at: "2026-02-28T14:30:00Z", source: "edge_ai", acked: false },
  { id: "alrt_004", node_id: "node_aln_003", machine_id: null, severity: "warning", rule: "backlog_threshold", message: "Cloud backlog exceeded 1,500 events — store-and-forward active", fired_at: "2026-02-28T13:15:00Z", source: "local", acked: true },
  { id: "alrt_005", node_id: "node_aln_002", machine_id: "machine_vf5_01", severity: "warning", rule: "ai_tool_wear", message: "Tool wear predicted at 28% remaining life on VF-5 Tool #7", fired_at: "2026-02-28T11:00:00Z", source: "edge_ai", acked: false },
  { id: "alrt_006", node_id: "node_pac_002", machine_id: "machine_ec400_02", severity: "info", rule: "ai_cycle_optimization", message: "Cycle time can be reduced 8% with feed rate adjustment on EC-400", fired_at: "2026-02-28T10:15:00Z", source: "edge_ai", acked: true },
];

const EVENT_TYPES = ["EXECUTION", "SPINDLE_SPEED", "FEED_RATE", "POSITION", "AVAILABILITY", "CONTROLLER_MODE", "PROGRAM", "PART_COUNT", "TOOL_ID", "ALARM"];

function generateEvent(seq: number) {
  const machine = MACHINES[Math.floor(Math.random() * MACHINES.length)];
  const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  let value: any;
  if (type === "EXECUTION") value = ["ACTIVE", "READY", "STOPPED", "INTERRUPTED"][Math.floor(Math.random() * 4)];
  else if (type === "SPINDLE_SPEED") value = String(Math.floor(Math.random() * 15000));
  else if (type === "FEED_RATE") value = (Math.random() * 300).toFixed(1);
  else if (type === "ALARM") value = Math.random() > 0.7 ? "ALARM 132 AXIS DRIVE FAULT" : "NORMAL";
  else value = (Math.random() * 200 - 100).toFixed(3);
  return {
    event_id: `evt_${Date.now()}_${seq}`, schema_version: "rost.event.v1", event_type: "mtconnect.observation",
    tenant_id: machine.node_id.startsWith("node_aln") ? "ten_allendale_01" : "ten_westcoast_02",
    node_id: machine.node_id, machine_id: machine.id, machine_model: machine.model,
    observed_at: new Date().toISOString(),
    payload: { type, value, sequence: 5430495 + seq },
    severity: type === "ALARM" && value !== "NORMAL" ? "critical" : "info",
    stored: "local", synced_cloud: machine.node_id !== "node_aln_003" && machine.node_id !== "node_aln_004",
  };
}

// ── DESIGN TOKENS ─────────────────────────────────────────────

const C = {
  bg: "#0a0a0b", surface: "#111113", surfaceHover: "#1a1a1d", surfaceActive: "#222225",
  border: "#2a2a2e", borderSubtle: "#1e1e22",
  text: "#ececef", textSec: "#8b8b92", textMut: "#5c5c63",
  accent: "#3b82f6", success: "#22c55e", warning: "#f59e0b", danger: "#ef4444",
  cyan: "#06b6d4", purple: "#a855f7", mesh: "#8b5cf6", offline: "#22c55e",
  haas: "#cc2936",
};

// ── UTILITY ───────────────────────────────────────────────────

function fmtDur(s: number) { if (!s) return "—"; const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`; }
function fmtAgo(iso: string | null) { if (!iso) return "never"; const d = (Date.now() - new Date(iso).getTime()) / 1000; return d < 60 ? `${Math.floor(d)}s ago` : d < 3600 ? `${Math.floor(d / 60)}m ago` : d < 86400 ? `${Math.floor(d / 3600)}h ago` : `${Math.floor(d / 86400)}d ago`; }
function sColor(s: string) { if (["online", "active", "ACTIVE", "AVAILABLE"].includes(s)) return C.success; if (["degraded", "intermittent", "INTERRUPTED", "warning"].includes(s)) return C.warning; if (["offline", "unavailable", "UNAVAILABLE", "STOPPED"].includes(s)) return C.danger; if (s === "READY") return C.cyan; if (s === "onboarding") return C.purple; return C.textMut; }

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html { font-size:14px; }
  body { background:${C.bg}; color:${C.text}; font-family:'DM Sans',sans-serif; -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes meshPulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
`;

// ── SHARED COMPONENTS ─────────────────────────────────────────

function Dot({ status, size = 8, pulse = false }: { status: string, size?: number, pulse?: boolean }) {
  const c = sColor(status);
  return <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size + 8, height: size + 8 }}>
    {pulse && <span style={{ position: "absolute", width: size + 6, height: size + 6, borderRadius: "50%", background: c, opacity: 0.25, animation: "pulse 2s infinite" }} />}
    <span style={{ width: size, height: size, borderRadius: "50%", background: c, position: "relative", zIndex: 1 }} />
  </span>;
}

function Badge({ children, color = C.accent, bg }: { children: React.ReactNode, color?: string, bg?: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", color, background: bg || color + "18", border: `1px solid ${color}30`, fontFamily: "'JetBrains Mono',monospace" }}>{children}</span>;
}

function Metric({ label, value, sub, accent = C.accent, icon }: { label: string, value: string | number, sub?: string, accent?: string, icon?: string }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 3 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.7rem", color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</span>
      {icon && <span style={{ fontSize: "0.9rem", opacity: 0.5 }}>{icon}</span>}
    </div>
    <span style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: accent }}>{value}</span>
    {sub && <span style={{ fontSize: "0.7rem", color: C.textMut }}>{sub}</span>}
  </div>;
}

function Section({ title, sub, action, children }: { title: string, sub?: string, action?: React.ReactNode, children: React.ReactNode }) {
  return <div style={{ marginBottom: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{title}</h2>
        {sub && <p style={{ fontSize: "0.75rem", color: C.textMut, marginTop: 2 }}>{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>;
}

function OperationBadge({ wan }: { wan: string }) {
  const isOffline = wan === "offline";
  return <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 6, background: isOffline ? C.offline + "15" : C.accent + "15", border: `1px solid ${isOffline ? C.offline : C.accent}30` }}>
    <span style={{ fontSize: "0.65rem" }}>{isOffline ? "📡" : "☁️"}</span>
    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: isOffline ? C.offline : C.accent, fontFamily: "'JetBrains Mono',monospace" }}>{isOffline ? "OFFLINE MODE" : "CLOUD SYNCING"}</span>
  </div>;
}

// ── FLEET OVERVIEW ────────────────────────────────────────────

function FleetOverview({ onSelectNode }: { onSelectNode: (id: string) => void }) {
  const onlineNodes = NODES.filter(n => n.status !== "offline").length;
  const totalMachines = MACHINES.length;
  const totalBacklog = NODES.reduce((a, n) => a + n.backlog, 0);
  const meshPeers = NODES.reduce((a, n) => a + n.mesh.discovered, 0);
  const localUISessions = NODES.reduce((a, n) => a + n.local_ui.sessions, 0);
  const aiAnomalies = NODES.reduce((a, n) => a + n.edge_ai.anomalies_24h, 0);
  const alertsFired = NODES.reduce((a, n) => a + n.local_alerts.fired_24h, 0);
  const wanOnline = NODES.filter(n => n.wan === "online").length;

  return <div style={{ animation: "fadeIn 0.3s ease" }}>
    <Section title="Global Infrastructure" sub="Real-time multi-tenant GrahmOS node status" action={null}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <Metric label="Active Nodes" value={`${onlineNodes}/${NODES.length}`} sub="Across 3 regions" />
        <Metric label="MTConnect Agents" value={totalMachines} sub="Machines tracked" />
        <Metric label="Cloud Backlog" value={totalBacklog.toLocaleString()} sub={totalBacklog > 0 ? "Pending sync" : "All nodes synced"} accent={totalBacklog > 0 ? C.warning : C.success} />
        <Metric label="Mesh Topology" value={meshPeers} sub="Active peer links" accent={C.mesh} />
      </div>
    </Section>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <Section title="Edge Observability" sub="Telemetry aggregated from local instances" action={null}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ padding: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.cyan + "20", color: C.cyan, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
              <div>
                <div style={{ fontWeight: 600 }}>Local AI Inference</div>
                <div style={{ fontSize: "0.75rem", color: C.textMut }}>Running predictive models without cloud</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: aiAnomalies > 0 ? C.warning : C.success }}>{aiAnomalies}</div>
              <div style={{ fontSize: "0.65rem", color: C.textMut }}>anomalies 24h</div>
            </div>
          </div>
          <div style={{ padding: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.danger + "20", color: C.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚨</div>
              <div>
                <div style={{ fontWeight: 600 }}>Local Rule Engine</div>
                <div style={{ fontSize: "0.75rem", color: C.textMut }}>Alarms generated and handled on-premise</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: alertsFired > 0 ? C.danger : C.textMut }}>{alertsFired}</div>
              <div style={{ fontSize: "0.65rem", color: C.textMut }}>alerts 24h</div>
            </div>
          </div>
          <div style={{ padding: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.accent + "20", color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💻</div>
              <div>
                <div style={{ fontWeight: 600 }}>Edge UI Sessions</div>
                <div style={{ fontSize: "0.75rem", color: C.textMut }}>Operators accessing nodes directly</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: C.accent }}>{localUISessions}</div>
              <div style={{ fontSize: "0.65rem", color: C.textMut }}>active now</div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Mesh Topology Activity" sub="Decentralized peer-to-peer event bus" action={null}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: C.border + "40", borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: "10px 16px", textAlign: "left", color: C.textMut, fontWeight: 600 }}>Tenant</th>
                <th style={{ padding: "10px 16px", textAlign: "left", color: C.textMut, fontWeight: 600 }}>Sync State</th>
                <th style={{ padding: "10px 16px", textAlign: "right", color: C.textMut, fontWeight: 600 }}>CRDT Seq</th>
              </tr>
            </thead>
            <tbody>
              {TENANTS.map(t => {
                const tenantNodes = NODES.filter(n => n.tenant_id === t.id);
                if (tenantNodes.length === 0) return null;
                const crdt = Math.max(...tenantNodes.map(n => n.mesh.crdt_version));
                const synced = tenantNodes.every(n => n.mesh.crdt_version >= crdt - 5);
                return <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}40` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: "0.7rem", color: C.textMut }}>{tenantNodes.length} nodes</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {synced ? <Badge color={C.success} bg={C.success + "18"}>FULLY SYNCED</Badge> : <Badge color={C.warning} bg={C.warning + "18"}>GOSSIPING</Badge>}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", color: C.mesh }}>v{crdt}</td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>

    <Section title="Node Inventory" sub="Physical deployment locations" action={null}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {NODES.map(node => (
          <div key={node.id} onClick={() => onSelectNode(node.id)} style={{ padding: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }} className="hover-card">
            <style>{`.hover-card:hover { border-color: ${C.accent}; transform: translateY(-2px); }`}</style>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Dot status={node.status} />
                  <span style={{ fontWeight: 600 }}>{node.site}</span>
                </div>
                <div style={{ fontSize: "0.7rem", color: C.textMut, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{node.ip}</div>
              </div>
              <OperationBadge wan={node.wan} />
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", marginBottom: 12 }}>
              <div>
                <div style={{ color: C.textMut }}>Machines</div>
                <div style={{ fontWeight: 600 }}>{node.machines.length} MTConnect</div>
              </div>
              <div>
                <div style={{ color: C.textMut }}>Uptime</div>
                <div style={{ fontWeight: 600 }}>{fmtDur(node.uptime_s)}</div>
              </div>
              <div>
                <div style={{ color: C.textMut }}>Backlog</div>
                <div style={{ fontWeight: 600, color: node.backlog > 0 ? C.warning : C.text }}>{node.backlog} evts</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {node.machines.map(mId => {
                const m = MACHINES.find(mx => mx.id === mId);
                return m ? <span key={mId} style={{ fontSize: "0.65rem", padding: "2px 6px", background: C.border, borderRadius: 4, color: C.textSec }}>{m.model}</span> : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  </div>;
}

// ── MESH NETWORK VIEW ─────────────────────────────────────────

function MeshNetworkView() {
  const sites: Record<string, any[]> = {};
  NODES.forEach(n => {
    const tenant = TENANTS.find(t => t.id === n.tenant_id);
    const key = tenant?.name || n.tenant_id;
    if (!sites[key]) sites[key] = [];
    sites[key].push(n);
  });

  return <div style={{ animation: "fadeIn 0.3s ease" }}>
    <Section title="Mesh Network" sub="Node-to-node discovery and CRDT sync — operates entirely on LAN without internet">
      <div style={{ background: C.surface, border: `1px solid ${C.mesh}30`, borderRadius: 8, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: "1.3rem" }}>🔗</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: C.mesh }}>Decentralized Mesh — No Central Coordinator</div>
          <div style={{ fontSize: "0.72rem", color: C.textSec, marginTop: 2 }}>Nodes auto-discover peers via mDNS on local network. CRDT (Automerge) resolves conflicts without a server. Every node has the full fleet picture.</div>
        </div>
        <Badge color={C.mesh}>P2P Active</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <Metric label="Total Mesh Links" value={NODES.reduce((a, n) => a + n.mesh.peers.length, 0)} sub="Bidirectional peer connections" accent={C.mesh} icon="🔗" />
        <Metric label="CRDT Version (max)" value={Math.max(...NODES.map(n => n.mesh.crdt_version))} sub="Automerge document version" accent={C.purple} icon="📝" />
        <Metric label="Sync Lag (max)" value={`${Math.max(...NODES.filter(n => n.mesh.crdt_version > 0).map(n => Math.max(...NODES.map(nn => nn.mesh.crdt_version)) - n.mesh.crdt_version))} ver`} sub="Behind latest CRDT state" accent={C.cyan} icon="⟳" />
      </div>

      {/* Per-site mesh topology */}
      {Object.entries(sites).map(([siteName, siteNodes]) => (
        <div key={siteName} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18, marginBottom: 14 }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 12 }}>{siteName}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "center", minHeight: 120 }}>
            {(siteNodes as any[]).map((node: any, i: number) => {
              const peerCount = node.mesh.peers.length;
              const isOnline = node.status !== "offline";
              return <div key={node.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${isOnline ? (node.wan === "online" ? C.accent : C.offline) : C.danger}`, background: C.surfaceHover, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {isOnline && peerCount > 0 && <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1px solid ${C.mesh}40`, animation: "meshPulse 3s infinite" }} />}
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: C.text }}>{node.site.split("–").pop()?.trim() || node.id.slice(-3)}</span>
                  <span style={{ fontSize: "0.55rem", color: C.textMut, fontFamily: "'JetBrains Mono',monospace" }}>{node.ip}</span>
                  <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                    <span style={{ fontSize: "0.5rem", padding: "1px 4px", borderRadius: 3, background: node.lan === "online" ? C.offline + "20" : C.danger + "20", color: node.lan === "online" ? C.offline : C.danger, fontWeight: 600 }}>LAN</span>
                    <span style={{ fontSize: "0.5rem", padding: "1px 4px", borderRadius: 3, background: node.wan === "online" ? C.accent + "20" : C.textMut + "20", color: node.wan === "online" ? C.accent : C.textMut, fontWeight: 600 }}>WAN</span>
                  </div>
                </div>
                <div style={{ fontSize: "0.65rem", textAlign: "center" }}>
                  <div style={{ color: C.mesh, fontWeight: 600 }}>{peerCount} peers</div>
                  <div style={{ color: C.textMut }}>v{node.mesh.crdt_version}</div>
                </div>
              </div>;
            })}
          </div>
          {/* Connection lines description */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.borderSubtle}`, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(siteNodes as any[]).filter((n: any) => n.mesh.peers.length > 0).map((n: any) => n.mesh.peers.map((p: any) => {
              const peer = NODES.find(nn => nn.id === p);
              if (!peer || !(siteNodes as any[]).find((sn: any) => sn.id === p)) return null;
              if (n.id > p) return null; // dedupe
              return <div key={`${n.id}-${p}`} style={{ fontSize: "0.65rem", color: C.mesh, padding: "2px 8px", background: C.mesh + "10", border: `1px solid ${C.mesh}20`, borderRadius: 4 }}>
                {n.site.split("–").pop()?.trim()} ↔ {peer.site.split("–").pop()?.trim()} <span style={{ color: C.textMut }}>synced</span>
              </div>;
            })).flat().filter(Boolean)}
          </div>
        </div>
      ))}
    </Section>
  </div>;
}

// ── EDGE INTELLIGENCE VIEW ────────────────────────────────────

function EdgeIntelligenceView() {
  const siteNodes = NODES.filter(n => n.edge_ai.models_loaded > 0);

  return <div style={{ animation: "fadeIn 0.3s ease" }}>
    <Section title="Edge Intelligence" sub="On-node AI inference, local alerts, and predictive maintenance — no cloud required">
      <div style={{ background: C.surface, border: `1px solid ${C.purple}30`, borderRadius: 8, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: "1.3rem" }}>🧠</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: C.purple }}>All Inference Runs On-Node — Zero Cloud Dependency</div>
          <div style={{ fontSize: "0.72rem", color: C.textSec, marginTop: 2 }}>ML models are deployed to edge nodes and run inference locally. Predictions, anomaly detection, and optimization happen at the machine — even without internet.</div>
        </div>
        <Badge color={C.purple}>Local AI</Badge>
      </div>

      {/* LEFT COL: Nodes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Section title="Edge Nodes" sub={`${siteNodes.length} units in cluster`} action={null}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {siteNodes.map((n: any) => (
              <div key={n.id} style={{ background: C.surfaceActive, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Dot status={n.status} />
                      <span style={{ fontWeight: 600 }}>{n.id}</span>
                    </div>
                    <div style={{ fontSize: "0.7rem", color: C.textMut, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{n.ip} • v{n.rost_version}</div>
                  </div>
                  <OperationBadge wan={n.wan} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.75rem", padding: "12px 0", borderTop: `1px solid ${C.border}50`, borderBottom: `1px solid ${C.border}50`, marginBottom: 12 }}>
                  <div><span style={{ color: C.textMut }}>Local Cache:</span> <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{n.backlog > 0 ? `${n.backlog} evts` : "Empty"}</span></div>
                  <div><span style={{ color: C.textMut }}>Mesh Sync:</span> <span style={{ color: C.mesh, fontFamily: "'JetBrains Mono',monospace" }}>v{n.mesh.crdt_version}</span></div>
                  <div><span style={{ color: C.textMut }}>AI Rate:</span> <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{n.edge_ai.inference_rate} hz</span></div>
                  <div><span style={{ color: C.textMut }}>Uptime:</span> <span>{fmtDur(n.uptime_s)}</span></div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: C.textMut, marginBottom: 8, fontWeight: 600 }}>ATTACHED MACHINES ({n.machines.length})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {n.machines.map((mId: any) => {
                      const m = MACHINES.find(mx => mx.id === mId);
                      return m ? <Badge key={mId} color={sColor(m.execution)} bg={sColor(m.execution) + "15"} >{m.model}</Badge> : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* AI Models */}
      <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Deployed Models</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {AI_MODELS.map(m => (
          <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{m.name}</span>
              <Badge color={C.success}>Active</Badge>
            </div>
            <div style={{ fontSize: "0.72rem", color: C.textSec, marginBottom: 8 }}>{m.type} · v{m.version}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: "0.7rem" }}>
              <div><span style={{ color: C.textMut }}>Input:</span> <span style={{ color: C.text }}>{m.input}</span></div>
              <div><span style={{ color: C.textMut }}>Output:</span> <span style={{ color: C.text }}>{m.output}</span></div>
              <div><span style={{ color: C.textMut }}>Accuracy:</span> <span style={{ color: C.success, fontWeight: 600 }}>{m.accuracy}%</span></div>
              <div><span style={{ color: C.textMut }}>Latency:</span> <span style={{ color: C.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{m.inference_ms}ms</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Local Alerts */}
      <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Local Alert Feed <span style={{ color: C.textMut, fontWeight: 400 }}>— fires at the edge, no cloud needed</span></h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {EDGE_ALERTS.map(alert => {
          const node = NODES.find(n => n.id === alert.node_id);
          const sc = alert.severity === "critical" ? C.danger : alert.severity === "warning" ? C.warning : C.cyan;
          return <div key={alert.id} style={{ background: C.surface, border: `1px solid ${sc}25`, borderLeft: `3px solid ${sc}`, borderRadius: "0 8px 8px 0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 50 }}>
              <Badge color={sc}>{alert.severity}</Badge>
              <span style={{ fontSize: "0.55rem", color: C.textMut, marginTop: 3 }}>{alert.source === "edge_ai" ? "🧠 AI" : "📡 Local"}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: C.text }}>{alert.message}</div>
              <div style={{ fontSize: "0.65rem", color: C.textMut, marginTop: 2 }}>{node?.site} · {fmtAgo(alert.fired_at)}</div>
            </div>
            {alert.acked && <Badge color={C.textMut}>Acked</Badge>}
          </div>;
        })}
      </div>

      {/* Per-node AI health */}
      <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 20, marginBottom: 10 }}>Per-Node AI Status</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {NODES.filter(n => n.edge_ai.models_loaded > 0).map(n => (
          <div key={n.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
            <div style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 6 }}>{n.site}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: "0.7rem" }}>
              <div><span style={{ color: C.textMut }}>Models:</span> <span style={{ color: C.purple, fontWeight: 600 }}>{n.edge_ai.models_loaded}</span></div>
              <div><span style={{ color: C.textMut }}>Rate:</span> <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{n.edge_ai.inference_rate}/s</span></div>
              <div><span style={{ color: C.textMut }}>Anomalies:</span> <span style={{ color: n.edge_ai.anomalies_24h > 2 ? C.warning : C.success, fontWeight: 600 }}>{n.edge_ai.anomalies_24h}</span></div>
              <div><span style={{ color: C.textMut }}>Last:</span> <span>{fmtAgo(n.edge_ai.last_prediction)}</span></div>
            </div>
            <OperationBadge wan={n.wan} />
          </div>
        ))}
      </div>
    </Section>
  </div>;
}

// ── EVENT STREAM ──────────────────────────────────────────────

function EventStream() {
  const [events, setEvents] = useState<any[]>([]);
  const seqRef = useRef(0);
  useEffect(() => {
    const initial = Array.from({ length: 20 }, (_, i) => generateEvent(i));
    setEvents(initial); seqRef.current = 20;
    const t = setInterval(() => { seqRef.current++; setEvents(prev => [generateEvent(seqRef.current), ...prev].slice(0, 50)); }, 800);
    return () => clearInterval(t);
  }, []);

  return <div style={{ animation: "fadeIn 0.3s ease" }}>
    <Section title="Live Event Stream" sub="Real-time rost.event.v1 — stored locally first, synced to cloud when available">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
        <Metric label="Events (local store)" value={events.length} accent={C.offline} icon="💾" />
        <Metric label="Cloud-Synced" value={events.filter(e => e.synced_cloud).length} accent={C.accent} icon="☁️" />
        <Metric label="Pending Sync" value={events.filter(e => !e.synced_cloud).length} accent={C.warning} icon="⏳" />
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "110px 100px 80px 70px 1fr 60px 60px", gap: 8, fontSize: "0.65rem", color: C.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span>Event ID</span><span>Machine</span><span>Type</span><span>Severity</span><span>Value</span><span>Stored</span><span>Synced</span>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {events.map((e, i) => (
            <div key={e.event_id} style={{ padding: "8px 16px", borderBottom: `1px solid ${C.borderSubtle}`, display: "grid", gridTemplateColumns: "110px 100px 80px 70px 1fr 60px 60px", gap: 8, fontSize: "0.72rem", animation: i === 0 ? "slideIn 0.3s ease" : "none" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.textMut, fontSize: "0.6rem" }}>{e.event_id.slice(0, 16)}…</span>
              <span style={{ fontWeight: 500 }}>{e.machine_model}</span>
              <span style={{ color: C.cyan }}>{e.payload.type}</span>
              <span><Badge color={e.severity === "critical" ? C.danger : C.textSec}>{e.severity}</Badge></span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{e.payload.value}</span>
              <span><Badge color={C.offline}>Local</Badge></span>
              <span>{e.synced_cloud ? <Badge color={C.accent}>Yes</Badge> : <Badge color={C.textMut}>Queued</Badge>}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  </div>;
}

// ── BACKLOG MONITOR ───────────────────────────────────────────

function BacklogMonitor() {
  return <div style={{ animation: "fadeIn 0.3s ease" }}>
    <Section title="Backlog Monitor" sub="Store-and-forward queue — data is ALWAYS safe locally, synced to cloud when possible">
      <div style={{ background: C.surface, border: `1px solid ${C.offline}30`, borderRadius: 8, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: "1.3rem" }}>🛡️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: C.offline }}>Zero Data Loss Guarantee — Backlog = Cloud Sync Queue, Not Data Loss</div>
          <div style={{ fontSize: "0.72rem", color: C.textSec, marginTop: 2 }}>Every event is persisted locally in SQLite WAL before any cloud sync attempt. Backlog indicates events waiting for cloud delivery — local operations and dashboards are unaffected.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        <Metric label="Total Backlog" value={NODES.reduce((a, n) => a + n.backlog, 0).toLocaleString()} sub="Events pending cloud sync" accent={C.warning} icon="↑" />
        <Metric label="Drain Rate" value="2,000+/s" sub="Recovery speed on reconnect" accent={C.success} icon="⚡" />
        <Metric label="Local Storage" value="~50M" sub="Events per 32GB capacity" accent={C.cyan} icon="💾" />
        <Metric label="Data Lost" value="0" sub="Ever. By design." accent={C.offline} icon="🛡️" />
      </div>

      {NODES.map(node => {
        const pct = Math.min((node.backlog / 50000000) * 100, 100);
        const barColor = node.backlog === 0 ? C.success : node.backlog < 500 ? C.accent : node.backlog < 2000 ? C.warning : C.danger;
        return <div key={node.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Dot status={node.status} size={7} /> <span style={{ fontWeight: 600, fontSize: "0.8rem" }}>{node.site}</span>
              <OperationBadge wan={node.wan} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: "0.85rem", color: barColor }}>{node.backlog.toLocaleString()}</span>
          </div>
          <div style={{ height: 6, background: C.surfaceHover, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(pct, node.backlog > 0 ? 2 : 0)}%`, background: barColor, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: C.textMut, marginTop: 4 }}>
            <span>Last cloud ack: {fmtAgo(node.last_ack)}</span>
            <span>Local store: operational ✓ · Mesh sync: {node.mesh.peers.length > 0 ? "active ✓" : "no peers"}</span>
          </div>
        </div>;
      })}
    </Section>
  </div>;
}

// ── MACHINE TELEMETRY ─────────────────────────────────────────

function MachineTelemetry() {
  return <div style={{ animation: "fadeIn 0.3s ease" }}>
    <Section title="Machine Telemetry" sub="Live MTConnect data — collected and displayed locally, synced to cloud optionally">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        {MACHINES.map(m => {
          const node = NODES.find(n => n.id === m.node_id);
          return <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Dot status={m.status} size={7} />
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{m.model}</span>
                <span style={{ fontSize: "0.7rem", color: C.textMut }}>{m.id.slice(-6)}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {m.ai_health && <Badge color={m.ai_health > 85 ? C.success : m.ai_health > 70 ? C.warning : C.danger}>AI: {m.ai_health}%</Badge>}
                <Badge color={sColor(m.execution)}>{m.execution}</Badge>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, fontSize: "0.72rem" }}>
              <div><span style={{ color: C.textMut, display: "block", fontSize: "0.6rem", textTransform: "uppercase" }}>Spindle</span><span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.cyan, fontWeight: 600 }}>{m.spindle_speed ?? "—"} RPM</span></div>
              <div><span style={{ color: C.textMut, display: "block", fontSize: "0.6rem", textTransform: "uppercase" }}>Feed Rate</span><span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.accent, fontWeight: 600 }}>{m.feed_rate ?? "—"} mm/min</span></div>
              <div><span style={{ color: C.textMut, display: "block", fontSize: "0.6rem", textTransform: "uppercase" }}>Program</span><span style={{ fontWeight: 600 }}>{m.program || "—"}</span></div>
            </div>
            {m.position && <div style={{ marginTop: 8, fontSize: "0.65rem", color: C.textMut, fontFamily: "'JetBrains Mono',monospace" }}>
              X:{m.position.x?.toFixed(3)} Y:{m.position.y?.toFixed(3) ?? "—"} Z:{m.position.z?.toFixed(3)}
            </div>}
            <div style={{ marginTop: 8, paddingTop: 6, borderTop: `1px solid ${C.borderSubtle}`, fontSize: "0.6rem", color: C.textMut }}>
              {node?.site} · Data source: <span style={{ color: C.offline }}>local store</span> · Seq: {m.last_sequence.toLocaleString()}
            </div>
          </div>;
        })}
      </div>
    </Section>
  </div>;
}

// ── ARCHITECTURE VIEW ─────────────────────────────────────────

function ArchitectureView() {
  const layers = [
    {
      zone: "OFFLINE ZONE — Operates Without Internet", color: C.offline, items: [
        { name: "Haas CNC", detail: "MTConnect agent :8082", icon: "🔧", tech: "SHDR → HTTP" },
        { name: "GrahmOS Edge Node", detail: "Collector + Store + ROS 2 + AI", icon: "💾", tech: "SQLite WAL + rclpy + ONNX" },
        { name: "Local Dashboard", detail: "On-prem UI served by edge node", icon: "📊", tech: "Next.js static + FastAPI :3000" },
        { name: "Local Alerts", detail: "Threshold + anomaly + ML alerts", icon: "🚨", tech: "Rules engine + edge AI" },
        { name: "Mesh Network", detail: "Node-to-node CRDT sync on LAN", icon: "🔗", tech: "mDNS + Automerge 3.0" },
      ]
    },
    {
      zone: "SYNC BRIDGE — When Internet Available", color: C.warning, items: [
        { name: "Store-and-Forward", detail: "Batch signed events to cloud", icon: "⚡", tech: "HTTP batch + Ed25519" },
        { name: "WireGuard VPN", detail: "Encrypted tunnel (optional)", icon: "🔐", tech: "WireGuard 1.x" },
      ]
    }
  ];

  return <div style={{ animation: "fadeIn 0.3s ease" }}>
    <Section title="Architecture" sub="Offline-first by design — cloud is the amplifier, not the dependency">

      {/* New Visual Infographic: Mesh vs Hub-and-Spoke */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Local Mesh Network visual */}
        <div style={{ background: C.surface, border: `1px solid ${C.mesh}40`, borderRadius: 8, padding: 20, position: "relative", overflow: "hidden", borderTop: `3px solid ${C.mesh}` }}>
          <div style={{ position: "absolute", right: -20, top: -20, opacity: 0.12 }}>
            <svg width="180" height="180" viewBox="0 0 100 100">
              <polygon points="50,5 95,27 95,72 50,95 5,72 5,27" fill="none" stroke={C.mesh} strokeWidth="2" />
              <line x1="50" y1="5" x2="95" y2="72" stroke={C.mesh} strokeWidth="1" />
              <line x1="50" y1="5" x2="5" y2="72" stroke={C.mesh} strokeWidth="1" />
              <line x1="95" y1="27" x2="5" y2="27" stroke={C.mesh} strokeWidth="1" />
              <line x1="5" y1="27" x2="50" y2="95" stroke={C.mesh} strokeWidth="1" />
              <line x1="95" y1="27" x2="50" y2="95" stroke={C.mesh} strokeWidth="1" />
              <line x1="95" y1="72" x2="5" y2="72" stroke={C.mesh} strokeWidth="1" />
            </svg>
          </div>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: C.mesh, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🔗</span> Decentralized Edge (Mesh P2P)
          </h3>
          <p style={{ fontSize: "0.75rem", color: C.textSec, marginTop: 8, marginBottom: 20, maxWidth: "90%", lineHeight: 1.5 }}>
            Nodes connect peer-to-peer on the local factory LAN using mDNS and CRDTs. <strong>Every node has the complete state.</strong> If one node fails, the rest operate flawlessly. There is no central point of failure on the shop floor.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: 0.95 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.surfaceHover, border: `2px solid ${C.mesh}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: "bold", zIndex: 2, boxShadow: `0 0 10px ${C.mesh}30` }}>N1</div>
            <div style={{ height: 3, flex: 1, background: `linear-gradient(90deg, ${C.mesh}, transparent, ${C.mesh})`, opacity: 0.6 }}></div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.surfaceHover, border: `2px solid ${C.mesh}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: "bold", zIndex: 2, boxShadow: `0 0 10px ${C.mesh}30` }}>N2</div>
            <div style={{ height: 3, flex: 1, background: `linear-gradient(90deg, ${C.mesh}, transparent, ${C.mesh})`, opacity: 0.6 }}></div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.surfaceHover, border: `2px solid ${C.mesh}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: "bold", zIndex: 2, boxShadow: `0 0 10px ${C.mesh}30` }}>N3</div>
          </div>
          <div style={{ display: "flex", gap: "50px", marginTop: "-12px", paddingLeft: "52px", opacity: 0.6 }}>
            <div style={{ width: 3, height: 26, background: C.mesh, transform: "rotate(40deg)" }}></div>
            <div style={{ width: 3, height: 26, background: C.mesh, transform: "rotate(-40deg)" }}></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: 0.95, marginTop: "-4px" }}>
            <div style={{ marginLeft: 36, width: 36, height: 36, borderRadius: "50%", background: C.surfaceHover, border: `2px solid ${C.mesh}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: "bold", zIndex: 2, boxShadow: `0 0 10px ${C.mesh}30` }}>N4</div>
            <div style={{ height: 3, flex: 1, maxWidth: 45, background: `linear-gradient(90deg, ${C.mesh}, transparent, ${C.mesh})`, opacity: 0.6 }}></div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.surfaceHover, border: `2px solid ${C.mesh}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: "bold", zIndex: 2, boxShadow: `0 0 10px ${C.mesh}30` }}>N5</div>
          </div>
          <div style={{ marginTop: 16, fontSize: "0.65rem", color: C.mesh, fontWeight: 600, padding: "4px 8px", background: C.mesh + "15", borderRadius: 4, display: "inline-block" }}>Local LAN · CRDT State · No Master</div>
        </div>

        {/* Hub-and-Spoke visual removed until release */}
      </div>

      {layers.map((layer, li) => (
        <div key={li} style={{ background: C.surface, border: `1px solid ${layer.color}25`, borderLeft: `3px solid ${layer.color}`, borderRadius: "0 8px 8px 0", padding: 16, marginBottom: 12 }}>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: layer.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{layer.zone}</h3>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(layer.items.length, 3)},1fr)`, gap: 10 }}>
            {layer.items.map((item, i) => (
              <div key={i} style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: "1rem", marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: "0.7rem", color: C.textSec, marginBottom: 4 }}>{item.detail}</div>
                <div style={{ fontSize: "0.6rem", color: C.textMut, fontFamily: "'JetBrains Mono',monospace" }}>{item.tech}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ background: C.surface, border: `1px solid ${C.offline}30`, borderRadius: 8, padding: 16, marginTop: 8 }}>
        <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: C.offline, marginBottom: 8 }}>KEY PRINCIPLE: The Internet is Optional</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.75rem", color: C.textSec }}>
          <div>✓ Machine monitoring works without internet</div>
          <div>✓ Alerts fire locally without internet</div>
          <div>✓ Dashboard is accessible on LAN without internet</div>
          <div>✓ AI inference runs on-node without internet</div>
          <div>✓ Nodes mesh-sync with each other without internet</div>
          <div>✓ All data is stored locally — cloud syncs when available</div>
        </div>
      </div>
    </Section>
  </div>;
}
// ── TENANTS VIEW ──────────────────────────────────────────────

function TenantView() {
  return <div style={{ animation: "fadeIn 0.3s ease" }}>
    <Section title="Ecosystem Orchestration" sub="Manage logical boundaries across the decentralized edge" action={null}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: C.border + "40", borderBottom: `1px solid ${C.border}` }}>
              <th style={{ padding: "12px 20px", textAlign: "left", color: C.textMut, fontWeight: 600 }}>Tenant Name</th>
              <th style={{ padding: "12px 20px", textAlign: "left", color: C.textMut, fontWeight: 600 }}>Region</th>
              <th style={{ padding: "12px 20px", textAlign: "right", color: C.textMut, fontWeight: 600 }}>Deployed Nodes</th>
              <th style={{ padding: "12px 20px", textAlign: "right", color: C.textMut, fontWeight: 600 }}>MTConnect Agents</th>
              <th style={{ padding: "12px 20px", textAlign: "center", color: C.textMut, fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {TENANTS.map(t => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}40`, transition: "background 0.2s" }} className="hover-row">
                <style>{`.hover-row:hover { background: ${C.surfaceHover}; }`}</style>
                <td style={{ padding: "16px 20px", fontWeight: 600 }}>{t.name}</td>
                <td style={{ padding: "16px 20px", color: C.textSec }}>{t.region}</td>
                <td style={{ padding: "16px 20px", textAlign: "right" }}>{t.nodes}</td>
                <td style={{ padding: "16px 20px", textAlign: "right" }}>{t.machines}</td>
                <td style={{ padding: "16px 20px", textAlign: "center" }}><Badge color={sColor(t.status)} bg={sColor(t.status) + "18"}>{t.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  </div>;
}

// ── MAIN APP ──────────────────────────────────────────────────

export default function RostDashboard() {
  const [activeView, setActiveView] = useState("haas_demo");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [stream, setStream] = useState<any[]>([]);
  let seq = useRef(0).current; // Use useRef for mutable sequence counter
  const clockOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit' };

  useEffect(() => {
    const streamInterval = setInterval(() => {
      seq++; // Increment mutable ref value
      setStream(prev => {
        const next = [generateEvent(seq), ...prev].slice(0, 50);
        return next as any[];
      });
    }, Math.random() * 800 + 400);

    const clockInterval = setInterval(() => setClock(new Date()), 1000);

    return () => { clearInterval(streamInterval); clearInterval(clockInterval); };
  }, []);

  const wanOnline = NODES.filter(n => n.wan === "online").length;
  const totalNodes = NODES.length;

  const navItems = [
    { key: "haas_demo", label: "HaaS Demo", icon: "⚙️", section: "operations", color: C.haas },
    { key: "fleet", label: "Fleet Overview", icon: "⬡", section: "operations", color: C.success },
    { key: "mesh", label: "Mesh Network", icon: "🔗", section: "operations", color: C.mesh },
    { key: "edge_ai", label: "Edge Intelligence", icon: "🧠", section: "operations", color: C.purple },
    { key: "events", label: "Event Stream", icon: "▸", section: "data", color: C.cyan },
    { key: "backlog", label: "Backlog Monitor", icon: "↑", section: "data", color: C.warning },
    { key: "telemetry", label: "Machine Telemetry", icon: "⚙", section: "data", color: C.accent },
    { key: "tenants", label: "Tenants", icon: "◈", section: "admin", color: C.textSec },
    { key: "architecture", label: "Architecture", icon: "△", section: "admin", color: C.textMut },
  ];

  const sections = { operations: "Edge Operations", data: "Data & Telemetry", admin: "Administration" };

  const handleSelectNode = (id: string) => { setSelectedNode(id); setActiveView("fleet"); };

  const renderView = () => {
    if (activeView === "fleet") return <FleetOverview onSelectNode={handleSelectNode} />;
    if (activeView === "mesh") return <MeshNetworkView />;
    if (activeView === "haas_demo") return <GrahmOSDemo />;
    if (activeView === "edge_ai") return <EdgeIntelligenceView />;
    if (activeView === "events") return <EventStream />;
    if (activeView === "backlog") return <BacklogMonitor />;
    if (activeView === "telemetry") return <MachineTelemetry />;
    if (activeView === "tenants") return <TenantView />;
    if (activeView === "architecture") return <ArchitectureView />;
    return null;
  };

  const sideW = collapsed ? 56 : 230;

  return <>
    <style>{globalCSS}</style>
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
      {/* Sidebar */}
      <aside style={{ width: sideW, minHeight: "100vh", background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.2s", overflow: "hidden", flexShrink: 0, position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ padding: collapsed ? "14px 10px" : "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
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
          {!collapsed && <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Grahm<span style={{ color: C.offline }}>OS</span></div>
            <div style={{ fontSize: "0.55rem", color: C.textMut, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Decentralized Edge v2.0</div>
          </div>}
        </div>

        {/* Offline indicator in sidebar */}
        {!collapsed && <div style={{ padding: "8px 12px", margin: "8px 8px 0", borderRadius: 6, background: C.offline + "10", border: `1px solid ${C.offline}25`, textAlign: "center" }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, color: C.offline, textTransform: "uppercase", letterSpacing: "0.1em" }}>📡 Internet Optional</div>
          <div style={{ fontSize: "0.55rem", color: C.textMut, marginTop: 1 }}>{wanOnline}/{totalNodes} cloud-syncing</div>
        </div>}

        <nav style={{ padding: "8px 6px", flex: 1, overflowY: "auto" }}>
          {Object.entries(sections).map(([secKey, secLabel]) => (
            <div key={secKey}>
              {!collapsed && <div style={{ fontSize: "0.55rem", fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 12px 4px" }}>{secLabel}</div>}
              {navItems.filter(n => n.section === secKey).map(item => {
                const isActive = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveView(item.key); setSelectedNode(null); }}
                    title={collapsed ? item.label : undefined}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: collapsed ? "8px 0" : "8px 12px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      background: isActive ? C.surfaceActive : "transparent",
                      border: "none", borderRadius: 6, color: isActive ? C.text : C.textSec,
                      cursor: "pointer", fontSize: "0.8rem", fontWeight: isActive ? 600 : 400,
                      textAlign: "left", marginBottom: 2, transition: "all 0.2s",
                      fontFamily: "inherit"
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.surfaceHover }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                  >
                    <span style={{ fontSize: "1rem", color: isActive ? item.color : C.textMut, width: collapsed ? "auto" : 20, textAlign: "center" }}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <button onClick={() => setCollapsed(!collapsed)} style={{ padding: 10, border: "none", borderTop: `1px solid ${C.border}`, background: "transparent", color: C.textMut, cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit" }}>{collapsed ? "→" : "← Collapse"}</button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: sideW, transition: "margin-left 0.2s" }}>
        <header style={{ height: 48, borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "sticky", top: 0, zIndex: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: "0.8rem", fontWeight: 600 }}>{navItems.find(n => n.key === activeView)?.label || "Fleet"}</h1>
            <Badge color={C.offline}>Offline-First</Badge>
            <Badge color={C.success}>LIVE</Badge>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: "0.7rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: C.offline }}>📡</span>
              <span style={{ color: C.textMut }}>WAN:</span>
              <span style={{ color: wanOnline > 0 ? C.accent : C.warning, fontWeight: 600 }}>{wanOnline}/{totalNodes}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: C.mesh }}>🔗</span>
              <span style={{ color: C.textMut }}>Mesh:</span>
              <span style={{ color: C.mesh, fontWeight: 600 }}>{NODES.reduce((a, n) => a + n.mesh.peers.length, 0)} links</span>
            </div>
            <span style={{ color: C.textMut, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem" }}>{clock.toLocaleTimeString()}</span>
            <Dot status="online" size={6} pulse />
          </div>
        </header>
        <div style={{ padding: 20, maxWidth: 1200 }}>{renderView()}</div>
      </main>
    </div>
  </>;
}
