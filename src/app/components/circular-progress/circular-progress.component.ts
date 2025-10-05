import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-circular-progress',
  templateUrl: './circular-progress.component.html',
  styleUrls: ['./circular-progress.component.css'],
})
export class CircularProgressComponent implements OnChanges {
  @Input() percentage = 0;
  @Input() size = 120;
  @Input() strokeWidth = 8;
  @Input() color = '#0891b2';
  

  radius = 50;
  circumference = 0;
  dash = 0;
  gap = 0;

  ngOnChanges(changes: SimpleChanges) {
    this.percentage = Math.round(this.percentage * 100) / 100;
    this.radius = (this.size - this.strokeWidth) / 2;
    this.circumference = this.radius * Math.PI * 2;
    this.dash = (this.percentage * this.circumference) / 100;
    this.gap = Math.max(this.circumference - this.dash, 0);
  }
}
