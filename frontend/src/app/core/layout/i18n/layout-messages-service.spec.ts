import { TestBed } from '@angular/core/testing';

import { LayoutMessagesService } from './layout-messages-service';

describe('LayoutMessagesService', () => {
  let service: LayoutMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('navigation', () => {

    it('should expose the navigation aria message', () => {
      expect(service.navigation.aria).toEqual({
        nav: 'Main navigation menu'
      });
    });

    it('should expose the navigation links', () => {
      expect(service.navigation.links).toEqual({
        home: 'Home',
        map: 'Map',
        calendar: 'Calendar',
        graphics: 'Graphics'
      });
    });

  });

  describe('authActions', () => {

    it('should expose the auth action buttons', () => {
      expect(service.authActions.buttons).toEqual({
        logout: 'Logout',
        register: 'Register',
        login: 'Login'
      });
    });

    it('should expose the auth action aria messages', () => {
      expect(service.authActions.aria).toEqual({
        logout: 'Log out of your account',
        register: 'Navigate to register page',
        login: 'Navigate to login page'
      });
    });

  });

  describe('drawer', () => {

    it('should expose the drawer title', () => {
      expect(service.drawer.title).toBe('My Account');
    });

    it('should expose the drawer buttons', () => {
      expect(service.drawer.buttons).toEqual({
        logout: 'Log out'
      });
    });

    it('should expose the drawer items', () => {
      expect(service.drawer.items).toEqual({
        editProfile: 'Edit Profile',
        settings: 'Settings',
        language: 'Language',
        darkMode: 'Dark Mode'
      });
    });

    it('should expose the drawer aria messages', () => {
      expect(service.drawer.aria).toEqual({
        openButton: 'Open account menu',
        closeButton: 'Close account menu',
        drawer: 'Account menu'
      });
    });

  });

});
