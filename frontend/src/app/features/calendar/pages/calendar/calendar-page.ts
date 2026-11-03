import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CalendarViewComponent } from '../../components/calendar-view/calendar-view';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [ CalendarViewComponent ],
  templateUrl: './calendar-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './calendar-page.scss',
})
export class CalendarPageComponent {
  
}
