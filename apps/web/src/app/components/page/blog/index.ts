import {
  Component, OnInit, inject, signal, computed, DestroyRef
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { PostsService } from '../../../core/services/posts';
import { Postcard } from '../../ui/postcard';
import { Bridge } from '../../ui/bridge';
import type { PostSummary, PaginatedResponse } from '@fakeintellect/types';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [FormsModule, Postcard],
  templateUrl: './index.html'
})
export class BlogPage implements OnInit {
  private readonly postsService: PostsService = inject(PostsService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();

  result = signal<PaginatedResponse<PostSummary> | null>(null);
  pagination = computed(() => this.result()?.pagination ?? null);
  total      = computed(() => this.pagination()?.total ?? 0);
  posts = computed(() => this.result()?.data ?? []);
  loading = signal(true);
  page = signal(1);
  activeTag = signal<string | undefined>(undefined);
  searchQuery = '';

  ngOnInit() {
    // Watch for tag param changes
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.activeTag.set(params['slug']);
        this.page.set(1);
        this.load();
      });

    // Debounced search
    this.search$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(350),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.search$.next(query);
  }

  clearSearch() {
    this.searchQuery = '';
    this.page.set(1);
    this.load();
  }

  goToPage(p: number) {
    this.page.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private load() {
    this.loading.set(true);
    this.postsService
      .listPosts({
        page: this.page(),
        pageSize: 9,
        tag: this.activeTag(),
        search: this.searchQuery || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: PaginatedResponse<PostSummary> | null) => {
          this.result.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
