
import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface NavLink {
    path: string;
    label: string;
    icon: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
    authService = inject(AuthService);
    navLinks = input.required<NavLink[]>();
    isOpen = input.required<boolean>();
    close = output<void>();
    
    onNavLinkClick() {
        this.close.emit();
    }

    logout() {
        this.close.emit();
        this.authService.logout();
    }
}
