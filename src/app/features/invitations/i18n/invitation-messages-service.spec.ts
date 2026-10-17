import { TestBed } from '@angular/core/testing';

import { InvitationMessagesService } from './invitation-messages-service';

describe('InvitationMessagesService', () => {
  let service: InvitationMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvitationMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('card', () => {

    it('should expose the labels', () => {
      expect(service.card.labels).toEqual({
        owner: 'Shared by'
      });
    });

    it('should expose the buttons', () => {
      expect(service.card.buttons).toEqual({
        accept: 'Accept',
        decline: 'Decline'
      });
    });

    describe('aria', () => {

      it('should return the accept message with the provided vehicle name', () => {
        expect(service.card.aria.accept('Ford Focus')).toBe('Accept invitation for Ford Focus');
      });

      it('should return the decline message with the provided vehicle name', () => {
        expect(service.card.aria.decline('Ford Focus')).toBe('Decline invitation for Ford Focus');
      });

    });

  });

  describe('notificationBell', () => {

    it('should expose the empty state message', () => {
      expect(service.notificationBell.emptyState).toBe('No pending invitations');
    });

    describe('aria.button', () => {

      it('should return the message without pending count when there are no pending notifications', () => {
        expect(service.notificationBell.aria.button(0)).toBe('View notifications');
      });

      it('should return the message with the pending count when there is one pending notification', () => {
        expect(service.notificationBell.aria.button(1)).toBe('View notifications, 1 pending');
      });

      it('should return the message with the pending count when there are several pending notifications', () => {
        expect(service.notificationBell.aria.button(3)).toBe('View notifications, 3 pending');
      });

    });
    
  });

});
