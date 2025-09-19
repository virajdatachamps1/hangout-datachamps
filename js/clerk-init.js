// Clerk Initialization - Load this before auth.js
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhvdGljLWFhcmR2YXJrLTI4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Replace with your actual key
console.log('🔧 Simple Clerk init starting...');

// Initialize immediately when Clerk is available
function initClerk() {
  if (window.Clerk) {
    console.log('✅ Clerk found, initializing with key...');
    
    window.Clerk.load({
      publishableKey: CLERK_PUBLISHABLE_KEY
    }).then(() => {
      console.log('✅ Clerk initialized successfully!');
      window.clerkReady = true;
      window.dispatchEvent(new CustomEvent('clerk-ready'));
    }).catch(error => {
      console.error('❌ Clerk init error:', error);
      alert('Authentication failed: ' + error.message);
    });
  } else {
    // Try again in 100ms
    setTimeout(initClerk, 100);
  }
}

// Start trying to initialize
initClerk();
