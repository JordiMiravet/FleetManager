import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedUiMessagesService {

  // confirm-modal

  readonly confirmModal = {
    title: 'Are you sure?',
    message: 'Do you really want to proceed? This action cannot be undone.',
    buttons: {
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    aria: {
      confirmButton: 'Confirm action',
      cancelButton: 'Cancel action',
    },
  };

  // dark-mode-toggle

  readonly darkModeToggle = {
    aria: {
      enable: 'Enable dark mode',
      disable: 'Disable dark mode',
    },
  };

  // delete-button

  readonly deleteButton = {
    aria: {
      delete: 'Delete vehicle',
    },
  };

}
