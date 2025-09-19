// Simple Authentication System for DataChamps
// No external dependencies, CSP-friendly

class SimpleAuth {
  constructor() {
    this.user = null;
    this.isReady = false;
    
    console.log('🔧 Initializing Simple Auth...');
    this.init();
  }

  init() {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('datachamps_user');
    
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        this.isReady = true;
        
        console.log('✅ User found in storage:', this.user.email);
        this.updateUI();
        
        // Notify app that user is authenticated
        setTimeout(() => {
          window.dispatchEvent(new Event('user-authenticated'));
        }, 100);
        
      } catch (error) {
        console.error('❌ Invalid stored user data, clearing...');
        localStorage.removeItem('datachamps_user');
        this.showLoginModal();
      }
    } else {
      console.log('❌ No user found, showing login modal');
      this.showLoginModal();
    }
  }

  showLoginModal() {
    // Remove existing modal
    const existingModal = document.getElementById('authModal');
    if (existingModal) existingModal.remove();

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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          text-align: center;
          max-width: 420px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
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
          ">Sign in with your @datachamps.ai email</p>
          
          <form id="loginForm" style="text-align: left;">
            <div style="margin-bottom: 1rem;">
              <input 
                type="email" 
                id="loginEmail" 
                placeholder="your.name@datachamps.ai" 
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  border: 2px solid #e5e7eb;
                  border-radius: 8px;
                  font-size: 16px;
                  transition: border-color 0.3s ease;
                  box-sizing: border-box;
                "
              >
            </div>
            
            <div style="margin-bottom: 1.5rem;">
              <input 
                type="password" 
                id="loginPassword" 
                placeholder="Password" 
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  border: 2px solid #e5e7eb;
                  border-radius: 8px;
                  font-size: 16px;
                  transition: border-color 0.3s ease;
                  box-sizing: border-box;
                "
              >
            </div>
            
            <button 
              type="submit" 
              id="loginBtn"
              style="
                width: 100%;
                padding: 14px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
              "
            >
              Sign In
            </button>
          </form>
          
          <div 
            id="authError" 
            style="
              color: #dc2626;
              background: #fef2f2;
              border: 1px solid #fecaca;
              padding: 12px;
              border-radius: 8px;
              margin-top: 1rem;
              display: none;
              font-size: 14px;
            "
          ></div>
          
          <p style="
            margin-top: 1.5rem;
            font-size: 0.85rem;
            color: #9ca3af;
          ">
            For demo: use any @datachamps.ai email with password "demo"
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add form event listener
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      this.handleLogin(e);
    });

    // Add input focus styles
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = '#667eea';
        input.style.outline = 'none';
        input.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
      });
      
      input.addEventListener('blur', () => {
        input.style.borderColor = '#e5e7eb';
        input.style.boxShadow = 'none';
      });
    });

    // Add button hover effect
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.addEventListener('mouseenter', () => {
      loginBtn.style.transform = 'translateY(-2px)';
      loginBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
    });
    
    loginBtn.addEventListener('mouseleave', () => {
      loginBtn.style.transform = 'translateY(0)';
      loginBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('authError');
    const loginBtn = document.getElementById('loginBtn');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    
    // Validate email domain
    if (!email.endsWith('@datachamps.ai')) {
      this.showError('Please use your @datachamps.ai email address');
      return;
    }

    // Show loading state
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<span style="display: inline-flex; align-items: center;"><span class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;"></span>Signing in...</span>';
    loginBtn.disabled = true;

    try {
      console.log('🔐 Attempting login for:', email);

      // For demo purposes, we'll accept any @datachamps.ai email with password "demo"
      // In production, you'd call your Google Apps Script here
      
      if (password === 'demo' || password === 'datachamps123') {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create user object
        const userData = {
          email: email,
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: 'Team Member',
          loginTime: new Date().toISOString()
        };

        // Store user data
        localStorage.setItem('datachamps_user', JSON.stringify(userData));
        this.user = userData;
        this.isReady = true;
        
        console.log('✅ Login successful for:', email);
        
        // Hide modal and update UI
        this.hideLoginModal();
        this.updateUI();
        
        // Notify app
        setTimeout(() => {
          window.dispatchEvent(new Event('user-authenticated'));
        }, 300);
        
      } else {
        // In production, you'd make this API call:
        /*
        const response = await fetch(window.api?.baseURL || 'YOUR_GAS_URL', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'authenticate',
            email: email,
            password: password
          })
        });

        const result = await response.json();
        
        if (result.success) {
          // Handle successful login
        } else {
          this.showError(result.error || 'Invalid credentials');
        }
        */
        
        this.showError('Invalid password. Use "demo" or "datachamps123" for testing.');
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      this.showError('Login failed. Please check your connection and try again.');
    } finally {
      // Restore button
      loginBtn.innerHTML = originalText;
      loginBtn.disabled = false;
    }
  }

  showError(message) {
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

  hideLoginModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      console.log('✅ Hiding login modal');
      modal.remove();
    }
  }

  updateUI() {
    if (!this.user) return;
    
    console.log('🎨 Updating UI for user:', this.user.name);
    
    // Update username in sidebar
    const userName = document.getElementById('userName');
    if (userName) {
      userName.textContent = this.user.name || 'User';
    }

    // Update avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
      const initials = (this.user.fullName || this.user.name || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
      
      userAvatar.innerHTML = `<span style="font-weight: bold; color: white;">${initials}</span>`;
    }

    // Update any welcome messages
    const welcomeElements = document.querySelectorAll('.welcome-user');
    welcomeElements.forEach(el => {
      el.textContent = `Welcome, ${this.user.name.split(' ')[0]}!`;
    });
  }

  // Public methods for compatibility with existing code
  isAuthenticated() {
    return this.isReady && !!this.user && this.user.email?.endsWith('@datachamps.ai');
  }

  getUserEmail() {
    return this.user?.email || null;
  }

  getUserName() {
    return this.user?.fullName || this.user?.name || 'User';
  }

  getCurrentUser() {
    return this.user;
  }

  async signOut() {
    console.log('🚪 Signing out...');
    
    // Clear stored data
    localStorage.removeItem('datachamps_user');
    this.user = null;
    this.isReady = false;
    
    // Reload page to reset state
    window.location.reload();
  }

  async logout() {
    return this.signOut();
  }

  // For compatibility with existing API calls
  getToken() {
    return this.getUserEmail();
  }
}

// Add spinner animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize auth when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM loaded, creating Simple Auth...');
  window.auth = new SimpleAuth();
  
  // Setup logout button when sidebar loads
  setTimeout(() => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.auth.signOut();
      });
      console.log('🔗 Logout button connected');
    }
  }, 2000);
});

console.log('✅ Simple Auth system loaded');
