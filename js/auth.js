// auth.js - Custom Authentication Manager
class AuthManager {
  constructor() {
    this.apiUrl = '1wt47PHcry-Tk6kUSvSECLrgVbGmxA-hzfoIrO17ZhcY'; // Replace with your deployed URL
    this.checkAuth();
  }

  async checkAuth() {
    // Skip auth check on login page
    if (window.location.pathname.includes('login.html')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    
    // Check if token exists and hasn't expired
    if (!token || !expiresAt) {
      this.redirectToLogin();
      return;
    }

    // Check if token expired (5 days)
    if (new Date() > new Date(expiresAt)) {
      localStorage.clear();
      this.redirectToLogin();
      return;
    }

    // Validate with server
    await this.validateSession(token);
  }

  async validateSession(token) {
    try {
      const response = await fetch(`${this.apiUrl}?action=validateSession&token=${token}`);
      const result = await response.json();

      if (!result.success || !result.data.valid) {
        localStorage.clear();
        this.redirectToLogin();
      } else {
        // Store user info
        localStorage.setItem('userEmail', result.data.user.email);
        localStorage.setItem('userName', result.data.user.name);
        localStorage.setItem('userRole', result.data.user.role);
        
        // Update UI
        this.updateUI(result.data.user);
        
        // Notify app that user is authenticated
        window.dispatchEvent(new Event('user-authenticated'));
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      this.redirectToLogin();
    }
  }

  updateUI(user) {
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
        await fetch(`${this.apiUrl}?action=logout&token=${token}`);
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
  window.auth = new AuthManager();
});
