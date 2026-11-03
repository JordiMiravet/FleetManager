import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { VehicleInterface } from '../../../vehicle/models/vehicle';
import { MapMessagesService } from '../../i18n/map-messages-service';

@Component({
  selector: 'app-details-panel',
  standalone: true,
  imports: [],
  templateUrl: './details-panel.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './details-panel.scss',
})
export class DetailsPanelComponent {

  private readonly messagesService = inject(MapMessagesService);
  public readonly detailsPanelMsg = this.messagesService.detailsPanel;

  public locationRequest = output<void>();
  public vehicle = input<VehicleInterface | null>(null);

}
