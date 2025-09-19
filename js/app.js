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
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setActiveNavigation();
    
    // Wait for authentication before loading data
    if (window.auth && window.auth.isAuthenticated()) {
      await this.loadUserData();
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path.includes('index.html') || path === '') {
      return 'index';
    }
    return path.split('/').pop().replace('.html', '') || 'index';
  }

  setActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      if (
        (this.currentPage === 'index' && (href === 'index.html' || href === '/')) ||
        href.includes(this.currentPage + '.html')
      ) {
        link.classList.add('active');
      }
    });
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
    }

    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', this.toggleSidebar);
    }

    // Task management (if on tasks page)
    if (this.currentPage === 'tasks') {
      document.addEventListener('click', this.handleTaskActions.bind(this));
      this.setupTaskForm();
    }

    // Kudos management (if on kudos page)
    if (this.currentPage === 'kudos') {
      this.setupKudosForm();
    }

    // Widget click handlers
    this.setupWidgetClicks();
  }

  async loadUserData() {
    try {
      // Load user profile
      this.userData = await window.api.getUserProfile();
      
      // Load page-specific data
      switch(this.currentPage) {
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
    } catch (error) {
      console.error('Failed to load user data:', error);
      window.api.handleError(error, 'loadUserData');
    }
  }

  async loadDashboardData() {
    try {
      // Load dashboard stats
      this.appData.stats = await window.api.getDashboardStats();
      this.updateDashboardStats();

      // Load today's celebrations
      this.appData.celebrations = await window.api.getTodayCelebrations();
      this.displayTodayCelebrations();

      // Load recent activity
      const recentActivity = await window.api.getRecentActivity(5);
      this.displayRecentActivity(recentActivity);

      // Load recent kudos
      const recentKudos = await window.api.getRecentKudos(3);
      this.displayRecentKudos(recentKudos);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  updateDashboardStats() {
    if (!this.appData.stats) return;

    const stats = this.appData.stats;
    
    this.updateStatCard('pendingTasksCount', stats.pendingTasks || 0);
    this.updateStatCard('coursesCount', stats.coursesInProgress || 0);
    this.updateStatCard('eventsCount', stats.upcomingEvents || 0);
    this.updateStatCard('overdueCount', stats.overdueItems || 0);
    this.updateStatCard('taskBadge', stats.pendingTasks || 0);
  }

  updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  displayTodayCelebrations() {
    if (!this.appData.celebrations) return;

    const { birthdays, anniversaries } = this.appData.celebrations;
    
    this.displayCelebrationsList('todayBirthdays', birthdays, 'birthday');
    this.displayCelebrationsList('todayAnniversaries', anniversaries, 'anniversary');
  }

  displayCelebrationsList(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
      container.innerHTML = '<div class="celebrations-none">None today</div>';
      return;
    }

    const listItems = items.map(item => {
      if (type === 'birthday') {
        return `<li class="celebration-item">
          <span class="celebration-name">${item.name}</span>
          <span class="celebration-dept">${item.department || ''}</span>
        </li>`;
      } else if (type === 'anniversary') {
        return `<li class="celebration-item">
          <span class="celebration-name">${item.name}</span>
          <span class="celebration-years">${item.years} years</span>
        </li>`;
      }
    }).join('');

    container.innerHTML = `<ul class="celebrations-list">${listItems}</ul>`;
  }

  displayRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    if (!container || !activities) return;

    if (activities.length === 0) {
      container.innerHTML = '<div class="no-activity">No recent activity</div>';
      return;
    }

    const activityHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = activityHTML;
  }

  displayRecentKudos(kudos) {
    const container = document.getElementById('recentKudos');
    if (!container) return;

    if (!kudos || kudos.length === 0) {
      container.innerHTML = '<div class="no-kudos">No recent kudos</div>';
      return;
    }

    const kudosHTML = kudos.map(kudo => `
      <div class="kudos-item">
        <div class="kudos-from">From: ${kudo.fromUser}</div>
        <div class="kudos-message">"${kudo.message}"</div>
        <div class="kudos-time">${this.formatTimeAgo(kudo.createdAt)}</div>
      </div>
    `).join('');

    container.innerHTML = kudosHTML;
  }

  async loadTasksData() {
    try {
      this.appData.tasks = await window.api.getTasks();
      this.renderTaskBoard();
    } catch (error) {
      console.error('Failed to load tasks:', error);
      window.api.handleError(error, 'loadTasksData');
    }
  }

  renderTaskBoard() {
    if (!this.appData.tasks) return;

    const { todo, inProgress, completed } = this.appData.tasks;
    
    this.renderTaskColumn('todo', todo || []);
    this.renderTaskColumn('inProgress', inProgress || []);
    this.renderTaskColumn('completed', completed || []);
  }

  renderTaskColumn(columnId, tasks) {
    const container = document.getElementById(columnId + 'Tasks');
    if (!container) return;

    const taskHTML = tasks.map(task => `
      <div class="task-card ${columnId === 'completed' ? 'completed' : ''}" 
           data-task-id="${task.id}" data-status="${columnId}">
        <div class="task-card-title">${task.title}</div>
        ${task.description ? `<div class="task-card-description">${task.description}</div>` : ''}
        <div class="task-card-meta">
          ${task.assignedBy !== 'Self' ? `Assigned by: ${task.assignedBy} • ` : ''}
          Due: ${this.formatDate(task.dueDate)}
        </div>
        <div class="task-card-actions">
          ${this.getTaskActions(columnId)}
        </div>
      </div>
    `).join('');

    container.innerHTML = taskHTML;
    
    // Update task count
    const countElement = document.getElementById(columnId + 'Count');
    if (countElement) {
      countElement.textContent = tasks.length;
    }
  }

  getTaskActions(status) {
    switch(status) {
      case 'todo':
        return `
          <button class="task-action btn-primary" data-action="start">Start</button>
          <button class="task-action btn-success" data-action="complete">Complete</button>
        `;
      case 'inProgress':
        return `
          <button class="task-action btn-secondary" data-action="todo">Move to Todo</button>
          <button class="task-action btn-success" data-action="complete">Complete</button>
        `;
      case 'completed':
        return `
          <button class="task-action btn-secondary" data-action="reopen">Reopen</button>
        `;
      default:
        return '';
    }
  }

  async handleTaskActions(event) {
    if (!event.target.classList.contains('task-action')) return;
    
    const action = event.target.getAttribute('data-action');
    const taskCard = event.target.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    const currentStatus = taskCard.getAttribute('data-status');
    
    await this.moveTask(taskId, currentStatus, action);
  }

  async moveTask(taskId, fromStatus, action) {
    try {
      // Determine target status
      let toStatus;
      switch(action) {
        case 'start':
          toStatus = 'inProgress';
          break;
        case 'complete':
          toStatus = 'completed';
          break;
        case 'todo':
          toStatus = 'todo';
          break;
        case 'reopen':
          toStatus = 'todo';
          break;
      }

      // Update task in backend
      await window.api.moveTask(taskId, toStatus);
      
      // Reload tasks data
      await this.loadTasksData();
      
      window.api.showSuccessNotification('Task moved successfully!');
      
    } catch (error) {
      console.error('Failed to move task:', error);
      window.api.handleError(error, 'moveTask');
    }
  }

  setupTaskForm() {
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', this.handleTaskSubmit.bind(this));
    }

    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', this.showTaskModal.bind(this));
    }
  }

  async handleTaskSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const taskData = {
      title: formData.get('title'),
      description: formData.get('description'),
      dueDate: formData.get('dueDate'),
      assignedTo: formData.get('assignedTo') || window.auth.getUserEmail(),
      status: 'todo'
    };

    try {
      await window.api.createTask(taskData);
      await this.loadTasksData();
      this.hideTaskModal();
      window.api.showSuccessNotification('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      window.api.handleError(error, 'createTask');
    }
  }

  async loadKudosData() {
    try {
      this.appData.kudos = await window.api.getKudos();
      this.renderKudos();
    } catch (error) {
      console.error('Failed to load kudos:', error);
      window.api.handleError(error, 'loadKudosData');
    }
  }

  setupKudosForm() {
    const kudosForm = document.getElementById('kudosForm');
    if (kudosForm) {
      kudosForm.addEventListener('submit', this.handleKudosSubmit.bind(this));
    }
  }

  async handleKudosSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const kudosData = {
      toUser: formData.get('toUser'),
      message: formData.get('message'),
      category: formData.get('category') || 'General'
    };

    try {
      await window.api.sendKudos(kudosData);
      await this.loadKudosData();
      event.target.reset();
      window.api.showSuccessNotification('Kudos sent successfully!');
    } catch (error) {
      console.error('Failed to send kudos:', error);
      window.api.handleError(error, 'sendKudos');
    }
  }

  async loadCelebrationsData() {
    try {
      this.appData.celebrations = await window.api.getCelebrations();
      this.renderCelebrations();
    } catch (error) {
      console.error('Failed to load celebrations:', error);
      window.api.handleError(error, 'loadCelebrationsData');
    }
  }

  async loadTrainingData() {
    try {
      this.appData.training = await window.api.getTraining();
      this.renderTraining();
    } catch (error) {
      console.error('Failed to load training:', error);
      window.api.handleError(error, 'loadTrainingData');
    }
  }

  setupWidgetClicks() {
    // Make celebration widgets clickable
    const celebrationWidgets = document.querySelectorAll('.widget');
    celebrationWidgets.forEach(widget => {
      const header = widget.querySelector('.widget-header h3');
      if (header && (header.textContent.includes('Birthday') || header.textContent.includes('Anniversary'))) {
        widget.style.cursor = 'pointer';
        widget.addEventListener('click', () => {
          window.location.href = 'celebrations.html';
        });
      }
    });
  }

  handleSearch(event) {
    const query = event.target.value.toLowerCase();
    // Implement search logic based on current page
    console.log('Searching for:', query);
    // TODO: Implement search functionality
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  }

  showTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  hideTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Utility functions
  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return time.toLocaleDateString();
  }

  getActivityIcon(type) {
    const icons = {
      task_completed: 'fas fa-check-circle',
      task_created: 'fas fa-plus-circle',
      kudos_sent: 'fas fa-heart',
      kudos_received: 'fas fa-star',
      training_completed: 'fas fa-graduation-cap',
      training_registered: 'fas fa-calendar-plus',
      login: 'fas fa-sign-in-alt',
      default: 'fas fa-info-circle'
    };
    
    return icons[type] || icons.default;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new DataChampsApp();
});
