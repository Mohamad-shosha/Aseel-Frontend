// landing-section.component.ts
import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-landing-section',
  templateUrl: './landing-section.component.html',
  styleUrls: ['./landing-section.component.css'],
})
export class LandingSectionComponent implements OnInit, AfterViewInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.initMorphingShape();
  }

  ngAfterViewInit() {
    this.animateContent();
  }

  private animateContent() {
    const tl = gsap.timeline();

    tl.from('.hero-title', {
      opacity: 0,
      y: 100,
      duration: 1,
      ease: 'power4.out',
    })
      .from(
        '.hero-subtitle',
        {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.5'
      )
      .from(
        '.hero-card',
        {
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 0.8,
          ease: 'back.out(1.2)',
        },
        '-=0.3'
      );

    // Animate icons
    gsap.to('.hero-card i', {
      y: -5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.2,
    });
  }

  private initMorphingShape() {
    const canvas = document.createElement('canvas');
    canvas.id = 'morphing-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';

    const container = this.el.nativeElement.querySelector('#about');
    if (container) {
      container.style.position = 'relative';
      container.prepend(canvas);

      const ctx = canvas.getContext('2d')!;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;

      let time = 0;

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw morphing gradient circles
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 3;

        for (let i = 0; i < 3; i++) {
          const radius = 100 + Math.sin(time + i) * 50;
          const x = centerX + Math.cos(time * 0.5 + i * 2) * 100;
          const y = centerY + Math.sin(time * 0.5 + i * 2) * 50;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(13, 110, 253, ${0.1 - i * 0.03})`);
          gradient.addColorStop(1, 'rgba(13, 202, 240, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        time += 0.02;
        requestAnimationFrame(animate);
      };

      animate();
    }
  }
}
