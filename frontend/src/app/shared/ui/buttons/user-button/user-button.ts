import { Component, inject, output, ChangeDetectionStrategy } from '@angular/core';

import { SharedUiMessagesService } from '../../i18n/shared-ui-messages-service';

@Component({
  selector: 'app-user-button',
  standalone: true,
  imports: [],
  templateUrl: './user-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
