const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CertChain - Blockchain Certificate Verification</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0f1e;--surface:#111827;--card:#1a2236;--border:#1e3a5f;--accent:#3b82f6;--accent2:#6366f1;--green:#22c55e;--red:#ef4444;--text:#e2e8f0;--muted:#64748b;--radius:12px}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.navbar{display:flex;justify-content:space-between;align-items:center;padding:18px 40px;background:rgba(17,24,39,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.logo{font-size:1.4rem;font-weight:800;background:linear-gradient(135deg,#3b82f6,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-right{display:flex;gap:12px;align-items:center}
#adminBadge{display:none;background:rgba(59,130,246,.15);color:var(--accent);padding:6px 14px;border-radius:20px;font-size:.85rem;font-weight:600}
.btn{padding:10px 20px;border-radius:8px;border:none;cursor:pointer;font-weight:600;font-size:.9rem;transition:all .2s}
.btn-primary{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff}
.btn-primary:hover{opacity:.85;transform:translateY(-1px)}
.btn-danger{background:rgba(239,68,68,.15);color:var(--red);border:1px solid rgba(239,68,68,.3)}
.btn-danger:hover{background:rgba(239,68,68,.25)}
.btn-outline{background:transparent;color:var(--text);border:1px solid var(--border)}
.btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.hero{text-align:center;padding:80px 20px 60px;background:radial-gradient(ellipse at 50% 0%,rgba(59,130,246,.12) 0%,transparent 70%)}
.hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.1;margin-bottom:16px}
.hero h1 span{background:linear-gradient(135deg,#3b82f6,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{color:var(--muted);font-size:1.1rem;max-width:540px;margin:0 auto 32px}
.stats{display:flex;justify-content:center;gap:40px;padding:20px 0 60px;flex-wrap:wrap}
.stat{text-align:center}
.stat-num{font-size:1.8rem;font-weight:800;color:var(--accent)}
.stat-label{color:var(--muted);font-size:.85rem}
.main{max-width:860px;margin:0 auto;padding:0 20px 60px}
.tabs{display:flex;gap:4px;background:var(--surface);border-radius:12px;padding:4px;margin-bottom:28px;border:1px solid var(--border)}
.tab{flex:1;padding:12px;text-align:center;border-radius:8px;cursor:pointer;font-weight:500;color:var(--muted);transition:all .2s;font-size:.9rem;border:none;background:none}
.tab.active{background:var(--card);color:var(--text);font-weight:600}
.tab-panel{display:none}
.tab-panel.active{display:block}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:28px}
.card-title{font-size:1.1rem;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px}
.field{margin-bottom:18px}
.field label{display:block;font-size:.82rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.field input{width:100%;background:#0d1628;border:1px solid var(--border);color:var(--text);padding:12px 16px;border-radius:8px;font-size:.95rem;outline:none;transition:border .2s;font-family:inherit}
.field input:focus{border-color:var(--accent)}
.dropzone{border:2px dashed var(--border);border-radius:10px;padding:32px;text-align:center;cursor:pointer;transition:all .2s;background:#0d1628}
.dropzone:hover{border-color:var(--accent);background:rgba(59,130,246,.05)}
.dropzone p{color:var(--muted);font-size:.88rem;margin-top:6px}
.dropzone .dz-icon{font-size:2.5rem}
.file-chosen{color:var(--accent);font-weight:600;margin-top:8px;font-size:.88rem}
.divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--muted);font-size:.85rem}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border)}
.result-box{margin-top:20px;border-radius:10px;overflow:hidden;display:none}
.result-box.show{display:block}
.result-header{padding:16px 20px;font-weight:700;font-size:1rem;display:flex;align-items:center;gap:10px}
.result-header.valid{background:rgba(34,197,94,.15);color:var(--green)}
.result-header.revoked{background:rgba(239,68,68,.15);color:var(--red)}
.result-header.notfound{background:rgba(100,116,139,.15);color:var(--muted)}
.result-header.success{background:rgba(34,197,94,.15);color:var(--green)}
.result-header.error{background:rgba(239,68,68,.15);color:var(--red)}
.result-body{background:var(--surface);padding:20px}
.detail-row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border);gap:16px}
.detail-row:last-child{border:none}
.detail-label{color:var(--muted);font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.4px;min-width:110px;padding-top:2px}
.detail-value{color:var(--text);font-size:.9rem;text-align:right;word-break:break-all}
.mono{font-family:monospace;font-size:.78rem}
.badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:.8rem;font-weight:700}
.badge-valid{background:rgba(34,197,94,.15);color:var(--green)}
.badge-revoked{background:rgba(239,68,68,.15);color:var(--red)}
.spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-box{text-align:center;padding:24px;display:none}
.loading-box.show{display:block}
.loading-box p{color:var(--muted);margin-top:12px;font-size:.9rem}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;align-items:center;justify-content:center;padding:20px}
.modal-overlay.show{display:flex}
.modal{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:32px;width:100%;max-width:400px}
.modal h2{font-size:1.3rem;font-weight:700;margin-bottom:6px}
.modal p.sub{color:var(--muted);font-size:.9rem;margin-bottom:24px}
.modal-close{float:right;cursor:pointer;color:var(--muted);font-size:1.4rem;line-height:1;background:none;border:none;color:var(--muted)}
.err-msg{color:var(--red);font-size:.85rem;margin-top:8px;display:none;padding:8px 12px;background:rgba(239,68,68,.1);border-radius:6px}
.admin-note{background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:.85rem;color:var(--accent)}
footer{text-align:center;padding:32px 20px;color:var(--muted);font-size:.85rem;border-top:1px solid var(--border)}
footer span{color:var(--accent)}
@media(max-width:600px){.navbar{padding:14px 20px}.stats{gap:24px}.hero{padding:60px 20px 40px}.card{padding:20px}}
</style>
</head>
<body>
<nav class="navbar">
  <div class="logo">🔐 CertChain</div>
  <div class="nav-right">
    <span id="adminBadge">⚡ Admin</span>
    <button class="btn btn-outline" id="loginBtn" onclick="openLogin()">Admin Login</button>
    <button class="btn btn-danger" id="logoutBtn" onclick="logout()" style="display:none">Logout</button>
  </div>
</nav>

<div class="hero">
  <h1>Blockchain<br><span>Certificate Verification</span></h1>
  <p>Tamper-proof certificates secured on Ethereum. Upload, verify, and manage with full audit trail.</p>
</div>

<div class="stats">
  <div class="stat"><div class="stat-num" id="totalCerts">—</div><div class="stat-label">Total Issued</div></div>
  <div class="stat"><div class="stat-num" id="validCerts">—</div><div class="stat-label">Valid</div></div>
  <div class="stat"><div class="stat-num" id="revokedCerts">—</div><div class="stat-label">Revoked</div></div>
</div>

<div class="main">
  <div class="tabs" id="tabBar">
    <button class="tab active" id="tab-verify" onclick="switchTab('verify')">✅ Verify Certificate</button>
    <button class="tab" id="tab-upload" onclick="switchTab('upload')" style="display:none">📤 Upload Certificate</button>
    <button class="tab" id="tab-revoke" onclick="switchTab('revoke')" style="display:none">❌ Revoke Certificate</button>
  </div>

  <!-- VERIFY PANEL -->
  <div class="tab-panel active" id="verifyPanel">
    <div class="card">
      <div class="card-title">🔍 Verify a Certificate</div>
      <div class="dropzone" id="verifyDrop" onclick="document.getElementById('verifyFile').click()">
        <div class="dz-icon">📄</div>
        <div style="font-weight:600;margin-top:8px">Drop file here or click to browse</div>
        <p>PDF, TXT, PNG, JPG, DOCX supported</p>
        <div class="file-chosen" id="verifyChosen"></div>
        <input type="file" id="verifyFile" style="display:none" onchange="onVerifyFile(this)">
      </div>
      <div class="divider">OR enter hash manually</div>
      <div class="field">
        <label>Certificate Hash (SHA-256)</label>
        <input type="text" id="verifyHash" placeholder="Paste 64-character hex hash...">
      </div>
      <button class="btn btn-primary" style="width:100%;padding:14px" onclick="verifyCert()">🔍 Verify Certificate</button>
      <div class="loading-box" id="verifyLoading"><div class="spinner"></div><p>Querying blockchain...</p></div>
      <div class="result-box" id="verifyResult"></div>
    </div>
  </div>

  <!-- UPLOAD PANEL -->
  <div class="tab-panel" id="uploadPanel">
    <div class="card">
      <div class="admin-note">⚡ Admin Mode — Uploads are stored on Ethereum blockchain + MongoDB database</div>
      <div class="card-title">📤 Upload Certificate to Blockchain</div>
      <div class="dropzone" id="uploadDrop" onclick="document.getElementById('uploadFile').click()">
        <div class="dz-icon">📁</div>
        <div style="font-weight:600;margin-top:8px">Drop certificate file here or click to browse</div>
        <p>PDF, TXT, PNG, JPG, DOCX — max 20MB</p>
        <div class="file-chosen" id="uploadChosen"></div>
        <input type="file" id="uploadFile" style="display:none" onchange="onUploadFile(this)">
      </div>
      <div style="height:16px"></div>
      <div class="field"><label>Student Name *</label><input type="text" id="studentName" placeholder="e.g. Moni Sharma"></div>
      <div class="field"><label>Course / Certification *</label><input type="text" id="courseName" placeholder="e.g. Blockchain Development"></div>
      <button class="btn btn-primary" style="width:100%;padding:14px" onclick="uploadCert()">📤 Upload to Blockchain</button>
      <div class="loading-box" id="uploadLoading"><div class="spinner"></div><p>Storing on blockchain — please wait...</p></div>
      <div class="result-box" id="uploadResult"></div>
    </div>
  </div>

  <!-- REVOKE PANEL -->
  <div class="tab-panel" id="revokePanel">
    <div class="card">
      <div class="admin-note" style="background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:var(--red)">⚠️ Revoking a certificate is a permanent blockchain action. It cannot be undone.</div>
      <div class="card-title">❌ Revoke Certificate</div>
      <div class="field"><label>Certificate Hash *</label><input type="text" id="revokeHash" placeholder="64-character SHA-256 hash"></div>
      <button class="btn btn-danger" style="width:100%;padding:14px;font-size:.95rem" onclick="revokeCert()">❌ Revoke Certificate</button>
      <div class="loading-box" id="revokeLoading"><div class="spinner"></div><p>Broadcasting revocation to blockchain...</p></div>
      <div class="result-box" id="revokeResult"></div>
    </div>
  </div>
</div>

<footer>
  <p>Secured by <span>Ethereum Blockchain</span> &bull; CertChain v3.0 Production</p>
  <p style="margin-top:6px">All certificate hashes are immutable and permanently verifiable</p>
</footer>

<!-- Admin Login Modal -->
<div class="modal-overlay" id="loginModal">
  <div class="modal">
    <button class="modal-close" onclick="closeLogin()">✕</button>
    <h2>Admin Login</h2>
    <p class="sub">Authenticate to access certificate upload and revocation.</p>
    <div class="field"><label>Email Address</label><input type="email" id="loginEmail" placeholder="admin@certchain.com"></div>
    <div class="field"><label>Password</label><input type="password" id="loginPass" placeholder="Your password" onkeydown="if(event.key==='Enter')doLogin()"></div>
    <div class="err-msg" id="loginError"></div>
    <button class="btn btn-primary" style="width:100%;padding:14px;margin-top:12px" onclick="doLogin()">Login</button>
  </div>
</div>

<script>
const API = '';
let token = localStorage.getItem('adminToken');
let verifyFileObj = null, uploadFileObj = null;

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById(name + 'Panel').classList.add('active');
}
function openLogin() { document.getElementById('loginModal').classList.add('show'); }
function closeLogin() { document.getElementById('loginModal').classList.remove('show'); }

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  if (!email || !pass) { showErrMsg(errEl, 'Please enter email and password'); return; }
  try {
    const r = await fetch(API + '/api/admin/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password: pass})
    });
    const d = await r.json();
    if (!d.success) { showErrMsg(errEl, d.message); return; }
    token = d.data.token;
    localStorage.setItem('adminToken', token);
    closeLogin();
    setAdminMode(true, d.data.name);
  } catch(e) { showErrMsg(errEl, 'Connection error: ' + e.message); }
}

function logout() {
  token = null;
  localStorage.removeItem('adminToken');
  setAdminMode(false);
  switchTab('verify');
}

function setAdminMode(on, name) {
  document.getElementById('adminBadge').style.display = on ? 'block' : 'none';
  document.getElementById('loginBtn').style.display = on ? 'none' : 'block';
  document.getElementById('logoutBtn').style.display = on ? 'block' : 'none';
  document.getElementById('tab-upload').style.display = on ? 'flex' : 'none';
  document.getElementById('tab-revoke').style.display = on ? 'flex' : 'none';
  if (on) document.getElementById('adminBadge').textContent = 'Admin: ' + name;
}

function showErrMsg(el, msg) { el.textContent = msg; el.style.display = 'block'; }
function setLoading(id, on) { document.getElementById(id).classList.toggle('show', on); }
function showResult(id, html) { const el = document.getElementById(id); el.innerHTML = html; el.classList.add('show'); }

function onVerifyFile(input) {
  verifyFileObj = input.files[0];
  document.getElementById('verifyChosen').textContent = verifyFileObj ? 'Selected: ' + verifyFileObj.name : '';
}
function onUploadFile(input) {
  uploadFileObj = input.files[0];
  document.getElementById('uploadChosen').textContent = uploadFileObj ? 'Selected: ' + uploadFileObj.name : '';
}

function buildCertHTML(d) {
  const isValid = d.isValid;
  const found = d.found;
  const hClass = !found ? 'notfound' : isValid ? 'valid' : 'revoked';
  const icon = !found ? '❓' : isValid ? '✅' : '❌';
  const statusTxt = !found ? 'NOT FOUND' : isValid ? 'VALID CERTIFICATE' : 'REVOKED CERTIFICATE';
  let rows = row('Hash', '<span class="mono">' + d.hash + '</span>');
  if (found) {
    rows += row('Student Name', d.studentName);
    rows += row('Course', d.course);
    const dt = new Date(d.issuedDate);
    rows += row('Issued On', dt.toLocaleDateString('en-IN', {year:'numeric',month:'long',day:'numeric'}));
    rows += row('Status', '<span class="badge ' + (isValid ? 'badge-valid' : 'badge-revoked') + '">' + (isValid ? 'VALID' : 'REVOKED') + '</span>');
    if (d.transactionHash) rows += row('TX Hash', '<span class="mono">' + d.transactionHash + '</span>');
    if (d.blockNumber) rows += row('Block #', d.blockNumber);
  } else {
    rows += '<div style="color:var(--muted);padding:12px 0;font-size:.9rem">No certificate found on the blockchain with this hash.</div>';
  }
  return '<div class="result-header ' + hClass + '">' + icon + ' ' + statusTxt + '</div><div class="result-body">' + rows + '</div>';
}

function row(label, value) {
  return '<div class="detail-row"><span class="detail-label">' + label + '</span><span class="detail-value">' + value + '</span></div>';
}

async function verifyCert() {
  const hashInput = document.getElementById('verifyHash').value.trim();
  if (!verifyFileObj && !hashInput) { alert('Please upload a file or enter a certificate hash'); return; }
  setLoading('verifyLoading', true);
  document.getElementById('verifyResult').classList.remove('show');
  try {
    let resp;
    if (verifyFileObj) {
      const fd = new FormData();
      fd.append('file', verifyFileObj);
      resp = await fetch(API + '/api/verify', {method: 'POST', body: fd});
    } else {
      resp = await fetch(API + '/api/verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({hash: hashInput})
      });
    }
    const d = await resp.json();
    if (!d.success) {
      showResult('verifyResult', '<div class="result-header error">❌ Error</div><div class="result-body">' + row('Message', d.message) + '</div>');
    } else {
      showResult('verifyResult', buildCertHTML(d.data));
    }
  } catch(e) {
    showResult('verifyResult', '<div class="result-header error">❌ Connection Error</div><div class="result-body">' + row('Error', e.message) + '</div>');
  }
  setLoading('verifyLoading', false);
}

async function uploadCert() {
  if (!uploadFileObj) { alert('Please select a certificate file'); return; }
  const sName = document.getElementById('studentName').value.trim();
  const cName = document.getElementById('courseName').value.trim();
  if (!sName || !cName) { alert('Student name and course are required'); return; }
  setLoading('uploadLoading', true);
  document.getElementById('uploadResult').classList.remove('show');
  try {
    const fd = new FormData();
    fd.append('file', uploadFileObj);
    fd.append('studentName', sName);
    fd.append('course', cName);
    const r = await fetch(API + '/api/upload', {
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + token},
      body: fd
    });
    const d = await r.json();
    if (!d.success) {
      showResult('uploadResult', '<div class="result-header error">❌ ' + d.message + '</div><div class="result-body">' + row('Details', d.message) + '</div>');
    } else {
      const c = d.data;
      const dt = new Date(c.issuedDate);
      const qrLink = 'http://' + location.hostname + ':3000/api/verify/' + c.hash;
      showResult('uploadResult',
        '<div class="result-header success">✅ Certificate Stored Successfully</div>' +
        '<div class="result-body">' +
          row('Student', c.studentName) +
          row('Course', c.course) +
          row('Issued On', dt.toLocaleDateString('en-IN', {year:'numeric',month:'long',day:'numeric'})) +
          row('Hash', '<span class="mono">' + c.hash + '</span>') +
          row('TX Hash', '<span class="mono">' + c.transactionHash + '</span>') +
          row('Block #', c.blockNumber) +
          row('Verify URL', '<a href="' + qrLink + '" target="_blank" style="color:var(--accent)">Open QR Verify Page</a>') +
        '</div>'
      );
      loadStats();
    }
  } catch(e) {
    showResult('uploadResult', '<div class="result-header error">❌ Error</div><div class="result-body">' + row('Error', e.message) + '</div>');
  }
  setLoading('uploadLoading', false);
}

async function revokeCert() {
  const hash = document.getElementById('revokeHash').value.trim();
  if (!hash) { alert('Please enter a certificate hash'); return; }
  if (!confirm('Revoke this certificate? This is permanent and cannot be undone.')) return;
  setLoading('revokeLoading', true);
  document.getElementById('revokeResult').classList.remove('show');
  try {
    const r = await fetch(API + '/api/revoke', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
      body: JSON.stringify({hash})
    });
    const d = await r.json();
    if (!d.success) {
      showResult('revokeResult', '<div class="result-header error">❌ Failed</div><div class="result-body">' + row('Message', d.message) + '</div>');
    } else {
      showResult('revokeResult',
        '<div class="result-header revoked">✅ Certificate Revoked</div>' +
        '<div class="result-body">' +
          row('Hash', '<span class="mono">' + d.data.hash + '</span>') +
          row('TX Hash', '<span class="mono">' + d.data.transactionHash + '</span>') +
        '</div>'
      );
      loadStats();
    }
  } catch(e) {
    showResult('revokeResult', '<div class="result-header error">❌ Error</div><div class="result-body">' + row('Error', e.message) + '</div>');
  }
  setLoading('revokeLoading', false);
}

async function loadStats() {
  try {
    const r = await fetch(API + '/api/status');
    const d = await r.json();
    if (d.success) {
      const total = d.data.totalCertificates;
      const rev = d.data.revokedCertificates;
      document.getElementById('totalCerts').textContent = total;
      document.getElementById('validCerts').textContent = total - rev;
      document.getElementById('revokedCerts').textContent = rev;
    }
  } catch(e) {}
}

// Init on page load
loadStats();
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 > Date.now()) {
      setAdminMode(true, payload.name);
    } else {
      token = null;
      localStorage.removeItem('adminToken');
    }
  } catch(e) {
    token = null;
    localStorage.removeItem('adminToken');
  }
}
</script>
</body>
</html>`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done. Size:', fs.statSync('index.html').size, 'bytes');
