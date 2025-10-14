import { Component, EventEmitter, Output } from '@angular/core';
import { VisionService } from '../../services/vision.service';

@Component({
  selector: 'app-upload-section',
  templateUrl: './upload-section.component.html',
  styleUrls: ['./upload-section.component.css'],
})
export class UploadSectionComponent {
  @Output() uploadComplete = new EventEmitter<any>();

  isDragOver = false;
  isUploading = false;
  progress = 0;
  fileName = '';
  selectedFile?: File;
  showSuccessPopup = false;

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

    this.vision.uploadImage(file).subscribe({
      next: (resp: any) => {
        this.progress = 100;
        this.isUploading = false;

        // رسالة نجاح مؤقتة
        this.showSuccessPopup = true;
        setTimeout(() => (this.showSuccessPopup = false), 2500);

        this.uploadComplete.emit(resp);
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.isUploading = false;
      },
    });

    // محاكاة تقدم الرفع
    const interval = setInterval(() => {
      if (this.progress >= 92) {
        clearInterval(interval);
        return;
      }
      this.progress += Math.random() * 12;
    }, 280);
  }
}
