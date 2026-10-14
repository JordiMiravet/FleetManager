import { Component, inject, output } from '@angular/core';

import { SharedUiMessagesService } from '../../i18n/shared-ui-messages-service';

@Component({
  selector: 'app-user-button',
  imports: [],
  templateUrl: './user-button.html',
  styleUrl: './user-button.scss',
})
export class UserButtonComponent {

  private readonly messagesService = inject(SharedUiMessagesService);

  readonly messages = this.messagesService.userButton;
  readonly user = output<void>();

  onClick(): void {
    this.user.emit();
  }

}
