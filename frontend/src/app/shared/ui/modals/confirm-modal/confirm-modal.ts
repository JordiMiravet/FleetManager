import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';

import { SharedUiMessagesService } from '../../i18n/shared-ui-messages-service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModalComponent {

  private readonly messagesService = inject(SharedUiMessagesService);

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
