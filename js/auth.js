// Complete Auth Manager - Replace your entire auth.js file with this
class AuthManager {
  constructor() {
    this.clerk = null;
    this.user = null;
    this.isReady = false;
    
    // Wait for Clerk to be initialized by clerk-init.js
    if (window.clerkReady) {
      this.start();
    } else {
      window.addEventListener('clerk-initialized', () => {
        this.start();
      });
    }
  }

  start() {
    console.log('🚀 Starting Auth Manager...');
    
    this.clerk = window.Clerk;
    this.isReady = true;
    
    // Check current auth state
    this.checkAuthState();
    
    // Listen for auth changes
    this.clerk.addListener(({ user }) => {
      console.log('Auth state changed:', user ? 'signed in' : 'signed out');
      
      if (user) {
        this.user = user;
        this.handleSignIn();
      } else {
        this.user = null;
        this.handleSignOut();
      }
    });
  }

  checkAuthState() {
    if (this.clerk.user) {
      console.log('✅ User already signed in');
      this.user = this.clerk.user;
      this.handleSignIn();
    } else {
      console.log('❌ No user signed in');
      this.showSignInModal();
    }
  }

  handleSignIn() {
    const email = this.user.primaryEmailAddress?.emailAddress;
    console.log('Handling sign in for:', email);
    
    // Check domain restriction
    if (!email || !email.endsWith('@datachamps.ai')) {
      console.log('❌ Domain check failed');
      this.clerk.signOut();
      alert('Please use your @datachamps.ai email address.');
      return;
    }
    
    console.log('✅ Domain check passed');
    
    // Hide sign-in modal
    this.hideSignInModal();
    
    // Update UI
    this.updateUI();
    
    // Register user and notify app
    this.registerUser();
    
    // Tell app user is authenticated
    setTimeout(() => {
      window.dispatchEvent(new Event('user-authenticated'));
    }, 500);
  }

  handleSignOut() {
    console.log('Handling sign out');
    this.user = null;
    this.clearUI();
    this.showSignInModal();
  }

  updateUI() {
    // Update username
    const userName = document.getElementById('userName');
    if (userName) {
      userName.textContent = this.user.fullName || this.user.firstName || 'User';
    }
    
    // Update avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
      if (this.user.imageUrl) {
        userAvatar.innerHTML = `<img src="${this.user.imageUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        userAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
      }
    }
  }

  clearUI() {
    const userName = document.getElementById('userName');
    if (userName) {
      userName.textContent = 'Please sign in';
    }
    
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
      userAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
  }

  showSignInModal() {
    console.log('📝 Showing sign-in modal');
    
    // Remove existing modal
    const existingModal = document.getElementById('signInModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'signInModal';
    modal.innerHTML = `
      <div class="modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 9999;">
        <div style="background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 400px; text-align: center;">
          <h2 style="color: #333; margin-bottom: 10px;">Welcome to DataChamps Hangout</h2>
          <p style="color: #666; margin-bottom: 30px;">Please sign in with your @datachamps.ai email</p>
          <div id="clerkSignInContainer"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mount Clerk sign-in
    try {
      this.clerk.mountSignIn(document.getElementById('clerkSignInContainer'), {
        routing: 'virtual'
      });
      console.log('✅ Sign-in component mounted');
    } catch (error) {
      console.error('❌ Failed to mount sign-in:', error);
      document.getElementById('clerkSignInContainer').innerHTML = `
        <p style="color: red;">Sign-in failed to load</p>
        <button onclick="window.location.reload()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">
          Refresh Page
        </button>
      `;
    }
  }

  hideSignInModal() {
    const modal = document.getElementById('signInModal');
    if (modal) {
      modal.remove();
    }
  }

  async registerUser() {
    try {
      if (!window.api) return;
      
      const userData = {
        email: this.user.primaryEmailAddress?.emailAddress,
        name: this.user.fullName || this.user.firstName || 'User',
        role: 'Team Member',
        lastLogin: new Date().toISOString()
      };
      
      await window.api.registerUser(userData);
      console.log('✅ User registered');
    } catch (error) {
      console.error('❌ User registration failed:', error);
    }
  }

  // Public methods that other files can use
  isAuthenticated() {
    return !!this.user && this.user.primaryEmailAddress?.emailAddress?.endsWith('@datachamps.ai');
  }

  getUserEmail() {
    return this.user?.primaryEmailAddress?.emailAddress || null;
  }

  getUserName() {
    return this.user?.fullName || this.user?.firstName || 'User';
  }

  async signOut() {
    if (this.clerk) {
      await this.clerk.signOut();
    }
  }

  async logout() {
    return this.signOut();
  }

  // Legacy methods for compatibility
  getToken() {
    return this.getUserEmail();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Creating Auth Manager...');
  window.auth = new AuthManager();
  
  // Setup logout button when sidebar loads
  setTimeout(() => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.auth.logout();
      });
    }
  }, 1000);
});
