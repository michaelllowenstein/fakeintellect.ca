import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  Post, PostSummary, PaginatedResponse, PostListParams
} from '@fakeintellect/types';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);

  listPosts(params: PostListParams = {}): Observable<PaginatedResponse<PostSummary>> {
    let httpParams = new HttpParams();
    if (params.page)     httpParams = httpParams.set('page', params.page);
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.tag)      httpParams = httpParams.set('tag', params.tag);
    if (params.search)   httpParams = httpParams.set('search', params.search);
    if (params.featured) httpParams = httpParams.set('featured', 'true');
    return this.http.get<PaginatedResponse<PostSummary>>('/api/v1/posts', { params: httpParams });
  }

  getFeaturedPosts(): Observable<{ data: PostSummary[] }> {
    return this.http.get<{ data: PostSummary[] }>('/api/v1/posts/featured');
  }

  getPost(slug: string): Observable<{ data: Post }> {
    return this.http.get<{ data: Post }>(`/api/v1/posts/${slug}`);
  }

  getRelatedPosts(slug: string): Observable<{ data: PostSummary[] }> {
    return this.http.get<{ data: PostSummary[] }>(`/api/v1/posts/${slug}/related`);
  }

  likePost(id: string): Observable<void> {
    return this.http.post<void>(`/api/v1/posts/${id}/like`, {});
  }
}
