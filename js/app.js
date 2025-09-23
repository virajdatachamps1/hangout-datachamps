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

  // CELEBRATIONS PAGE
  async loadCelebrationsData() {
    try {
      console.log('Loading celebrations data...');
      
      // Load today's celebrations
      const todayCelebrations = await window.api.getTodayCelebrations();
      console.log('Today celebrations:', todayCelebrations);
      
      // Display in the 3 cards
      this.displayTodayCelebrationCards(todayCelebrations);
      
      // Load all celebrations for upcoming lists
      const allCelebrations = await window.api.getCelebrations();
      console.log('All celebrations:', allCelebrations);
      
      this.displayUpcomingCelebrations(allCelebrations);
      
    } catch (error) {
      console.error('Failed to load celebrations:', error);
    }
  }

  displayTodayCelebrationCards(celebrations) {
    // Today's Birthdays Card
    const birthdaysList = document.getElementById('todayBirthdaysList');
    if (birthdaysList) {
      if (celebrations && celebrations.birthdays && celebrations.birthdays.length > 0) {
        birthdaysList.innerHTML = celebrations.birthdays.map(b => `
          <div class="celebration-item">
            <div class="celebration-name">${b.name}</div>
            <div class="celebration-dept">${b.department || 'DataChamps'}</div>
          </div>
        `).join('');
      } else {
        birthdaysList.innerHTML = '<div class="celebrations-none">No birthdays today 🎂</div>';
      }
    }

    // Today's Anniversaries Card
    const anniversariesList = document.getElementById('todayAnniversariesList');
    if (anniversariesList) {
      if (celebrations && celebrations.anniversaries && celebrations.anniversaries.length > 0) {
        anniversariesList.innerHTML = celebrations.anniversaries.map(a => `
          <div class="celebration-item">
            <div class="celebration-name">${a.name}</div>
            <div class="celebration-years">${a.years} years with DataChamps!</div>
          </div>
        `).join('');
      } else {
        anniversariesList.innerHTML = '<div class="celebrations-none">No anniversaries today 🏆</div>';
      }
    }

    // Today's Events Card
    const eventsList = document.getElementById('todayEventsList');
    if (eventsList) {
      if (celebrations && celebrations.events && celebrations.events.length > 0) {
        eventsList.innerHTML = celebrations.events.map(e => `
          <div class="celebration-item">
            <div class="celebration-name">${e.name}</div>
          </div>
        `).join('');
      } else {
        eventsList.innerHTML = '<div class="celebrations-none">No special events today 🎉</div>';
      }
    }
  }

  displayUpcomingCelebrations(celebrations) {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Filter upcoming birthdays
    const upcomingBirthdays = document.getElementById('upcomingBirthdaysList');
    if (upcomingBirthdays && celebrations && celebrations.birthdays) {
      const upcoming = celebrations.birthdays
        .filter(b => {
          const bDate = new Date(b.date);
          return bDate > today && bDate <= next30Days;
        })
        .slice(0, 10);
      
      if (upcoming.length > 0) {
        upcomingBirthdays.innerHTML = upcoming.map(b => `
          <div class="celebration-item">
            <div>
              <div class="celebration-name">${b.name}</div>
              <div class="celebration-dept">${b.department || ''}</div>
            </div>
            <div class="celebration-date">${new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        `).join('');
      } else {
        upcomingBirthdays.innerHTML = '<div class="celebrations-none">No upcoming birthdays</div>';
      }
    }

    // Similar for anniversaries
    const upcomingAnniversaries = document.getElementById('upcomingAnniversariesList');
    if (upcomingAnniversaries && celebrations && celebrations.anniversaries) {
      const upcoming = celebrations.anniversaries
        .filter(a => {
          const aDate = new Date(a.date);
          return aDate > today && aDate <= next30Days;
        })
        .slice(0, 10);
      
      if (upcoming.length > 0) {
        upcomingAnniversaries.innerHTML = upcoming.map(a => `
          <div class="celebration-item">
            <div>
              <div class="celebration-name">${a.name}</div>
              <div class="celebration-years">${a.years} years</div>
            </div>
            <div class="celebration-date">${new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        `).join('');
      } else {
        upcomingAnniversaries.innerHTML = '<div class="celebrations-none">No upcoming anniversaries</div>';
      }
    }
  }

  // TASKS PAGE
  async loadTasksData() {
    try {
      console.log('Loading tasks data...');
      const tasks = await window.api.getTasks();
      console.log('Tasks loaded:', tasks);
      
      // Display tasks in columns
      this.displayTasks(tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }

  displayTasks(tasks) {
    const todoList = document.getElementById('todoTasks');
    const inProgressList = document.getElementById('inProgressTasks');
    const completedList = document.getElementById('completedTasks');

    if (!tasks || tasks.length === 0) {
      if (todoList) todoList.innerHTML = '<div class="no-tasks">No tasks yet</div>';
      if (inProgressList) inProgressList.innerHTML = '<div class="no-tasks">No tasks in progress</div>';
      if (completedList) completedList.innerHTML = '<div class="no-tasks">No completed tasks</div>';
      return;
    }

    const todo = tasks.filter(t => t.status === 'To Do');
    const inProgress = tasks.filter(t => t.status === 'In Progress');
    const completed = tasks.filter(t => t.status === 'Completed');

    if (todoList) {
      todoList.innerHTML = todo.length > 0 ? todo.map(t => this.createTaskCard(t)).join('') : '<div class="no-tasks">No tasks</div>';
    }
    if (inProgressList) {
      inProgressList.innerHTML = inProgress.length > 0 ? inProgress.map(t => this.createTaskCard(t)).join('') : '<div class="no-tasks">No tasks</div>';
    }
    if (completedList) {
      completedList.innerHTML = completed.length > 0 ? completed.map(t => this.createTaskCard(t)).join('') : '<div class="no-tasks">No tasks</div>';
    }
  }

  createTaskCard(task) {
    return `
      <div class="task-card">
        <div class="task-card-title">${task.title}</div>
        <div class="task-card-description">${task.description || ''}</div>
        <div class="task-card-meta">Due: ${new Date(task.dueDate).toLocaleDateString()}</div>
      </div>
    `;
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

  async handleTaskSubmit(e) {
    e.preventDefault();
    // Task creation logic here
    console.log('Task submitted');
  }

  // KUDOS PAGE
  async loadKudosData() {
    try {
      console.log('Loading kudos data...');
      const kudos = await window.api.getKudos();
      console.log('Kudos loaded:', kudos);
      
      // Display kudos
      this.displayKudos(kudos);
    } catch (error) {
      console.error('Failed to load kudos:', error);
    }
  }

  displayKudos(kudos) {
    // Implement kudos display logic
    console.log('Displaying kudos:', kudos);
  }

  // TRAINING PAGE
  async loadTrainingData() {
    console.log('Loading training data - not implemented yet');
  }

  // DASHBOARD STATS
  updateDashboardStats(stats) {
    if (!stats) return;
    
    const elements = {
      pendingTasksCount: stats.pendingTasks,
      coursesCount: stats.coursesInProgress,
      eventsCount: stats.upcomingEvents,
      overdueCount: stats.overdueItems
    };

    Object.keys(elements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = elements[id] || 0;
      }
    });
  }

  displayRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    if (!container || !activities) return;

    if (activities.length === 0) {
      container.innerHTML = '<div class="no-activity">No recent activity</div>';
      return;
    }

    container.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="fas fa-${activity.icon || 'info-circle'}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Add task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.showTaskModal());
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, creating app instance...');
  window.app = new DataChampsApp();
});
