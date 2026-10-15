import { Component, inject, signal } from '@angular/core';

import { InvitationService } from '../../data-access/invitation-service';
import { LayoutMessagesService } from '../../../../core/layout/i18n/layout-messages-service';

import { InvitationCardComponent } from '../invitation-card/invitation-card';
import { NotificationDropdownComponent } from '../../../../core/layout/notifications/notification-dropdown/notification-dropdown';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [NotificationDropdownComponent, InvitationCardComponent],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
})
export class NotificationBellComponent {

  private readonly messagesService = inject(LayoutMessagesService);
  private readonly invitationService = inject(InvitationService);

  public readonly notificationBellMsg = this.messagesService.notificationBell;
  public readonly pendingCount = this.invitationService.pendingCount;
  public readonly pendingInvitations = this.invitationService.pendingInvitations;

  public readonly isPanelOpen = signal(false);

  togglePanel(): void {
    this.isPanelOpen.update(open => !open);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  acceptInvitation(id: string): void {
    this.invitationService.acceptInvitation(id);
  }

  declineInvitation(id: string): void {
    this.invitationService.declineInvitation(id);
  }

}
