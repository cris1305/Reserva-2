
import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Fix: Declare properties here and initialize in the constructor to break circular dependency.
  private dataService: DataService;
  private router: Router;
  
  currentUser = signal<User | null>(null);

  // Fix: Injected dependencies in the constructor to resolve a circular dependency issue.
  // The `Router` injection was failing when used as a property initializer due to a
  // circular dependency with the route guards (Router -> canActivate -> AuthService -> Router).
  constructor() {
    this.dataService = inject(DataService);
    this.router = inject(Router);
  }

  login(email: string, password: string): boolean {
    const user = this.dataService.users().find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUser.set(user);
      if (user.role === 'Admin') {
        this.router.navigate(['/admin']);
      } else if (user.role === 'Docente') {
        this.router.navigate(['/docente']);
      }
      return true;
    }
    this.currentUser.set(null);
    return false;
  }

  logout() {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  isAdmin(): boolean {
    if (this.currentUser()?.role === 'Admin') {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }

  isDocente(): boolean {
    if (this.currentUser()?.role === 'Docente') {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
