import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'consultations',
    loadComponent: () => import('./features/patient/consultations-list/consultations-list').then(m => m.ConsultationsList),
    canActivate: [authGuard],
    data: { role: 'patient' }
  },
  {
    path: 'consultations/new',
    loadComponent: () => import('./features/patient/new-consultation/new-consultation').then(m => m.NewConsultation),
    canActivate: [authGuard],
    data: { role: 'patient' }
  },
  {
    path: 'consultations/doctor',
    loadComponent: () => import('./features/doctor/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboard),
    canActivate: [authGuard],
    data: { role: 'doctor' }
  },
  {
    path: 'consultation/:id',
    loadComponent: () => import('./features/consultation/consultation-details/consultation-details').then(m => m.ConsultationDetails),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
