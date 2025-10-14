import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent {
  isOpen = false;

  faqs = [
    {
      question: 'ما هي منصة أصيل؟',
      answer:
        'منصة أصيل هي أداة أكاديمية ذكية تهدف إلى ضمان النزاهة الأكاديمية وتحليل أصالة المشاريع الجامعية باستخدام الذكاء الاصطناعي.',
    },
    {
      question: 'كيف تعمل المنصة؟',
      answer:
        'تعمل المنصة على تحليل النصوص والصور لاكتشاف التشابه وتقييم الإبداع الأكاديمي من خلال ثلاث مراحل: رفع المشروع، التحليل الذكي، والتقرير النهائي.',
    },
    {
      question: 'من يمكنه استخدام المنصة؟',
      answer:
        'المنصة مخصصة للجامعات وأعضاء هيئة التدريس والطلاب لتحليل المشاريع واكتشاف الأصالة الفكرية.',
    },
    {
      question: 'ما المزايا التي تقدمها المنصة للجامعات؟',
      answer:
        'المنصة تساعد الجامعات على تحليل الصور الخاصة بالمشاريع، قياس جودة المشاريع، وإنشاء قاعدة بيانات مخصصة للمشاريع السابقة.',
    },
    {
      question: 'كيف يستفيد أعضاء هيئة التدريس من أصيل؟',
      answer:
        'يمكنهم تحليل مشاريع الطلاب بدقة، تقييم مستوى الطالب، والتحقق من تكرار المشروع مقارنةً بقاعدة البيانات.',
    },
    {
      question: 'ما الفائدة للطلاب؟',
      answer:
        'الطلاب يمكنهم تحليل مشاريعهم، عرض تفاصيلها لأعضاء هيئة التدريس، وضمان أن المشروع المقدم هو من اختيارهم الشخصي بثقة وشفافية.',
    },
    {
      question: 'هل يمكن رفع أكثر من نوع من الملفات؟',
      answer:
        'نعم، المنصة تدعم أنواع ملفات متعددة مثل PDF وJPG وPNG وDOCX بحجم أقصى 10MB.',
    },
  ];

  selectedAnswer: string | null = null;

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.selectedAnswer = null;
  }

  selectQuestion(answer: string) {
    this.selectedAnswer = answer;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotButton = document.querySelector('.chatbot-button');

    if (
      this.isOpen &&
      chatbotContainer &&
      !chatbotContainer.contains(target) &&
      (!chatbotButton || !chatbotButton.contains(target))
    ) {
      this.isOpen = false;
      this.selectedAnswer = null;
    }
  }
}
