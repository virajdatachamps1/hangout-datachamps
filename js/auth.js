// Clerk Configuration
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhvdGljLWFhcmR2YXJrLTI4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Replace with your Clerk publishable key
// Simplified Authentication Manager - Working Version
class AuthManager {
  constructor() {
    this.clerk = null;
    this.user = null;
    this.isInitialized = false;
    
    // Initialize immediately when page loads
    this.init();
  }

  async init() {
    try {
      console.log('Starting auth initialization...');
      
      // Wait for Clerk to be available
      await this.waitForClerk();
      
      // Initialize Clerk
      await this.initializeClerk();
      
      // Check authentication status
      await this.checkAuthStatus();
      
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.showError('Authentication failed to load. Please refresh the page.');
    }
  }

  async waitForClerk() {
    return new Promise((resolve) => {
      const checkClerk = () => {
        if (window.Clerk) {
          console.log('Clerk is available');
          resolve();
        } else {
          console.log('Waiting for Clerk...');
          setTimeout(checkClerk, 100);
        }
      };
      checkClerk();
    });
  }

  async initializeClerk() {
    try {
      this.clerk = window.Clerk;
      
      // Load Clerk with your publishable key
      await this.clerk.load({
        publishableKey: CLERK_PUBLISHABLE_KEY
      });
      
      console.log('Clerk loaded successfully');
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Failed to initialize Clerk:', error);
      throw error;
    }
  }

  async checkAuthStatus() {
    try {
      if (this.clerk.user) {
        console.log('User is already logged in');
        this.user = this.clerk.user;
        await this.handleUserLogin();
      } else {
        console.log('User not logged in, showing login modal');
        this.showLoginModal();
      }

      // Listen for auth changes
      this.clerk.addListener(({ user }) => {
        console.log('Auth state changed:', user ? 'logged in' : 'logged out');
        if (user) {
          this.user = user;
          this.handleUserLogin();
        } else {
          this.handleUserLogout();
        }
      });

    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }

  async handleUserLogin() {
    try {
      const email = this.user.primaryEmailAddress?.emailAddress;
      console.log('Handling login for:', email);
      
      // Check domain restriction
      if (!email || !email.endsWith('@datachamps.ai')) {
        console.log('Invalid domain, signing out');
        await this.clerk.signOut();
        this.showError('Please use your @datachamps.ai email address.');
        return;
      }

      // Hide login modal
      this.hideLoginModal();

      // Update UI
      this.updateUserInterface();

      // Register user in backend
      await this.registerUser();

      // Trigger event for app to load data
      window.dispatchEvent(new Event('user-authenticated'));

      console.log('Login successful for:', email);

    } catch (error) {
      console.error('Login handling error:', error);
    }
  }

  handleUserLogout() {
    this.user = null;
    this.clearUserInterface();
    this.showLoginModal();
    console.log('User logged out');
  }

  updateUserInterface() {
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

  showLoginModal() {
    // Create modal if it doesn't exist
    this.createLoginModal();
    
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'flex';
      
      // Mount sign-in component
      if (this.clerk && this.isInitialized) {
        const signInDiv = document.getElementById('clerk-signin');
        if (signInDiv) {
          signInDiv.innerHTML = ''; // Clear existing content
          
          try {
            this.clerk.mountSignIn(signInDiv, {
              routing: 'virtual'
            });
            console.log('Sign-in component mounted');
          } catch (error) {
            console.error('Failed to mount sign-in:', error);
            signInDiv.innerHTML = '<p>Loading sign-in form...</p>';
          }
        }
      }
    }
  }

  createLoginModal() {
    // Check if modal already exists
    if (document.getElementById('loginModal')) {
      return;
    }

    // Create modal HTML
    const modalHTML = `
      <div id="loginModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Welcome to DataChamps Hangout</h2>
            <p>Please sign in with your @datachamps.ai email</p>
          </div>
          <div class="modal-body">
            <div id="clerk-signin"></div>
          </div>
        </div>
      </div>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
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
        name: this.user.fullName || `${this.user.firstName} ${this.user.lastName}`,
        role: 'Team Member',
        lastLogin: new Date().toISOString()
      };

      await window.api.registerUser(userData);
      console.log('User registered successfully');
    } catch (error) {
      console.error('Failed to register user:', error);
    }
  }

  async logout() {
    try {
      if (this.clerk) {
        await this.clerk.signOut();
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  showError(message) {
    console.error('Auth Error:', message);
    alert(message); // Simple alert for now
  }
}

// Initialize auth manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing auth manager...');
  window.auth = new AuthManager();
});
