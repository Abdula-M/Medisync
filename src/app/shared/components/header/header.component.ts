import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private authService = inject(AuthService);

  user = computed(() => this.authService.currentUser());
  isDoctor = computed(() => this.user()?.role === 'doctor');
  
  dashboardUrl = computed(() => this.isDoctor() ? '/consultations/doctor' : '/consultations');
  
  logout() {
    this.authService.logout();
  }
}
