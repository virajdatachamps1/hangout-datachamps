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

    // Wait for authentication to complete
    document.addEventListener('user-authenticated', () => {
      console.log('✅ User authenticated event received, initializing app...');
      this.init();
    });

    // Check if already authenticated (in case event already fired)
    setTimeout(() => {
      if (window.auth && window.auth.isAuthenticated()) {
        console.log('✅ User already authenticated, initializing app...');
        this.init();
      }
    }, 1500); // Increased delay to ensure auth completes
  }

  // ... rest of the code stays the same

  async init() {
    console.log('Initializing DataChamps App for page:', this.currentPage);
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
      const celebrations = await window.api.getTodayCelebrations();
      console.log('Today celebrations:', celebrations);
      this.displayTodayCelebrations(celebrations);
    } catch (error) {
      console.error('Failed to load celebrations:', error);
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

  // TASKS PAGE
  async loadTasksData() {
    try {
      console.log('Loading tasks data...');
      const tasks = await window.api.getTasks(this.currentUser.email);
      console.log('Tasks loaded:', tasks);
      this.displayTasks(tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }

  displayTasks(tasks) {
    console.log('Displaying tasks:', tasks);
    // Simple task display - can be enhanced later
    if (tasks) {
      console.log('Tasks data received:', tasks);
    }
  }

  // KUDOS PAGE
  async loadKudosData() {
    try {
      console.log('Loading kudos data...');
      const kudos = await window.api.getKudos();
      console.log('Kudos loaded:', kudos);
    } catch (error) {
      console.error('Failed to load kudos:', error);
    }
  }

  // TRAINING PAGE
  async loadTrainingData() {
    console.log('Loading training data - not implemented yet');
  }

  setupEventListeners() {
    console.log('Setting up event listeners');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, creating app instance...');
  window.app = new DataChampsApp();
});

