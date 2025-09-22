
// auth.js - Fixed Session Validation
class AuthManager {
  constructor() {
    this.apiUrl = 'https://script.google.com/macros/s/AKfycbwh-dRlLIPAIs58APp08QSiH8Tj1jlnuGEcOSDoQtZL490bjEkzMlzf71WyAZGqFj34_w/exec';
    this.isValidating = false;
    this.checkAuth();
  }

  async checkAuth() {
    // Skip auth check on login page
    if (window.location.pathname.includes('login.html')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    
    console.log('Checking auth...', { token: token ? 'exists' : 'missing', expiresAt });
    
    if (!token || !expiresAt) {
      console.log('No token or expiry, redirecting to login');
      this.redirectToLogin();
      return;
    }

    // Check if token expired (client-side check)
    if (new Date() > new Date(expiresAt)) {
      console.log('Token expired, clearing and redirecting');
      localStorage.clear();
      this.redirectToLogin();
      return;
    }

    // Validate with server
    await this.validateSession(token);
  }

  async validateSession(token) {
    if (this.isValidating) {
      console.log('Already validating, skipping...');
      return;
    }

    this.isValidating = true;

    try {
      console.log('Validating session with server...');
      
      const url = `${this.apiUrl}?action=validateSession&token=${encodeURIComponent(token)}`;
      const response = await fetch(url);
      const result = await response.json();

      console.log('Validation result:', result);

      if (!result.success || !result.data.valid) {
        console.log('Session invalid, clearing storage');
        localStorage.clear();
        this.redirectToLogin();
      } else {
        console.log('Session valid, user authenticated');
        
        // Store user info
        localStorage.setItem('userEmail', result.data.user.email);
        localStorage.setItem('userName', result.data.user.name);
        localStorage.setItem('userRole', result.data.user.role);
        
        // Update UI
        this.updateUI(result.data.user);
        
        // Notify app
        window.dispatchEvent(new Event('user-authenticated'));
      }
    } catch (error) {
      console.error('Session validation error:', error);
      // Don't redirect on network error, keep user logged in
      // localStorage.clear();
      // this.redirectToLogin();
    } finally {
      this.isValidating = false;
    }
  }

  updateUI(user) {
    console.log('Updating UI for user:', user.name);
    
    const userName = document.getElementById('userName');
    if (userName) {
      userName.textContent = user.name;
    }

    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
      userAvatar.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#667eea;color:white;border-radius:50%;font-weight:600;">${initials}</div>`;
    }
  }

  redirectToLogin() {
    if (!window.location.pathname.includes('login.html')) {
      console.log('Redirecting to login page');
      window.location.href = 'login.html';
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getUserEmail() {
    return localStorage.getItem('userEmail');
  }

  getUserName() {
    return localStorage.getItem('userName');
  }

  async logout() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        const url = `${this.apiUrl}?action=logout&token=${encodeURIComponent(token)}`;
        await fetch(url);
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    
    localStorage.clear();
    window.location.href = 'login.html';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Auth Manager...');
  window.auth = new AuthManager();
});
