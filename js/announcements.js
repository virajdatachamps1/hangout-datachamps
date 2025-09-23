// announcements.js - Handles all announcement functionality

// ⚠️ CONFIGURE AUTHORIZED USERS HERE ⚠️
const AUTHORIZED_ANNOUNCEMENT_CREATORS = [
  'admin@datachamps.ai',
  'hr@datachamps.ai',
  'management@datachamps.ai',
  // 👆 ADD MORE EMAILS HERE WHO CAN CREATE ANNOUNCEMENTS
];

class AnnouncementsManager {
  constructor() {
    this.currentUser = null;
    this.announcements = [];
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    // Wait for user authentication
    document.addEventListener('user-authenticated', () => {
      this.currentUser = window.auth ? window.auth.getUserEmail() : null;
      this.checkPermissions();
      this.loadAnnouncements();
      this.setupEventListeners();
    });

    // Fallback check
    setTimeout(() => {
      if (window.auth && window.auth.isAuthenticated()) {
        this.currentUser = window.auth.getUserEmail();
        this.checkPermissions();
        this.loadAnnouncements();
        this.setupEventListeners();
      }
    }, 1000);
  }

  checkPermissions() {
    const canCreate = AUTHORIZED_ANNOUNCEMENT_CREATORS.includes(this.currentUser);
    const newBtn = document.getElementById('newAnnouncementBtn');
    
    if (newBtn) {
      newBtn.style.display = canCreate ? 'inline-flex' : 'none';
    }

    console.log('Announcement permissions:', { user: this.currentUser, canCreate });
  }

  async loadAnnouncements() {
    try {
      // Try to load from API
      const data = await window.api.getAnnouncements();
      this.announcements = data || this.getSampleAnnouncements();
    } catch (error) {
      console.log('Using sample announcements:', error);
      this.announcements = this.getSampleAnnouncements();
    }

    this.displayAnnouncements();
    this.displayPinnedAnnouncements();
  }

  getSampleAnnouncements() {
    return [
      {
        id: 1,
        title: 'Q3 Company All-Hands Meeting',
        content: 'Join us for our quarterly all-hands meeting on Friday, September 22nd at 2:00 PM. We\'ll be discussing Q3 results, upcoming initiatives, and celebrating team achievements.',
        category: 'events',
        author: 'Sarah Johnson',
        authorEmail: 'sarah@datachamps.ai',
        date: new Date().toISOString(),
        priority: 'high',
        pinned: false,
        likes: 24,
        comments: 8
      },
      {
        id: 2,
        title: 'New Remote Work Policy Updates',
        content: 'We\'ve updated our remote work policy to provide more flexibility. The new policy allows for up to 3 days of remote work per week. Please review the updated guidelines in the employee handbook.',
        category: 'policy',
        author: 'HR Team',
        authorEmail: 'hr@datachamps.ai',
        date: new Date(Date.now() - 86400000).toISOString(),
        priority: 'urgent',
        pinned: true,
        likes: 45,
        comments: 15
      },
      {
        id: 3,
        title: 'DataChamps Celebrates 5th Anniversary!',
        content: 'This month marks DataChamps\' 5th anniversary! Thank you to all team members for your dedication and hard work. Join us for the celebration party on September 30th.',
        category: 'general',
        author: 'Management Team',
        authorEmail: 'management@datachamps.ai',
        date: new Date(Date.now() - 172800000).toISOString(),
        priority: 'normal',
        pinned: false,
        likes: 67,
        comments: 22
      }
    ];
  }

  displayAnnouncements() {
    const container = document.getElementById('announcementsList');
    if (!container) return;

    const filtered = this.currentFilter === 'all' 
      ? this.announcements 
      : this.announcements.filter(a => a.category === this.currentFilter);

    if (filtered.length === 0) {
      container.innerHTML = '<div class="no-activity">No announcements found</div>';
      return;
    }

    const html = filtered.map(announcement => `
      <div class="announcement-card ${announcement.priority}" data-category="${announcement.category}">
        <div class="announcement-header">
          <div class="announcement-title-section">
            <h3 class="announcement-title">${announcement.title}</h3>
            <div class="announcement-meta">
              <span class="announcement-author">by ${announcement.author}</span>
              <span class="announcement-date">${this.formatDate(announcement.date)}</span>
              <span class="announcement-category category-${announcement.category}">${announcement.category}</span>
              ${announcement.priority === 'urgent' ? '<span class="priority-badge urgent">Urgent</span>' : ''}
              ${announcement.pinned ? '<i class="fas fa-thumbtack pinned-icon"></i>' : ''}
            </div>
          </div>
        </div>
        <div class="announcement-content">
          <p>${announcement.content}</p>
        </div>
        <div class="announcement-actions">
          <button class="action-button" onclick="announcementManager.toggleLike(${announcement.id})">
            <i class="fas fa-heart"></i> ${announcement.likes}
          </button>
          <button class="action-button" onclick="announcementManager.showComments(${announcement.id})">
            <i class="fas fa-comment"></i> ${announcement.comments}
          </button>
          <button class="action-button" onclick="announcementManager.shareAnnouncement(${announcement.id})">
            <i class="fas fa-share"></i> Share
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  displayPinnedAnnouncements() {
    const pinned = this.announcements.filter(a => a.pinned);
    const widget = document.getElementById('pinnedWidget');
    const container = document.getElementById('pinnedAnnouncements');

    if (!container || !widget) return;

    if (pinned.length === 0) {
      widget.style.display = 'none';
      return;
    }

    widget.style.display = 'block';

    const html = pinned.map(announcement => `
      <div class="pinned-announcement">
        <div class="pinned-content">
          <h4 class="pinned-title">${announcement.title}</h4>
          <p class="pinned-excerpt">${announcement.content.substring(0, 120)}...</p>
          <div class="pinned-date">${this.formatDate(announcement.date)}</div>
        </div>
        <div class="pinned-icon">
          <i class="fas fa-thumbtack"></i>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  setupEventListeners() {
    // Filter tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.getAttribute('data-filter');
        this.displayAnnouncements();
      });
    });

    // New announcement button
    const newBtn = document.getElementById('newAnnouncementBtn');
    if (newBtn) {
      newBtn.addEventListener('click', () => this.openAnnouncementModal());
    }

    // Form submission
    const form = document.getElementById('announcementForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  }

  openAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = {
      title: document.getElementById('announcementTitle').value,
      category: document.getElementById('announcementCategory').value,
      priority: document.getElementById('announcementPriority').value,
      content: document.getElementById('announcementContent').value,
      pinned: document.getElementById('announcementPinned').checked,
      author: window.auth.getUserName() || 'Team Member',
      authorEmail: this.currentUser,
      date: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    try {
      // Try to save to backend
      const result = await window.api.createAnnouncement(formData);
      
      // Show success notification
      this.showNotification('Announcement posted successfully!', 'success');
      
      // Send notification to all users
      this.sendAnnouncementNotification(formData);
      
      // Reload announcements
      await this.loadAnnouncements();
      
    } catch (error) {
      console.error('Error creating announcement:', error);
      
      // Fallback: Add to local array
      formData.id = Date.now();
      this.announcements.unshift(formData);
      this.displayAnnouncements();
      this.showNotification('Announcement posted (local only)', 'success');
    }

    this.closeAnnouncementModal();
    e.target.reset();
  }

  sendAnnouncementNotification(announcement) {
    // Create notification for all users
    const notification = {
      type: 'announcement',
      title: 'New Announcement',
      message: announcement.title,
      priority: announcement.priority,
      timestamp: new Date().toISOString()
    };

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Announcement from DataChamps', {
        body: announcement.title,
        icon: '/assets/images/logo.png'
      });
    }

    // Show in-app notification
    this.showNotification(`📢 New announcement: ${announcement.title}`, 'info');
  }

  showNotification(message, type = 'info') {
    // Use existing notification system from API manager
    if (window.api) {
      if (type === 'success') {
        window.api.showSuccessNotification(message);
      } else {
        window.api.showErrorNotification(message);
      }
    } else {
      alert(message);
    }
  }

  closeAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  handleSearch(query) {
    const cards = document.querySelectorAll('.announcement-card');
    const searchLower = query.toLowerCase();

    cards.forEach(card => {
      const title = card.querySelector('.announcement-title').textContent.toLowerCase();
      const content = card.querySelector('.announcement-content').textContent.toLowerCase();
      
      if (title.includes(searchLower) || content.includes(searchLower)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  toggleLike(id) {
    const announcement = this.announcements.find(a => a.id === id);
    if (announcement) {
      announcement.likes++;
      this.displayAnnouncements();
      this.showNotification('Thank you for your feedback!', 'success');
    }
  }

  showComments(id) {
    this.showNotification('Comments feature coming soon!', 'info');
  }

  shareAnnouncement(id) {
    const announcement = this.announcements.find(a => a.id === id);
    if (announcement && navigator.share) {
      navigator.share({
        title: announcement.title,
        text: announcement.content,
      }).catch(err => console.log('Share failed:', err));
    } else {
      this.showNotification('Share feature coming soon!', 'info');
    }
  }
}

// Global functions for HTML onclick handlers
function closeAnnouncementModal() {
  if (window.announcementManager) {
    window.announcementManager.closeAnnouncementModal();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.announcementManager = new AnnouncementsManager();
});
