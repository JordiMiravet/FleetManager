import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';

import { SharedUiMessagesService } from '../../i18n/shared-ui-messages-service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModalComponent {

  readonly messagesService = inject(SharedUiMessagesService);

  readonly messages = this.messagesService.confirmModal;

  title = input<string>(this.messages.title);
  message = input<string>(this.messages.message);

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}
