// Clerk Configuration
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhvdGljLWFhcmR2YXJrLTI4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Replace with your Clerk publishable key

// Updated Authentication Manager
class AuthManager {
  constructor() {
    this.clerk = null;
    this.user = null;
    this.isInitialized = false;

    // Wait for Clerk to be ready
    window.addEventListener('clerk-ready', () => {
      this.initClerk();
    });

    // If Clerk is already ready, init immediately
    if (window.Clerk) {
      this.initClerk();
    }
  }

  async initClerk() {
    try {
      if (this.isInitialized) return;

      this.clerk = window.Clerk;
      this.isInitialized = true;

      console.log('Initializing auth with Clerk...');

      if (this.clerk.user) {
        console.log('User already logged in:', this.clerk.user.primaryEmailAddress?.emailAddress);
        this.user = this.clerk.user;
        await this.handleUserLogin();
      } else {
        console.log('No user logged in, showing login modal');
        this.showLoginModal();
      }

      // Listen for auth state changes
      this.clerk.addListener(({ user }) => {
        console.log('Auth state changed:', user?.primaryEmailAddress?.emailAddress || 'logged out');
        if (user) {
          this.user = user;
          this.handleUserLogin();
        } else {
          this.handleUserLogout();
        }
      });

    } catch (error) {
      console.error('Failed to initialize Clerk:', error);
      this.showError('Authentication service is unavailable. Please refresh the page.');
    }
  }

  async handleUserLogin() {
    try {
      const email = this.user.primaryEmailAddress?.emailAddress;
      console.log('User attempting login:', email);

      if (!email || !email.endsWith('@datachamps.ai')) {
        console.log('Access denied for email:', email);
        await this.clerk.signOut();
        this.showError('Access denied. Please use your @datachamps.ai email address.');
        return;
      }

      console.log('User authenticated successfully:', email);

      this.hideLoginModal();
      this.updateUserInterface();
      await this.registerUser();

      if (window.app) {
        await window.app.loadUserData();
      }

      this.showSuccess(`Welcome back, ${this.getUserName()}!`);

    } catch (error) {
      console.error('Login error:', error);
      this.showError('Login failed. Please try again.');
    }
  }

  handleUserLogout() {
    this.user = null;
    this.showLoginModal();
    this.clearUserInterface();
  }

  updateUserInterface() {
    if (!this.user) return;

    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) {
      userName.textContent = this.user.fullName || this.user.firstName || 'User';
    }

    if (userAvatar && this.user.imageUrl) {
      userAvatar.innerHTML = `<img src="${this.user.imageUrl}" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
  }

  clearUserInterface() {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) {
      userName.textContent = 'Please login';
    }

    if (userAvatar) {
      userAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
  }

  async registerUser() {
    try {
      const userData = {
        email: this.user.primaryEmailAddress?.emailAddress,
        name: this.user.fullName || `${this.user.firstName} ${this.user.lastName}`,
        role: 'Team Member',
        lastLogin: new Date().toISOString()
      };

      await window.api.registerUser(userData);
      console.log('User registered successfully:', userData.email);
    } catch (error) {
      console.error('Failed to register user:', error);
    }
  }

  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'flex';

      if (this.clerk) {
        const signInDiv = document.getElementById('clerk-signin');
        if (signInDiv) {
          signInDiv.innerHTML = '';

          this.clerk.mountSignIn(signInDiv, {
            routing: 'virtual',
            redirectUrl: window.location.href,
            appearance: {
              elements: {
                formButtonPrimary: 'clerk-btn-primary',
                card: 'clerk-card',
                headerTitle: 'clerk-title',
                headerSubtitle: 'clerk-subtitle'
              }
            }
          });
        }
      }
    } else {
      console.error('Login modal not found in DOM');
    }
  }

  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  }

  async logout() {
    try {
      console.log('Logging out user');
      await this.clerk.signOut();
      this.showSuccess('You have been logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      this.showError('Failed to logout. Please try again.');
    }
  }

  async getToken() {
    if (!this.user) return null;
    return this.user.primaryEmailAddress?.emailAddress;
  }

  isAuthenticated() {
    return !!this.user && this.user.primaryEmailAddress?.emailAddress?.endsWith('@datachamps.ai');
  }

  getUserEmail() {
    return this.user?.primaryEmailAddress?.emailAddress || null;
  }

  getUserName() {
    return this.user?.fullName || this.user?.firstName || 'User';
  }

  getUserId() {
    return this.user?.id || null;
  }
}

// Initialize auth manager
window.auth = new AuthManager();

// Setup logout button
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.auth.logout();
    });
  }
});
