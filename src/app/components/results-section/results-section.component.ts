// results-section.component.ts
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-results-section',
  templateUrl: './results-section.component.html',
  styleUrls: ['./results-section.component.css'],
  animations: [
    trigger('fadeIn', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out'),
      ]),
    ]),
  ],
})
export class ResultsSectionComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() analysisData: any = null; // نص أو object

  webEntities: { name: string; score: number }[] = [];
  fullMatchingImages: string[] = [];
  visuallySimilarImages: string[] = [];
  matchingPages: string[] = [];
  bestGuessLabels: string[] = [];

  ngOnInit(): void {
    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['analysisData']) {
      this.updateData();
    }
  }

  private updateData() {
    if (!this.analysisData) return;

    let data: any;
    if (typeof this.analysisData === 'string') {
      data = this.parseTextResponse(this.analysisData);
    } else {
      data = this.analysisData;
    }

    this.webEntities = (data['Web Entities'] || [])
      .map((item: string) => {
        const match = item.match(/^(.+?)\s*\(score:\s*([\d.]+)\)$/);
        return match
          ? { name: match[1].trim(), score: parseFloat(match[2]) }
          : { name: item, score: 0 };
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    // ✅ هنا الفلترة الجديدة
    this.fullMatchingImages = (data['Full Matching Images'] || []).filter(
      (url: string) => this.isSafeUrl(url)
    );
    this.visuallySimilarImages = (data['Visually Similar Images'] || []).filter(
      (url: string) => this.isSafeUrl(url)
    );
    this.matchingPages = (data['Pages With Matching Images'] || []).filter(
      (url: string) => this.isSafeUrl(url)
    );
    this.bestGuessLabels = data['Best Guess Labels'] || [];
  }

  // ✅ helper function
  private isSafeUrl(url: string): boolean {
    if (
      !url ||
      !(
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('data:')
      )
    ) {
      return false;
    }

    // ✅ نحاول نتأكد إن الصورة تقدر تتحمل
    const img = new Image();
    img.src = url;

    // هنعمل flag مؤقت
    let isValid = true;
    img.onerror = () => {
      console.warn('⛔ صورة غير صالحة أو محجوبة:', url);
      isValid = false;
    };

    return isValid;
  }

  private parseTextResponse(text: string) {
    const data: any = {
      'Web Entities': [],
      'Full Matching Images': [],
      'Visually Similar Images': [],
      'Pages With Matching Images': [],
      'Best Guess Labels': [],
    };

    let currentSection = '';
    const lines = text.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // تحديد القسم الحالي
      if (line.startsWith('🔹 Web Entities')) {
        currentSection = 'Web Entities';
        continue;
      } else if (line.startsWith('🔹 Full Matching Images')) {
        currentSection = 'Full Matching Images';
        continue;
      } else if (line.startsWith('🔹 Visually Similar Images')) {
        currentSection = 'Visually Similar Images';
        continue;
      } else if (line.startsWith('🔹 Pages With Matching Images')) {
        currentSection = 'Pages With Matching Images';
        continue;
      } else if (line.startsWith('🔹 Best Guess Labels')) {
        currentSection = 'Best Guess Labels';
        continue;
      }

      // إضافة العناصر حسب القسم
      if (line.startsWith('- ')) {
        const item = line.substring(2).trim();
        data[currentSection].push(item);
      }
    }

    return data;
  }

  getEntityColor(score: number): string {
    if (score < 0.4) return '#ef4444';
    if (score < 0.5) return '#f59e0b';
    return '#10b981';
  }
}
