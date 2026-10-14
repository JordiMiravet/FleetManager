import { Component, inject, output } from '@angular/core';

import { SharedUiMessagesService } from '../../i18n/shared-ui-messages-service';

@Component({
  selector: 'app-edit-button',
  standalone: true,
  imports: [],
  templateUrl: './edit-button.html',
  styleUrl: './edit-button.scss',
})
export class EditButtonComponent {

  private readonly messagesService = inject(SharedUiMessagesService);

  readonly messages = this.messagesService.editButton;
  readonly edit = output<void>()

  onClick(): void {
    this.edit.emit();
  }

}
