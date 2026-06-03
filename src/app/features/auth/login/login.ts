import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  
  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit(): void {
    this.error = '';
    
    if (!this.username || !this.password) {
      this.error = 'Пожалуйста, введите логин и пароль';
      return;
    }

    const success = this.authService.login(this.username, this.password);
    if (success) {
      const user = this.authService.currentUser();
      if (user?.role === 'patient') {
        this.router.navigate(['/consultations']);
      } else if (user?.role === 'doctor') {
        this.router.navigate(['/consultations/doctor']);
      }
    } else {
      this.error = 'Неверный логин или пароль. (Логин: patient, Пароль: 1)';
    }
  }
}
