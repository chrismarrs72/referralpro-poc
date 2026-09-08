const LOB = {
  "Auto & Vehicle Insurance": ["Auto Insurance", "Motorcycle Insurance", "Boat Insurance", "RV Insurance"],
  "Property Insurance": ["Homeowners Insurance", "Renters Insurance", "Umbrella Insurance - Personal", "Condo Insurance", "Flood Insurance"],
  "Health & Medical Insurance": ["Health, Individual", "Short-Term Medical", "Dental", "Vision", "Supplemental Health"],
  "Life & Disability Insurance": ["Life, Individual", "Final Expense", "Disability", "Long-Term Care"],
  "Business & Commercial Insurance": ["Group Health, Major Medical", "Employee Benefits, Ancillary & Voluntary", "Commercial Auto", "General Liability", "Workers' Compensation"],
  "Medicare": ["Medicare Advantage", "Medicare Supplement / Medigap", "Medicare Part D"],
  "Niche & Specialty Insurance": ["Title Insurance", "Pet Insurance", "Event Insurance"]
};
const seedSeats = [
  { id: "MN-HENNEPIN-GROUP_HEALTH", state: "Minnesota", county: "Hennepin", category: "Business & Commercial Insurance", product: "Group Health, Major Medical", role: "Primary", status: "Active", agentId: "RP-A0001", agent: "Mikell Simmons", agency: "EMS" },
  { id: "FL-MIAMI-DADE-HEALTH_INDIVIDUAL", state: "Florida", county: "Miami-Dade", category: "Health & Medical Insurance", product: "Health, Individual", role: "Primary", status: "Active", agentId: "RP-A0001", agent: "Mikell Simmons", agency: "EMS" }
];
const state = {
  seats: JSON.parse(JSON.stringify(seedSeats)),
  form: { state: "Minnesota", county: "Hennepin", category: "", product: "", name: "Chris TEST", email: "chris@chrismarrscto.com", phone: "(612) 555-0199" },
  last: null, log: [], referrals: [], req: 61000
};
function route() { return location.hash.replace("#", "") || "/"; }
function idleHint() {
  const h = route();
  if (h === "/result" && state.last) {
    return state.last.result === "house"
      ? "House result. Consumer sees no fake card. Next: click 3 Accept. That is the specialist inbox for this same referral."
      : "Primary result. Same agent as the live TA row. Next: click 3 Accept.";
  }
  if (h === "/accept") {
    return state.last
      ? "Step 3. This is the specialist view of " + state.last.id + ". Accept starts 24 / 48 / 72. Reject returns it to statewide agents in this category. Then 4 Agent ref."
      : "Step 3 needs a referral. Go Home, run Beat 1 or Beat 2, press Find, then come back.";
  }
  if (h === "/a2a") {
    return "Step 4. Mike as agent sends Individual Health in Hennepin, a seat he does not hold. Same resolver. Credit stays with the sender. Press the navy button.";
  }
  if (h === "/") return "Start on Home. Beat 1 or Beat 2, then Find. Then 3 Accept.";
  return document.getElementById("pocHint") ? document.getElementById("pocHint").dataset.idle : "";
}
function setHint(text) {
  const box = document.getElementById("pocHint");
  if (!box) return;
  box.textContent = text || idleHint();
}
function norm(s) { return (s || "").toLowerCase().replace(/,\s*mn$/, "").replace(/,\s*fl$/, "").trim(); }
function nextId() { state.req += 1; return "WIE-REQ-" + state.req; }
function resolve(f) {
  const hit = state.seats.find(s => s.status === "Active" && s.role === "Primary" && norm(s.state) === norm(f.state) && norm(s.county) === norm(f.county) && s.category === f.category && s.product === f.product);
  if (hit) return { kind: "primary", seat: hit };
  return { kind: "house", seat: { id: "HOUSE-EMS", agentId: "RP-A0001", agent: "Mikell Simmons", agency: "EMS", role: "House" } };
}
function submitForm() {
  const f = state.form;
  if (!f.category || !f.product) return;
  const r = resolve(f);
  const id = nextId();
  const rec = { id, source: "WIE consumer", state: f.state, county: f.county, category: f.category, product: f.product, name: f.name, email: f.email, phone: f.phone, result: r.kind, dest: r.seat, status: r.kind === "primary" ? "assigned" : "assigned-house", created: new Date().toISOString() };
  state.last = rec;
  state.referrals.unshift(rec);
  state.log.unshift({ t: new Date().toISOString(), ev: "referral.created", id, dest: r.seat.id, rule: r.kind === "primary" ? "county Primary" : "House EMS" });
  location.hash = "#/result";
  render();
}
function preset(kind) {
  if (kind === "house") {
    state.form = { state: "Minnesota", county: "Hennepin", category: "Health & Medical Insurance", product: "Health, Individual", name: "Chris TEST Hennepin Health", email: "chris@chrismarrscto.com", phone: "(612) 555-0199" };
  } else if (kind === "ems") {
    state.form = { state: "Minnesota", county: "Hennepin", category: "Business & Commercial Insurance", product: "Group Health, Major Medical", name: "Chris TEST Hennepin Group", email: "chris@chrismarrscto.com", phone: "(612) 555-0199" };
  } else if (kind === "mia") {
    state.form = { state: "Florida", county: "Miami-Dade", category: "Health & Medical Insurance", product: "Health, Individual", name: "Chris TEST Florida Health", email: "chris@chrismarrscto.com", phone: "(305) 555-0199" };
  }
  location.hash = "#/";
  render();
  if (kind === "house") setHint("Step 1 loaded. Empty Hennepin Individual Health seat. Press Find My Specialist. After the House result, go to 3 Accept.");
  if (kind === "ems") setHint("Step 2 loaded. Live EMS Group Health row. Press Find My Specialist. After the Primary result, go to 3 Accept.");
  if (kind === "mia") setHint("Miami-Dade Individual Health loaded. Press Find My Specialist.");
}
function headerSearch() {
  const f = state.form;
  const cats = Object.keys(LOB);
  const products = f.category ? LOB[f.category] : [];
  const findTip = (!f.category || !f.product) ? "Pick Beat 1 or Beat 2 first. Then this button runs the resolver." : "Creates one referral. One result. Then go to 3 Accept.";
  return `<div class="search-card"><h2><span class="badge-ico">Q</span> Find My Specialist</h2><div class="presets">
    <button type="button" data-tip="Step 1. Empty seat. After Find you should see We'll assign a specialist. Then 3 Accept." onclick="preset('house')">Beat 1: Hennepin Individual Health</button>
    <button type="button" data-tip="Step 2. Live EMS row. After Find you should see Mikell / EMS. Then 3 Accept." onclick="preset('ems')">Beat 2: Hennepin Group Health</button>
    <button type="button" data-tip="Storyboard seed. After Find: EMS as Primary." onclick="preset('mia')">Miami-Dade Individual Health</button>
  </div>
  <label class="field"><span>STATE</span><select onchange="state.form.state=this.value;render()"><option ${f.state==="Minnesota"?"selected":""}>Minnesota</option><option ${f.state==="Florida"?"selected":""}>Florida</option></select></label>
  <label class="field"><span>COUNTY</span><select onchange="state.form.county=this.value;render()"><option ${f.county==="Hennepin"?"selected":""}>Hennepin</option><option ${f.county==="Miami-Dade"?"selected":""}>Miami-Dade</option></select></label>
  <label class="field"><span>COVERAGE CATEGORY</span><select onchange="state.form.category=this.value;state.form.product='';render()"><option value="">-</option>${cats.map(c => `<option ${f.category===c?"selected":""}>${c}</option>`).join("")}</select></label>
  <label class="field"><span>PRODUCT / SPECIALTY</span><select onchange="state.form.product=this.value;render()"><option value="">-</option>${products.map(p => `<option ${f.product===p?"selected":""}>${p}</option>`).join("")}</select></label>
  <label class="field"><span>NAME</span><input type="text" value="${f.name}" oninput="state.form.name=this.value" /></label>
  <label class="field"><span>EMAIL</span><input type="email" value="${f.email}" oninput="state.form.email=this.value" /></label>
  <label class="field"><span>PHONE</span><input type="tel" value="${f.phone}" oninput="state.form.phone=this.value" /></label>
  <button class="btn-navy" data-tip="${findTip}" ${(!f.category||!f.product)?"disabled":""} onclick="submitForm()">Find My Specialist</button></div>`;
}
function pageHome() {
  return `<section class="hero"><div class="quote"><div class="stars">★★★★★</div>"Finding the right agent was incredibly easy."<div class="who">Sarah M. · illustrative review</div></div>${headerSearch()}</section>
    <section class="market"><h2>Specialists in Your Market</h2><div class="sub">Hennepin County, MN · Business & Commercial</div>
    <div class="cards"><div class="agent-card"><div class="avatar">JH</div><b>Jennifer Hayes</b><div class="fine" style="font-style:normal">Summit Benefits Group</div><div class="chip">Group Health & Employee Benefits</div></div>
    <div class="agent-card"><div class="avatar">DC</div><b>David Carter</b><div class="fine" style="font-style:normal">Northstar Commercial Insurance</div><div class="chip">Commercial & Business Coverage</div></div>
    <div class="agent-card"><div class="avatar">RM</div><b>Robert Mills</b><div class="fine" style="font-style:normal">Lakeside Risk Advisors</div><div class="chip">Major Medical & Health</div></div></div>
    <p class="fine">Illustrative profiles. Actual specialists are matched from live Territory Assignments. Operating model is one Primary, not three cards.</p></section>`;
}
function pageResult() {
  const rec = state.last;
  if (!rec) return `<main class="page"><div class="panel">No referral yet. <a href="#/">Go to intake and run Beat 1 or Beat 2, then Find.</a></div></main>`;
  const house = rec.result === "house";
  const headTip = house ? "Empty seat, not a dead end. Referral is with EMS. Next: 3 Accept." : "Active Primary. Next: 3 Accept.";
  return `<main class="page"><div class="grid2"><div class="panel">
    <div class="steps"><b>You finished intake.</b> This is the consumer result. Next is step 3, the specialist inbox for ${rec.id}. Use Specialist accept or the 3 Accept button in the top bar.</div>
    <p class="tag ${house?"house":"primary"}" data-tip="${headTip}">${house ? "We'll assign a specialist" : "Assigned specialist"}</p>
    <h1 data-tip="${headTip}">${house ? "We'll assign a specialist." : rec.dest.agent}</h1>
    <p>${house ? "No Active Primary on this county + category. Your request is with House (EMS). You will hear from someone. This is not a dropped lead." : rec.dest.agency + " · " + rec.dest.role + " · " + rec.dest.agentId}</p>
    <div class="kvs"><div><b>Reference</b><span>${rec.id}</span></div><div><b>Need</b><span>${rec.state} / ${rec.county} / ${rec.category} / ${rec.product}</span></div><div><b>Destination</b><span>${rec.dest.id}</span></div></div>
    <p class="fine">No Position 1 / Backup labels. One result.</p>
    <div class="walk"><a class="btn-outline" data-tip="Opens step 3. Same referral. Agent Accept or Reject." href="#/accept">Step 3: Specialist accept</a>
    <a class="btn-outline" data-tip="Why it went Primary or House." href="#/routing">Routing log</a></div></div>
    <div class="panel"><h2>Platform record</h2><p class="tag mock">POC side panel</p>
    <div class="kvs"><div><b>referral_id</b><span>${rec.id}</span></div><div><b>source</b><span>${rec.source}</span></div><div><b>status</b><span>${rec.status}</span></div><div><b>rule</b><span>${house ? "County empty + no statewide = House EMS" : "Active Primary"}</span></div><div><b>GHL write</b><span>mocked</span></div></div></div></div></main>`;
}
function pageAccept() {
  const rec = state.last;
  if (!rec) {
    return `<main class="page"><div class="panel">
      <div class="steps"><b>Step 3 is empty because no referral exists in this tab.</b><ol><li>Click 1 House or 2 EMS.</li><li>Press Find My Specialist.</li><li>Come back to 3 Accept.</li></ol></div>
      <h1>No referral yet</h1>
      <p><a class="btn-outline" href="#/">Go to Home</a></p>
    </div></main>`;
  }
  return `<main class="page"><div class="panel">
    <div class="steps"><b>Step 3. Specialist inbox.</b> This is the same file as ${rec.id}. The consumer already saw ${rec.result === "house" ? "We'll assign a specialist" : rec.dest.agent}. You are now the assigned agent.
      <ol><li>Accept starts the 24 progress / 48 warning / 72 red-line clock.</li><li>Reject, poor fit sends it to statewide agents in ${rec.category}. Not a drop.</li><li>When you are done, click 4 Agent ref.</li></ol></div>
    <p class="tag mock">Specialist view · mocked delivery</p>
    <h1>Referral ${rec.id}</h1>
    <p>${rec.county}, ${rec.state} · ${rec.product}</p>
    <p>Assigned to ${rec.dest.agent} / ${rec.dest.agency}. Email + SMS with this id (mocked).</p>
    <div class="walk">
      <button class="btn-navy" style="width:auto" data-tip="Starts the 24 / 48 / 72 clock. Next: 4 Agent ref." onclick="var r=state.last; if(r){r.status='accepted';state.log.unshift({t:new Date().toISOString(),ev:'referral.accepted',id:r.id}); setHint('Accepted. Clock started. Next: 4 Agent ref.');}render()">Accept</button>
      <button class="btn-outline" data-tip="Statewide round-robin in this category. Not a drop. Next: 4 Agent ref." onclick="var r=state.last; if(r){r.status='rejected';state.log.unshift({t:new Date().toISOString(),ev:'referral.rejected',id:r.id,note:'poor fit to state + category RR'}); setHint('Rejected. Goes to statewide round-robin. Next: 4 Agent ref.');}render()">Reject, poor fit</button>
    </div>
    <p>Status now: <b>${rec.status}</b></p>
    <p><a class="btn-outline" href="#/a2a">Step 4: Agent-to-agent</a></p>
    <p class="fine">24 / 48 / 72 window. At 72 hours or reject, statewide round-robin in this category.</p>
  </div></main>`;
}
function pageA2A() {
  return `<main class="page"><div class="panel">
    <div class="steps"><b>Step 4. Agent-to-agent.</b> Not a consumer WIE submit. Mike (RP-A0001) refers a Hennepin Individual Health lead. He does not hold that seat, so the resolver sends it to House. Credit stays with Mike.
      <ol><li>Press the navy button.</li><li>You land on the same result screen as step 1, with source = agent-to-agent.</li><li>Seats, Replace, and Records are optional after this.</li></ol></div>
    <h1>Agent-to-agent referral</h1>
    <p>Same record type as a WIE lead. Source is agent. Destination still follows State + County + Category + Product.</p>
    <button class="btn-navy" style="width:auto" data-tip="Creates the A2A sample and opens the result. House, because Mike does not hold Hennepin Individual Health." onclick="const f={state:'Minnesota',county:'Hennepin',category:'Health & Medical Insurance',product:'Health, Individual'}; const r=resolve(f); const id=nextId(); state.referrals.unshift({id,source:'agent-to-agent',referring:'RP-A0001',...f,result:r.kind,dest:r.seat,status:'assigned-house',name:'A2A sample'}); state.log.unshift({t:new Date().toISOString(),ev:'referral.created',id,source:'agent'}); state.last=state.referrals[0]; location.hash='#/result'; render();">Send a Health Individual referral Mike does not hold</button>
  </div></main>`;
}
function pageTerritory() {
  return `<main class="page"><div class="panel"><h1>Territory assignments</h1><p>Seed from the live proof row plus the storyboard Miami-Dade Individual Health seat. Not the full 378.</p>
    <table><tr><th>Territory ID</th><th>Seat</th><th>Role</th><th>Agent</th></tr>${state.seats.map(s => `<tr><td>${s.id}</td><td>${s.county}, ${s.state}<br/>${s.product}</td><td>${s.role} / ${s.status}</td><td>${s.agent} / ${s.agency}<br/>${s.agentId}</td></tr>`).join("")}</table>
    <p class="fine">Empty seats do not appear as fake cards. They resolve to House.</p></div></main>`;
}
function pageRouting() {
  return `<main class="page"><div class="panel"><h1>Routing log</h1><table><tr><th>When</th><th>Event</th><th>Detail</th></tr>${state.log.map(e => `<tr><td>${e.t.replace("T"," ").slice(0,19)}</td><td>${e.ev}</td><td>${e.id || ""} ${e.dest || ""} ${e.rule || ""} ${e.note || ""}</td></tr>`).join("") || "<tr><td colspan=3>Empty. Run intake first.</td></tr>"}</table></div></main>`;
}
function pageReplace() {
  const seat = state.seats.find(s => s.id === "FL-MIAMI-DADE-HEALTH_INDIVIDUAL");
  return `<main class="page"><div class="panel"><h1>Replace a seat</h1><p>Miami-Dade Individual Health. Historic referrals stay with the writing agent. Future leads move.</p>
    <p>Current Primary: ${seat ? seat.agent + " / " + seat.agency : "none"}</p>
    <button class="btn-navy" style="width:auto" data-tip="Next Miami-Dade Individual Health lead goes to the buyer. Old referrals stay with EMS." onclick="const s=state.seats.find(x=>x.id==='FL-MIAMI-DADE-HEALTH_INDIVIDUAL'); if(s){s.agent='Buyer Agency';s.agency='RP-A0002';s.agentId='RP-A0002';} state.log.unshift({t:new Date().toISOString(),ev:'assignment.replaced',id:'FL-MIAMI-DADE-HEALTH_INDIVIDUAL',note:'future leads only'}); setHint('Seat replaced. Future leads only.'); render();">Replace EMS with RP-A0002</button>
    <p class="fine">Do not run this on a live sold membership. Storyboard buyer is fictitious.</p></div></main>`;
}
function pageRecords() {
  return `<main class="page"><div class="panel"><h1>Where the record lives</h1><div class="kvs">
    <div><b>Platform layer</b><span>Source of record for the referral and the routing assignment</span></div>
    <div><b>ReferralPro pipeline</b><span>Visibility copy. Progress the agent can see.</span></div>
    <div><b>GHL / AgentPro</b><span>Echo. Email and SMS. Not territory SoR.</span></div>
    <div><b>WIE</b><span>Intake only. No routing table of its own.</span></div></div>
    <p class="fine">Writes to GHL are mocked in this POC.</p></div></main>`;
}
function pageAdmin() {
  return `<main class="page"><div class="panel"><h1>Admin</h1><p>Accept window locked Friday: 24 progress / 48 warning / 72 red line, then state + category round-robin.</p><p>Catalogue: Drive file ReferralPro_Official_LOB_Taxonomy.docx. Seven categories, 57 products. Seats are State + County + Category.</p><p class="tag mock">Config changes here are display only.</p></div></main>`;
}
function pageMeasure() {
  const n = state.referrals.length;
  const house = state.referrals.filter(r => r.result === "house").length;
  const prim = state.referrals.filter(r => r.result === "primary").length;
  const acc = state.referrals.filter(r => r.status === "accepted").length;
  const rej = state.referrals.filter(r => r.status === "rejected").length;
  return `<main class="page"><h1 style="color:var(--navy)">Measurement</h1><p class="fine">Tiles from events in this session. Targets from the KPI note. Not live production numbers.</p>
    <div class="tiles"><div class="tile"><div class="n">${state.seats.length}</div><div class="l">Seed Primary seats</div></div><div class="tile"><div class="n">${n}</div><div class="l">Referrals this session</div></div><div class="tile"><div class="n">${prim}</div><div class="l">County Primary</div></div><div class="tile"><div class="n">${house}</div><div class="l">House</div></div><div class="tile"><div class="n">${acc}</div><div class="l">Accepted</div></div><div class="tile"><div class="n">${rej}</div><div class="l">Rejected</div></div></div></main>`;
}
function pageSimple(title, body) { return `<main class="page"><div class="panel"><h1>${title}</h1><p>${body}</p></div></main>`; }
function render() {
  const h = route();
  const root = document.getElementById("app");
  const map = { "/": pageHome, "/result": pageResult, "/accept": pageAccept, "/a2a": pageA2A, "/territory": pageTerritory, "/routing": pageRouting, "/replace": pageReplace, "/records": pageRecords, "/admin": pageAdmin, "/measure": pageMeasure,
    "/coverage": () => pageSimple("Coverage Types", "Uses the official LOB file. Seven categories. This route 404s on live WIE today. POC placeholder only."),
    "/how": () => pageSimple("How It Works", "Consumer submits need. Resolver matches live Territory Assignments. One specialist or House. Agent accepts inside 24 / 48 / 72.") };
  root.innerHTML = (map[h] || pageHome)();
  setHint(idleHint());
}
document.querySelector(".poc-bar").addEventListener("click", (e) => {
  const b = e.target.getAttribute("data-beat");
  if (!b) return;
  const go = { "1": () => preset("house"), "2": () => preset("ems"), "3": () => { location.hash = "#/accept"; }, "4": () => { location.hash = "#/a2a"; }, "5": () => { location.hash = "#/territory"; }, "6": () => { location.hash = "#/replace"; }, "7": () => { location.hash = "#/records"; }, "8": () => { location.hash = "#/admin"; }, "9": () => { location.hash = "#/measure"; } };
  go[b]();
  if (b !== "1" && b !== "2") render();
});
document.addEventListener("mouseover", (e) => { const el = e.target.closest("[data-tip]"); if (el) setHint(el.getAttribute("data-tip")); });
document.addEventListener("mouseout", (e) => { const el = e.target.closest("[data-tip]"); if (!el) return; const next = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("[data-tip]"); if (!next) setHint(); });
window.addEventListener("hashchange", render);
render();
