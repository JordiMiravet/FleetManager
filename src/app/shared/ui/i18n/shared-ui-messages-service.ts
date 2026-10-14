import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedUiMessagesService {

  // confirm-modal

  readonly confirmModal = {
    title: 'Are you sure?',
    message: 'Do you really want to proceed? This action cannot be undone.',
    confirm: 'Confirm',
    cancel: 'Cancel',
    confirmActionLabel: 'Confirm action',
    cancelActionLabel: 'Cancel action',
  };

}
