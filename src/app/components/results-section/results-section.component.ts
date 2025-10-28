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
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';

(pdfMake as any).vfs = pdfFonts.vfs;

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
  @Input() analysisData: string | null = null;

  webEntities: { name: string; score: number }[] = [];
  fullMatchingImages: string[] = [];
  visuallySimilarImages: string[] = [];
  matchingPages: string[] = [];
  bestGuessLabels: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['analysisData']) this.updateData();
  }

  extractDomain(url: string): string {
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      return hostname.length > 25 ? hostname.substring(0, 25) + '...' : hostname;
    } catch {
      return 'رابط غير صالح';
    }
  }

  private updateData() {
    if (!this.analysisData) return;
    let data: any =
      typeof this.analysisData === 'string'
        ? this.parseTextResponse(this.analysisData)
        : this.analysisData;

    this.webEntities = (data['Web Entities'] || [])
      .map((item: string) => {
        const match = item.match(/^(.+?)\s*\(score:\s*([\d.]+)\)$/);
        let score = match ? parseFloat(match[2]) : 0;
        score = Math.min(score, 1);
        return { name: match ? match[1].trim() : item, score };
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    this.fullMatchingImages = (data['Full Matching Images'] || []).filter((url: string) =>
      this.isSafeUrl(url)
    );
    this.visuallySimilarImages = (data['Visually Similar Images'] || []).filter((url: string) =>
      this.isSafeUrl(url)
    );
    this.matchingPages = (data['Pages With Matching Images'] || []).filter((url: string) =>
      this.isSafeUrl(url)
    );
    this.bestGuessLabels = data['Best Guess Labels'] || [];
  }

  private isSafeUrl(url: string): boolean {
    return !!url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'));
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

  getEntityColor(score: number): string {
    if (score < 0.4) return '#ef4444';
    if (score < 0.5) return '#f59e0b';
    return '#10b981';
  }

  private async loadImageAsBase64(url: string): Promise<string> {
    if (!url) return '';
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) return '';
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  }
async generatePdf() {
  try {
    const content: any[] = [];

    const logoBase64 = await this.loadImageAsBase64('assets/Logo-Assel.png');

    // ✅ شعار المشروع (في الأعلى)
    if (logoBase64) {
      content.push({
        image: logoBase64,
        width: 120,
        alignment: 'center',
        margin: [0, 0, 0, 15],
      });
    }

    // ✅ العنوان الرئيسي
    content.push({
      text: 'Aseel: Academic Project Originality Analyzer',
      style: 'header',
      margin: [0, 0, 0, 10],
    });

    // ✅ خط فاصل
    content.push({
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 2,
          lineColor: '#0056B3',
        },
      ],
      margin: [0, 10, 0, 25],
    });

    // ✅ فقرة تعريفية
    content.push({
      text: `Aseel is an intelligent academic platform ensuring academic integrity by analyzing originality of university projects using advanced AI. The system assists universities, faculty members, and students in detecting similarities and evaluating creativity with precision.`,
      style: 'paragraph',
      alignment: 'justify',
      margin: [30, 0, 30, 20],
    });

    // ✅ عنوان قسم النتائج
    content.push({
      text: 'Analysis Results',
      style: 'sectionTitle',
      alignment: 'center',
      margin: [0, 10, 0, 20],
    });

    // ✅ جدول الكيانات المكتشفة (Web Entities)
    if (this.webEntities.length) {
      content.push({
        text: `Detected Entities (${this.webEntities.length})`,
        style: 'subHeader',
        alignment: 'center',
        margin: [0, 0, 0, 10],
      });

      content.push({
        table: {
          widths: ['70%', '30%'],
          body: [
            [
              { text: 'Entity', style: 'tableHeader' },
              { text: 'Score', style: 'tableHeader' },
            ],
            ...this.webEntities.map(ent => [
              { text: ent.name, style: 'tableCell' },
              {
                text: ent.score.toFixed(2),
                style: 'tableCell',
                color: this.getEntityColor(ent.score),
              },
            ]),
          ],
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? '#CFE2FF' : rowIndex % 2 === 0 ? '#F5FAFF' : null,
          hLineWidth: () => 0.8,
          vLineWidth: () => 0.8,
          hLineColor: () => '#0056B366',
          vLineColor: () => '#0056B366',
        },
        margin: [30, 0, 30, 25],
        alignment: 'center',
        pageBreak: 'after',
      });
    }

    // 🟦 دالة لإضافة الجداول الخاصة بالروابط
    const addLinksTable = (title: string, urls: string[]) => {
      if (!urls.length) return;

      content.push({
        text: `${title} (${urls.length})`,
        style: 'subHeader',
        alignment: 'center',
        margin: [0, 10, 0, 10],
      });

      const tableBody: any[] = [[{ text: 'Link', style: 'tableHeader' }]];

      urls.forEach(url => {
        tableBody.push([
          {
            text: url,
            link: url,
            style: 'tableLink',
            alignment: 'center',
            margin: [0, 5, 0, 5],
          },
        ]);
      });

      content.push({
        table: { widths: ['*'], body: tableBody },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? '#CFE2FF' : '#F0F7FF',
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#0056B333',
          vLineColor: () => '#0056B333',
        },
        margin: [40, 0, 40, 25],
        pageBreak: 'after',
      });
    };

    addLinksTable('Full Matching Images', this.fullMatchingImages);
    addLinksTable('Visually Similar Images', this.visuallySimilarImages);
    addLinksTable('Pages Containing the Image', this.matchingPages);

    // ✅ Best Guess Labels (كل Label في صف واحد داخل جدول)
    if (Array.isArray(this.bestGuessLabels) && this.bestGuessLabels.length > 0) {
      content.push({
        text: `Best Guess Labels (${this.bestGuessLabels.length})`,
        style: 'subHeader',
        alignment: 'center',
        margin: [0, 10, 0, 10],
      });

      const tableBody: any[] = [[{ text: 'Label', style: 'tableHeader' }]];

      this.bestGuessLabels.forEach((label, idx) => {
        tableBody.push([
          {
            text: label,
            style: 'tagItem',
            fillColor: idx % 2 === 0 ? '#0056B3' : '#007BFF',
            margin: [0, 6, 0, 6],
          },
        ]);
      });

      content.push({
        table: {
          widths: ['100%'],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? '#CFE2FF' : rowIndex % 2 === 0 ? '#F0F7FF' : null,
          hLineWidth: () => 0.6,
          vLineWidth: () => 0.6,
          hLineColor: () => '#0056B355',
          vLineColor: () => '#0056B355',
        },
        margin: [40, 0, 40, 30],
      });
    }

    // ✅ تعريف التصميم الكامل للمستند
    const docDefinition = {
      content,
      defaultStyle: { font: 'Roboto', alignment: 'left' },
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#002B5B',
          alignment: 'center',
          decoration: 'underline',
        },
        sectionTitle: {
          fontSize: 17,
          bold: true,
          color: '#003C82',
          alignment: 'center',
        },
        subHeader: {
          fontSize: 13,
          bold: true,
          color: '#0056B3',
        },
        paragraph: {
          fontSize: 12,
          color: '#002B5B',
          lineHeight: 1.5,
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#002B5B',
          alignment: 'center',
        },
        tableCell: {
          fontSize: 11,
          color: '#002B5B',
          alignment: 'center',
        },
        tableLink: {
          fontSize: 11,
          color: '#004C99',
          decoration: 'underline',
        },
        tagItem: {
          fontSize: 11,
          color: '#FFFFFF',
          alignment: 'center',
          bold: true,
          padding: [8, 4, 8, 4],
          borderRadius: 6,
        },
      },
      pageMargins: [40, 60, 40, 60],
      background: [
        {
          canvas: [
            { type: 'rect', x: 20, y: 20, w: 555, h: 802, color: '#E6F2FF', r: 10 },
            { type: 'rect', x: 20, y: 20, w: 555, h: 802, r: 10, lineWidth: 2, lineColor: '#0056B3' },
          ],
        },
        ...(logoBase64
          ? [
              {
                image: logoBase64,
                width: 180,
                opacity: 0.05,
                alignment: 'center',
                margin: [0, 250, 0, 0],
              },
            ]
          : []),
      ],
    };

    (pdfMake as any).createPdf(docDefinition).download('Aseel_Report.pdf');
  } catch (error) {
    console.error('❌ Error generating report:', error);
    alert('Failed to generate the report.');
  }
}
  }

