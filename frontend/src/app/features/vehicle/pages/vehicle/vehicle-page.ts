import { Component, ChangeDetectionStrategy } from '@angular/core';
import { VehicleViewComponent } from '../../components/vehicle-view/vehicle-view';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ VehicleViewComponent ],
  templateUrl: './vehicle-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vehicle-page.scss',
})
export class VehiclePageComponent {

}
