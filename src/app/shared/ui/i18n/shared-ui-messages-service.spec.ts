import { TestBed } from '@angular/core/testing';

import { SharedUiMessagesService } from './shared-ui-messages-service';

describe('SharedUiMessagesService', () => {
  let service: SharedUiMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedUiMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirmModal', () => {

    it('should expose the confirmation modal messages', () => {
      expect(service.confirmModal).toEqual({
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
      });
    });

  });

  describe('darkModeToggle', () => {

    it('should expose the dark mode toggle messages', () => {
      expect(service.darkModeToggle).toEqual({
        aria: {
          enable: 'Enable dark mode',
          disable: 'Disable dark mode',
        },
      });
    });

  });

  describe('deleteButton', () => {

    it('should expose the delete button messages', () => {
      expect(service.deleteButton).toEqual({
        aria: {
          delete: 'Delete vehicle',
        },
      });
    });

  });

  describe('editButton', () => {

    it('should expose the edit button messages', () => {
      expect(service.editButton).toEqual({
        aria: {
          edit: 'Edit vehicle',
        },
      });
    });

  });

  describe('userButton', () => {

    it('should expose the user button messages', () => {

    });

  });

});
