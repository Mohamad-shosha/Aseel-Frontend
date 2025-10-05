import { Component, EventEmitter, Output } from '@angular/core';
import { VisionService } from '../../services/vision.service';

@Component({
  selector: 'app-upload-section',
  templateUrl: './upload-section.component.html',
  styleUrls: ['./upload-section.component.css'],
})
export class UploadSectionComponent {
  @Output() uploadComplete = new EventEmitter<any>(); // بدل void بخليها any

  isDragOver = false;
  isUploading = false;
  progress = 0;
  fileName = '';
  selectedFile?: File;

  constructor(private vision: VisionService) {}

  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    this.isDragOver = false;
  }

  onDrop(evt: DragEvent) {
    evt.preventDefault();
    this.isDragOver = false;
    const files = evt.dataTransfer?.files;
    if (files && files.length) this.startUpload(files[0]);
  }

  onFileChange(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.files && el.files.length) this.startUpload(el.files[0]);
  }

  startUpload(file: File) {
    this.selectedFile = file;
    this.fileName = file.name;
    this.isUploading = true;
    this.progress = 0;

    // call backend
    this.vision.uploadImage(file).subscribe({
      next: (resp: any) => {
        console.log('📦 Response from backend:', resp); // اطبع النتيجة في الكونسول
        this.showToast('✅ النتيجة جاهزة');

        setTimeout(() => {
          this.isUploading = false;
          this.progress = 100;
          this.uploadComplete.emit(resp); // ابعت النتيجة للأب
        }, 900);
      },
      error: (err) => {
        console.error('❌ Upload error:', err);
        this.showToast('❌ حدث خطأ أثناء الرفع', true);
        this.isUploading = false;
      },
    });

    // local faux progress animation
    const interval = setInterval(() => {
      if (this.progress >= 92) {
        clearInterval(interval);
        return;
      }
      this.progress += Math.random() * 12;
    }, 280);
  }

  showToast(text: string, danger = false) {
    const el = document.createElement('div');
    el.className = `toast-custom position-fixed top-0 start-50 translate-middle-x mt-3 px-4 py-2 rounded shadow ${
      danger ? 'bg-danger text-white' : 'bg-success text-white'
    }`;
    el.innerText = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
}
