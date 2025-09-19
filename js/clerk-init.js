// Clerk Initialization - Load this before auth.js
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhvdGljLWFhcmR2YXJrLTI4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Replace with your actual key

console.log('🔧 clerk-init.js starting...');

// CRITICAL: Block Clerk from auto-initializing
window.__clerk_publishable_key = undefined;
window.__clerk_frontend_api = undefined;

// Set our custom initialization flag
window.CLERK_MANUAL_INIT = true;

console.log('🚫 Blocked Clerk auto-initialization');
console.log('🔑 Our key ready:', CLERK_PUBLISHABLE_KEY ? 'YES' : 'NO');

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClerkManually);
} else {
  initClerkManually();
}

async function initClerkManually() {
  console.log('🚀 Starting manual Clerk initialization...');

  try {
    // Validate our key
    if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY.includes('YOUR_ACTUAL_KEY')) {
      throw new Error('Clerk publishable key not configured properly');
    }

    // Wait for Clerk library to be available
    let attempts = 0;
    while (!window.Clerk && attempts < 100) {
      console.log('⏳ Waiting for Clerk library... attempt', attempts + 1);
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }

    if (!window.Clerk) {
      throw new Error('Clerk library failed to load');
    }

    console.log('✅ Clerk library found, initializing...');

    // Initialize Clerk with our key
    await window.Clerk.load({
      publishableKey: CLERK_PUBLISHABLE_KEY,
      appearance: {
        theme: 'light',
        variables: {
          colorPrimary: '#667eea'
        }
      }
    });

    console.log('✅ Clerk initialized successfully!');

    // Set ready flags
    window.clerkReady = true;
    window.clerkInstance = window.Clerk;

    // Notify other scripts
    window.dispatchEvent(new CustomEvent('clerk-ready', {
      detail: { clerk: window.Clerk }
    }));

    console.log('📡 Clerk ready event dispatched');

  } catch (error) {
    console.error('❌ Clerk initialization failed:', error);
    
    // Show error to user
    showInitializationError(error.message);
  }
}

function showInitializationError(message) {
  // Remove any existing error modals
  const existing = document.getElementById('clerk-error-modal');
  if (existing) existing.remove();

  // Create error modal
  const errorModal = document.createElement('div');
  errorModal.id = 'clerk-error-modal';
  errorModal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 16px;
        text-align: center;
        max-width: 450px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      ">
        <div style="
          width: 80px;
          height: 80px;
          background: #ef4444;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
        ">⚠️</div>
        
        <h2 style="
          color: #ef4444;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          font-weight: 600;
        ">Authentication Error</h2>
        
        <p style="
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        ">${message}</p>
        
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button onclick="window.location.reload()" style="
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
          ">
            Refresh Page
          </button>
          
          <button onclick="console.log('Debug info:', {clerk: !!window.Clerk, key: '${CLERK_PUBLISHABLE_KEY.substring(0, 20)}...'})" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
          ">
            Debug Info
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(errorModal);
}
