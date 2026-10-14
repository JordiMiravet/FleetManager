import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ThemeService } from '../../../../core/services/theme/theme-service';
import { SharedUiMessagesService } from '../../i18n/shared-ui-messages-service';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './dark-mode-toggle.html',
  styleUrl: './dark-mode-toggle.scss',
})
export class DarkModeToggleComponent {

  theme = inject(ThemeService);
  private readonly messagesService = inject(SharedUiMessagesService);

  readonly messages = this.messagesService.darkModeToggle;

  toggle() {
    this.theme.toggle();
  }
}
