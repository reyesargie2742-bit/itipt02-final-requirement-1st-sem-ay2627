import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonSplitPane, IonMenu, IonContent, IonHeader, 
  IonToolbar, IonButtons, IonMenuButton, IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  school, home, addCircle, create, trash, notifications,
  megaphone, people, cube, calendar, location, time, chevronForward,
  flash, logOut, calculator, close, image, call, personCircle, shieldCheckmark
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonSplitPane, IonMenu, IonContent, 
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonIcon
  ]
})
export class DashboardPage implements OnInit {
  activeTab: 'read' | 'create' | 'update' | 'delete' = 'read';
  currentUser = localStorage.getItem('campusfind_user') || 'argie reyes';
  
  items = signal<any[]>([]);
  selectedPreviewItem = signal<any | null>(null);
  modalItem = signal<any | null>(null);
  showProfileMenu = signal<boolean>(false);
  showNotificationsMenu = signal<boolean>(false);
  hasUnread = signal<boolean>(true);

  // STRICT OWNERSHIP: Only items belonging to the current user appear in management tabs
  myItems = computed(() => {
    return this.items().filter(item => this.isOwner(item));
  });

  totalReportsCount = () => this.items().length;
  lostCount = () => this.items().filter(i => i.category === 'Lost').length;
  foundCount = () => this.items().filter(i => i.category === 'Found').length;
  claimedCount = () => this.items().filter(i => i.category === 'Claimed').length;

  newItem = {
    title: '',
    description: '',
    category: 'Lost',
    location: '',
    contact_info: ''
  };

  editingItem: any = null;
  selectedFile: File | null = null;

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ 
      school, home, addCircle, create, trash, notifications,
      megaphone, people, cube, calendar, location, time, chevronForward,
      flash, logOut, calculator, close, image, call, personCircle, shieldCheckmark
    });
  }

  ngOnInit() {
    this.loadItems();
  }

  setTab(tab: 'read' | 'create' | 'update' | 'delete') {
    this.activeTab = tab;
    this.editingItem = null;
    this.showProfileMenu.set(false);
    this.showNotificationsMenu.set(false);
    if (tab !== 'create') {
      this.loadItems();
    }
  }

  loadItems() {
    this.authService.getItems().subscribe({
      next: (data: any[]) => {
        this.items.set(data);
        if (data.length > 0 && !this.selectedPreviewItem()) {
          this.selectedPreviewItem.set(data[0]);
        }
      },
      error: (err: any) => console.error('Error loading items:', err)
    });
  }

  selectPreview(item: any) {
    this.selectedPreviewItem.set(item);
  }

  openExpandedModal(item: any, event?: Event) {
    if (event) event.stopPropagation();
    this.modalItem.set(item);
  }

  closeModal() {
    this.modalItem.set(null);
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showNotificationsMenu.set(false);
    this.showProfileMenu.set(!this.showProfileMenu());
  }

  toggleNotificationsMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu.set(false);
    this.showNotificationsMenu.set(!this.showNotificationsMenu());
    
    if (this.showNotificationsMenu()) {
      this.hasUnread.set(false);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
    }
  }

  // STRICT OWNERSHIP CHECK
  isOwner(item: any): boolean {
    if (!item.username || !this.currentUser) return false;
    return item.username.trim().toLowerCase() === this.currentUser.trim().toLowerCase();
  }

  submitItem() {
    const formData = new FormData();
    formData.append('title', this.newItem.title);
    formData.append('description', this.newItem.description);
    formData.append('category', this.newItem.category);
    formData.append('location', this.newItem.location);
    formData.append('contact_info', this.newItem.contact_info);
    formData.append('username', this.currentUser);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.authService.addItem(formData).subscribe({
      next: () => {
        alert('Item posted successfully!');
        this.selectedFile = null;
        this.newItem = { title: '', description: '', category: 'Lost', location: '', contact_info: '' };
        this.hasUnread.set(true);
        this.setTab('read');
      },
      error: (err: any) => console.error('Error posting item:', err)
    });
  }

  selectForEdit(item: any) {
    if (!this.isOwner(item)) {
      alert('You can only edit your own posts!');
      return;
    }
    this.editingItem = { ...item };
  }

  saveUpdate() {
    if (!this.editingItem) return;
    this.authService.updateItem(this.editingItem.id, this.editingItem, this.currentUser).subscribe({
      next: () => {
        alert('Report updated successfully!');
        this.editingItem = null;
        this.loadItems();
      },
      error: (err: any) => alert(err.error?.detail || 'Error updating item')
    });
  }

  deleteItem(item: any) {
    if (!this.isOwner(item)) {
      alert('You can only delete your own posts!');
      return;
    }

    if (confirm('Are you sure you want to permanently delete this report?')) {
      this.authService.deleteItem(item.id, this.currentUser).subscribe({
        next: () => {
          alert('Report deleted.');
          if (this.selectedPreviewItem()?.id === item.id) {
            this.selectedPreviewItem.set(null);
          }
          if (this.modalItem()?.id === item.id) {
            this.modalItem.set(null);
          }
          this.loadItems();
        },
        error: (err: any) => alert(err.error?.detail || 'Error deleting item')
      });
    }
  }

  logout() {
    localStorage.removeItem('campusfind_user');
    this.router.navigate(['/auth']);
  }
}