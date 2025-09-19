// Main Application Class
class DataChampsApp {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.userData = null;
    this.appData = {
      tasks: null,
      kudos: null,
      celebrations: null,
      training: null,
      stats: null
    };

    // Wait for user authentication
    document.addEventListener('user-authenticated', () => {
      console.log('User authenticated, initializing app...');
      this.init();
    });

    // If user is already authenticated, init immediately
    setTimeout(() => {
      if (window.auth && window.auth.isAuthenticated()) {
        console.log('User already authenticated, initializing app...');
        this.init();
      }
    }, 1000);
  }

  async init() {
    console.log('Initializing DataChamps App for page:', this.currentPage);

    this.setupEventListeners();

    // Load user data
    await this.loadUserData();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path.includes('index.html') || path === '') {
      return 'index';
    }
    return path.split('/').pop().replace('.html', '') || 'index';
  }

  async loadUserData() {
    try {
      console.log('Loading user data...');

      // Load page-specific data
      switch (this.currentPage) {
        case 'index':
          await this.loadDashboardData();
          break;
        case 'tasks':
          await this.loadTasksData();
          break;
        case 'kudos':
          await this.loadKudosData();
          break;
        case 'celebrations':
          await this.loadCelebrationsData();
          break;
        case 'training':
          await this.loadTrainingData();
          break;
      }

      console.log('User data loaded successfully');
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  async loadDashboardData() {
    try {
      console.log('Loading dashboard data...');

      // Load today's celebrations
      try {
        const celebrations = await window.api.getTodayCelebrations();
        console.log('Today celebrations:', celebrations);
        this.displayTodayCelebrations(celebrations);
      } catch (error) {
        console.error('Failed to load celebrations:', error);
      }

      // Load dashboard stats
      try {
        const stats = await window.api.getDashboardStats();
        console.log('Dashboard stats:', stats);
        this.updateDashboardStats(stats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }

      // Load recent activity
      try {
        const activity = await window.api.getRecentActivity(5);
        console.log('Recent activity:', activity);
        this.displayRecentActivity(activity);
      } catch (error) {
        console.error('Failed to load activity:', error);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  displayTodayCelebrations(celebrations) {
    console.log('Displaying celebrations:', celebrations);

    // Display birthdays
    const birthdaysContainer = document.getElementById('todayBirthdays');
    if (birthdaysContainer) {
      if (celebrations && celebrations.birthdays && celebrations.birthdays.length > 0) {
        const birthdaysList = celebrations.birthdays.map(b =>
          `<div class="celebration-item">${b.name}</div>`
        ).join('');
        birthdaysContainer.innerHTML = birthdaysList;
      } else {
        birthdaysContainer.innerHTML = '<div class="celebrations-none">No birthdays today</div>';
      }
    }

    // Display anniversaries
    const anniversariesContainer = document.getElementById('todayAnniversaries');
    if (anniversariesContainer) {
      if (celebrations && celebrations.anniversaries && celebrations.anniversaries.length > 0) {
        const anniversariesList = celebrations.anniversaries.map(a =>
          `<div class="celebration-item">${a.name} - ${a.years} years</div>`
        ).join('');
        anniversariesContainer.innerHTML = anniversariesList;
      } else {
        anniversariesContainer.innerHTML = '<div class="celebrations-none">No anniversaries today</div>';
      }
    }
  }

  showTaskModal() {
    console.log('Showing task modal');

    // Create modal if it doesn't exist
    if (!document.getElementById('taskModal')) {
      const modalHTML = `
        <div id="taskModal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Add New Task</h2>
              <button class="modal-close" onclick="window.app.hideTaskModal()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <form id="taskForm">
                <div class="form-group">
                  <label for="taskTitle">Task Title *</label>
                  <input type="text" id="taskTitle" name="title" required>
                </div>
                
                <div class="form-group">
                  <label for="taskDescription">Description</label>
                  <textarea id="taskDescription" name="description" rows="3"></textarea>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="taskDueDate">Due Date *</label>
                    <input type="date" id="taskDueDate" name="dueDate" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="taskAssignTo">Assign To</label>
                    <select id="taskAssignTo" name="assignedTo">
                      <option value="">Myself</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" onclick="window.app.hideTaskModal()">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // Setup form handler
      document.getElementById('taskForm').addEventListener('submit', (e) => {
        this.handleTaskSubmit(e);
      });
    }

    const modal = document.getElementById('taskModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  hideTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
      modal.style.display = 'none';
      document.getElementById('taskForm').reset();
    }
  }

  // Placeholder for other existing methods not modified
  setupEventListeners() {}
  async loadTasksData() {}
  async loadKudosData() {}
  async loadCelebrationsData() {}
  async loadTrainingData() {}
  updateDashboardStats() {}
  displayRecentActivity() {}
  handleTaskSubmit() {}
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, creating app instance...');
  window.app = new DataChampsApp();
});
