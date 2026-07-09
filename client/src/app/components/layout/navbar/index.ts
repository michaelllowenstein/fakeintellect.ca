import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './index.html',
  styles: [`
    :host { display: block; }
    .scrolled { box-shadow: 0 1px 0 rgba(var(--color-border) / 0.3); }
  `]
})
export class Navbar {
  isScrolled = signal(false);
  mobileOpen = signal(false);

  navLinks = [
    { path: '/',       label: 'Home',    exact: true },
    { path: '/blog',  label: 'Writing', exact: false },
    { path: '/about',  label: 'About',   exact: true },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }
}
