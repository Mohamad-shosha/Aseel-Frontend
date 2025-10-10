// three-background.component.ts
import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-background',
  template: '<div class="three-container"></div>',
  styles: [
    `
      .three-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
      }
    `,
  ],
})
export class ThreeBackgroundComponent implements OnInit, OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.PointsMaterial;
  private particles!: THREE.Points;
  private animationId: number = 0;
  private mouseX = 0;
  private mouseY = 0;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.initThree();
    this.createParticles();
    this.animate();
    this.addEventListeners();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  private initThree() {
    const container = this.el.nativeElement.querySelector('.three-container');

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.0008);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.z = 1000;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);
  }

  private createParticles() {
    const positions = [];
    const colors = [];
    const sizes = [];

    const color = new THREE.Color();
    const particleCount = 5000;

    for (let i = 0; i < particleCount; i++) {
      positions.push(
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000
      );

      // Gradient colors
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        color.setHex(0x0d6efd); // Blue
      } else if (colorChoice < 0.66) {
        color.setHex(0x0dcaf0); // Cyan
      } else {
        color.setHex(0x6610f2); // Purple
      }

      colors.push(color.r, color.g, color.b);
      sizes.push(Math.random() * 5 + 1);
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );
    this.geometry.setAttribute(
      'size',
      new THREE.Float32BufferAttribute(sizes, 1)
    );

    this.material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // Rotate particles
    this.particles.rotation.x += 0.0005;
    this.particles.rotation.y += 0.0005;

    // Mouse interaction
    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  };

  private addEventListeners() {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private onMouseMove = (event: MouseEvent) => {
    this.mouseX = (event.clientX - window.innerWidth / 2) * 0.5;
    this.mouseY = (event.clientY - window.innerHeight / 2) * 0.5;
  };
}
