import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationsComponent } from './invitations';

describe('InvitationsComponent', () => {
  let component: InvitationsComponent;
  let fixture: ComponentFixture<InvitationsComponent>;

  const getNotificationBell = (): HTMLElement | null => fixture.nativeElement.querySelector('app-notification-bell');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ InvitationsComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('NotificationBellComponent', () => {

    it('should render NotificationBellComponent', () => {
      const notificationBell = getNotificationBell();

      expect(notificationBell).toBeTruthy();
    });

  });
});
