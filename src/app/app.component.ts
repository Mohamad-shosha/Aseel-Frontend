// app.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { VisionService } from './services/vision.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  showResults = false;
  analysisData: any;

  constructor(private vision: VisionService) {}

  ngOnInit() {
    this.initParticleCanvas();
  }

  ngAfterViewInit() {
    this.initGSAPAnimations();
  }

  onUploadComplete(data: any) {
    this.analysisData = data;
    this.showResults = true;

    // Animate results section entrance
    setTimeout(() => {
      const el = document.querySelector('#results');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      gsap.from('#results', {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'power3.out',
      });
    }, 200);
  }

  private initGSAPAnimations() {
    // Animate header on load
    gsap.from('.navbar', {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });

    // Floating animation for shapes
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

    // Scroll-triggered animations
    gsap.utils.toArray('.fade-in').forEach((element: any) => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power2.out',
      });
    });

    // Card hover animations
    gsap.utils.toArray('.card-ghost').forEach((card: any) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.08,
          y: -10,
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });
  }

  private initParticleCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';

    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        const colors = ['#0d6efd', '#0dcaf0', '#6610f2', '#d63384'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = '#0dcaf0';
            ctx.globalAlpha = 0.1 * (1 - distance / 150);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
}
