import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { LayoutComponent } from './components/layout/layout.component';
import { LandingSectionComponent } from './components/landing-section/landing-section.component';
import { UploadSectionComponent } from './components/upload-section/upload-section.component';
import { ResultsSectionComponent } from './components/results-section/results-section.component';
import { CircularProgressComponent } from './components/circular-progress/circular-progress.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { LottiePlayerComponent } from './components/lottie-player/lottie-player.component';
import { ThreeBackgroundComponent } from './components/three-background/three-background.component';
import { HomepageComponent } from './components/homepage/homepage.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LayoutComponent,
    LandingSectionComponent,
    UploadSectionComponent,
    ResultsSectionComponent,
    CircularProgressComponent,
    FooterComponent,
    LottiePlayerComponent,
    ThreeBackgroundComponent,
    HomepageComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
  ],
  providers: [],
  exports: [ResultsSectionComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
