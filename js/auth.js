// Fixed Authentication Manager - Alternative Clerk Initialization
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhvdGljLWFhcmR2YXJrLTI4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Replace with your actual key

class AuthManager {
  constructor() {
    this.clerk = null;
    this.user = null;
    this.isInitialized = false;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      console.log('Starting auth initialization...');
      console.log('Publishable key:', CLERK_PUBLISHABLE_KEY);
      
      // Wait for Clerk script to load
      await this.waitForClerk();
      
      // Initialize Clerk the simple way
      await this.setupClerk();
      
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.showSimpleError('Authentication failed to load. Please refresh the page.');
    }
  }

  async waitForClerk() {
    let attempts = 0;
    const maxAttempts = 50;
    
    return new Promise((resolve, reject) => {
      const checkClerk = () => {
        attempts++;
        
        if (window.Clerk) {
          console.log('Clerk is available after', attempts, 'attempts');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Clerk script failed to load'));
        } else {
          console.log('Waiting for Clerk... attempt', attempts);
          setTimeout(checkClerk, 200);
        }
      };
      checkClerk();
    });
  }

  async setupClerk() {
    try {
      // Get Clerk instance
      this.clerk = window.Clerk;
      
      // Initialize with publishable key
      console.log('Loading Clerk with publishable key...');
      await this.clerk.load({
        publishableKey: CLERK_PUBLISHABLE_KEY
      });
      
      console.log('Clerk loaded successfully!');
      this.isInitialized = true;
      
      // Check if user is already signed in
      if (this.clerk.user) {
        console.log('User already signed in:', this.clerk.user.primaryEmailAddress?.emailAddress);
        this.user = this.clerk.user;
        this.handleUserLogin();
      } else {
        console.log('No user signed in, showing login');
        this.showLoginModal();
      }

      // Listen for auth state changes
      this.clerk.addListener(({ user }) => {
        console.log('Auth state changed. User:', user?.primaryEmailAddress?.emailAddress || 'none');
        
        if (user) {
          this.user = user;
          this.handleUserLogin();
        } else {
          this.handleUserLogout();
        }
      });

    } catch (error) {
      console.error('Failed to setup Clerk:', error);
      this.showSimpleError('Failed to initialize authentication: ' + error.message);
    }
  }

  handleUserLogin() {
    const email = this.user.primaryEmailAddress?.emailAddress;
    console.log('Handling login for user:', email);
    
    // Check domain restriction
    if (!email || !email.endsWith('@datachamps.ai')) {
      console.log('Domain restriction failed for:', email);
      this.clerk.signOut();
      this.showSimpleError('Please use your @datachamps.ai email address.');
      return;
    }

    // Hide login modal
    this.hideLoginModal();

    // Update UI
    this.updateUserInterface();

    // Register user in backend
    this.registerUser().catch(err => console.error('User registration failed:', err));

    // Tell app that user is authenticated
    setTimeout(() => {
      if (window.app) {
        window.dispatchEvent(new Event('user-authenticated'));
      }
    }, 500);

    console.log('Login successful for:', email);
  }

  handleUserLogout() {
    console.log('Handling user logout');
    this.user = null;
    this.clearUserInterface();
    this.showLoginModal();
  }

  updateUserInterface() {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) {
      const name = this.user.fullName || this.user.firstName || 'User';
      userName.textContent = name;
      console.log('Updated username to:', name);
    }

    if (userAvatar) {
      if (this.user.imageUrl) {
        userAvatar.innerHTML = `<img src="${this.user.imageUrl}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      } else {
        userAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
      }
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

  showLoginModal() {
    console.log('Showing login modal');
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('loginModal');
    if (!modal) {
      const modalHTML = `
        <div id="loginModal" class="modal" style="display: flex;">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Welcome to DataChamps Hangout</h2>
              <p>Please sign in with your @datachamps.ai email</p>
            </div>
            <div class="modal-body">
              <div id="clerk-signin">Loading sign-in form...</div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      modal = document.getElementById('loginModal');
    }

    // Show modal
    modal.style.display = 'flex';
    
    // Mount Clerk sign-in
    if (this.clerk && this.isInitialized) {
      const signInDiv = document.getElementById('clerk-signin');
      if (signInDiv) {
        try {
          console.log('Mounting Clerk sign-in component');
          this.clerk.mountSignIn(signInDiv, {
            routing: 'virtual',
            appearance: {
              elements: {
                formButtonPrimary: 'clerk-button-primary',
                card: 'clerk-card'
              }
            }
          });
        } catch (error) {
          console.error('Failed to mount sign-in component:', error);
          signInDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <p>Sign-in form failed to load.</p>
              <button onclick="window.location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px;">
                Refresh Page
              </button>
            </div>
          `;
        }
      }
    }
  }

  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  async registerUser() {
    try {
      if (!window.api) {
        console.log('API not ready, skipping user registration');
        return;
      }

      const userData = {
        email: this.user.primaryEmailAddress?.emailAddress,
        name: this.user.fullName || `${this.user.firstName} ${this.user.lastName || ''}`.trim(),
        role: 'Team Member',
        lastLogin: new Date().toISOString()
      };

      console.log('Registering user:', userData);
      await window.api.registerUser(userData);
      console.log('User registered successfully');
      
    } catch (error) {
      console.error('Failed to register user:', error);
    }
  }

  async logout() {
    try {
      console.log('Logging out user');
      if (this.clerk) {
        await this.clerk.signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  isAuthenticated() {
    return !!this.user && 
           !!this.user.primaryEmailAddress?.emailAddress?.endsWith('@datachamps.ai');
  }

  getUserEmail() {
    return this.user?.primaryEmailAddress?.emailAddress || null;
  }

  getUserName() {
    return this.user?.fullName || this.user?.firstName || 'User';
  }

  showSimpleError(message) {
    console.error('Auth Error:', message);
    
    // Create simple error display
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
    `;
    errorDiv.innerHTML = `
      <strong>Error:</strong> ${message}
      <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 10000);
  }
}

// Initialize when page loads
console.log('Loading auth manager...');
window.auth = new AuthManager();
