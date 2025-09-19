// Complete Auth Manager - Timing Fixed
class AuthManager {
  constructor() {
    this.clerk = null;
    this.user = null;
    this.isReady = false;
    
    console.log('🔧 Creating Auth Manager...');
    
    // Wait for Clerk to be properly initialized
    this.waitForClerk();
  }

  waitForClerk() {
    if (window.clerkReady && window.Clerk) {
      console.log('✅ Clerk already ready, starting auth...');
      this.start();
    } else {
      console.log('⏳ Waiting for Clerk to be ready...');
      
      // Listen for clerk-ready event
      window.addEventListener('clerk-ready', () => {
        console.log('🎯 Clerk ready event received');
        this.start();
      });

      // Fallback: poll for Clerk readiness
      const checkReady = setInterval(() => {
        if (window.clerkReady && window.Clerk) {
          clearInterval(checkReady);
          console.log('🎯 Clerk ready via polling');
          this.start();
        }
      }, 100);

      // Timeout after 15 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if (!this.isReady) {
          console.error('❌ Auth manager timeout - Clerk not ready');
          this.showError('Authentication service is not responding. Please refresh the page.');
        }
      }, 15000);
    }
  }

  start() {
    if (this.isReady) {
      console.log('⚠️ Auth manager already started');
      return;
    }

    console.log('🚀 Starting Auth Manager...');
    
    this.clerk = window.Clerk;
    this.isReady = true;
    
    // Check current auth state
    this.checkAuthState();
    
    // Listen for auth changes
    this.clerk.addListener(({ user }) => {
      console.log('🔄 Auth state changed:', user ? 'signed in' : 'signed out');
      
      if (user) {
        this.user = user;
        this.handleSignIn();
      } else {
        this.user = null;
        this.handleSignOut();
      }
    });

    console.log('✅ Auth Manager started successfully');
  }

  checkAuthState() {
    console.log('🔍 Checking current auth state...');
    
    if (this.clerk.user) {
      console.log('✅ User already signed in:', this.clerk.user.primaryEmailAddress?.emailAddress);
      this.user = this.clerk.user;
      this.handleSignIn();
    } else {
      console.log('❌ No user signed in, showing login modal');
      this.handleSignOut();
    }
  }

  handleSignIn() {
    const email = this.user.primaryEmailAddress?.emailAddress;
    console.log('🔐 Handling sign in for:', email);
    
    // Check domain restriction
    if (!email || !email.endsWith('@datachamps.ai')) {
      console.log('❌ Domain check failed for:', email);
      alert('Please use your @datachamps.ai email address to access DataChamps Hangout.');
      this.clerk.signOut();
      return;
    }
    
    console.log('✅ Domain check passed');
    
    // Hide sign-in modal
    this.hideSignInModal();
    
    // Update UI
    this.updateUI();
    
    // Register user
    this.registerUser();
    
    // Notify app that user is authenticated
    setTimeout(() => {
      console.log('📡 Dispatching user-authenticated event');
      window.dispatchEvent(new Event('user-authenticated'));
    }, 500);
  }

  handleSignOut() {
    console.log('🚪 Handling sign out');
    this.user = null;
    this.clearUI();
    this.showSignInModal();
  }

  updateUI() {
    console.log('🎨 Updating UI for user:', this.user?.fullName);
    
    // Update username
    const userName = document.getElementById('userName');
    if (userName) {
      const displayName = this.user.fullName || this.user.firstName || 'User';
      userName.textContent = displayName;
      console.log('✅ Updated username to:', displayName);
    }
    
    // Update avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
      if (this.user.imageUrl) {
        userAvatar.innerHTML = `<img src="${this.user.imageUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        const initials = this.getInitials(this.user.fullName || this.user.firstName || 'U');
        userAvatar.innerHTML = `<span style="font-weight:bold;">${initials}</span>`;
      }
    }
  }

  clearUI() {
    const userName = document.getElementById('userName');
    if (userName) {
      userName.textContent = 'Loading...';
    }
    
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
      userAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
  }

  getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  showSignInModal() {
    console.log('🚪 Showing sign-in modal');
    
    // Remove existing modal
    const existingModal = document.getElementById('authModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
      ">
        <div style="
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          text-align: center;
          max-width: 420px;
          width: 90%;
        ">
          <!-- Logo -->
          <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: bold;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
          ">DC</div>
          
          <h2 style="
            margin: 0 0 0.5rem 0; 
            color: #1f2937; 
            font-size: 1.5rem;
            font-weight: 600;
          ">Welcome to DataChamps</h2>
          
          <p style="
            color: #6b7280; 
            margin: 0 0 2rem 0; 
            font-size: 1rem;
            line-height: 1.5;
          ">Please sign in with your @datachamps.ai email to access your workspace</p>
          
          <button id="signInBtn" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          ">
            <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>
            Sign In with Email
          </button>
          
          <div id="authError" style="
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 12px;
            border-radius: 8px;
            margin-top: 1rem;
            display: none;
            font-size: 14px;
          "></div>
          
          <p style="
            margin-top: 1.5rem;
            font-size: 0.85rem;
            color: #9ca3af;
          ">
            Need access? Contact your administrator
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);

    // Add hover effect
    const signInBtn = document.getElementById('signInBtn');
    signInBtn.addEventListener('mouseenter', () => {
      signInBtn.style.transform = 'translateY(-2px)';
      signInBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
    });
    
    signInBtn.addEventListener('mouseleave', () => {
      signInBtn.style.transform = 'translateY(0)';
      signInBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });

    // Add click handler
    signInBtn.addEventListener('click', () => {
      console.log('🔐 Sign-in button clicked');
      this.initiateSignIn();
    });
  }

  hideSignInModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      console.log('✅ Hiding sign-in modal');
      modal.remove();
    }
  }

  async initiateSignIn() {
    try {
      console.log('🚀 Initiating sign-in process...');
      
      const signInBtn = document.getElementById('signInBtn');
      const originalContent = signInBtn.innerHTML;
      
      // Show loading state
      signInBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Loading...';
      signInBtn.disabled = true;
      
      // Open Clerk sign-in
      await this.clerk.openSignIn({
        afterSignInUrl: window.location.href,
        appearance: {
          theme: 'light',
          variables: {
            colorPrimary: '#667eea'
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Sign-in error:', error);
      this.showSignInError('Sign-in failed: ' + error.message);
      
      // Restore button
      const signInBtn = document.getElementById('signInBtn');
      if (signInBtn) {
        signInBtn.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>Sign In with Email';
        signInBtn.disabled = false;
      }
    }
  }

  showSignInError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  showError(message) {
    console.error('🚨 Auth Error:', message);
    alert('Authentication Error: ' + message);
  }

  async registerUser() {
    if (!window.api) {
      console.warn('⚠️ API not available for user registration');
      return;
    }
    
    try {
      const userData = {
        email: this.user.primaryEmailAddress?.emailAddress,
        name: this.user.fullName || this.user.firstName || 'User',
        role: 'Team Member',
        lastLogin: new Date().toISOString()
      };
      
      console.log('👤 Registering user:', userData);
      await window.api.registerUser(userData);
      console.log('✅ User registered successfully');
      
    } catch (error) {
      console.warn('⚠️ User registration failed:', error);
      // Don't block the user experience for registration failures
    }
  }

  // Public methods
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
    console.log('🚪 Signing out...');
    if (this.clerk) {
      await this.clerk.signOut();
    }
  }

  async logout() {
    return this.signOut();
  }
}

// Initialize auth manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM loaded, creating Auth Manager...');
  window.auth = new AuthManager();
});
