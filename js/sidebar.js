// Reusable Sidebar Component
class SidebarComponent {
  constructor() {
    this.currentPage = this.getCurrentPage();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path.includes('index.html') || path === '' || path.endsWith('/')) {
      return 'index';
    }
    return path.split('/').pop().replace('.html', '') || 'index';
  }

  generateSidebarHTML() {
    return `
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">DC</span>
            <span class="logo-text">DataChamps</span>
          </div>
          <div class="user-info">
            <div class="user-avatar" id="userAvatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
              <div class="user-name" id="userName">Loading...</div>
              <div class="user-role">Team Member</div>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">Workspace</div>
            <a href="index.html" class="nav-link ${this.currentPage === 'index' ? 'active' : ''}">
              <i class="fas fa-home"></i>
              <span>Dashboard</span>
            </a>
            <a href="tasks.html" class="nav-link ${this.currentPage === 'tasks' ? 'active' : ''}">
              <i class="fas fa-tasks"></i>
              <span>My Tasks</span>
              <span class="nav-badge" id="taskBadge">5</span>
            </a>
            <a href="timesheets.html" class="nav-link ${this.currentPage === 'timesheets' ? 'active' : ''}">
              <i class="fas fa-clock"></i>
              <span>Timesheets</span>
            </a>
            <a href="celebrations.html" class="nav-link ${this.currentPage === 'celebrations' ? 'active' : ''}">
              <i class="fas fa-birthday-cake"></i>
              <span>Celebrations</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Learning & Development</div>
            <a href="training.html" class="nav-link ${this.currentPage === 'training' ? 'active' : ''}">
              <i class="fas fa-book"></i>
              <span>Training & Courses</span>
            </a>
            <a href="#" class="nav-link">
              <i class="fas fa-certificate"></i>
              <span>Assessments</span>
              <span class="nav-badge">2</span>
            </a>
            <a href="#" class="nav-link">
              <i class="fas fa-award"></i>
              <span>Certifications</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Team & Recognition</div>
            <a href="kudos.html" class="nav-link ${this.currentPage === 'kudos' ? 'active' : ''}">
              <i class="fas fa-heart"></i>
              <span>Give Kudos</span>
            </a>
            <a href="#" class="nav-link">
              <i class="fas fa-user-plus"></i>
              <span>Onboarding</span>
            </a>
            <a href="photos.html" class="nav-link ${this.currentPage === 'photos' ? 'active' : ''}">
              <i class="fas fa-images"></i>
              <span>Company Photos</span>
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Company</div>
            <a href="announcements.html" class="nav-link ${this.currentPage === 'announcements' ? 'active' : ''}">
              <i class="fas fa-bullhorn"></i>
              <span>Announcements</span>
            </a>
            <a href="sop.html" class="nav-link ${this.currentPage === 'sop' ? 'active' : ''}">
              <i class="fas fa-file-alt"></i>
              <span>SOPs & Policies</span>
            </a>
            <a href="#" class="nav-link">
              <i class="fas fa-building"></i>
              <span>Company Profile</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button class="btn btn-outline" id="logoutBtn">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    `;
  }

  render() {
    // Find the sidebar container and inject HTML
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = this.generateSidebarHTML();
      
      // Setup logout button event listener
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (window.auth) {
            window.auth.logout();
          }
        });
      }
    }
  }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = new SidebarComponent();
  sidebar.render();
});
