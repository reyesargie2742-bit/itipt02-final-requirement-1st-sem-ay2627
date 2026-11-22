import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { school, person, lockClosed, eye, eyeOff, search, location, people } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon]
})
export class AuthPage implements OnInit {
  isRegisterMode: boolean = false;
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ school, person, lockClosed, eye, eyeOff, search, location, people });
  }

  ngOnInit() {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.username = '';
    this.password = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.username || !this.password) {
      alert('Please fill in both username and password');
      return;
    }

    const credentials = {
      username: this.username.trim(),
      password: this.password
    };

    if (this.isRegisterMode) {
      // REGISTER ACCOUNT
      this.authService.register(credentials).subscribe({
        next: (res: any) => {
          alert(`Account "${res.username}" created successfully! You can now sign in.`);
          this.isRegisterMode = false;
          this.password = '';
        },
        error: (err: any) => {
          alert(err.error?.detail || 'Registration failed');
        }
      });
    } else {
      // LOGIN ACCOUNT (Strictly checks database)
      this.authService.login(credentials).subscribe({
        next: (res: any) => {
          localStorage.setItem('campusfind_user', res.username);
          alert(`Welcome back, ${res.username}!`);
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          alert(err.error?.detail || 'Account not found. Please register first.');
        }
      });
    }
  }
}