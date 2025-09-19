// Clerk Initialization - Load this before auth.js
const CLERK_PUBLISHABLE_KEY = 'pk_test_YOUR_CLERK_PUBLISHABLE_KEY_HERE'; // Replace with your actual key

// Initialize Clerk when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Wait for Clerk to be available
    if (typeof window.Clerk === 'undefined') {
      console.error('Clerk not loaded');
      return;
    }

    // Initialize Clerk with your publishable key
    await window.Clerk.load({
      publishableKey: CLERK_PUBLISHABLE_KEY,
    });

    console.log('Clerk initialized successfully');
    
    // Trigger custom event to let auth.js know Clerk is ready
    window.dispatchEvent(new Event('clerk-ready'));
    
  } catch (error) {
    console.error('Failed to initialize Clerk:', error);
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>Authentication service failed to load. Please refresh the page.</span>
        <button onclick="window.location.reload()">Refresh</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
});
