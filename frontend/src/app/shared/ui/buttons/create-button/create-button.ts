import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-create-button',
  standalone: true,
  imports: [],
  templateUrl: './create-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './create-button.scss',
})
export class CreateButtonComponent {

  readonly createText = input<string | null>(null);
  readonly create = output<void>();

  onClick(): void {
    this.create.emit(); 
  }
  
}
