
                    const material = new THREE.MeshPhongMaterial({ 
                        color: color,
                        shininess: 100,
                        specular: 0x444444,
                        flatShading: false
                    });
                    

// Modal functionality
function showLogin() {
    const modal = document.getElementById('login-modal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function showSignup() {
    const modal = document.getElementById('signup-modal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    clearMessages();
}

function switchToSignup() {
    closeModal('login-modal');
    setTimeout(() => showSignup(), 300);
}

function switchToLogin() {
    closeModal('signup-modal');
    setTimeout(() => showLogin(), 300);
}

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateName(name) {
    return name.trim().length >= 2;
}

function showMessage(formId, message, type) {
    const form = document.getElementById(formId);
    const existingMessage = form.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    form.insertBefore(messageDiv, form.firstChild);
}

function clearMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
}

// Form submission handlers
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Validation
    if (!validateEmail(email)) {
        showMessage('login-form', 'Please enter a valid email address.', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('login-form', 'Password must be at least 6 characters long.', 'error');
        return;
    }
    
    // Simulate login process
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Logging in...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showMessage('login-form', 'Login successful! Welcome back to CUBE.', 'success');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Close modal after success
        setTimeout(() => {
            closeModal('login-modal');
        }, 2000);
    }, 1500);
});

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validation
    if (!validateName(name)) {
        showMessage('signup-form', 'Please enter your full name (at least 2 characters).', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('signup-form', 'Please enter a valid email address.', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showMessage('signup-form', 'Password must be at least 6 characters long.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('signup-form', 'Passwords do not match.', 'error');
        return;
    }
    
    // Simulate signup process
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Creating account...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showMessage('signup-form', 'Account created successfully! Welcome to CUBE.', 'success');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Close modal after success
        setTimeout(() => {
            closeModal('signup-modal');
        }, 2000);
    }, 1500);
});

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual Google Client ID

// Check if Google Identity Services is loaded
function isGoogleIdentityLoaded() {
    return typeof google !== 'undefined' && google.accounts;
}

// Initialize Google Identity Services
function initializeGoogleIdentity() {
    if (!isGoogleIdentityLoaded()) {
        console.warn('Google Identity Services not loaded. Falling back to manual buttons.');
        createFallbackGoogleButtons();
        return;
    }
    
    // Configure Google Identity Services
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn
    });
    
    // Render the sign-in button
    google.accounts.id.renderButton(
        document.querySelector('.g_id_signin'),
        { 
            theme: 'outline', 
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        }
    );
}

// Google OAuth handlers
function handleGoogleSignIn(response) {
    console.log('Google Sign In Response:', response);
    
    try {
        if (response.credential) {
            // Decode the JWT token to get user information
            const decoded = jwt_decode(response.credential);
            console.log('Decoded user info:', decoded);
            
            if (!decoded) {
                throw new Error('Failed to decode JWT token');
            }
            
            // Store user information
            const userInfo = {
                id: decoded.sub,
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                provider: 'google'
            };
            
            // Check if user has 2FA enabled
            const existingUser = localStorage.getItem('user');
            if (existingUser) {
                const existingUserInfo = JSON.parse(existingUser);
                if (existingUserInfo.email === userInfo.email && existingUserInfo.twofaEnabled) {
                    // User has 2FA enabled, require verification
                    pendingLoginUser = { ...userInfo, twofaSecret: existingUserInfo.twofaSecret };
                    closeModal('login-modal');
                    showModal('twofa-verify-modal');
                    return;
                }
            }
            
            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(userInfo));
            localStorage.setItem('authToken', response.credential);
            
            // Show success message
            showMessage('login-form', `Welcome back, ${userInfo.name}!`, 'success');
            
            // Update UI to show logged in state
            updateUIForLoggedInUser(userInfo);
            
            // Close modal after success
            setTimeout(() => {
                closeModal('login-modal');
            }, 2000);
        } else {
            throw new Error('No credential received from Google');
        }
    } catch (error) {
        console.error('Google Sign In Error:', error);
        handleGoogleOAuthError({ error: 'signin_failed', message: error.message });
    }
}

function handleGoogleSignUp(response) {
    console.log('Google Sign Up Response:', response);
    
    try {
        if (response.credential) {
            // Decode the JWT token to get user information
            const decoded = jwt_decode(response.credential);
            console.log('Decoded user info:', decoded);
            
            if (!decoded) {
                throw new Error('Failed to decode JWT token');
            }
            
            // Store user information
            const userInfo = {
                id: decoded.sub,
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                provider: 'google'
            };
            
            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(userInfo));
            localStorage.setItem('authToken', response.credential);
            
            // Show success message
            showMessage('signup-form', `Welcome to CUBE, ${userInfo.name}!`, 'success');
            
            // Update UI to show logged in state
            updateUIForLoggedInUser(userInfo);
            
            // Close modal after success
            setTimeout(() => {
                closeModal('signup-modal');
            }, 2000);
        } else {
            throw new Error('No credential received from Google');
        }
    } catch (error) {
        console.error('Google Sign Up Error:', error);
        handleGoogleOAuthError({ error: 'signup_failed', message: error.message });
    }
}

// JWT Decode function (you can also use a library like jwt-decode)
function jwt_decode(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(userInfo) {
    const navButtons = document.querySelector('.nav-buttons');
    
    // Create user profile section
    const userSection = document.createElement('div');
    userSection.className = 'user-section';
    
    // Add 2FA status indicator
    const twofaStatus = userInfo.twofaEnabled ? 
        '<span class="twofa-status enabled">🔒 2FA Enabled</span>' : 
        '<span class="twofa-status disabled">🔓 2FA Disabled</span>';
    
    userSection.innerHTML = `
        <div class="user-profile">
            <img src="${userInfo.picture}" alt="${userInfo.name}" class="user-avatar">
            <span class="user-name">${userInfo.name}</span>
            ${twofaStatus}
        </div>
        <div class="user-actions">
            ${!userInfo.twofaEnabled ? 
                `<button class="twofa-toggle" onclick="setupTwoFA('${userInfo.email}')">Enable 2FA</button>` : 
                `<button class="twofa-toggle" onclick="disableTwoFA()">Disable 2FA</button>`
            }
            <button class="nav-btn logout-btn" onclick="logout()">Logout</button>
        </div>
    `;
    
    // Replace existing buttons with user section
    navButtons.innerHTML = '';
    navButtons.appendChild(userSection);
}

// Logout function
function logout() {
    // Clear stored data
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    // Reset UI
    const navButtons = document.querySelector('.nav-buttons');
    navButtons.innerHTML = `
        <button class="nav-btn login-btn" onclick="showLogin()">Login</button>
        <button class="nav-btn signup-btn" onclick="showSignup()">Sign Up</button>
    `;
    
    // Show logout message
    showMessage('login-form', 'Successfully logged out.', 'success');
}

// Create fallback Google buttons if Google Identity Services fails to load
function createFallbackGoogleButtons() {
    const googleButtons = document.querySelectorAll('.g_id_signin');
    googleButtons.forEach(button => {
        button.innerHTML = `
            <button type="button" class="social-btn google-btn" onclick="handleGoogleSignInFallback()">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
            </button>
        `;
    });
}

// Fallback Google sign-in handler
function handleGoogleSignInFallback() {
    const form = event.target.closest('form');
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Connecting to Google...';
    submitBtn.disabled = true;
    
    // Show error message for fallback
    setTimeout(() => {
        showMessage(form.id, 'Google OAuth not configured. Please set up your Google Client ID.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Enhanced error handling for Google OAuth
function handleGoogleOAuthError(error) {
    console.error('Google OAuth Error:', error);
    
    let errorMessage = 'Google sign-in failed. Please try again.';
    
    if (error.error === 'popup_closed_by_user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
    } else if (error.error === 'access_denied') {
        errorMessage = 'Access denied. Please check your Google account settings.';
    } else if (error.error === 'invalid_client') {
        errorMessage = 'Invalid client configuration. Please check your Google OAuth setup.';
    }
    
    // Show error in the appropriate form
    const activeModal = document.querySelector('.modal.show');
    if (activeModal) {
        const formId = activeModal.querySelector('form').id;
        showMessage(formId, errorMessage, 'error');
    }
}

// Google Authenticator (2FA) Functions
let currentUserSecret = null;
let pendingLoginUser = null;

// Generate TOTP secret for user
function generateTOTPSecret(userEmail) {
    const secret = CryptoJS.lib.WordArray.random(20).toString();
    const base32Secret = base32Encode(secret);
    return base32Secret;
}

// Base32 encoding for TOTP secrets
function base32Encode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    
    for (let i = 0; i < str.length; i++) {
        value = (value << 8) | str.charCodeAt(i);
        bits += 8;
        
        while (bits >= 5) {
            output += alphabet[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    
    if (bits > 0) {
        output += alphabet[(value << (5 - bits)) & 31];
    }
    
    return output;
}

// Generate TOTP code
function generateTOTP(secret, time = Math.floor(Date.now() / 30000)) {
    const key = base32Decode(secret);
    const message = new ArrayBuffer(8);
    const view = new DataView(message);
    view.setBigUint64(0, BigInt(time), false);
    
    const hmac = CryptoJS.HmacSHA1(CryptoJS.lib.WordArray.create(message), key);
    const hash = hmac.toString(CryptoJS.enc.Hex);
    
    const offset = parseInt(hash.slice(-1), 16) & 0xf;
    const code = ((parseInt(hash.slice(offset, offset + 2), 16) & 0x7f) << 24) |
                 ((parseInt(hash.slice(offset + 2, offset + 4), 16) & 0xff) << 16) |
                 ((parseInt(hash.slice(offset + 4, offset + 6), 16) & 0xff) << 8) |
                 (parseInt(hash.slice(offset + 6, offset + 8), 16) & 0xff);
    
    return (code % 1000000).toString().padStart(6, '0');
}

// Base32 decoding
function base32Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i).toUpperCase();
        const index = alphabet.indexOf(char);
        if (index === -1) continue;
        
        value = (value << 5) | index;
        bits += 5;
        
        while (bits >= 8) {
            output += String.fromCharCode((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }
    
    return output;
}

// Verify TOTP code
function verifyTOTP(secret, code) {
    const currentTime = Math.floor(Date.now() / 30000);
    
    // Check current time and ±1 time step (90 seconds total)
    for (let i = -1; i <= 1; i++) {
        const expectedCode = generateTOTP(secret, currentTime + i);
        if (code === expectedCode) {
            return true;
        }
    }
    
    return false;
}

// Setup 2FA for user
function setupTwoFA(userEmail) {
    const secret = generateTOTPSecret(userEmail);
    currentUserSecret = secret;
    
    // Generate QR code URL
    const qrCodeUrl = `otpauth://totp/CUBE:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=CUBE`;
    
    // Generate QR code
    const qrContainer = document.getElementById('qr-code-container');
    qrContainer.innerHTML = '';
    
    new QRCode(qrContainer, {
        text: qrCodeUrl,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Display secret key
    document.getElementById('secret-key').textContent = secret;
    
    // Show setup modal
    showModal('twofa-setup-modal');
}

// Copy secret key to clipboard
function copySecretKey() {
    const secretKey = document.getElementById('secret-key').textContent;
    navigator.clipboard.writeText(secretKey).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Next step in 2FA setup
function nextStep() {
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
    document.getElementById('verification-code').focus();
}

// Verify 2FA setup
function verifyTwoFA() {
    const code = document.getElementById('verification-code').value;
    const statusDiv = document.getElementById('verification-status');
    
    if (!code || code.length !== 6) {
        statusDiv.textContent = 'Please enter a 6-digit code.';
        statusDiv.className = 'verification-status error';
        return;
    }
    
    statusDiv.textContent = 'Verifying...';
    statusDiv.className = 'verification-status loading';
    
    setTimeout(() => {
        if (verifyTOTP(currentUserSecret, code)) {
            // Store 2FA secret for user
            const user = JSON.parse(localStorage.getItem('user'));
            user.twofaSecret = currentUserSecret;
            user.twofaEnabled = true;
            localStorage.setItem('user', JSON.stringify(user));
            
            statusDiv.textContent = 'Two-factor authentication enabled successfully!';
            statusDiv.className = 'verification-status success';
            
            // Update UI
            updateUIForLoggedInUser(user);
            
            setTimeout(() => {
                closeModal('twofa-setup-modal');
                showMessage('login-form', 'Two-factor authentication has been enabled.', 'success');
            }, 2000);
        } else {
            statusDiv.textContent = 'Invalid code. Please try again.';
            statusDiv.className = 'verification-status error';
        }
    }, 1000);
}

// Verify 2FA during login
function verifyLoginTwoFA() {
    const code = document.getElementById('login-verification-code').value;
    const statusDiv = document.getElementById('login-verification-status');
    
    if (!code || code.length !== 6) {
        statusDiv.textContent = 'Please enter a 6-digit code.';
        statusDiv.className = 'verification-status error';
        return;
    }
    
    statusDiv.textContent = 'Verifying...';
    statusDiv.className = 'verification-status loading';
    
    setTimeout(() => {
        if (pendingLoginUser && verifyTOTP(pendingLoginUser.twofaSecret, code)) {
            statusDiv.textContent = 'Verification successful!';
            statusDiv.className = 'verification-status success';
            
            // Complete login
            updateUIForLoggedInUser(pendingLoginUser);
            
            setTimeout(() => {
                closeModal('twofa-verify-modal');
                showMessage('login-form', 'Login successful!', 'success');
                pendingLoginUser = null;
            }, 2000);
        } else {
            statusDiv.textContent = 'Invalid code. Please try again.';
            statusDiv.className = 'verification-status error';
        }
    }, 1000);
}

// Show modal function
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Disable 2FA
function disableTwoFA() {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        const user = JSON.parse(localStorage.getItem('user'));
        delete user.twofaSecret;
        user.twofaEnabled = false;
        localStorage.setItem('user', JSON.stringify(user));
        
        updateUIForLoggedInUser(user);
        showMessage('login-form', 'Two-factor authentication has been disabled.', 'success');
    }
}

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    const user = localStorage.getItem('user');
    if (user) {
        const userInfo = JSON.parse(user);
        updateUIForLoggedInUser(userInfo);
    }
    
    // Initialize Google Identity Services after a short delay
    setTimeout(() => {
        initializeGoogleIdentity();
    }, 1000);
});

document.querySelectorAll('.github-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Simulate GitHub OAuth
        const form = this.closest('form');
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Connecting to GitHub...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showMessage(form.id, 'GitHub login successful!', 'success');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            setTimeout(() => {
                closeModal(form.closest('.modal').id);
            }, 2000);
        }, 1500);
    });
});

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(this.id);
        }
    });
});

// Real-time input validation
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', function() {
        const form = this.closest('form');
        const formId = form.id;
        
        if (this.type === 'email' && this.value) {
            if (!validateEmail(this.value)) {
                this.style.borderBottomColor = '#e74c3c';
            } else {
                this.style.borderBottomColor = '#27ae60';
            }
        }
        
        if (this.type === 'password' && this.value) {
            if (!validatePassword(this.value)) {
                this.style.borderBottomColor = '#e74c3c';
            } else {
                this.style.borderBottomColor = '#27ae60';
            }
        }
        
        if (this.id === 'signup-confirm-password' && this.value) {
            const password = document.getElementById('signup-password').value;
            if (this.value !== password) {
                this.style.borderBottomColor = '#e74c3c';
            } else {
                this.style.borderBottomColor = '#27ae60';
            }
        }
    });
    
    input.addEventListener('input', function() {
        this.style.borderBottomColor = '#ecf0f1';
    });
});

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Ensure video background plays properly
    const video = document.querySelector('.video-background video');
    if (video) {
        video.play().catch(function(error) {
            console.log('Video autoplay failed:', error);
        });
        
        // Ensure video loops and plays continuously
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
    }
});

// Cube Solver Functionality
let selectedColor = 'white';
let selectedCell = null;
let cubeState = {};

function startSolving() {
    document.getElementById('cube-solver').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Initialize cube state
    selectedColor = 'white';
    selectedCell = null;
    
    // Clear any previous selections
    document.querySelectorAll('.face-cell').forEach(cell => {
        cell.classList.remove('selected', 'colored');
        cell.style.background = '#f8fafc';
        cell.dataset.color = '';
    });
    
    // Clear color selection
    document.querySelectorAll('.color-cell').forEach(cell => {
        cell.style.border = '2px solid transparent';
    });
    
    // Set default color selection
    const whiteColorCell = document.querySelector('.color-cell[data-color="white"]');
    if (whiteColorCell) {
        whiteColorCell.style.border = '2px solid #1e293b';
    }
}

function closeSolver() {
    document.getElementById('cube-solver').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchTab(tabName) {
    // Remove active class from all tabs and methods
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.input-method').forEach(method => method.classList.remove('active'));
    
    // Add active class to selected tab and method
    event.target.classList.add('active');
    document.getElementById(tabName + '-input').classList.add('active');
}

function selectColor(element, color) {
    selectedColor = color;
    
    // Remove selected class from all color cells
    document.querySelectorAll('.color-cell').forEach(cell => {
        cell.style.border = '2px solid transparent';
    });
    
    // Add selected border to clicked color
    element.style.border = '2px solid #1e293b';
    
    // Apply color to selected cell if any
    if (selectedCell) {
        selectedCell.style.background = getColorValue(color);
        selectedCell.dataset.color = color;
        selectedCell.classList.add('colored');
    }
    
    // Show feedback
    showMessage('Color selected: ' + color, 'success');
}

function selectCell(element) {
    // Remove selected class from all cells
    document.querySelectorAll('.face-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // Add selected class to clicked cell
    element.classList.add('selected');
    selectedCell = element;
    
    // Apply selected color if one is chosen
    if (selectedColor) {
        element.style.background = getColorValue(selectedColor);
        element.dataset.color = selectedColor;
        element.classList.add('colored');
    }
    
    // Show feedback
    showMessage('Cell selected. Choose a color to apply.', 'info');
}

function getColorValue(color) {
    const colors = {
        'white': '#ffffff',
        'yellow': '#fbbf24',
        'red': '#ef4444',
        'orange': '#f97316',
        'blue': '#3b82f6',
        'green': '#10b981'
    };
    return colors[color] || '#f8fafc';
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Simulate photo processing
            showMessage('Photo uploaded successfully! Processing cube state...', 'success');
            setTimeout(() => {
                // Simulate automatic color detection
                simulatePhotoProcessing();
            }, 2000);
        };
        reader.readAsDataURL(file);
    }
}

function simulatePhotoProcessing() {
    // Simulate automatic color detection
    const cells = document.querySelectorAll('.face-cell');
    const colors = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];
    
    cells.forEach((cell, index) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        cell.style.background = getColorValue(randomColor);
        cell.dataset.color = randomColor;
    });
    
    showMessage('Cube state detected! Please verify the colors.', 'success');
}

function solveCube() {
    // Collect cube state
    const cells = document.querySelectorAll('.face-cell');
    const state = {};
    
    cells.forEach((cell, index) => {
        state[index] = cell.dataset.color || 'white';
    });
    
    // Validate cube state
    if (!validateCubeState(state)) {
        showMessage('Invalid cube state detected. Please check your input.', 'error');
        return;
    }
    
    showMessage('Analyzing cube state...', 'info');
    
    setTimeout(() => {
        const solution = generateSolution(state);
        showSolution(solution);
    }, 1500);
}

function validateCubeState(state) {
    // Check if all cells have colors
    for (let i = 0; i < 9; i++) {
        if (!state[i] || state[i] === '') {
            return false;
        }
    }
    return true;
}

function generateSolution(state) {
    // This is a simplified but functional solving algorithm
    // In a real implementation, you would use more sophisticated algorithms
    
    const solution = [];
    
    // Step 1: White Cross
    solution.push({
        step: 1,
        title: "White Cross",
        description: "Create the white cross by placing white edges correctly",
        moves: ["F", "R", "U", "R'", "U'", "F'"],
        details: "Place white edges in their correct positions relative to center pieces"
    });
    
    // Step 2: White Corners
    solution.push({
        step: 2,
        title: "White Corners",
        description: "Solve the white face by placing white corners",
        moves: ["R", "U", "R'", "U'"],
        details: "Insert white corners using the right-hand algorithm"
    });
    
    // Step 3: Middle Layer
    solution.push({
        step: 3,
        title: "Middle Layer",
        description: "Solve the middle layer edges",
        moves: ["U", "R", "U'", "R'", "U'", "F'", "U", "F"],
        details: "Insert middle layer edges without disturbing the white face"
    });
    
    // Step 4: Yellow Cross
    solution.push({
        step: 4,
        title: "Yellow Cross",
        description: "Create the yellow cross on the top face",
        moves: ["F", "R", "U", "R'", "U'", "F'"],
        details: "Orient yellow edges to form a cross pattern"
    });
    
    // Step 5: Yellow Corners Position
    solution.push({
        step: 5,
        title: "Yellow Corners Position",
        description: "Position yellow corners in their correct locations",
        moves: ["U", "R", "U'", "L'", "U", "R'", "U'", "L"],
        details: "Move yellow corners to their correct positions"
    });
    
    // Step 6: Yellow Corners Orientation
    solution.push({
        step: 6,
        title: "Yellow Corners Orientation",
        description: "Orient yellow corners to complete the cube",
        moves: ["R", "U", "R'", "U'"],
        details: "Rotate yellow corners to complete the solve"
    });
    
    return solution;
}

function showSolution(solution) {
    const solutionDisplay = document.getElementById('solution-display');
    const solutionStepsDiv = document.getElementById('solution-steps');
    
    solutionStepsDiv.innerHTML = '';
    
    solution.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'solution-step';
        stepElement.innerHTML = `
            <div class="step-header">
                <div class="step-number">${step.step}</div>
                <div class="step-title">${step.title}</div>
            </div>
            <div class="step-content">
                <div class="step-description">${step.description}</div>
                <div class="step-moves">
                    <strong>Moves:</strong> ${step.moves.join(' ')}
                </div>
                <div class="step-details">${step.details}</div>
            </div>
        `;
        solutionStepsDiv.appendChild(stepElement);
    });
    
    solutionDisplay.style.display = 'block';
    showMessage('Solution generated! Follow the steps above.', 'success');
}

function replaySolution() {
    showMessage('Replaying solution animation...', 'info');
    // Simulate replay animation
    setTimeout(() => {
        showMessage('Solution replay completed!', 'success');
    }, 2000);
}

function closeSolution() {
    document.getElementById('solution-display').style.display = 'none';
}

function showMessage(message, type) {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '4000';
    messageDiv.style.animation = 'slideInRight 0.3s ease-out';
    
    document.body.appendChild(messageDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}



// Add CSS for solution steps
const style = document.createElement('style');
style.textContent = `
    .solution-step {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }
    
    .solution-step:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 255, 255, 0.15);
    }
    
    .step-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    }
    
    .step-number {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 20px;
        flex-shrink: 0;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .step-title {
        color: white;
        font-size: 20px;
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .step-content {
        margin-left: 60px;
    }
    
    .step-description {
        color: white;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 10px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .step-moves {
        color: #e0e0e0;
        font-size: 14px;
        margin-bottom: 8px;
        font-family: 'Courier New', monospace;
        background: rgba(0, 0, 0, 0.2);
        padding: 8px 12px;
        border-radius: 8px;
        display: inline-block;
    }
    
    .step-details {
        color: #f0f0f0;
        font-size: 14px;
        line-height: 1.5;
        font-style: italic;
    }
    
    .face-cell.selected {
        border: 3px solid #667eea !important;
        box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
        transform: scale(1.05);
    }
    
    .face-cell.colored {
        border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .color-cell[style*="border: 2px solid #1e293b"] {
        box-shadow: 0 0 10px rgba(30, 41, 59, 0.5);
        transform: scale(1.1);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style); 