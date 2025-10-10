import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LottiePlayerComponent } from './lottie-player.component';

describe('LottiePlayerComponent', () => {
  let component: LottiePlayerComponent;
  let fixture: ComponentFixture<LottiePlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LottiePlayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LottiePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
