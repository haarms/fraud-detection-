// app.js - Central Unified State & Interactive Application Engine

const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="%230284c7"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>';

(function initStorage() {
  let users = JSON.parse(localStorage.getItem('rv_users') || '[]');
  
  // ALWAYS guarantee default Admin exists in system
  if (!users.some(u => u.email.toLowerCase() === 'admin@system.com')) {
    users.unshift({
      id: 'usr_admin',
      fullName: 'System Administrator',
      email: 'admin@system.com',
      password: 'admin123',
      role: 'Admin',
      nin: '00000000000',
      profilePic: DEFAULT_AVATAR,
      isEmailVerified: true,
      isNinVerified: true,
      activePropertyId: null
    });
    localStorage.setItem('rv_users', JSON.stringify(users));
  } else {
    // Ensure admin user password and verified state are always intact
    const aIdx = users.findIndex(u => u.email.toLowerCase() === 'admin@system.com');
    if (aIdx !== -1) {
      users[aIdx].password = 'admin123';
      users[aIdx].isEmailVerified = true;
      users[aIdx].isNinVerified = true;
      users[aIdx].role = 'Admin';
      localStorage.setItem('rv_users', JSON.stringify(users));
    }
  }

  if (!localStorage.getItem('rv_properties')) {
    localStorage.setItem('rv_properties', JSON.stringify([]));
  }
  if (!localStorage.getItem('rv_agreements')) {
    localStorage.setItem('rv_agreements', JSON.stringify([]));
  }
  if (!localStorage.getItem('rv_fraud_alerts')) {
    localStorage.setItem('rv_fraud_alerts', JSON.stringify([]));
  }
})();

function getCurrentUser() {
  const data = localStorage.getItem('rv_currentUser');
  return data ? JSON.parse(data) : null;
}

function getUsers() {
  return JSON.parse(localStorage.getItem('rv_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('rv_users', JSON.stringify(users));
}

function getProperties() {
  return JSON.parse(localStorage.getItem('rv_properties') || '[]');
}

function saveProperties(props) {
  localStorage.setItem('rv_properties', JSON.stringify(props));
}

function getAgreements() {
  return JSON.parse(localStorage.getItem('rv_agreements') || '[]');
}

function saveAgreements(agreements) {
  localStorage.setItem('rv_agreements', JSON.stringify(agreements));
}

function getFraudAlerts() {
  return JSON.parse(localStorage.getItem('rv_fraud_alerts') || '[]');
}

function logFraudAlert(type, description, offendingUser) {
  const alerts = getFraudAlerts();
  const alertObj = {
    id: 'alert_' + Date.now(),
    type: type,
    description: description,
    offendingUser: offendingUser || 'Unknown',
    timestamp: new Date().toLocaleString()
  };
  alerts.unshift(alertObj);
  localStorage.setItem('rv_fraud_alerts', JSON.stringify(alerts));
}

function renderHeader() {
  const user = getCurrentUser();
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;

  // Dynamically toggle Admin Link visibility in Navbar
  const adminLink = document.getElementById('navAdminLink');
  if (adminLink) {
    adminLink.style.display = (user && user.role === 'Admin') ? 'inline-block' : 'none';
  }

  const regLink = document.getElementById('navRegisterLink');
  const loginLink = document.getElementById('navLoginLink');

  let widget = document.getElementById('navbarUserWidget');
  if (widget) widget.remove();

  if (user) {
    if (regLink) regLink.style.display = 'none';
    if (loginLink) loginLink.style.display = 'none';

    const avatarSrc = user.profilePic || DEFAULT_AVATAR;
    widget = document.createElement('div');
    widget.id = 'navbarUserWidget';
    widget.className = 'user-widget';
    widget.innerHTML = `
      <img src="${avatarSrc}" alt="Avatar" class="user-avatar-tn" id="headerAvatarImg">
      <div>
        <a href="profile.html" style="color:#ffffff; text-decoration:none;" class="user-info-text">${user.fullName}</a>
        <span class="user-role-tag">${user.role} ${user.isNinVerified ? '• <span style="color:#10b981;">NIMC Verified</span>' : ''}</span>
      </div>
      <button class="btn-logout" onclick="logoutUser()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>
    `;
    navContainer.appendChild(widget);
  } else {
    if (regLink) regLink.style.display = 'inline-block';
    if (loginLink) loginLink.style.display = 'inline-block';
  }

  // Update Admin Banner on Homepage if present
  const adminHeroAlert = document.getElementById('adminHeroAlert');
  if (adminHeroAlert) {
    adminHeroAlert.style.display = (user && user.role === 'Admin') ? 'block' : 'none';
  }
}

function logoutUser() {
  localStorage.removeItem('rv_currentUser');
  alert('👋 You have successfully signed out.');
  window.location.href = 'login.html';
}

function demoLogin(role) {
  let users = getUsers();
  let user = users.find(u => u.role === role);

  if (!user) {
    if (role === 'Landlord') {
      user = {
        id: 'usr_landlord_demo',
        fullName: 'Solomon Landlord',
        email: 'solomon.landlord@gmail.com',
        password: 'landlord123',
        role: 'Landlord',
        nin: '11111111111',
        profilePic: DEFAULT_AVATAR,
        isEmailVerified: true,
        isNinVerified: true,
        activePropertyId: null
      };
      users.push(user);
    } else if (role === 'Tenant') {
      user = {
        id: 'usr_tenant_demo',
        fullName: 'Amina Tenant',
        email: 'amina.tenant@gmail.com',
        password: 'tenant123',
        role: 'Tenant',
        nin: '22222222222',
        profilePic: DEFAULT_AVATAR,
        isEmailVerified: true,
        isNinVerified: true,
        activePropertyId: null
      };
      users.push(user);
    } else if (role === 'Admin') {
      user = users.find(u => u.email === 'admin@system.com');
    }
    saveUsers(users);
  }

  localStorage.setItem('rv_currentUser', JSON.stringify(user));
  alert(`✅ Signed in as ${user.fullName} (${user.role})`);
  window.location.href = (role === 'Admin') ? 'admin.html' : 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
});

// 1. LOGIN HANDLER
function loginUser(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  let users = getUsers();

  // Ensure Admin account exists in users list
  let adminUser = users.find(u => u.email.toLowerCase() === 'admin@system.com');
  if (!adminUser) {
    adminUser = {
      id: 'usr_admin',
      fullName: 'System Administrator',
      email: 'admin@system.com',
      password: 'admin123',
      role: 'Admin',
      nin: '00000000000',
      profilePic: DEFAULT_AVATAR,
      isEmailVerified: true,
      isNinVerified: true,
      activePropertyId: null
    };
    users.unshift(adminUser);
    saveUsers(users);
  }

  // SPECIAL ADMIN LOGIN CHECK - NO VERIFICATION REQUIRED
  if (cleanEmail === 'admin@system.com' || cleanEmail === 'admin') {
    if (cleanPass === 'admin123' || cleanPass === adminUser.password) {
      adminUser.isEmailVerified = true;
      adminUser.isNinVerified = true;
      localStorage.setItem('rv_currentUser', JSON.stringify(adminUser));
      alert('✅ WELCOME ADMIN: Signed in successfully as System Administrator!');
      window.location.href = 'admin.html';
      return false;
    } else {
      alert('❌ INCORRECT ADMIN PASSWORD: Enter "admin123" for admin@system.com.');
      return false;
    }
  }

  // REGULAR USER LOGIN CHECK
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    alert('❌ USER NOT FOUND: No account registered with email ' + email);
    return false;
  }

  if (user.password !== cleanPass) {
    alert('❌ INCORRECT PASSWORD: The password entered does not match our records for ' + email);
    return false;
  }

  if (!user.isEmailVerified) {
    openEmailOtpModal(user);
    return false;
  }

  localStorage.setItem('rv_currentUser', JSON.stringify(user));
  alert('✅ Welcome back, ' + user.fullName + '!');
  window.location.href = 'index.html';
  return false;
}

// 2. REGISTRATION HANDLER (DUPLICATE NIN CHECK & EMAIL OTP)
function registerUser(fullName, email, password, role, nin) {
  if (nin.length !== 11 || isNaN(nin)) {
    alert('❌ INVALID NIN: National Identification Number must be exactly 11 numeric digits.');
    return false;
  }

  const users = getUsers();

  // Duplicate Email Check
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    alert('❌ EMAIL REGISTERED: An account with email ' + email + ' already exists.');
    return false;
  }

  // DUPLICATE NIN COLLISION GUARD
  const duplicateNinUser = users.find(u => u.nin === nin);
  if (duplicateNinUser) {
    logFraudAlert(
      'DUPLICATE_NIN_ATTEMPT',
      'Identity Risk: Registration attempted by ' + fullName + ' (' + email + ') using NIN ' + nin + ' which ALREADY belongs to ' + duplicateNinUser.fullName + ' (' + duplicateNinUser.email + ').',
      fullName
    );
    alert('⛔ SECURITY ALERT: This 11-Digit NIN (' + nin + ') is ALREADY REGISTERED to ' + duplicateNinUser.fullName + ' in the database. Incident logged in Fraud Console!');
    return false;
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    fullName: fullName,
    email: email,
    password: password,
    role: role,
    nin: nin,
    profilePic: DEFAULT_AVATAR,
    isEmailVerified: false,
    isNinVerified: false,
    activePropertyId: null
  };

  users.push(newUser);
  saveUsers(users);

  openEmailOtpModal(newUser);
  return false;
}

// 3. EMAIL OTP MODAL
function openEmailOtpModal(user) {
  const modal = document.createElement('div');
  modal.id = 'emailOtpModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card" style="text-align:center;">
      <div style="font-size: 3rem; color: #0284c7; margin-bottom: 1rem;"><i class="fa-solid fa-envelope-circle-check"></i></div>
      <h2>Email Verification Sent</h2>
      <p style="color: #64748b; margin-top: 0.5rem;">We sent a 6-digit confirmation OTP code to <strong>${user.email}</strong>.</p>
      
      <div style="background: #e0f2fe; color: #0369a1; padding: 1rem; border-radius: 8px; font-weight: 800; font-size: 1.5rem; letter-spacing: 4px; margin: 1.5rem 0;">
        4 8 2 9 0 1
      </div>

      <div class="form-group">
        <input type="text" id="otpInput" class="form-control" placeholder="Enter 6-digit code (482901)" style="text-align:center; font-size: 1.2rem; font-weight:700;">
      </div>

      <button class="btn btn-emerald btn-block" onclick="verifyEmailOtp('${user.id}')">Verify & Activate Account</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function verifyEmailOtp(userId) {
  const code = document.getElementById('otpInput').value.trim();
  if (code === '482901') {
    let users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].isEmailVerified = true;
      saveUsers(users);
      localStorage.setItem('rv_currentUser', JSON.stringify(users[userIndex]));
    }
    alert('✅ Email Verified Successfully! Account Activated.');
    document.getElementById('emailOtpModal').remove();
    window.location.href = 'index.html';
  } else {
    alert('❌ Invalid OTP Code. Enter 482901 to activate account.');
  }
}

// 4. PROFILE PICTURE UPLOAD HANDLER
function handleProfilePicUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('❌ Please select a valid image file (PNG, JPG, JPEG, WEBP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    
    let currentUser = getCurrentUser();
    if (currentUser) {
      currentUser.profilePic = dataUrl;
      localStorage.setItem('rv_currentUser', JSON.stringify(currentUser));

      let users = getUsers();
      const uIdx = users.findIndex(u => u.id === currentUser.id);
      if (uIdx !== -1) {
        users[uIdx].profilePic = dataUrl;
        saveUsers(users);
      }

      const profileImg = document.getElementById('profileAvatarDisplay');
      if (profileImg) profileImg.src = dataUrl;

      renderHeader();
      alert('✅ Profile Picture Updated Successfully!');
    }
  };
  reader.readAsDataURL(file);
}

// 5. NIMC NIN VERIFICATION MODAL
function openNimcModal() {
  const user = getCurrentUser();
  if (!user) {
    alert('Please sign in first to verify your NIMC NIN identity.');
    window.location.href = 'login.html';
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'nimcModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem;">
        <h2 style="font-size: 1.3rem;"><i class="fa-solid fa-id-card text-emerald"></i> NIMC Identity Authentication</h2>
        <button class="btn btn-outline" onclick="document.getElementById('nimcModal').remove()" style="padding: 0.25rem 0.5rem;">✕</button>
      </div>

      <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1rem;">
        Verifying NIN record for <strong>${user.fullName}</strong> (NIN: <code>${user.nin}</code>) against the official National Identity Management Commission portal.
      </p>

      <div class="form-group">
        <label class="form-label">Select Verification Channel:</label>
        <select id="nimcChannel" class="form-control" onchange="toggleNimcChannel()">
          <option value="sms">SMS Mobile OTP Authentication</option>
          <option value="face">Live Biometric Face Geometry Scan</option>
        </select>
      </div>

      <div id="nimcSmsBox" style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem; border: 1px solid #e2e8f0;">
        <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.5rem;">Simulated SMS code sent to mobile number tied to NIN ${user.nin}:</p>
        <div style="font-weight: 800; font-size: 1.4rem; color: #0284c7; text-align:center; letter-spacing: 3px;">7 3 9 1 0 4</div>
        <input type="text" id="nimcSmsInput" class="form-control" placeholder="Enter 6-digit SMS OTP (739104)" style="margin-top: 0.75rem; text-align:center; font-weight:700;">
      </div>

      <div id="nimcFaceBox" style="display:none; background: #0f172a; color: #ffffff; padding: 1.5rem; border-radius: 12px; text-align:center; margin-bottom: 1.25rem;">
        <div style="font-size: 3rem; color: #10b981; margin-bottom: 0.5rem;"><i class="fa-solid fa-camera"></i></div>
        <p style="font-size: 0.9rem;">Biometric Camera Active</p>
        <span style="font-size: 0.8rem; color: #94a3b8;">Scanning facial landmark points...</span>
      </div>

      <button class="btn btn-emerald btn-block" onclick="completeNimcVerification()">Submit & Verify Identity</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function toggleNimcChannel() {
  const channel = document.getElementById('nimcChannel').value;
  document.getElementById('nimcSmsBox').style.display = channel === 'sms' ? 'block' : 'none';
  document.getElementById('nimcFaceBox').style.display = channel === 'face' ? 'block' : 'none';
}

function completeNimcVerification() {
  let user = getCurrentUser();
  if (!user) return;

  user.isNinVerified = true;
  localStorage.setItem('rv_currentUser', JSON.stringify(user));

  let users = getUsers();
  const uIdx = users.findIndex(u => u.id === user.id);
  if (uIdx !== -1) {
    users[uIdx].isNinVerified = true;
    saveUsers(users);
  }

  alert('✅ NIMC IDENTITY VERIFIED SUCCESSFULLY! Official verification badge awarded.');
  document.getElementById('nimcModal').remove();
  location.reload();
}

// 6. PROPERTY LISTING & ADDRESS COLLISION ENGINE
function addProperty(title, address, rentAmount, imageUrl) {
  const user = getCurrentUser();
  if (!user || user.role !== 'Landlord') {
    alert('❌ Permission Denied: Only registered Landlords can list properties.');
    return false;
  }

  const normalized = address.toLowerCase().replace(/[^a-z0-9]/g, '');
  const props = getProperties();

  const collision = props.find(p => p.normalizedAddress === normalized);
  if (collision) {
    logFraudAlert(
      'ADDRESS_COLLISION',
      'Duplicate Property Listing Blocked: Attempted listing at "' + address + '" by ' + user.fullName + ' matches existing listing registered by ' + collision.landlordName + '.',
      user.fullName
    );
    alert('⛔ ADDRESS COLLISION DETECTED: A property at this address ("' + address + '") is ALREADY LISTED in the system by ' + collision.landlordName + '. Fraud incident logged!');
    return false;
  }

  const newProp = {
    id: 'prop_' + Date.now(),
    landlordId: user.id,
    landlordName: user.fullName,
    title: title,
    address: address,
    normalizedAddress: normalized,
    rentAmount: parseFloat(rentAmount),
    imageUrl: imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="%230f172a"/><text x="400" y="200" fill="%23ffffff" font-size="28" font-family="sans-serif" text-anchor="middle">Property Listing</text></svg>',
    isAvailable: true,
    currentTenantId: null
  };

  props.unshift(newProp);
  saveProperties(props);
  alert('✅ Property Listed Successfully!');
  location.reload();
  return false;
}

// 7. ONLINE AGREEMENT VIEWER MODAL
function openOnlineAgreementViewer(agreementId) {
  const agreements = getAgreements();
  const agr = agreements.find(a => a.id === agreementId);
  if (!agr) {
    alert('Agreement document not found.');
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'agreementViewerModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card" style="max-width: 750px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e2e8f0; padding-bottom:1rem; margin-bottom:1.5rem;">
        <div>
          <span class="badge badge-emerald">OFFICIAL DIGITAL LEASE CONTRACT</span>
          <h2 style="font-size: 1.4rem; margin-top: 0.25rem;">Tenancy Agreement Document</h2>
        </div>
        <button class="btn btn-outline" onclick="document.getElementById('agreementViewerModal').remove()">✕</button>
      </div>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 1.5rem; border-radius: 8px; font-size: 0.9rem; line-height: 1.7; color: #1e293b; max-height: 50vh; overflow-y: auto;">
        <h3 style="text-align:center; text-transform:uppercase; text-decoration:underline; margin-bottom:1rem;">Residential Lease Agreement</h3>
        <p><strong>THIS AGREEMENT</strong> is executed between the undersigned parties:</p>
        <p style="margin-top:0.5rem;"><strong>LANDLORD:</strong> ${agr.landlordName}</p>
        <p><strong>TENANT:</strong> ${agr.tenantName} (NIN: <code>${agr.tenantNin}</code>)</p>
        <p style="margin-top:0.5rem;"><strong>PROPERTY ADDRESS:</strong> ${agr.propertyTitle}</p>
        <p><strong>ANNUAL RENT:</strong> ₦${agr.rentAmount.toLocaleString()}</p>
        <p><strong>LEASE DURATION:</strong> ${agr.startDate} to ${agr.endDate}</p>
        
        <hr style="margin:1rem 0; border:0; border-top:1px solid #cbd5e1;">
        
        <p style="font-size:0.85rem; color:#475569;">
          <strong>TERMS & CONDITIONS:</strong> The Tenant agrees to pay the annual rent promptly and maintain the demised property in good tenantable condition. Subletting without written authorization is strictly prohibited.
        </p>

        <div style="margin-top:1.5rem; background:#ffffff; border:1px solid #e2e8f0; padding:1rem; border-radius:8px;">
          <span style="font-size:0.75rem; color:#64748b; font-weight:700; display:block;">IMMUTABLE SHA-256 DIGITAL SIGNATURE STAMP:</span>
          <code style="font-size:0.8rem; word-break:break-all; color:#0284c7; font-weight:800;">${agr.sha256Hash}</code>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; margin-top:1.5rem;">
        <button class="btn btn-outline" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Document</button>
        <button class="btn btn-primary" onclick="document.getElementById('agreementViewerModal').remove()">Close Viewer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
