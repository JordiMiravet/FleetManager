import { Component, inject, output, ChangeDetectionStrategy } from '@angular/core';

import { SharedUiMessagesService } from '../../i18n/shared-ui-messages-service';

@Component({
  selector: 'app-delete-button',
  standalone: true,
  imports: [],
  templateUrl: './delete-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './delete-button.scss',
})
export class DeleteButtonComponent {

  private readonly messagesService = inject(SharedUiMessagesService);

  readonly messages = this.messagesService.deleteButton;
  readonly delete = output<void>();

  onClick(): void {
    this.delete.emit();
  }

}
