/* ============================================================
   VELVET BEAUTY — auth.js
   Login Page: Role Tabs · Login · Register · Redirect
   ============================================================ */

let authRole = 'customer';
let authMode = 'login';

document.addEventListener('DOMContentLoaded', () => {
  seedIfNeeded();
  // If already logged in, redirect
  const session = VBAuth.session();
  if (session) redirectAfterAuth(session.role);
});

// ── Role switching ────────────────────────────────────────────
function switchRole(role, btn) {
  authRole = role;
  document.querySelectorAll('.auth-role-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide access code fields
  const loginCodeGroup = document.getElementById('login-code-group');
  const regCodeGroup   = document.getElementById('reg-code-group');
  const registerTab    = document.getElementById('register-tab');
  const staffNote      = document.getElementById('staff-note');

  const isStaff = role === 'employee' || role === 'owner';
  if (loginCodeGroup) loginCodeGroup.classList.toggle('hidden', !isStaff);
  if (regCodeGroup)   regCodeGroup.classList.toggle('hidden', !isStaff);

  // Staff can't register — show note
  if (registerTab) registerTab.style.display = isStaff ? 'none' : '';
  if (staffNote)   staffNote.classList.toggle('hidden', !isStaff);
  if (isStaff) { switchMode('login', document.querySelector('.auth-toggle-btn')); }

  // Update code hints
  if (role === 'employee') {
    const h1 = document.getElementById('login-code-hint');
    const h2 = document.getElementById('reg-code-hint');
    if (h1) h1.innerHTML = 'Contact your <span>Owner</span> for the employee access code.';
    if (h2) h2.innerHTML = 'Contact your <span>Owner</span> for the employee access code.';
  } else if (role === 'owner') {
    const h1 = document.getElementById('login-code-hint');
    const h2 = document.getElementById('reg-code-hint');
    if (h1) h1.innerHTML = 'Default owner code: <span>OWNER2025</span>';
    if (h2) h2.innerHTML = 'Default owner code: <span>OWNER2025</span>';
  }
}

// ── Mode switching (login/register) ──────────────────────────
function switchMode(mode, btn) {
  authMode = mode;
  document.querySelectorAll('.auth-toggle-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('login-form').classList.toggle('hidden', mode !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', mode !== 'register');
  // Clear errors
  document.querySelectorAll('.alert').forEach(a => a.classList.add('hidden'));
}

// ── Toggle password ───────────────────────────────────────────
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁️';
}

// ── Login ─────────────────────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const code     = document.getElementById('login-code')?.value.trim() || '';
  const btn      = document.getElementById('login-btn');
  const errEl    = document.getElementById('login-error');
  const msgEl    = document.getElementById('login-error-msg');

  btn.classList.add('btn-loading'); btn.disabled = true;
  if (errEl) errEl.classList.add('hidden');

  setTimeout(() => {
    const result = VBAuth.login(email, password, authRole, code);
    btn.classList.remove('btn-loading'); btn.disabled = false;
    if (!result.ok) {
      if (msgEl) msgEl.textContent = result.error;
      if (errEl) errEl.classList.remove('hidden');
      return;
    }
    VBToast.show(`Welcome back, ${result.session.name}! 💄`, 'success');
    setTimeout(() => redirectAfterAuth(result.session.role), 600);
  }, 600);
}

// ── Register ──────────────────────────────────────────────────
function handleRegister(e) {
  e.preventDefault();
  const firstName = document.getElementById('reg-fname').value.trim();
  const lastName  = document.getElementById('reg-lname').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const phone     = document.getElementById('reg-phone').value.trim();
  const password  = document.getElementById('reg-password').value;
  const code      = document.getElementById('reg-code')?.value.trim() || '';
  const btn       = document.getElementById('register-btn');
  const errEl     = document.getElementById('reg-error');
  const msgEl     = document.getElementById('reg-error-msg');

  btn.classList.add('btn-loading'); btn.disabled = true;
  if (errEl) errEl.classList.add('hidden');

  setTimeout(() => {
    const result = VBAuth.register({ firstName, lastName, email, phone, password, role:authRole, accessCode:code });
    btn.classList.remove('btn-loading'); btn.disabled = false;
    if (!result.ok) {
      if (msgEl) msgEl.textContent = result.error;
      if (errEl) errEl.classList.remove('hidden');
      return;
    }
    VBToast.show(`Account created! Welcome, ${result.session.name}! 🎉`, 'success');
    setTimeout(() => redirectAfterAuth(result.session.role), 600);
  }, 600);
}

// ── Redirect ──────────────────────────────────────────────────
function redirectAfterAuth(role) {
  const returnUrl = new URLSearchParams(window.location.search).get('return');
  if (returnUrl) { window.location.href = returnUrl; return; }
  if (role === 'owner')    { window.location.href = 'dashboard-owner.html'; return; }
  if (role === 'employee') { window.location.href = 'dashboard-emp.html';   return; }
  window.location.href = 'index.html';
}
