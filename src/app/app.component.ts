import { Component } from '@angular/core';
import { VisionService } from './services/vision.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  showResults = false;
  analysisData: any; // هنا هنخزن النتيجة اللي جاية من الباك

  constructor(private vision: VisionService) {}

  onUploadComplete(resp: any) {
    // لو resp object بالفعل، ما تعملش parse
    this.analysisData = resp;
    this.showResults = true;

    setTimeout(() => {
      const el = document.querySelector('#results');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
}
