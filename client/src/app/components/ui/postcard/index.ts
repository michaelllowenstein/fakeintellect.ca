import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import type { PostSummary } from '@fakeintellect/types';

@Component({
  selector: 'app-postcard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './index.html',
  styles: [`
    .featured-card { grid-column: span 2; }
    @media (max-width: 768px) { .featured-card { grid-column: span 1; } }
  `]
})
export class Postcard {
  @Input({ required: true }) post!: PostSummary;
  @Input() featured = false;
}
