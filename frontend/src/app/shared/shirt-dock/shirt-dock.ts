

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  effect,
  signal,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AssessmentStateService, SHIRT_IMG } from '../assessment-state.service';


export const DUMMY_DATA = {
  labelLive: 'Your readiness, live',
  labelFinal: 'Your DPP readiness',
  defaultCaption: '',
};

@Component({
  selector: 'app-shirt-dock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shirt-dock.html',
  styleUrl: './shirt-dock.scss',
})
export class ShirtDockComponent implements OnInit, OnDestroy {
  @Input() inline = false;
  @Input() customCaption = '';
  readonly shirtImg = SHIRT_IMG;
  readonly dummy = DUMMY_DATA;

  displayedPct = signal<number>(0);
  caption = signal<string>('');
  levelTransform = signal<string>('translateY(535.0px)');
  isHot = signal<boolean>(false);
  isBump = signal<boolean>(false);
  rx = signal<string>('0deg');
  ry = signal<string>('0deg');

  private prevPct = 0;
  private animFrameId: number | null = null;
  private platformId = inject(PLATFORM_ID);

  constructor(public state: AssessmentStateService) {
    effect(() => {
      const p = this.state.shirtProgress(this.inline);
      const targetPct = p.pct;
      const fromPct = this.prevPct;

      this.levelTransform.set(`translateY(${this.state.levelY(targetPct).toFixed(1)}px)`);
      this.caption.set(this.state.shirtCaption(p));
      this.isHot.set(targetPct > 0);

      if (targetPct > fromPct && isPlatformBrowser(this.platformId)) {
        this.isBump.set(false);
        setTimeout(() => this.isBump.set(true), 10);
      }

      this.tweenPct(fromPct, targetPct, 650);
      this.prevPct = targetPct;
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && !this.inline) {
      document.body.classList.add('has-dock');
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.inline) {
        document.body.classList.remove('has-dock');
      }
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
      }
    }
  }

  onPointerMove(event: PointerEvent, el: HTMLElement): void {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const ryVal = (((event.clientX - r.left) / r.width - 0.5) * 36).toFixed(1) + 'deg';
    const rxVal = ((0.5 - (event.clientY - r.top) / r.height) * 20).toFixed(1) + 'deg';
    this.ry.set(ryVal);
    this.rx.set(rxVal);
  }

  onPointerLeave(): void {
    this.ry.set('0deg');
    this.rx.set('0deg');
  }

  private tweenPct(from: number, to: number, duration: number): void {
    if (!isPlatformBrowser(this.platformId) || duration <= 0) {
      this.displayedPct.set(Math.round(to));
      return;
    }
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      this.displayedPct.set(Math.round(from + (to - from) * k));
      if (k < 1) {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };
    this.animFrameId = requestAnimationFrame(tick);
  }
}

