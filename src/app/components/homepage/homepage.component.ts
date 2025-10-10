import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent {
  showResults = false;
  analysisData: any;

  claims = [
    'نظام ذكي يعتمد على الذكاء الاصطناعي لتحليل النصوص والصور للكشف عن الانتحال.',
    'وحدة NLP لمعالجة اللغة الطبيعية ومقارنة المحتوى بمصادر محلية وعالمية.',
    'وحدة رؤية حاسوبية لتحليل الصور والمشروعات التصميمية بدقة عالية.',
    'نظام تقييم يعتمد على معايير كمية ونوعية لتقدير مستوى الإبداع.',
    'وحدة تتبع زمني لرصد تطور المشروع على مراحل مختلفة.',
    'واجهة مستخدم تفاعلية تسهّل عملية رفع المشاريع واستعراض التقارير.',
    'قدرة تعلم مستمر لتحسين الأداء ودقة التحليل مع الوقت.',
    'دمج فريد بين كشف الانتحال ومتابعة الإبداع في منصة واحدة.',
  ];

  onUploadComplete(data: any) {
    this.analysisData = data;
    this.showResults = true;
  }
}
