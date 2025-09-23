// Add these COMPLETE functions to your app.js

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

setupEventListeners() {
  // Add task button
  const addTaskBtn = document.getElementById('addTaskBtn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => this.showTaskModal());
  }
}
