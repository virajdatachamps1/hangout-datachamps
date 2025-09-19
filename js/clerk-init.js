// Clerk Initialization - Load this before auth.js
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhvdGljLWFhcmR2YXJrLTI4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Replace with your actual key

console.log('🔧 clerk-init.js loaded');
console.log('🔑 Clerk key available:', CLERK_PUBLISHABLE_KEY ? 'YES' : 'NO');

// Prevent Clerk from auto-initializing
if (window.Clerk) {
  console.log('⚠️ Clerk already loaded, initializing immediately');
  initializeClerkNow();
} else {
  console.log('⏳ Waiting for Clerk to load...');
  // Wait for Clerk to load, then initialize
  const checkClerk = setInterval(() => {
    if (window.Clerk) {
      clearInterval(checkClerk);
      console.log('✅ Clerk loaded, initializing...');
      initializeClerkNow();
    }
  }, 50);

  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkClerk);
    if (!window.Clerk) {
      console.error('❌ Clerk failed to load after 10 seconds');
      showError('Authentication service failed to load. Please refresh the page.');
    }
  }, 10000);
}

async function initializeClerkNow() {
  try {
    // Validate key
    if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY === 'pk_test_YOUR_ACTUAL_KEY_HERE') {
      throw new Error('Clerk publishable key not configured');
    }

    console.log('🚀 Initializing Clerk with key:', CLERK_PUBLISHABLE_KEY.substring(0, 20) + '...');

    // Initialize Clerk
    await window.Clerk.load({
      publishableKey: CLERK_PUBLISHABLE_KEY
    });

    console.log('✅ Clerk initialized successfully!');

    // Set ready flag
    window.clerkReady = true;

    // Notify other scripts
    window.dispatchEvent(new CustomEvent('clerk-ready'));

    return true;

  } catch (error) {
    console.error('❌ Clerk initialization failed:', error);
    showError('Authentication failed: ' + error.message);
    return false;
  }
}

function showError(message) {
  // Create error overlay
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
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
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        color: #333;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      ">
        <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h2 style="color: #ef4444; margin-bottom: 1rem;">Authentication Error</h2>
        <p style="margin-bottom: 2rem; line-height: 1.5;">${message}</p>
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
      </div>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
}
