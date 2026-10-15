import { Component, inject, Signal } from '@angular/core';

import { AuthService } from '../../../features/auth/data-access/auth-service';

import { NavigationComponent } from "../navigation/navigation";
import { AuthActionsComponent } from "../auth-actions/auth-actions";
import { NotificationBellComponent } from '../../../features/invitations/components/notification-bell/notification-bell';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NavigationComponent, 
    AuthActionsComponent,
    NotificationBellComponent
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {

  private readonly auth = inject(AuthService)
  
  public isLogged: Signal<boolean> = this.auth.isLogged;
  
}
