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

  readonly messages = inject(SharedUiMessagesService)

  title = input<string>('Are you sure?');
  message = input<string>('Do you really want to proceed? This action cannot be undone');

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}
