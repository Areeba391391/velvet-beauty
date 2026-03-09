/* ============================================
   VELVET BEAUTY — auth.js
   Login & Register with role-based access.
   Uses localStorage for session simulation.
   ============================================ */

/* ── Current selected role ── */
let loginRole    = 'customer';
let registerRole = 'customer';

/* ── Access codes (match settings panel) ── */
function getAccessCodes() {
  return {
    employee: localStorage.getItem('vb_emp_code')   || 'EMP2025',
    owner:    localStorage.getItem('vb_owner_code') || 'OWNER2025'
  };
}

/* ── Switch role tab (login page) ── */
function switchRole(role, btn) {
  loginRole = role;

  /* Update tabs */
  document.querySelectorAll('.auth-role-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  /* Update heading */
  const subheadings = {
    customer: 'Sign in to your customer account',
    employee: 'Sign in to your employee account',
    owner:    'Sign in as store owner'
  };
  const el = document.getElementById('login-subheading');
  if (el) el.textContent = subheadings[role];

  /* Show/hide access code field */
  const codeGroup = document.getElementById('access-code-group');
  const codeLabel = document.getElementById('access-code-label');
  const codeNote  = document.getElementById('access-code-note');
  if (codeGroup) {
    if (role === 'customer') {
      codeGroup.classList.add('hidden');
    } else {
      codeGroup.classList.remove('hidden');
      codeLabel.textContent = role === 'employee' ? 'Employee Code' : 'Owner Code';
      codeNote.textContent  = role === 'employee'
        ? 'Ask your manager for the employee access code.'
        : 'Enter the owner access code to access the admin dashboard.';
    }
  }

  /* Hide alert */
  const alert = document.getElementById('login-alert');
  if (alert) alert.classList.add('hidden');
}

/* ── Handle login submit ── */
function handleLogin(e) {
  e.preventDefault();

  const email    = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  const code     = document.getElementById('access-code')?.value.trim();
  const btn      = document.getElementById('login-submit-btn');

  /* Clear previous errors */
  document.getElementById('login-alert')?.classList.add('hidden');

  /* Basic validation */
  if (!email || !email.includes('@')) {
    showLoginError('Enter a valid email address');
    return;
  }
  if (!password || password.length < 4) {
    showLoginError('Password must be at least 4 characters');
    return;
  }

  /* Role-specific code check */
  const codes = getAccessCodes();
  if (loginRole === 'employee' && code !== codes.employee) {
    showLoginError('Invalid employee access code');
    return;
  }
  if (loginRole === 'owner' && code !== codes.owner) {
    showLoginError('Invalid owner access code');
    return;
  }

  /* Loading state */
  if (btn) { btn.textContent = 'Signing in...'; btn.disabled = true; }

  /* Simulate API call */
  setTimeout(() => {
    /* Check against registered users (or accept any for demo) */
    const users = JSON.parse(localStorage.getItem('vb_users') || '[]');
    const user  = users.find(u => u.email === email && u.role === loginRole);

    /* For demo: if no registered users, accept any credentials */
    const session = user || {
      id:    'demo-' + loginRole,
      name:  loginRole === 'owner' ? 'Store Owner' : loginRole === 'employee' ? 'Staff Member' : email.split('@')[0],
      email,
      role:  loginRole
    };

    /* Save session */
    localStorage.setItem('vb_session', JSON.stringify(session));

    /* Redirect based on role */
    const redirects = {
      customer: '../views/index.html',
      employee: 'dashboard-emp.html',
      owner:    'dashboard-owner.html'
    };

    window.location.href = redirects[loginRole] || 'index.html';
  }, 800);
}

function showLoginError(msg) {
  const alert   = document.getElementById('login-alert');
  const msgEl   = document.getElementById('login-alert-msg');
  const btn     = document.getElementById('login-submit-btn');
  if (alert)  alert.classList.remove('hidden');
  if (msgEl)  msgEl.textContent = msg;
  if (btn)    { btn.textContent = 'Sign In'; btn.disabled = false; }
}

/* ── Switch role tab (register page) ── */
function switchRegisterRole(role, btn) {
  registerRole = role;

  document.querySelectorAll('.auth-role-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const subheadings = {
    customer: 'Join us as a customer',
    employee: 'Register as a team member',
    owner:    'Set up your owner account'
  };
  const el = document.getElementById('reg-subheading');
  if (el) el.textContent = subheadings[role];

  const codeGroup = document.getElementById('reg-code-group');
  const codeLabel = document.getElementById('reg-code-label');
  const codeNote  = document.getElementById('reg-code-note');
  if (codeGroup) {
    if (role === 'customer') {
      codeGroup.classList.add('hidden');
    } else {
      codeGroup.classList.remove('hidden');
      codeLabel.textContent = role === 'employee' ? 'Employee Code *' : 'Owner Code *';
      codeNote.textContent  = role === 'employee'
        ? 'Contact the store owner to get your employee registration code.'
        : 'Enter the owner registration code to create an admin account.';
    }
  }
}

/* ── Handle register submit ── */
function handleRegister(e) {
  e.preventDefault();

  const firstName = document.getElementById('reg-first-name')?.value.trim();
  const lastName  = document.getElementById('reg-last-name')?.value.trim();
  const email     = document.getElementById('reg-email')?.value.trim();
  const phone     = document.getElementById('reg-phone')?.value.trim();
  const city      = document.getElementById('reg-city')?.value.trim();
  const password  = document.getElementById('reg-password')?.value;
  const confirm   = document.getElementById('reg-confirm-password')?.value;
  const code      = document.getElementById('reg-access-code')?.value.trim();
  const terms     = document.getElementById('reg-terms')?.checked;
  const btn       = document.getElementById('reg-submit-btn');

  /* Hide previous alert */
  document.getElementById('reg-alert')?.classList.add('hidden');

  /* Validation */
  let valid = true;

  if (!email || !email.includes('@')) {
    document.getElementById('err-reg-email')?.classList.remove('hidden');
    valid = false;
  } else {
    document.getElementById('err-reg-email')?.classList.add('hidden');
  }

  if (!password || password.length < 6) {
    document.getElementById('err-reg-password')?.classList.remove('hidden');
    valid = false;
  } else {
    document.getElementById('err-reg-password')?.classList.add('hidden');
  }

  if (password !== confirm) {
    document.getElementById('err-reg-confirm')?.classList.remove('hidden');
    valid = false;
  } else {
    document.getElementById('err-reg-confirm')?.classList.add('hidden');
  }

  if (!terms) {
    showRegError('Please accept the Terms of Service');
    return;
  }

  /* Access code check */
  const codes = getAccessCodes();
  if (registerRole === 'employee' && code !== codes.employee) {
    showRegError('Invalid employee code. Contact the store owner.');
    return;
  }
  if (registerRole === 'owner' && code !== codes.owner) {
    showRegError('Invalid owner code.');
    return;
  }

  if (!valid) { showRegError('Please fix the errors above.'); return; }

  /* Loading */
  if (btn) { btn.textContent = 'Creating account...'; btn.disabled = true; }

  setTimeout(() => {
    /* Save user */
    const users = JSON.parse(localStorage.getItem('vb_users') || '[]');
    if (users.find(u => u.email === email)) {
      showRegError('An account with this email already exists.');
      if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
      return;
    }

    const newUser = {
      id:       'u' + Date.now(),
      name:     `${firstName} ${lastName}`,
      email, phone, city,
      role:     registerRole,
      joinDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem('vb_users', JSON.stringify(users));

    /* Auto login */
    localStorage.setItem('vb_session', JSON.stringify(newUser));

    /* Show success */
    showRegSuccess('Account created! Redirecting...');

    setTimeout(() => {
      const redirects = {
        customer: 'index.html',
        employee: 'dashboard-emp.html',
        owner:    'dashboard-owner.html'
      };
      window.location.href = redirects[registerRole] || 'index.html';
    }, 1000);
  }, 800);
}

function showRegError(msg) {
  const alert = document.getElementById('reg-alert');
  const msgEl = document.getElementById('reg-alert-msg');
  const btn   = document.getElementById('reg-submit-btn');
  if (alert) { alert.classList.remove('hidden'); alert.className = 'auth-alert auth-alert-error'; }
  if (msgEl) msgEl.textContent = msg;
  if (btn)   { btn.textContent = 'Create Account'; btn.disabled = false; }
}

function showRegSuccess(msg) {
  const alert = document.getElementById('reg-alert');
  const msgEl = document.getElementById('reg-alert-msg');
  if (alert) { alert.classList.remove('hidden'); alert.className = 'auth-alert auth-alert-success'; }
  if (msgEl) msgEl.textContent = '✅ ' + msg;
}

/* ── Logout (called from dashboards) ── */
function logoutUser() {
  localStorage.removeItem('vb_session');
  window.location.href = 'login.html';
}

/* ── Auto-redirect if already logged in ── */
document.addEventListener('DOMContentLoaded', () => {
  const session  = JSON.parse(localStorage.getItem('vb_session') || 'null');
  const isLogin  = window.location.pathname.includes('login');
  const isReg    = window.location.pathname.includes('register');

  if (session && (isLogin || isReg)) {
    const redirects = {
      owner:    'dashboard-owner.html',
      employee: 'dashboard-emp.html',
      customer: 'index.html'
    };
    window.location.href = redirects[session.role] || 'index.html';
  }
});

/* ── Toast for auth pages (auth pages don't include cart.js on all paths) ── */
if (typeof showToast !== 'function') {
  function showToast(msg, type = 'default') {
    alert(msg); /* fallback */
  }
}
