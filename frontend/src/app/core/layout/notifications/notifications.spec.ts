import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsComponent } from './notifications';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  const getNotificationBell = (): HTMLElement | null => fixture.nativeElement.querySelector('app-notification-bell');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NotificationsComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
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
