import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './index.html',
})
export class Footer {
  currentYear = new Date().getFullYear();

  footerLinks = [
    { path: '/', label: 'Home' },
    { path: '/posts', label: 'All Writing' },
    { path: '/about', label: 'About' },
  ];
}
