import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isSidebarActive = false;

  ngOnInit(): void {}

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }

  closeSidebar(): void {
    this.isSidebarActive = false;
  }

  reloadPage(): void {
    window.location.reload();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(): void {
    this.isSidebarActive = false;
  }
}
