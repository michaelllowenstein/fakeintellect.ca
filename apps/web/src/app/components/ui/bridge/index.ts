import {
  Component, Input, OnInit, OnDestroy, OnChanges,
  ElementRef, ViewChild, NgZone, PLATFORM_ID, inject, SimpleChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type IslandName =
  | 'FeaturedPostsGrid'
  | 'StatsTicker'
  | 'NewsletterSignup'
  | 'CommentThread'
  | 'PostReactions'
  | 'SearchModal'
  | 'ReadingProgress';

@Component({
  selector: 'app-bridge',
  standalone: true,
  template: `<div #mountPoint class="react-island"></div>`,
  styles: [`:host { display: block; } .react-island { min-height: 1px; }`],
})
export class Bridge implements OnInit, OnDestroy, OnChanges {
  @Input({ required: true }) componentName!: IslandName;
  @Input() props: Record<string, unknown> = {};

  @ViewChild('mountPoint', { static: true }) mountPoint!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private unmountFn: (() => void) | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.mount();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['props'] && !changes['props'].firstChange) {
      this.unmount();
      this.mount();
    }
  }

  ngOnDestroy() {
    this.unmount();
  }

  private mount() {
    // Run OUTSIDE Angular's zone to prevent zone.js from tracking React events
    this.ngZone.runOutsideAngular(async () => {
      const { mountIsland } = await import('./islands/mount');
      this.unmountFn = mountIsland(
        this.mountPoint.nativeElement,
        this.componentName,
        { ...this.props, ngZone: this.ngZone },
      );
    });
  }

  private unmount() {
    if (this.unmountFn) {
      this.unmountFn();
      this.unmountFn = null;
    }
  }
}
