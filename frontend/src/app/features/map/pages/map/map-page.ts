import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MapContainerComponent } from '../../components/map-container/map-container';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [ MapContainerComponent ],
  templateUrl: './map-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './map-page.scss',
})
export class MapPageComponent {

}