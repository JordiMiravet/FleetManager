import { Component, ChangeDetectionStrategy } from '@angular/core';

import { GraphicsViewComponent } from "../../components/graphics-view/graphics-view";

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [ GraphicsViewComponent ] ,
  templateUrl: './graphics-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './graphics-page.scss',
})
export class GraphicsPageComponent {

}
