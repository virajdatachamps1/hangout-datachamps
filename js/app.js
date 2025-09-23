class DataChampsApp {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.userData = null;
    this.isInitialized = false;
    this.appData = {
      tasks: null,
      kudos: null,
      celebrations: null,
      training: null,
      stats: null,
      teamMembers: []
    };

    console.log('📱 DataChampsApp created for page:', this.currentPage);

    // Wait for authentication
    document.addEventListener('user-authenticated', () => {
      console.log('✅ User authenticated event received');
      if (!this.isInitialized) {
        this.init();
      }
    });

    // Fallback: Check if already authenticated after a delay
    setTimeout(() => {
      if (window.auth && window.auth.isAuthenticated() && !this.isInitialized) {
        console.log('✅ User already authenticated (fallback check)');
        this.init();
      } else if (!window.auth) {
        console.error('❌ Auth manager not found');
      } else if (!window.auth.isAuthenticated()) {
        console.log('⏳ User not yet authenticated, waiting...');
      }
    }, 2000);
  }

  async init() {
    if (this.isInitialized) {
      console.log('⚠️ App already initialized, skipping...');
      return;
    }

    this.isInitialized = true;
    console.log('🚀 Initializing DataChamps App for page:', this.currentPage);

    // Load team members first (needed for dropdowns)
    await this.loadTeamMembers();
    
    this.setupEventListeners();
    await this.loadUserData();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path.includes('index.html') || path === '') {
      return 'index';
    }
    return path.split('/').pop().replace('.html', '') || 'index';
  }

  async loadTeamMembers() {
    try {
      console.log('Loading team members...');
      const members = await window.api.getTeamMembers();
      this.appData.teamMembers = members || [];
      console.log('Team members loaded:', this.appData.teamMembers);
    } catch (error) {
      console.error('Failed to load team members:', error);
      this.appData.teamMembers = [];
    }
  }

  async loadUserData() {
    try {
      console.log('Loading user data...');

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
      
      // Load celebrations
      const celebrations = await window.api.getTodayCelebrations();
      console.log('Today celebrations:', celebrations);
      this.displayTodayCelebrations(celebrations);

      // Load notifications
      await this.loadNotifications();
      
      // Load task stats
      await this.updateDashboardStats();
      
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }

  async updateDashboardStats() {
    try {
      const userEmail = window.auth.getUserEmail();
      const tasks = await window.api.getTasks(userEmail);
      
      // Calculate real stats
      const stats = {
        pending: (tasks.todo?.length || 0) + (tasks.inProgress?.length || 0),
        completed: tasks.completed?.length || 0,
        overdue: 0
      };

      // Count overdue tasks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      [...(tasks.todo || []), ...(tasks.inProgress || [])].forEach(task => {
        const dueDate = new Date(task.dueDate);
        if (dueDate < today) {
          stats.overdue++;
        }
      });

      // Update UI
      const pendingEl = document.getElementById('pendingTasksCount');
      if (pendingEl) pendingEl.textContent = stats.pending;
      
      const overdueEl = document.getElementById('overdueCount');
      if (overdueEl) overdueEl.textContent = stats.overdue;
      
    } catch (error) {
      console.error('Failed to update dashboard stats:', error);
    }
  }

  async loadNotifications() {
    try {
      const userEmail = window.auth.getUserEmail();
      const notifications = [];

      // Get today's celebrations for notifications
      const celebrations = await window.api.getTodayCelebrations();
      
      if (celebrations.birthdays?.length > 0) {
        celebrations.birthdays.forEach(b => {
          notifications.push({
            type: 'birthday',
            message: `🎂 ${b.name}'s birthday today!`,
            time: new Date().toISOString()
          });
        });
      }

      if (celebrations.anniversaries?.length > 0) {
        celebrations.anniversaries.forEach(a => {
          notifications.push({
            type: 'anniversary',
            message: `🏆 ${a.name} - ${a.years} years with DataChamps!`,
            time: new Date().toISOString()
          });
        });
      }

      // Get recent tasks assigned to user
      const tasks = await window.api.getTasks(userEmail);
      const recentTasks = [...(tasks.todo || []), ...(tasks.inProgress || [])]
        .filter(t => {
          const createdDate = new Date(t.createdAt);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return createdDate > dayAgo && t.assignedBy !== userEmail;
        })
        .slice(0, 3);

      recentTasks.forEach(task => {
        notifications.push({
          type: 'task',
          message: `📋 New task: ${task.title}`,
          time: task.createdAt
        });
      });

      // Get recent kudos
      const kudos = await window.api.getKudos(userEmail);
      const recentKudos = (kudos.received || [])
        .filter(k => {
          const kudosDate = new Date(k.createdAt);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return kudosDate > dayAgo;
        })
        .slice(0, 3);

      recentKudos.forEach(k => {
        notifications.push({
          type: 'kudos',
          message: `❤️ Kudos from ${k.fromUser}`,
          time: k.createdAt
        });
      });

      // Store and display notifications
      this.appData.notifications = notifications;
      this.updateNotificationBadge(notifications.length);
      
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  updateNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
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
      
      const todayCelebrations = await window.api.getTodayCelebrations();
      console.log('Today celebrations:', todayCelebrations);
      
      this.displayTodayCelebrationCards(todayCelebrations);
      
      // Load upcoming celebrations (next 30 days)
      await this.loadUpcomingCelebrations();
      
    } catch (error) {
      console.error('Failed to load celebrations:', error);
    }
  }

  async loadUpcomingCelebrations() {
    try {
      const allCelebrations = await window.api.getCelebrations();
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);

      const upcoming = {
        birthdays: [],
        anniversaries: [],
        events: []
      };

      // Process birthdays and anniversaries
      ['birthdays', 'anniversaries'].forEach(type => {
        (allCelebrations[type] || []).forEach(item => {
          const itemDate = this.parseDateFlexible(item.date);
          if (!itemDate) return;

          // Check this year and next year
          const thisYear = new Date(today.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          const nextYear = new Date(today.getFullYear() + 1, itemDate.getMonth(), itemDate.getDate());

          let targetDate = null;
          let years = 0;

          if (thisYear > today && thisYear <= futureDate) {
            targetDate = thisYear;
            years = today.getFullYear() - itemDate.getFullYear();
          } else if (nextYear > today && nextYear <= futureDate) {
            targetDate = nextYear;
            years = (today.getFullYear() + 1) - itemDate.getFullYear();
          }

          if (targetDate) {
            upcoming[type].push({
              ...item,
              date: targetDate.toISOString().split('T')[0],
              years: type === 'anniversaries' ? years : undefined,
              daysUntil: Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))
            });
          }
        });
      });

      // Process events (exact date match)
      (allCelebrations.events || []).forEach(event => {
        const eventDate = this.parseDateFlexible(event.date);
        if (eventDate && eventDate > today && eventDate <= futureDate) {
          upcoming.events.push({
            ...event,
            daysUntil: Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
          });
        }
      });

      // Sort by days until
      Object.keys(upcoming).forEach(type => {
        upcoming[type].sort((a, b) => a.daysUntil - b.daysUntil);
      });

      this.displayUpcomingCelebrations(upcoming);
      
    } catch (error) {
      console.error('Failed to load upcoming celebrations:', error);
    }
  }

  parseDateFlexible(dateStr) {
    if (!dateStr) return null;
    
    try {
      // If already a Date object
      if (dateStr instanceof Date) return dateStr;

      // Try DD-MM-YYYY format
      if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
          }
        }
      }

      // Fallback to standard parsing
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return null;
    }
  }

  displayUpcomingCelebrations(upcoming) {
    // Birthdays
    const birthdaysList = document.getElementById('upcomingBirthdaysList');
    if (birthdaysList) {
      if (upcoming.birthdays.length > 0) {
        birthdaysList.innerHTML = upcoming.birthdays.map(b => `
          <div class="upcoming-item">
            <div class="upcoming-name">${b.name}</div>
            <div class="upcoming-date">${this.formatDate(b.date)} (${b.daysUntil} days)</div>
          </div>
        `).join('');
      } else {
        birthdaysList.innerHTML = '<div class="celebrations-none">No upcoming birthdays</div>';
      }
    }

    // Anniversaries
    const anniversariesList = document.getElementById('upcomingAnniversariesList');
    if (anniversariesList) {
      if (upcoming.anniversaries.length > 0) {
        anniversariesList.innerHTML = upcoming.anniversaries.map(a => `
          <div class="upcoming-item">
            <div class="upcoming-name">${a.name}</div>
            <div class="upcoming-date">${a.years} years - ${this.formatDate(a.date)} (${a.daysUntil} days)</div>
          </div>
        `).join('');
      } else {
        anniversariesList.innerHTML = '<div class="celebrations-none">No upcoming anniversaries</div>';
      }
    }

    // Events
    const eventsList = document.getElementById('upcomingEventsList');
    if (eventsList) {
      if (upcoming.events.length > 0) {
        eventsList.innerHTML = upcoming.events.map(e => `
          <div class="upcoming-item">
            <div class="upcoming-name">${e.name}</div>
            <div class="upcoming-date">${this.formatDate(e.date)} (${e.daysUntil} days)</div>
          </div>
        `).join('');
      } else {
        eventsList.innerHTML = '<div class="celebrations-none">No upcoming events</div>';
      }
    }
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  // TASKS PAGE
  async loadTasksData() {
    try {
      console.log('Loading tasks data...');
      const userEmail = window.auth.getUserEmail();
      const tasks = await window.api.getTasks(userEmail);
      console.log('Tasks loaded:', tasks);
      
      this.appData.tasks = tasks;
      this.displayTasks(tasks);
      this.updateTaskStats(tasks);
      
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }

  updateTaskStats(tasks) {
    const stats = {
      total: 0,
      active: 0,
      completed: 0,
      overdue: 0
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count tasks
    stats.total = (tasks.todo?.length || 0) + (tasks.inProgress?.length || 0) + (tasks.completed?.length || 0);
    stats.active = (tasks.todo?.length || 0) + (tasks.inProgress?.length || 0);
    stats.completed = tasks.completed?.length || 0;

    // Count overdue
    [...(tasks.todo || []), ...(tasks.inProgress || [])].forEach(task => {
      const dueDate = new Date(task.dueDate);
      if (dueDate < today) {
        stats.overdue++;
      }
    });

    // Update UI
    document.getElementById('totalTasksCount').textContent = stats.total;
    document.getElementById('activeTasksCount').textContent = stats.active;
    document.getElementById('completedTasksCount').textContent = stats.completed;
    document.getElementById('overdueTasksCount').textContent = stats.overdue;

    // Update column counts
    document.getElementById('todoCount').textContent = tasks.todo?.length || 0;
    document.getElementById('inProgressCount').textContent = tasks.inProgress?.length || 0;
    document.getElementById('completedCount').textContent = tasks.completed?.length || 0;
  }

  displayTasks(tasks) {
    // Display To Do tasks
    const todoContainer = document.getElementById('todoTasks');
    if (todoContainer) {
      if (tasks.todo && tasks.todo.length > 0) {
        todoContainer.innerHTML = tasks.todo.map(task => this.createTaskCard(task, 'todo')).join('');
      } else {
        todoContainer.innerHTML = '<div class="no-tasks">No tasks to do</div>';
      }
    }

    // Display In Progress tasks
    const inProgressContainer = document.getElementById('inProgressTasks');
    if (inProgressContainer) {
      if (tasks.inProgress && tasks.inProgress.length > 0) {
        inProgressContainer.innerHTML = tasks.inProgress.map(task => this.createTaskCard(task, 'inProgress')).join('');
      } else {
        inProgressContainer.innerHTML = '<div class="no-tasks">No tasks in progress</div>';
      }
    }

    // Display Completed tasks
    const completedContainer = document.getElementById('completedTasks');
    if (completedContainer) {
      if (tasks.completed && tasks.completed.length > 0) {
        completedContainer.innerHTML = tasks.completed.map(task => this.createTaskCard(task, 'completed')).join('');
      } else {
        completedContainer.innerHTML = '<div class="no-tasks">No completed tasks</div>';
      }
    }
  }

  createTaskCard(task, status) {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today && status !== 'completed';
    
    let buttons = '';
    if (status === 'todo') {
      buttons = `<button class="task-action" onclick="window.app.moveTaskStatus('${task.id}', 'In Progress')">Start</button>`;
    } else if (status === 'inProgress') {
      buttons = `<button class="task-action complete" onclick="window.app.moveTaskStatus('${task.id}', 'Completed')">Complete</button>`;
    } else if (status === 'completed') {
      buttons = `<button class="task-action" onclick="window.app.moveTaskStatus('${task.id}', 'To Do')">Restart</button>`;
    }

    return `
      <div class="task-card ${status === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-card-title ${status === 'completed' ? 'completed' : ''}">${task.title}</div>
        ${task.description ? `<div class="task-card-description">${task.description}</div>` : ''}
        <div class="task-card-meta">
          ${isOverdue ? '<span style="color: #ef4444;">⚠️ Overdue</span> | ' : ''}
          Due: ${dueDate.toLocaleDateString()}
          ${task.assignedBy && task.assignedBy !== window.auth.getUserEmail() ? ` | Assigned by: ${task.assignedBy}` : ''}
        </div>
        <div class="task-card-actions">
          ${buttons}
        </div>
      </div>
    `;
  }

  async moveTaskStatus(taskId, newStatus) {
    try {
      await window.api.moveTask(taskId, newStatus);
      window.api.showSuccessNotification('Task updated successfully!');
      await this.loadTasksData(); // Reload tasks
    } catch (error) {
      console.error('Failed to move task:', error);
      window.api.showErrorNotification('Failed to update task');
    }
  }

  // KUDOS PAGE
  async loadKudosData() {
    try {
      console.log('Loading kudos data...');
      const userEmail = window.auth.getUserEmail();
      const kudos = await window.api.getKudos(userEmail);
      console.log('Kudos loaded:', kudos);
      
      this.displayKudos(kudos);
      this.populateKudosDropdown();
      
    } catch (error) {
      console.error('Failed to load kudos:', error);
    }
  }

  displayKudos(kudos) {
    // Display received kudos
    const receivedContainer = document.getElementById('receivedKudos');
    if (receivedContainer) {
      if (kudos.received && kudos.received.length > 0) {
        receivedContainer.innerHTML = kudos.received.slice(0, 10).map(k => `
          <div class="kudos-item">
            <div class="kudos-from">From: ${k.fromUser}</div>
            <div class="kudos-message">"${k.message}"</div>
            <div class="kudos-time">${new Date(k.createdAt).toLocaleDateString()}</div>
          </div>
        `).join('');
      } else {
        receivedContainer.innerHTML = '<div class="no-kudos">No kudos received yet</div>';
      }
    }

    // Display sent kudos
    const sentContainer = document.getElementById('sentKudos');
    if (sentContainer) {
      if (kudos.sent && kudos.sent.length > 0) {
        sentContainer.innerHTML = kudos.sent.slice(0, 10).map(k => `
          <div class="kudos-item">
            <div class="kudos-from">To: ${k.toUser}</div>
            <div class="kudos-message">"${k.message}"</div>
            <div class="kudos-time">${new Date(k.createdAt).toLocaleDateString()}</div>
          </div>
        `).join('');
      } else {
        sentContainer.innerHTML = '<div class="no-kudos">No kudos sent yet</div>';
      }
    }

    // Update stats
    document.getElementById('totalReceived').textContent = kudos.received?.length || 0;
    document.getElementById('totalSent').textContent = kudos.sent?.length || 0;
    
    const thisMonth = kudos.received?.filter(k => {
      const date = new Date(k.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length || 0;
    document.getElementById('thisMonth').textContent = thisMonth;
  }

  populateKudosDropdown() {
    const dropdown = document.getElementById('kudosTo');
    if (dropdown && this.appData.teamMembers) {
      const currentUser = window.auth.getUserEmail();
      const options = this.appData.teamMembers
        .filter(member => member.email !== currentUser)
        .map(member => `<option value="${member.email}">${member.name} (${member.email})</option>`)
        .join('');
      dropdown.innerHTML = '<option value="">Select a team member</option>' + options;
    }
  }

  // TRAINING PAGE
  async loadTrainingData() {
    console.log('Loading training data - not implemented yet');
  }

  setupEventListeners() {
    console.log('Setting up event listeners');

    // Task form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleTaskSubmit(e);
      });
    }

    // Add Task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        this.showTaskModal();
      });
    }

    // Kudos form submission
    const kudosForm = document.getElementById('kudosForm');
    if (kudosForm) {
      kudosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleKudosSubmit(e);
      });
    }

    // Populate task assignment dropdown
    this.populateTaskAssignmentDropdown();

    // Notification button
    const notifBtn = document.getElementById('notificationBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => this.showNotifications());
    }
  }

  showTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
      modal.style.display = 'flex';
      this.populateTaskAssignmentDropdown();
    }
  }

  populateTaskAssignmentDropdown() {
    const dropdown = document.getElementById('taskAssignTo');
    if (dropdown && this.appData.teamMembers) {
      const currentUser = window.auth.getUserEmail();
      const options = this.appData.teamMembers
        .map(member => {
          const label = member.email === currentUser ? 'Myself' : `${member.name} (${member.email})`;
          return `<option value="${member.email}">${label}</option>`;
        })
        .join('');
      dropdown.innerHTML = '<option value="">Select assignee</option>' + options;
    }
  }

  async handleTaskSubmit(e) {
    const formData = new FormData(e.target);
    const currentUser = window.auth.getUserEmail();
    
    const taskData = {
      title: formData.get('title'),
      description: formData.get('description'),
      dueDate: formData.get('dueDate'),
      assignedTo: formData.get('assignedTo') || currentUser,
      assignedBy: currentUser,
      status: 'To Do',
      createdAt: new Date().toISOString()
    };

    try {
      await window.api.createTask(taskData);
      window.api.showSuccessNotification('Task created successfully!');
      
      // Close modal
      document.getElementById('taskModal').style.display = 'none';
      e.target.reset();
      
      // Reload tasks
      await this.loadTasksData();
      
    } catch (error) {
      console.error('Failed to create task:', error);
      window.api.showErrorNotification('Failed to create task');
    }
  }

  async handleKudosSubmit(e) {
    const formData = new FormData(e.target);
    const currentUser = window.auth.getUserEmail();
    
    const kudosData = {
      fromUser: currentUser,
      toUser: formData.get('toUser'),
      message: formData.get('message'),
      category: formData.get('category'),
      createdAt: new Date().toISOString()
    };

    try {
      await window.api.sendKudos(kudosData);
      window.api.showSuccessNotification('Kudos sent successfully!');
      
      // Reset form
      e.target.reset();
      
      // Reload kudos
      await this.loadKudosData();
      
    } catch (error) {
      console.error('Failed to send kudos:', error);
      window.api.showErrorNotification('Failed to send kudos');
    }
  }

  showNotifications() {
    const notifications = this.appData.notifications || [];
    
    if (notifications.length === 0) {
      window.api.showSuccessNotification('No new notifications');
      return;
    }

    // Create notification panel
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.innerHTML = `
      <div class="notification-panel-header">
        <h3>Notifications</h3>
        <button onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-panel-body">
        ${notifications.map(n => `
          <div class="notification-panel-item ${n.type}">
            <div class="notification-message">${n.message}</div>
            <div class="notification-time">${this.formatNotificationTime(n.time)}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Remove existing panel if any
    const existing = document.querySelector('.notification-panel');
    if (existing) existing.remove();

    document.body.appendChild(panel);
  }

  formatNotificationTime(timeStr) {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, creating app instance...');
  window.app = new DataChampsApp();
});
