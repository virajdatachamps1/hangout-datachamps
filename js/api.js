
// Debug mode - set to false in production
const DEBUG_MODE = true;

function debugLog(...args) {
  if (DEBUG_MODE) {
    console.log('[API DEBUG]', ...args);
  }
}

// API Configuration
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbwh-dRlLIPAIs58APp08QSiH8Tj1jlnuGEcOSDoQtZL490bjEkzMlzf71WyAZGqFj34_w/exec';
const API_SECRET = 'datachamps_hangout_2025';

class APIManager {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.apiSecret = API_SECRET;
  }

  async makeRequest(action, data = {}, method = 'POST') {
    try {
      // Get user email - but don't require it for all requests
      const userEmail = window.auth ? window.auth.getUserEmail() : null;
      
      debugLog('Making request:', action, 'Method:', method, 'User:', userEmail);

      const requestData = {
        action,
        data,
        user: userEmail,
        apiSecret: this.apiSecret,
        timestamp: new Date().toISOString()
      };

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': this.apiSecret
        }
      };

      // For POST requests, add data to body
      if (method === 'POST') {
        options.body = JSON.stringify(requestData);
      }

      // For GET requests, add data to URL parameters
      let url = this.baseURL;
      if (method === 'GET') {
        const params = new URLSearchParams({
          action,
          data: JSON.stringify(data),
          user: userEmail || '',
          apiSecret: this.apiSecret,
          timestamp: new Date().toISOString()
        });
        url += `?${params.toString()}`;
      }

      debugLog('Request URL:', url);

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      debugLog('API response for', action, ':', result);
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data;
    } catch (error) {
      console.error(`API Error (${action}):`, error);
      this.handleError(error, action);
      throw error;
    }
  }

  // User Management
  async registerUser(userData) {
    return await this.makeRequest('registerUser', userData);
  }

  async getUser(email) {
    return await this.makeRequest('getUser', { email }, 'GET');
  }

  // Task Management
  async getTasks(userEmail = null) {
    return await this.makeRequest('getTasks', { userEmail: userEmail || window.auth.getUserEmail() }, 'GET');
  }

  async createTask(taskData) {
    return await this.makeRequest('createTask', {
      ...taskData,
      createdBy: window.auth.getUserEmail(),
      createdAt: new Date().toISOString()
    });
  }

  async updateTask(taskId, updates) {
    return await this.makeRequest('updateTask', {
      taskId,
      updates: {
        ...updates,
        updatedAt: new Date().toISOString()
      }
    });
  }

  async deleteTask(taskId) {
    return await this.makeRequest('deleteTask', { taskId });
  }

  async moveTask(taskId, newStatus) {
    return await this.updateTask(taskId, { status: newStatus });
  }

  // Kudos Management
  async getKudos(userEmail = null) {
    return await this.makeRequest('getKudos', { userEmail: userEmail || window.auth.getUserEmail() }, 'GET');
  }

  async sendKudos(kudosData) {
    return await this.makeRequest('sendKudos', {
      ...kudosData,
      fromUser: window.auth.getUserEmail(),
      createdAt: new Date().toISOString()
    });
  }

  async getRecentKudos(limit = 5) {
    return await this.makeRequest('getRecentKudos', { limit }, 'GET');
  }

  // Celebrations Management
  async getCelebrations() {
    return await this.makeRequest('getCelebrations', {}, 'GET');
  }

  async getTodayCelebrations() {
    const today = new Date().toISOString().split('T')[0];
    return await this.makeRequest('getCelebrationsForDate', { date: today }, 'GET');
  }

  async addCelebration(celebrationData) {
    return await this.makeRequest('addCelebration', celebrationData);
  }

  // Dashboard Data
  async getDashboardStats() {
    return await this.makeRequest('getDashboardStats', { userEmail: window.auth.getUserEmail() }, 'GET');
  }

  async getRecentActivity(limit = 10) {
    return await this.makeRequest('getRecentActivity', { 
      userEmail: window.auth.getUserEmail(),
      limit 
    }, 'GET');
  }

  // Team Management
  async getTeamMembers() {
    return await this.makeRequest('getTeamMembers', {}, 'GET');
  }

  async getUserProfile(email = null) {
    return await this.makeRequest('getUserProfile', { 
      email: email || window.auth.getUserEmail() 
    }, 'GET');
  }

  // Utility Methods
  async healthCheck() {
    try {
      const result = await this.makeRequest('healthCheck', {}, 'GET');
      console.log('Health check result:', result);
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Error handling helper
  handleError(error, action) {
    console.error(`API Error in ${action}:`, error);
    
    const errorMessage = this.getErrorMessage(error);
    this.showErrorNotification(errorMessage);
    
    return null;
  }

  getErrorMessage(error) {
    const message = error.message || error.toString();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'Session expired. Please log in again.';
    }
    
    if (message.includes('403') || message.includes('forbidden')) {
      return 'Access denied. You don\'t have permission for this action.';
    }

    if (message.includes('Invalid API secret')) {
      return 'Authentication error. Please refresh the page and try again.';
    }

    if (message.includes('Invalid email domain')) {
      return 'Access denied. Please use your @datachamps.ai email address.';
    }
    
    return message || 'An unexpected error occurred. Please try again.';
  }

  showErrorNotification(message) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.error-notification, .success-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  showSuccessNotification(message) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.error-notification, .success-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }

  // Test API connectivity
  async testConnection() {
    try {
      console.log('Testing API connection...');
      const result = await this.healthCheck();
      if (result) {
        this.showSuccessNotification('API connection successful!');
        return true;
      } else {
        this.showErrorNotification('API connection failed!');
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showErrorNotification('Failed to connect to API. Please check your configuration.');
      return false;
    }
  }
}

// Initialize API manager
window.api = new APIManager();

// Test connection when page loads (optional - for debugging)
document.addEventListener('DOMContentLoaded', () => {
  // Uncomment the line below to test API connection on page load
  // setTimeout(() => window.api.testConnection(), 2000);
});


