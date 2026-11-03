import { Component, HostListener, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './notification-dropdown.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './notification-dropdown.scss',
})
export class NotificationDropdownComponent {

  isEmpty = input<boolean>(true);
  emptyMessage = input<string>('Nothing to show here');

  panelClose = output<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.panelClose.emit();
  }

  onBackdropClick(): void {
    this.panelClose.emit();
  }

}
