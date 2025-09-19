// Clerk Initialization - Load this before auth.js
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhvdGljLWFhcmR2YXJrLTI4LmNsZXJrLmFjY291bnRzLmRldiQ'; // Replace with your actual key

// Initialize Clerk immediately when this script loads
(async function initializeClerk() {
  console.log('Initializing Clerk with key:', CLERK_PUBLISHABLE_KEY.substring(0, 20) + '...');
  
  try {
    // Wait for Clerk to be available
    while (!window.Clerk) {
      console.log('Waiting for Clerk to load...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Clerk found, initializing...');
    
    // Initialize Clerk with the publishable key
    await window.Clerk.load({
      publishableKey: CLERK_PUBLISHABLE_KEY
    });
    
    console.log('✅ Clerk initialized successfully!');
    
    // Set a flag to indicate Clerk is ready
    window.clerkReady = true;
    
    // Dispatch event to notify other scripts
    window.dispatchEvent(new CustomEvent('clerk-initialized'));
    
  } catch (error) {
    console.error('❌ Failed to initialize Clerk:', error);
    
    // Show error to user
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5;">
        <div style="text-align: center; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px;">
          <h2 style="color: #e53e3e; margin-bottom: 15px;">Authentication Error</h2>
          <p style="color: #666; margin-bottom: 20px;">Failed to load authentication service.</p>
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Error: ${error.message}</p>
          <button onclick="window.location.reload()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
})();
