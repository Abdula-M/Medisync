import { Injectable, signal, WritableSignal } from '@angular/core';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'medisync_user';

  currentUser: WritableSignal<User | null> = signal<User | null>(this.loadUserFromStorage());

  constructor(private router: Router) { }

  private loadUserFromStorage(): User | null {
    const savedUser = localStorage.getItem(this.USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  }

  login(username: string, password?: string): boolean {
    let user: User | null = null;

    if (username === 'patient' && password === '1') {
      user = { id: '1', role: 'patient', username: 'Амир Саидович' };
    } else if (username === 'doctor' && password === '1') {
      user = { id: '1', role: 'doctor', username: 'Магомедов Али Магомедович' };
    }

    if (user) {
      this.currentUser.set(user);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user !== null && user.role === role;
  }
}
