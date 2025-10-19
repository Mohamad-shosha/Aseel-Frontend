import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisionService {
  private api = 'https://designtrace-production.up.railway.app/api/vision/upload';

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);

    // نرسل الطلب ونحول النص ل object
    return this.http
      .post(this.api, fd, { responseType: 'text' })
      .pipe(map((text: string) => this.parseTextResponse(text)));
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
}
