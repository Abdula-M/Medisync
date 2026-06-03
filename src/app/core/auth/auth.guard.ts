import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const requiredRole = route.data['role'];
    if (requiredRole && !authService.hasRole(requiredRole)) {
      const role = authService.currentUser()?.role;
      if (role === 'doctor') return router.parseUrl('/consultations/doctor');
      if (role === 'patient') return router.parseUrl('/consultations');
      return router.parseUrl('/login');
    }
    return true;
  }

  return router.parseUrl('/login');
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.currentUser()?.role;
    if (role === 'doctor') return router.parseUrl('/consultations/doctor');
    if (role === 'patient') return router.parseUrl('/consultations');
  }

  return true;
};
