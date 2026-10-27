import { Component } from '@angular/core';

import { NotificationBellComponent } from '../../../features/invitations/components/notification-bell/notification-bell';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [ NotificationBellComponent ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class NotificationsComponent {

}
