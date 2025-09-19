// Clerk Configuration
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhvdGljLWFhcmR2YXJrLTI4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Replace with your Clerk publishable key
// Modified Authentication Manager - Frontend Domain Validation Only

class AuthManager {
  constructor() {
    this.clerk = null;
    this.user = null;
    this.initClerk();
  }

  async initClerk() {
    try {
      this.clerk = window.Clerk;
      await this.clerk.load();
      
      if (this.clerk.user) {
        this.user = this.clerk.user;
        await this.handleUserLogin();
      } else {
        this.showLoginModal();
      }

      // Listen for auth state changes
      this.clerk.addListener(({ user }) => {
        if (user) {
          this.user = user;
          this.handleUserLogin();
        } else {
          this.handleUserLogout();
        }
      });

    } catch (error) {
      console.error('Failed to initialize Clerk:', error);
      this.showError('Authentication service is unavailable');
    }
  }

  async handleUserLogin() {
    try {
      // Check if user email is from datachamps.ai domain
      const email = this.user.primaryEmailAddress?.emailAddress;
      console.log('User attempting login:', email);
      
      if (!email || !email.endsWith('@datachamps.ai')) {
        console.log('Access denied for email:', email);
        await this.clerk.signOut();
        this.showError('Access denied. Please use your @datachamps.ai email address.');
        return;
      }

      console.log('User authenticated successfully:', email);

      // Hide login modal
      this.hideLoginModal();

      // Update UI with user info
      this.updateUserInterface();

      // Register/update user in backend
      await this.registerUser();

      // Load user-specific data
      if (window.app) {
        await window.app.loadUserData();
      }

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
        role: 'Team Member', // Default role
        lastLogin: new Date().toISOString()
      };

      await window.api.registerUser(userData);
      console.log('User registered successfully:', userData.email);
    } catch (error) {
      console.error('Failed to register user:', error);
      // Don't show error to user for registration failures
    }
  }

  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'flex';
      
      // Mount Clerk sign-in component
      if (this.clerk) {
        this.clerk.mountSignIn(document.getElementById('clerk-signin'), {
          routing: 'virtual',
          redirectUrl: window.location.href,
          appearance: {
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              card: 'border-0 shadow-lg',
              headerTitle: 'text-2xl font-bold text-gray-900',
              headerSubtitle: 'text-gray-600'
            }
          },
          // Add a message about email restrictions
          localization: {
            signIn: {
              start: {
                title: 'Sign in to DataChamps Hangout',
                subtitle: 'Please use your @datachamps.ai email address'
              }
            }
          }
        });
      }
    }
  }

  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  showError(message) {
    // Create error notification
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

    // Add to page
    document.body.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 5000);
  }

  showSuccess(message) {
    // Create success notification
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

    // Add to page
    document.body.appendChild(successDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (successDiv.parentElement) {
        successDiv.remove();
      }
    }, 3000);
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

  // Since we don't have JWT, we'll return the user's email as a simple identifier
  async getToken() {
    if (!this.user) return null;
    
    // Return the user's email as identifier (not secure, but works for basic auth)
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

  // Get user ID for API calls
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
