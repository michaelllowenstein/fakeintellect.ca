import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PostsService } from '../../../core/services/posts';
import { Bridge } from '../../ui/bridge';
import { Postcard } from '../../ui/postcard';
import type { Post, PostSummary } from '@fakeintellect/types';
import { marked } from 'marked';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, Bridge, Postcard],
  templateUrl: './index.html',
  styles: [
    `
      :host ::ng-deep .fi-prose {
        h1,
        h2,
        h3,
        h4 {
          font-family: 'Playfair Display', Georgia, serif;
          color: #e8e6e1;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.25;
        }
        h2 {
          font-size: 1.75rem;
        }
        h3 {
          font-size: 1.35rem;
        }
        p {
          color: #a8a29e;
          line-height: 1.85;
          margin-bottom: 1.5rem;
          font-size: 1.0625rem;
        }
        a {
          color: #a3e635;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        code {
          font-family: ui-monospace, monospace;
          font-size: 0.8rem;
          color: #a3e635;
          background: rgba(163, 230, 53, 0.1);
          padding: 0.15rem 0.4rem;
          border: 1px solid rgba(163, 230, 53, 0.15);
        }
        pre {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.5rem;
          overflow-x: auto;
          margin: 2rem 0;
        }
        blockquote {
          border-left: 2px solid #a3e635;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b6560;
        }
        ul,
        ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: #a8a29e;
          line-height: 1.85;
        }
        li {
          margin-bottom: 0.5rem;
        }
        strong {
          color: #e8e6e1;
          font-weight: 600;
        }
        em {
          font-style: italic;
        }
        hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin: 3rem 0;
        }
      }
    `,
  ],
})
export class PostDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  post = signal<Post | null>(null);
  relatedPosts = signal<PostSummary[]>([]);
  loading = signal(true);
  notFound = signal(false);
  copied = signal(false);

  renderedContent = computed<SafeHtml>(() => {
    const p = this.post();
    if (!p) return '';
    const html = marked(p.content) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  reactionProps = computed(() => {
    const p = this.post();
    if (!p) return {};
    return {
      postId: p.id,
      initialStats: {
        viewCount: p.viewCount,
        likeCount: p.likeCount,
        commentCount: p.commentCount,
        activeReaders: 0,
      },
    };
  });

  currentUrl() {
    return encodeURIComponent(window.location.href);
  }

  encodeTitle(title: string) {
    return encodeURIComponent(`"${title}"`);
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          this.loading.set(true);
          this.post.set(null);
          this.notFound.set(false);
          return this.postsService.getPost(params['slug']);
        }),
        tap((res) => {
          this.post.set(res.data);
          this.loading.set(false);
          document.title = `${res.data.title} — FakeIntellect`;
          // Load related posts
          this.postsService.getRelatedPosts(res.data.slug).subscribe({
            next: (r) => this.relatedPosts.set(r.data),
          });
        }),
      )
      .subscribe({
        error: () => {
          this.loading.set(false);
          this.notFound.set(true);
        },
      });
  }
}
