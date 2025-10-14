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

// ربط خطوط PDFMake
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
  @Input() analysisData: any = null;

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

  private updateData() {
    if (!this.analysisData) return;
    let data: any =
      typeof this.analysisData === 'string'
        ? this.parseTextResponse(this.analysisData)
        : this.analysisData;

    this.webEntities = (data['Web Entities'] || [])
      .map((item: string) => {
        const match = item.match(/^(.+?)\s*\(score:\s*([\d.]+)\)$/);
        return match
          ? { name: match[1].trim(), score: parseFloat(match[2]) }
          : { name: item, score: 0 };
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

  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        },
        error: (err) => reject(err),
      });
    });
  }

  async generatePdf() {
    try {
      const logoBase64 = await this.loadImageAsBase64('assets/Logo Assel.png');
      const content: any[] = [];

      // Logo
      content.push({
        image: logoBase64,
        width: 120,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      });

      // Title
      content.push({
        text: 'Aseel: Academic Project Originality Analyzer',
        style: 'header',
        alignment: 'center',
      });

      // Description
      content.push(
        {
          text: `Aseel is an intelligent academic platform that ensures academic integrity by analyzing the originality of university projects using advanced AI technologies.`,
          style: 'paragraph',
          alignment: 'left',
        },
        {
          text: `The platform helps universities, faculty members, and students analyze projects, detect similarities, and assess creativity levels.`,
          style: 'paragraph',
          alignment: 'left',
        },
        { text: '', margin: [0, 10] }
      );

      // Results
      content.push({
        text: 'Analysis Results',
        style: 'sectionTitle',
        alignment: 'left',
      });

      // Entities
      if (this.webEntities.length) {
        content.push({
          text: `Detected Entities (${this.webEntities.length})`,
          style: 'subHeader',
          alignment: 'left',
        });
        this.webEntities.forEach((ent) =>
          content.push({
            text: `• ${ent.name} (Score: ${ent.score.toFixed(2)})`,
            style: 'listItem',
            alignment: 'left',
          })
        );
      }

      // Full Matching Images (with previews)
      if (this.fullMatchingImages.length) {
        content.push({
          text: `Full Matching Images (${this.fullMatchingImages.length})`,
          style: 'subHeader',
          alignment: 'left',
        });
        for (const url of this.fullMatchingImages) {
          try {
            const imgBase64 = await this.loadImageAsBase64(url);
            content.push({
              image: imgBase64,
              width: 200,
              margin: [0, 5, 0, 10],
            });
          } catch {
            content.push({
              text: `• ${url}`,
              style: 'linkItem',
              alignment: 'left',
              link: url,
            });
          }
        }
      }

      // Visually Similar Images (with previews)
      if (this.visuallySimilarImages.length) {
        content.push({
          text: `Visually Similar Images (${this.visuallySimilarImages.length})`,
          style: 'subHeader',
          alignment: 'left',
        });
        for (const url of this.visuallySimilarImages) {
          try {
            const imgBase64 = await this.loadImageAsBase64(url);
            content.push({
              image: imgBase64,
              width: 200,
              margin: [0, 5, 0, 10],
            });
          } catch {
            content.push({
              text: `• ${url}`,
              style: 'linkItem',
              alignment: 'left',
              link: url,
            });
          }
        }
      }

      // Matching Pages (black links)
      if (this.matchingPages.length) {
        content.push({
          text: `Pages Containing the Image (${this.matchingPages.length})`,
          style: 'subHeader',
          alignment: 'left',
        });
        this.matchingPages.forEach((url) =>
          content.push({
            text: `• ${url}`,
            style: 'blackLink',
            alignment: 'left',
            link: url,
          })
        );
      }

      // Best Guess Labels
      if (this.bestGuessLabels.length) {
        content.push({
          text: `Best Guess Labels (${this.bestGuessLabels.length})`,
          style: 'subHeader',
          alignment: 'left',
        });
        this.bestGuessLabels.forEach((label) =>
          content.push({
            text: `• ${label}`,
            style: 'listItem',
            alignment: 'left',
          })
        );
      }

      // PDF Styles
      const docDefinition = {
        content,
        defaultStyle: { font: 'Roboto', alignment: 'left' },
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            color: '#007bff',
            margin: [0, 0, 0, 10],
          },
          sectionTitle: {
            fontSize: 16,
            bold: true,
            color: '#007bff',
            margin: [0, 15, 0, 8],
          },
          subHeader: {
            fontSize: 13,
            bold: true,
            color: '#007bff',
            margin: [0, 10, 0, 5],
          },
          paragraph: {
            fontSize: 12,
            color: '#333',
            margin: [0, 5, 0, 5],
          },
          listItem: {
            fontSize: 11,
            color: '#555',
            margin: [0, 3, 0, 3],
          },
          linkItem: {
            fontSize: 11,
            color: '#000000',
            margin: [0, 3, 0, 3],
          },
          blackLink: {
            fontSize: 11,
            color: '#000000',
            margin: [0, 3, 0, 3],
          },
        },
        pageMargins: [40, 40, 40, 60],
      };

      (pdfMake as any).createPdf(docDefinition).download('Aseel_Report.pdf');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate the report. Check image access or logo path.');
    }
  }
}
