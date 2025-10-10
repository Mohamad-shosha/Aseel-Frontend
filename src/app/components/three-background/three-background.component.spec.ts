import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeBackgroundComponent } from './three-background.component';

describe('ThreeBackgroundComponent', () => {
  let component: ThreeBackgroundComponent;
  let fixture: ComponentFixture<ThreeBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreeBackgroundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
