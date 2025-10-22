import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisionService {
  private api = 'https://designtrace-production.up.railway.app/api/vision/upload';

  constructor(private http: HttpClient) {}

  // 🟢 الدالة دلوقتي تستقبل password
  uploadImage(file: File, password: string): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('password', password); // ✅ تم تعريف المتغير هنا

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

      if (line.startsWith('🔹 Web Entities')) currentSection = 'Web Entities';
      else if (line.startsWith('🔹 Full Matching Images')) currentSection = 'Full Matching Images';
      else if (line.startsWith('🔹 Visually Similar Images')) currentSection = 'Visually Similar Images';
      else if (line.startsWith('🔹 Pages With Matching Images')) currentSection = 'Pages With Matching Images';
      else if (line.startsWith('🔹 Best Guess Labels')) currentSection = 'Best Guess Labels';
      else if (line.startsWith('- ')) data[currentSection].push(line.substring(2).trim());
    }

    return data;
  }
}
