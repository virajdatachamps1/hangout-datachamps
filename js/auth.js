// Simple Working Auth Manager
class AuthManager {
  constructor() {
    this.clerk = null;
    this.user = null;
    this.isReady = false;
    
    console.log('🔧 Creating Auth Manager...');
    this.init();
  }

  init() {
    // Wait for Clerk to be ready
    const checkClerkReady = () => {
      if (window.clerkReady && window.Clerk) {
        console.log('✅ Clerk is ready, starting auth...');
        this.start();
      } else {
        console.log('⏳ Waiting for Clerk...');
        setTimeout(checkClerkReady, 200);
      }
    };

    // Listen for clerk-ready event
    window.addEventListener('clerk-ready', () => {
      console.log('🎯 Clerk ready event received');
      this.start();
    });

    // Start checking
    checkClerkReady();
  }

  start() {
    if (this.isReady) return;

    console.log('🚀 Starting Auth Manager...');
    
    this.clerk = window.Clerk;
    this.isReady = true;
    
    // Check current auth state
    if (this.clerk.user) {
      console.log('✅ User already signed in');
      this.user = this.clerk.user;
      this.handleSignIn();
    } else {
      console.log('❌ No user signed in, showing login modal');
      this.showSignInModal();
    }
    
    // Listen for auth changes
    this.clerk.addListener(({ user }) => {
      console.log('🔄 Auth state changed:', user ? 'signed in' : 'signed out');
      
      if (user) {
        this.user = user;
        this.handleSignIn();
      } else {
        this.user = null;
        this.showSignInModal();
      }
    });
  }

  handleSignIn() {
    const email = this.user.primaryEmailAddress?.emailAddress;
    console.log('🔐 Handling sign in for:', email);
    
    // Check domain restriction
    if (!email || !email.endsWith('@datachamps.ai')) {
      console.log('❌ Domain check failed');
      alert('Please use your @datachamps.ai email address.');
      this.clerk.signOut();
      return;
    }
    
    console.log('✅ Domain check passed');
    
    // Hide sign-in modal
    this.hideSignInModal();
    
    // Update UI
    this.updateUI();
    
    // Notify app
    setTimeout(() => {
      console.log('📡 Dispatching user-authenticated event');
      window.dispatchEvent(new Event('user-authenticated'));
    }, 500);
  }

  updateUI() {
    // Update username in sidebar
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

  getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  showSignInModal() {
    console.log('🚪 Showing sign-in modal');
    
    // Remove existing modal
    const existingModal = document.getElementById('authModal');
    if (existingModal) existingModal.remove();
    
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
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
          <div style="
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          ">DC</div>
          
          <h2 style="margin: 0 0 0.5rem 0; color: #1f2937;">Welcome to DataChamps</h2>
          <p style="color: #6b7280; margin: 0 0 2rem 0;">Please sign in with your @datachamps.ai email</p>
          
          <button id="signInBtn" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
          ">
            Sign In with Email
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);

    // Add click handler
    document.getElementById('signInBtn').addEventListener('click', () => {
      console.log('🔐 Opening Clerk sign-in...');
      this.clerk.openSignIn().catch(error => {
        console.error('❌ Sign-in error:', error);
        alert('Sign-in failed: ' + error.message);
      });
    });
  }

  hideSignInModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      console.log('✅ Hiding sign-in modal');
      modal.remove();
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
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM loaded, creating Auth Manager...');
  window.auth = new AuthManager();
  
  // Setup logout button
  setTimeout(() => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.auth.signOut();
      });
    }
  }, 2000);
});
