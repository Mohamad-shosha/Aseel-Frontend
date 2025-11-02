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
      return hostname.length > 25
        ? hostname.substring(0, 25) + '...'
        : hostname;
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

  private isSafeUrl(url: string): boolean {
    return (
      !!url &&
      (url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('data:'))
    );
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
      else if (line.startsWith('🔹 Full Matching Images'))
        currentSection = 'Full Matching Images';
      else if (line.startsWith('🔹 Visually Similar Images'))
        currentSection = 'Visually Similar Images';
      else if (line.startsWith('🔹 Pages With Matching Images'))
        currentSection = 'Pages With Matching Images';
      else if (line.startsWith('🔹 Best Guess Labels'))
        currentSection = 'Best Guess Labels';
      else if (line.startsWith('- '))
        data[currentSection].push(line.substring(2).trim());
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

      if (logoBase64) {
        content.push({
          image: logoBase64,
          width: 120,
          alignment: 'center',
          margin: [0, 0, 0, 15],
        });
      }

      content.push({
        text: 'Aseel: Academic Project Originality Analyzer',
        style: 'header',
        margin: [0, 0, 0, 10],
      });

      content.push({
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 500,
            y2: 0,
            lineWidth: 1.2,
            lineColor: '#007bff',
          },
        ],
        margin: [0, 10, 0, 15],
      });

      content.push({
        text: `Aseel is an intelligent academic platform that ensures academic integrity by analyzing the originality of university projects using advanced AI technologies. The platform helps universities, faculty members, and students analyze projects, detect similarities, and assess creativity levels.`,
        style: 'paragraph',
        margin: [0, 0, 0, 15],
      });

      content.push({
        text: 'Analysis Results',
        style: 'sectionTitle',
        margin: [0, 0, 0, 10],
      });

      // ✅ جدول Web Entities
      if (this.webEntities.length) {
        content.push({
          text: `Detected Entities (${this.webEntities.length})`,
          style: 'subHeader',
          margin: [0, 5, 0, 5],
        });

        content.push({
          table: {
            widths: ['*', 50],
            body: [
              [
                { text: 'Entity', style: 'tableHeader' },
                { text: 'Score', style: 'tableHeader' },
              ],
              ...this.webEntities.map((ent) => [
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
              rowIndex === 0 ? '#007bff33' : null,
            hLineWidth: () => 0.7,
            vLineWidth: () => 0.7,
            hLineColor: () => '#007bff66',
            vLineColor: () => '#007bff66',
            paddingLeft: () => 8,
            paddingRight: () => 8,
          },
          margin: [0, 0, 0, 15],
          pageBreak: 'after', // ✅ تجعل هذا القسم على صفحة كاملة
        });
      }

      // 🟢 دالة لإضافة الروابط في جدول مع pageBreak
      const addLinksTable = (title: string, urls: string[]) => {
        if (!urls.length) return;

        content.push({
          text: `${title} (${urls.length})`,
          style: 'subHeader',
          margin: [0, 10, 0, 5],
        });

        const tableBody: any[] = [[{ text: 'Link', style: 'tableHeader' }]];

        urls.forEach((url) => {
          tableBody.push([
            {
              stack: [{ text: url, link: url, style: 'tableLink' }],
              fillColor: '#f9f9f9',
              margin: [0, 2, 0, 2],
            },
          ]);
        });

        content.push({
          table: { widths: ['*'], body: tableBody },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#d0e7ff' : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ccc',
            vLineColor: () => '#ccc',
            paddingLeft: () => 8,
            paddingRight: () => 8,
          },
          margin: [0, 0, 0, 15],
          pageBreak: 'after', // ✅ كل قسم على صفحة جديدة
        });
      };

      addLinksTable('Full Matching Images', this.fullMatchingImages);
      addLinksTable('Visually Similar Images', this.visuallySimilarImages);
      addLinksTable('Pages Containing the Image', this.matchingPages);

      // ✅ Best Guess Labels كـTags
      if (this.bestGuessLabels.length) {
        content.push({
          text: `Best Guess Labels (${this.bestGuessLabels.length})`,
          style: 'subHeader',
          margin: [0, 10, 0, 5],
        });

        const tags = this.bestGuessLabels.map((label, idx) => ({
          text: label,
          style: 'tagItem',
          margin: [2, 2, 2, 2],
          fillColor: idx % 2 === 0 ? '#007bff' : '#0056b3',
        }));

        content.push({
          columns: tags,
          columnGap: 5,
          margin: [0, 0, 0, 15],
        });
      }

      const docDefinition = {
        content,
        defaultStyle: { font: 'Roboto', alignment: 'left' },
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            color: '#0056b3',
            alignment: 'center',
            decoration: 'underline',
            decorationColor: '#007bff',
            decorationStyle: 'dashed',
          },
          sectionTitle: {
            fontSize: 16,
            bold: true,
            color: '#004080',
            margin: [0, 10, 0, 5],
          },
          subHeader: { fontSize: 13, bold: true, color: '#007bff' },
          paragraph: { fontSize: 12, color: '#333' },
          tableHeader: { bold: true, fontSize: 12, color: '#007bff' },
          tableCell: { fontSize: 11, color: '#333' },
          tableLink: { fontSize: 11, color: '#000', decoration: 'underline' },
          tagItem: {
            fontSize: 11,
            color: '#fff',
            alignment: 'center',
            bold: true,
            borderRadius: 4,
            padding: [4, 2, 4, 2],
          },
        },
        pageMargins: [40, 60, 40, 60],
        background: logoBase64
          ? [
              {
                image: logoBase64,
                width: 150,
                opacity: 0.05,
                alignment: 'center',
                margin: [0, 200, 0, 0],
              },
            ]
          : [],
      };

      (pdfMake as any).createPdf(docDefinition).download('Aseel_Report.pdf');
    } catch (error) {
      console.error('❌ Error generating report:', error);
      alert('Failed to generate the report.');
    }
  }
}
