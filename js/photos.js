// photos.js - Handles all photo gallery functionality

// ⚠️ CONFIGURE AUTHORIZED USERS HERE ⚠️
const AUTHORIZED_PHOTO_UPLOADERS = [
  'admin@datachamps.ai',
  'hr@datachamps.ai',
  'social@datachamps.ai',
  // 👆 ADD MORE EMAILS HERE WHO CAN UPLOAD PHOTOS
];

class PhotoGalleryManager {
  constructor() {
    this.currentUser = null;
    this.photos = [];
    this.currentFilter = 'all';
    this.currentPhotoIndex = 0;
    this.init();
  }

  init() {
    // Wait for user authentication
    document.addEventListener('user-authenticated', () => {
      this.currentUser = window.auth ? window.auth.getUserEmail() : null;
      this.checkPermissions();
      this.loadPhotos();
      this.setupEventListeners();
    });

    // Fallback check
    setTimeout(() => {
      if (window.auth && window.auth.isAuthenticated()) {
        this.currentUser = window.auth.getUserEmail();
        this.checkPermissions();
        this.loadPhotos();
        this.setupEventListeners();
      }
    }, 1000);
  }

  checkPermissions() {
    const canUpload = AUTHORIZED_PHOTO_UPLOADERS.includes(this.currentUser);
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    
    if (uploadBtn) {
      uploadBtn.style.display = canUpload ? 'inline-flex' : 'none';
    }

    console.log('Photo upload permissions:', { user: this.currentUser, canUpload });
  }

  async loadPhotos() {
    try {
      // Try to load from API
      const data = await window.api.getPhotos();
      this.photos = data || this.getSamplePhotos();
    } catch (error) {
      console.log('Using sample photos:', error);
      this.photos = this.getSamplePhotos();
    }

    this.displayPhotos();
  }

  getSamplePhotos() {
    return [
      {
        id: 1,
        url: 'assets/photos/img1.jpg',
        caption: 'Off-site',
        category: 'events',
        uploadedBy: 'HR Team',
        date: new Date().toISOString()
      },
      {
        id: 2,
        url: 'assets/photos/img2.jpg',
        caption: 'Off-site',
        category: 'events',
        uploadedBy: 'Social Team',
        date: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        url: 'assets/photos/img3.jpg',
        caption: 'Training',
        category: 'Training',
        uploadedBy: 'Admin',
        date: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 4,
        url: 'assets/photos/img4.jpg',
        caption: 'Off-site',
        category: 'events',
        uploadedBy: 'L&D Team',
        date: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: 5,
        url: 'assets/photos/img5.jpg',
        caption: 'Off-site',
        category: 'events',
        uploadedBy: 'HR Team',
        date: new Date(Date.now() - 345600000).toISOString()
      },
      {
        id: 6,
        url: 'assets/photos/img6.jpg',
        caption: 'Off-site',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 7,
        url: 'assets/photos/img7.jpg',
        caption: 'Off-site',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 8,
        url: 'assets/photos/img8.jpg',
        caption: 'Innovation Event',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 9,
        url: 'assets/photos/img9.jpg',
        caption: 'Environmental Activity',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 10,
        url: 'assets/photos/img10.jpg',
        caption: 'Off-site',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 11,
        url: 'assets/photos/img11.jpg',
        caption: 'Meet-up',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 12,
        url: 'assets/photos/img12.jpg',
        caption: 'Trekking',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 13,
        url: 'assets/photos/img13.jpg',
        caption: 'Off-site',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 14,
        url: 'assets/photos/img14.jpg',
        caption: 'Meet-up',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      },
      {
        id: 15,
        url: 'assets/photos/img15.jpg',
        caption: 'Dinner',
        category: 'events',
        uploadedBy: 'Tech Team',
        date: new Date(Date.now() - 432000000).toISOString()
      }
    ];
  }

  displayPhotos() {
    const container = document.getElementById('photoGallery');
    if (!container) return;

    const filtered = this.currentFilter === 'all' 
      ? this.photos 
      : this.photos.filter(p => p.category === this.currentFilter);

    if (filtered.length === 0) {
      container.innerHTML = '<div class="no-activity">No photos found</div>';
      return;
    }

    const html = filtered.map((photo, index) => `
      <div class="photo-item" data-category="${photo.category}" onclick="photoManager.openPhotoViewer(${index})">
        <img src="${photo.url}" alt="${photo.caption}" loading="lazy">
        <div class="photo-caption">${photo.caption}</div>
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
        this.displayPhotos();
      });
    });

    // Upload button
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.openUploadModal());
    }

    // Upload form
    const uploadForm = document.getElementById('uploadPhotoForm');
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
    }

    // Photo file input preview
    const photoFiles = document.getElementById('photoFiles');
    if (photoFiles) {
      photoFiles.addEventListener('change', (e) => this.previewPhotos(e));
    }

    // Search
    const searchInput = document.getElementById('searchPhotos');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  }

  openUploadModal() {
    const modal = document.getElementById('uploadPhotoModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closeUploadModal() {
    const modal = document.getElementById('uploadPhotoModal');
    if (modal) {
      modal.style.display = 'none';
    }
    // Clear preview
    const preview = document.getElementById('photoPreview');
    if (preview) {
      preview.innerHTML = '';
    }
  }

  previewPhotos(e) {
    const files = e.target.files;
    const preview = document.getElementById('photoPreview');
    
    if (!preview) return;
    
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.src = event.target.result;
          img.style.width = '100px';
          img.style.height = '100px';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '8px';
          img.style.margin = '5px';
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  async handleUpload(e) {
    e.preventDefault();

    const files = document.getElementById('photoFiles').files;
    const category = document.getElementById('photoCategory').value;
    const caption = document.getElementById('photoCaption').value || 'Company Photo';

    if (files.length === 0) {
      this.showNotification('Please select at least one photo', 'error');
      return;
    }

    try {
      // In a real app, you would upload to cloud storage
      // For now, we'll simulate with base64 encoding
      const uploadPromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const newPhoto = {
              id: Date.now() + Math.random(),
              url: event.target.result,
              caption: caption,
              category: category,
              uploadedBy: window.auth.getUserName() || 'Team Member',
              date: new Date().toISOString()
            };
            resolve(newPhoto);
          };
          reader.readAsDataURL(file);
        });
      });

      const newPhotos = await Promise.all(uploadPromises);
      
      // Try to save to backend
      try {
        await window.api.uploadPhotos(newPhotos);
      } catch (error) {
        console.log('Saving locally:', error);
      }

      // Add to local array
      this.photos = [...newPhotos, ...this.photos];
      
      this.showNotification(`${files.length} photo(s) uploaded successfully!`, 'success');
      this.displayPhotos();
      this.closeUploadModal();
      e.target.reset();
      
    } catch (error) {
      console.error('Upload error:', error);
      this.showNotification('Failed to upload photos', 'error');
    }
  }

  openPhotoViewer(index) {
    const filtered = this.currentFilter === 'all' 
      ? this.photos 
      : this.photos.filter(p => p.category === this.currentFilter);
    
    this.currentPhotoIndex = index;
    const photo = filtered[index];
    
    if (!photo) return;

    const modal = document.getElementById('photoViewerModal');
    const img = document.getElementById('viewerImage');
    const caption = document.getElementById('viewerCaption');
    const meta = document.getElementById('viewerMeta');

    if (modal && img && caption && meta) {
      img.src = photo.url;
      caption.textContent = photo.caption;
      meta.textContent = `Uploaded by ${photo.uploadedBy} • ${this.formatDate(photo.date)}`;
      modal.style.display = 'flex';
    }
  }

  closePhotoViewer() {
    const modal = document.getElementById('photoViewerModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  previousPhoto() {
    const filtered = this.currentFilter === 'all' 
      ? this.photos 
      : this.photos.filter(p => p.category === this.currentFilter);
    
    this.currentPhotoIndex = (this.currentPhotoIndex - 1 + filtered.length) % filtered.length;
    this.openPhotoViewer(this.currentPhotoIndex);
  }

  nextPhoto() {
    const filtered = this.currentFilter === 'all' 
      ? this.photos 
      : this.photos.filter(p => p.category === this.currentFilter);
    
    this.currentPhotoIndex = (this.currentPhotoIndex + 1) % filtered.length;
    this.openPhotoViewer(this.currentPhotoIndex);
  }

  handleSearch(query) {
    const items = document.querySelectorAll('.photo-item');
    const searchLower = query.toLowerCase();

    items.forEach(item => {
      const caption = item.querySelector('.photo-caption').textContent.toLowerCase();
      
      if (caption.includes(searchLower)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  showNotification(message, type = 'info') {
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
}

// Global functions for HTML onclick handlers
function closeUploadModal() {
  if (window.photoManager) {
    window.photoManager.closeUploadModal();
  }
}

function closePhotoViewer() {
  if (window.photoManager) {
    window.photoManager.closePhotoViewer();
  }
}

function previousPhoto() {
  if (window.photoManager) {
    window.photoManager.previousPhoto();
  }
}

function nextPhoto() {
  if (window.photoManager) {
    window.photoManager.nextPhoto();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.photoManager = new PhotoGalleryManager();
});
