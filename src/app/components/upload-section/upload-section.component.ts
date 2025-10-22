import { Component, EventEmitter, Output } from '@angular/core';
import Swal from 'sweetalert2';
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

  accessPassword: string = '';
  errorMessage: string = '';

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
    if (!this.accessPassword) {
      this.errorMessage = '⚠️ من فضلك أدخل كلمة السر قبل رفع المشروع';
      setTimeout(() => (this.errorMessage = ''), 2500);
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    this.isUploading = true;
    this.progress = 0;

    Swal.fire({
      title: 'جارٍ رفع الملف...',
      html: 'يرجى الانتظار حتى اكتمال العملية.',
      allowOutsideClick: false,
      background: '#f8fafc',
      color: '#1a1a1a',
      didOpen: () => Swal.showLoading(),
    });

    this.vision.uploadImage(file, this.accessPassword).subscribe({
      next: (resp: any) => {
        this.progress = 100;
        this.isUploading = false;
        Swal.close();

        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: 'تم رفع الملف بنجاح!',
          showConfirmButton: false,
          timer: 2500,
          background: '#f8fafc',
          color: '#1a1a1a',
          width: window.innerWidth < 600 ? '90%' : '380px',
          customClass: {
            popup: 'success-toast',
            title: 'success-toast-title',
          },
        });

        this.uploadComplete.emit(resp);
      },
      error: () => {
        this.isUploading = false;
        Swal.close();

        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: '❌ كلمة السر غير صحيحة أو حدث خطأ أثناء رفع الملف!',
          showConfirmButton: false,
          timer: 3000,
          background: '#fff0f0',
          color: '#b91c1c',
          width: window.innerWidth < 600 ? '90%' : '380px',
          customClass: {
            popup: 'error-toast',
            title: 'error-toast-title',
          },
        });
      },
    });

    const interval = setInterval(() => {
      if (this.progress >= 92) {
        clearInterval(interval);
        return;
      }
      this.progress += Math.random() * 10;
    }, 250);
  }
}
