/**
 * SysConf 2026 — How to Safely Give AI Agents a Terminal
 * Alex Idowu · Co-founder & CTO, PipeOps · Lagos
 * Dark / terminal aesthetic. Standard 16:9.
 */

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Alex Idowu";
pres.title = "How to Safely Give AI Agents a Terminal";
pres.subject = "SysConf 2026";
pres.company = "PipeOps";

const C = {
  bg: "0B0F14",
  card: "151B24",
  ink: "F5F7FA",
  muted: "B7C4D4",
  dim: "8B9BB0",
  line: "243041",
  accent: "00FF41",
  soft: "86EFAC",
  warn: "FDA4AF",
  sky: "7DD3FC",
};

const FONT = "Arial";
const mono = "Consolas";
const TOTAL = 18;

function sh() {
  return { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.35 };
}

function footer(slide, n) {
  slide.addText("nitrocode.sh · Rexec", {
    x: 0.5, y: 5.25, w: 4.5, h: 0.25,
    fontFace: mono, fontSize: 11, color: C.dim, margin: 0,
  });
  slide.addText(`SysConf 2026  ·  ${String(n).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`, {
    x: 5, y: 5.25, w: 4.5, h: 0.25,
    fontFace: FONT, fontSize: 11, color: C.dim, align: "right", margin: 0,
  });
}

function label(slide, text) {
  slide.addText(text.toUpperCase(), {
    x: 0.5, y: 0.28, w: 9, h: 0.28,
    fontFace: mono, fontSize: 12, color: C.accent, charSpacing: 2, margin: 0,
  });
}

function title(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 0.6, w: 9, h: 0.5,
    fontFace: FONT, fontSize: 28, bold: true, color: C.ink, margin: 0,
  });
}

function card(slide, x, y, w, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: C.card }, shadow: sh(),
  });
}

// 1 Title
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.accent } });
  s.addText("SYSCONF 2026", {
    x: 0.6, y: 1.2, w: 8.5, h: 0.3,
    fontFace: mono, fontSize: 14, color: C.accent, charSpacing: 3, margin: 0,
  });
  s.addText("How to Safely Give AI Agents\na Terminal", {
    x: 0.6, y: 1.65, w: 8.8, h: 1.4,
    fontFace: FONT, fontSize: 34, bold: true, color: C.ink, margin: 0,
  });
  s.addText("Alex Idowu  ·  Co-founder & CTO, PipeOps  ·  Lagos", {
    x: 0.6, y: 3.4, w: 8.5, h: 0.35,
    fontFace: FONT, fontSize: 16, color: C.muted, margin: 0,
  });
  s.addText("nitrocode.sh  ·  github.com/PipeOpsHQ/Rexec", {
    x: 0.6, y: 3.85, w: 8.5, h: 0.3,
    fontFace: mono, fontSize: 13, color: C.dim, margin: 0,
  });
  footer(s, 1);
}

// 2 Opening claim (blog voice)
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addText("AI agents need a terminal to be useful.\nGiving them yours is a bad idea.", {
    x: 0.5, y: 1.6, w: 9, h: 1.4,
    fontFace: FONT, fontSize: 28, bold: true, color: C.ink, margin: 0,
  });
  s.addText("Isolation problem. Not a prompt problem.\nRexec is one way to ship it — Jobs + RuntimeClass works too.", {
    x: 0.5, y: 3.3, w: 9, h: 0.9,
    fontFace: FONT, fontSize: 18, color: C.muted, margin: 0,
  });
  footer(s, 2);
}

// 3 Hook
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addText("Laptop. Dev VM. Shared CI runner.\nSometimes worse.", {
    x: 0.5, y: 1.2, w: 9, h: 1.0,
    fontFace: FONT, fontSize: 26, bold: true, color: C.ink, margin: 0,
  });
  const scene = ["curl | bash", "secrets in the environment", "kubeconfig in ~/.kube"];
  scene.forEach((line, i) => {
    s.addText(line, {
      x: 0.5, y: 2.5 + i * 0.4, w: 9, h: 0.35,
      fontFace: mono, fontSize: 18, color: C.soft, margin: 0,
    });
  });
  s.addText("You’re not doing chat. You’re doing untrusted RCE with a friendly UI.", {
    x: 0.5, y: 4.0, w: 9, h: 0.45,
    fontFace: FONT, fontSize: 16, bold: true, color: C.warn, margin: 0,
  });
  footer(s, 3);
}

// 4 Wrong default
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "The wrong default");
  const steps = [
    "Install the agent CLI on a machine you care about",
    "Point it at a repo",
    "Grant shell / network / package install",
    "Hope system prompts and “approve tool use” are enough",
  ];
  steps.forEach((t, i) => {
    const y = 1.3 + i * 0.7;
    s.addShape(pres.shapes.OVAL, { x: 0.55, y: y + 0.05, w: 0.4, h: 0.4, fill: { color: C.accent } });
    s.addText(String(i + 1), { x: 0.55, y: y + 0.1, w: 0.4, h: 0.3, fontFace: FONT, fontSize: 14, bold: true, color: C.bg, align: "center", margin: 0 });
    s.addText(t, { x: 1.2, y, w: 8.2, h: 0.5, fontFace: FONT, fontSize: 17, color: C.ink, margin: 0, valign: "middle" });
  });
  s.addText("Hope is not a control.", {
    x: 0.5, y: 4.3, w: 9, h: 0.4, fontFace: FONT, fontSize: 18, bold: true, color: C.warn, margin: 0,
  });
  footer(s, 4);
}

// 5 What goes wrong
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Even without malice");
  const bad = [
    "Secrets into world-readable files",
    "rm -rf with a creative path expansion",
    "Env exfil over HTTPS or DNS",
    "Packages that phone home",
    "Production kubeconfigs on the same disk",
    "Thrash · half-broken state · works in the agent’s world",
  ];
  bad.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6;
    const y = 1.35 + row * 1.1;
    card(s, x, y, 4.4, 0.95);
    s.addText(t, { x: x + 0.25, y: y + 0.28, w: 3.9, h: 0.45, fontFace: FONT, fontSize: 15, color: C.ink, margin: 0 });
  });
  footer(s, 5);
}

// 6 Human vs agent
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Human terminal vs agent terminal");
  s.addTable(
    [
      [
        { text: "", options: { fill: { color: "1A2330" }, color: C.ink, bold: true } },
        { text: "Human", options: { fill: { color: "1A2330" }, color: C.ink, bold: true } },
        { text: "Agent", options: { fill: { color: "1A2330" }, color: C.ink, bold: true } },
      ],
      ["Intent", "Usually intentional", "Exploratory, error-prone"],
      ["Speed", "Seconds between commands", "Bursts of tool calls"],
      ["Oversight", "Eyes on the glass", "Often headless"],
      ["Network", "Expects outbound", "Will try outbound"],
      ["Lifecycle", "Hours to days", "Minutes, then delete"],
    ].map((row, ri) =>
      row.map((cell) =>
        typeof cell === "string"
          ? { text: cell, options: { color: ri === 0 ? C.ink : C.muted, bold: ri > 0 && row.indexOf(cell) === 0 } }
          : cell
      )
    ),
    {
      x: 0.5, y: 1.3, w: 9, h: 3.4,
      colW: [2.0, 3.5, 3.5],
      border: { pt: 0.5, color: C.line },
      fontFace: FONT, fontSize: 14, valign: "middle",
      fill: { color: C.card },
    }
  );
  footer(s, 6);
}

// 7 Reframe
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Treat it as isolation");
  s.addText("Not a prompt problem.", {
    x: 0.5, y: 1.3, w: 9, h: 0.45, fontFace: FONT, fontSize: 22, color: C.muted, margin: 0,
  });
  s.addText("Sandbox = create / delete + quotas + network policy + audit.\nNot a system prompt.", {
    x: 0.5, y: 2.1, w: 9, h: 1.0, fontFace: FONT, fontSize: 22, bold: true, color: C.ink, margin: 0,
  });
  s.addText("“Approve tool use” on a machine you care about is still RCE with a dialog.", {
    x: 0.5, y: 3.5, w: 9, h: 0.5, fontFace: FONT, fontSize: 16, color: C.warn, margin: 0,
  });
  footer(s, 7);
}

// 8 Sandbox must mean
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "What “sandbox the agent” has to mean");
  const reqs = [
    { n: "01", t: "Disposable by default" },
    { n: "02", t: "Hard CPU / memory / PIDs" },
    { n: "03", t: "Network isolation as a first-class switch" },
    { n: "04", t: "API / headless entry" },
    { n: "05", t: "Audit / session recording" },
    { n: "06", t: "Outbound tunnels over inbound SSH for real metal" },
  ];
  reqs.forEach((r, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const y = 1.35 + row * 1.55;
    card(s, x, y, 2.95, 1.35);
    s.addText(r.n, { x: x + 0.2, y: y + 0.25, w: 2.5, h: 0.3, fontFace: mono, fontSize: 14, color: C.accent, margin: 0 });
    s.addText(r.t, { x: x + 0.2, y: y + 0.65, w: 2.5, h: 0.5, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, margin: 0 });
  });
  footer(s, 8);
}

// 9 Two primitives
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Two primitives");
  card(s, 0.5, 1.3, 9, 3.4);
  s.addText([
    { text: "Agent / CLI / UI", options: { breakLine: true } },
    { text: "        │  API or WebSocket", options: { breakLine: true } },
    { text: "        ▼", options: { breakLine: true } },
    { text: "Control plane  —  create / exec / delete", options: { breakLine: true } },
    { text: "        │", options: { breakLine: true } },
    { text: "        ├── Cloud terminal  (container + gVisor + limits + isolated net)", options: { breakLine: true } },
    { text: "        └── BYOS agent      (outbound WebSocket → real hardware)", options: {} },
  ], {
    x: 0.85, y: 1.55, w: 8.3, h: 2.9,
    fontFace: mono, fontSize: 15, color: C.soft, margin: 0, valign: "middle",
  });
  footer(s, 9);
}

// 10 Cloud terminal
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Cloud terminal");
  const bits = [
    "Docker / Podman with hard limits",
    "Cap drop + no-new-privileges",
    "Isolated bridge, ICC off",
    "OCI runtime runsc (gVisor)",
    "Attach via API / WebSocket — not published SSH",
  ];
  bits.forEach((t, i) => {
    const y = 1.3 + i * 0.55;
    s.addText("▸", { x: 0.5, y, w: 0.4, h: 0.45, fontFace: FONT, fontSize: 16, color: C.accent, margin: 0 });
    s.addText(t, { x: 1.0, y, w: 8.4, h: 0.45, fontFace: FONT, fontSize: 17, color: C.ink, margin: 0 });
  });
  s.addText("That model is what I designed into Rexec. Steal the shape.", {
    x: 0.5, y: 4.3, w: 9, h: 0.35, fontFace: FONT, fontSize: 15, color: C.muted, margin: 0,
  });
  footer(s, 10);
}

// 11 Isolation ladder
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Isolation ladder");
  const ladder = [
    { n: "1", t: "cgroup + caps + network", d: "Baseline hygiene" },
    { n: "2", t: "gVisor (runsc)", d: "Smaller host syscall surface" },
    { n: "3", t: "MicroVMs (Firecracker)", d: "When the threat model demands it" },
    { n: "4", t: "Dedicated nodes / accounts", d: "Compliance — not cosplay" },
  ];
  ladder.forEach((l, i) => {
    const y = 1.25 + i * 0.75;
    card(s, 0.5, y, 9, 0.65);
    s.addText(l.n, { x: 0.7, y: y + 0.15, w: 0.5, h: 0.35, fontFace: mono, fontSize: 18, bold: true, color: C.accent, margin: 0 });
    s.addText(l.t, { x: 1.4, y: y + 0.1, w: 5, h: 0.45, fontFace: FONT, fontSize: 16, bold: true, color: C.ink, margin: 0, valign: "middle" });
    s.addText(l.d, { x: 6.5, y: y + 0.1, w: 2.8, h: 0.45, fontFace: FONT, fontSize: 13, color: C.muted, margin: 0, valign: "middle" });
  });
  footer(s, 11);
}

// 12 Network + egress
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Network is the product");
  s.addText("A cloud terminal is a network endpoint that happens to have a shell.", {
    x: 0.5, y: 1.2, w: 9, h: 0.35, fontFace: FONT, fontSize: 15, color: C.muted, margin: 0,
  });
  const threats = [
    { t: "T1", d: "Peer to peer" },
    { t: "T2", d: "Tenant → host / metadata" },
    { t: "T3", d: "Egress exfil" },
    { t: "T4", d: "Published ports" },
    { t: "T5", d: "Confused-deputy fetches" },
  ];
  threats.forEach((th, i) => {
    const x = 0.5 + i * 1.85;
    card(s, x, 1.75, 1.75, 1.3);
    s.addText(th.t, { x: x + 0.1, y: 1.95, w: 1.55, h: 0.35, fontFace: mono, fontSize: 16, color: C.accent, margin: 0, align: "center" });
    s.addText(th.d, { x: x + 0.1, y: 2.4, w: 1.55, h: 0.45, fontFace: FONT, fontSize: 12, color: C.ink, margin: 0, align: "center" });
  });
  s.addText("Egress modes:  None  ·  Allowlist  ·  Full outbound (break-glass)", {
    x: 0.5, y: 3.4, w: 9, h: 0.4, fontFace: FONT, fontSize: 15, color: C.ink, margin: 0,
  });
  s.addText("ICC off is not “no internet.” Say it out loud.", {
    x: 0.5, y: 4.0, w: 9, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.warn, margin: 0,
  });
  footer(s, 12);
}

// 13 Agent flow
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Agent flow");
  const flow = [
    { n: "1", t: "Create sandbox", d: "Image + class + network mode" },
    { n: "2", t: "Inject secrets", d: "Short-lived only" },
    { n: "3", t: "Run agent", d: "Headless by default" },
    { n: "4", t: "Attach if needed", d: "Human intervene" },
    { n: "5", t: "Delete", d: "Assume disk + memory gone" },
  ];
  flow.forEach((f, i) => {
    const x = 0.4 + i * 1.9;
    card(s, x, 1.5, 1.8, 2.6);
    s.addText(f.n, { x: x + 0.15, y: 1.75, w: 1.5, h: 0.4, fontFace: mono, fontSize: 22, bold: true, color: C.accent, margin: 0, align: "center" });
    s.addText(f.t, { x: x + 0.1, y: 2.4, w: 1.6, h: 0.7, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, margin: 0, align: "center" });
    s.addText(f.d, { x: x + 0.1, y: 3.25, w: 1.6, h: 0.55, fontFace: FONT, fontSize: 12, color: C.muted, margin: 0, align: "center" });
  });
  footer(s, 13);
}

// 14 BYOS
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "BYOS: mediated access, not a jail");
  card(s, 0.5, 1.35, 9, 1.2);
  s.addText("Outbound WebSocket on the machine. No inbound SSH. No “open 22 for the demo.”", {
    x: 0.75, y: 1.6, w: 8.5, h: 0.7, fontFace: FONT, fontSize: 17, color: C.ink, margin: 0, valign: "middle",
  });
  s.addTable(
    [
      [
        { text: "Need", options: { fill: { color: "1A2330" }, color: C.ink, bold: true } },
        { text: "Prefer", options: { fill: { color: "1A2330" }, color: C.ink, bold: true } },
      ],
      ["Untrusted model code", "Cloud terminal + gVisor"],
      ["Real GPU / lab box", "BYOS — treat like prod access"],
      ["Shared expensive machine", "BYOS + identity + recording"],
    ].map((row) =>
      row.map((cell) =>
        typeof cell === "string" ? { text: cell, options: { color: C.muted } } : cell
      )
    ),
    {
      x: 0.5, y: 2.8, w: 9, h: 1.9,
      colW: [4, 5],
      border: { pt: 0.5, color: C.line },
      fontFace: FONT, fontSize: 14, valign: "middle",
      fill: { color: C.card },
    }
  );
  footer(s, 14);
}

// 15 Failure modes
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Failure modes I’ve hit");
  const fails = [
    { t: "Docker socket", d: "Mount the socket into the “sandbox” and you moved the gate." },
    { t: "Open egress", d: "Convenient. Leaky. Agents will phone home." },
    { t: "Thrashing agents", d: "Quotas, concurrency caps, aggressive TTLs are security features." },
    { t: "Prompt as security", d: "System prompts are UX, not a boundary." },
    { t: "Runtime theater", d: "gVisor on paper, tenants still on stock runc." },
  ];
  fails.forEach((f, i) => {
    const y = 1.2 + i * 0.7;
    s.addText(f.t, { x: 0.5, y, w: 3.2, h: 0.55, fontFace: FONT, fontSize: 15, bold: true, color: C.warn, margin: 0, valign: "middle" });
    s.addText(f.d, { x: 3.8, y, w: 5.7, h: 0.55, fontFace: FONT, fontSize: 15, color: C.ink, margin: 0, valign: "middle" });
  });
  footer(s, 15);
}

// 16 Checklist
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Field checklist");
  const checks = [
    "Ban agent shell on laptops for secrets / prod",
    "Create / delete per task (or per PR)",
    "Run agent sandboxes on gVisor or stronger",
    "Set egress deliberately; treat DNS as data",
    "Cap CPU / memory / PIDs; kill on a timer",
    "Record high-risk sessions until you trust the loop",
    "Prefer outbound agents over inbound SSH",
    "Assume breakout; escalate when the threat model says so",
  ];
  checks.forEach((c, i) => {
    const y = 1.15 + i * 0.45;
    s.addText(String(i + 1).padStart(2, "0"), { x: 0.5, y, w: 0.5, h: 0.4, fontFace: mono, fontSize: 13, color: C.accent, margin: 0, valign: "middle" });
    s.addText(c, { x: 1.15, y, w: 8.3, h: 0.4, fontFace: FONT, fontSize: 14, color: C.ink, margin: 0, valign: "middle" });
  });
  footer(s, 16);
}

// 17 Takeaways
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  title(s, "Takeaways");
  const takes = [
    "Agents are remote code execution with better UX",
    "Sandbox = create/delete + quotas + network + audit — not a system prompt",
    "Containers ≠ hostile multi-tenant boundary by themselves",
    "Prefer outbound tunnels over inbound SSH for fleet access",
    "TTL and concurrency caps are security features when models thrash",
  ];
  takes.forEach((t, i) => {
    const y = 1.25 + i * 0.7;
    card(s, 0.5, y, 9, 0.6);
    s.addText(String(i + 1), { x: 0.7, y: y + 0.12, w: 0.5, h: 0.35, fontFace: mono, fontSize: 18, bold: true, color: C.accent, margin: 0 });
    s.addText(t, { x: 1.4, y: y + 0.12, w: 7.8, h: 0.35, fontFace: FONT, fontSize: 17, color: C.ink, margin: 0 });
  });
  footer(s, 17);
}

// 18 Close
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.accent } });
  s.addText("Questions?", {
    x: 0.6, y: 1.5, w: 8.8, h: 0.6, fontFace: FONT, fontSize: 34, bold: true, color: C.ink, margin: 0,
  });
  s.addText("nitrocode.sh/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal\ngithub.com/PipeOpsHQ/Rexec", {
    x: 0.6, y: 2.5, w: 8.8, h: 0.7, fontFace: mono, fontSize: 15, color: C.muted, margin: 0,
  });
  s.addText("Alex Idowu  ·  @nitrocode  ·  Lagos", {
    x: 0.6, y: 3.6, w: 8.8, h: 0.35, fontFace: FONT, fontSize: 15, color: C.dim, margin: 0,
  });
  footer(s, 18);
}

pres
  .writeFile({ fileName: "/Users/nitrocode/personal/9trocode.github.io/docs/SysConf-2026-Safely-Give-AI-Agents-a-Terminal.pptx" })
  .then(() => console.log("Wrote docs/SysConf-2026-Safely-Give-AI-Agents-a-Terminal.pptx"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
