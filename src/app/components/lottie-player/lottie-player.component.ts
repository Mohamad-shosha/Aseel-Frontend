import {
  Component,
  AfterViewInit,
  ElementRef,
  Input,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import lottie from 'lottie-web';

@Component({
  selector: 'app-lottie-player',
  template: `<div
    #lottieContainer
    style="width:200px;height:200px;margin:auto"
  ></div>`,
})
export class LottiePlayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lottieContainer') container!: ElementRef;
  @Input() path!: string;
  private anim: any;

  ngAfterViewInit() {
    this.anim = lottie.loadAnimation({
      container: this.container.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: this.path,
    });
  }

  ngOnDestroy() {
    if (this.anim) this.anim.destroy();
  }
}
