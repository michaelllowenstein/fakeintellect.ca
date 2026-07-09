import {
  Component, OnInit, inject, signal, PLATFORM_ID, AfterViewInit, ElementRef, ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../../core/services/posts';
import { Postcard } from '../../ui/postcard';
import { Bridge } from '../../ui/bridge';
import type { PostSummary } from '@fakeintellect/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, Postcard, Bridge],
  templateUrl: './index.html',
  styles: [`
    .fi-grid-bg {
      background-image:
        linear-gradient(rgba(var(--color-accent) / 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(var(--color-accent) / 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
    }
  `]
})
export class HomePage implements OnInit {
  private readonly postsService: PostsService = inject(PostsService);
  private readonly platformId = inject(PLATFORM_ID);

  featuredPosts = signal<PostSummary[]>([]);
  recentPosts = signal<PostSummary[]>([]);

  ngOnInit() {
    this.postsService.getFeaturedPosts().subscribe({
      next: (res: { data: PostSummary[]; }) => this.featuredPosts.set(res.data),
    });

    this.postsService.listPosts({ pageSize: 6 }).subscribe({
      next: (res: { data: PostSummary[]; }) => this.recentPosts.set(res.data),
    });
  }
}
