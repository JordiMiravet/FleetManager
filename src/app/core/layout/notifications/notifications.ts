import { Component } from '@angular/core';

import { NotificationBellComponent } from '../../../features/invitations/components/notification-bell/notification-bell';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [ NotificationBellComponent ],
  templateUrl: './invitations.html',
  styleUrl: './invitations.css',
})
export class NotificationsComponent {

}
