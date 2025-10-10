import { Component, AfterViewInit, HostListener } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements AfterViewInit {
  @HostListener('window:scroll', [])
  onScroll() {
    const scrollY = window.scrollY;
    const shapes = document.querySelectorAll('.shape');

    shapes.forEach((shape, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const moveX = direction * (scrollY * (index + 1) * 0.3);
      const rotateZ = direction * (scrollY * 0.1);
      (
        shape as HTMLElement
      ).style.transform = `translateX(${moveX}px) rotateZ(${rotateZ}deg)`;
    });
  }

  ngAfterViewInit(): void {
    // حركة ناعمة دائمة باستخدام gsap
    gsap.to('.shape.s1', {
      y: 30,
      x: 20,
      rotation: 360,
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to('.shape.s2', {
      y: -30,
      x: -20,
      rotation: -360,
      duration: 25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
}
