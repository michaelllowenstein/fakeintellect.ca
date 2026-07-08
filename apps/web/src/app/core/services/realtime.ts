import { Injectable, inject, OnDestroy } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, DatabaseReference } from 'firebase/database';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from './config';
import type { RealtimePostStats } from '@fakeintellect/types';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private readonly config: ConfigService = inject(ConfigService);
  private firebaseApp: FirebaseApp;
  private activeRefs: DatabaseReference[] = [];

  constructor() {
    this.firebaseApp = initializeApp(this.config.firebaseConfig);
  }

  watchPostStats(postId: string): Observable<RealtimePostStats> {
    const db = getDatabase(this.firebaseApp);
    const statsRef = ref(db, `post_stats/${postId}`);
    this.activeRefs.push(statsRef);

    const subject = new BehaviorSubject<RealtimePostStats>({
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      activeReaders: 0,
    });

    onValue(statsRef, (snapshot: { val: () => any; }) => {
      const data = snapshot.val();
      if (data) {
        subject.next({
          viewCount: data.viewCount ?? 0,
          likeCount: data.likeCount ?? 0,
          commentCount: data.commentCount ?? 0,
          activeReaders: data.activeReaders ?? 0,
        });
      }
    });

    return subject.asObservable();
  }

  watchActiveReaders(postId: string): Observable<number> {
    const db = getDatabase(this.firebaseApp);
    const readersRef = ref(db, `active_readers/${postId}`);
    this.activeRefs.push(readersRef);

    const subject = new BehaviorSubject<number>(0);

    onValue(readersRef, (snapshot) => {
      const readers = snapshot.val();
      subject.next(readers ? Object.keys(readers).length : 0);
    });

    return subject.asObservable();
  }

  ngOnDestroy(): void {
    this.activeRefs.forEach((r) => off(r));
  }
}
