import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AssessmentStateService } from '../shared/assessment-state.service';

export const DUMMY_DATA = {
  eyebrow: 'A Tool for the Textile Industry',
  brandLeft: 'BluWin',
  brandRight: 'Reput.ai',
  tag: 'DPP Readiness Scan',
  heading: 'What we bring to the table',
  subtitle: 'Two teams, one goal: DPP-ready, lower-impact textiles.',
  reput: {
    tag: 'The data',
    name: 'RePut.ai',
    role: 'Digital infrastructure for product and supply-chain information',
    chips: [
      'DPP creation and management',
      'Multi-tier supplier traceability',
      'Supplier onboarding and data collection',
      'Evidence and product data in one place',
    ],
  },
  bluwin: {
    tag: 'The performance',
    name: 'BluWin',
    role: 'Technical consultancy behind the numbers',
    chips: [
      'SBTi and decarbonisation consultancy',
      'Energy, steam and water assessments',
      'Chemical management and RSL risk',
      'Cradle to Cradle certification',
    ],
  },
  hubPill: 'Audit-ready DPPs for every SKU',
  closingText:
    'RePut.ai structures and connects the data. BluWin improves the environmental performance behind it. Together we walk beside you, from data gaps to a live DPP.',
};

@Component({
  selector: 'app-positioning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './positioning.html',
  styleUrl: './positioning.scss',
})
export class Positioning implements OnInit, OnDestroy {
  readonly data = DUMMY_DATA;
  showScoreBtn = signal<boolean>(false);
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    private state: AssessmentStateService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const reduceMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        this.showScoreBtn.set(true);
      } else {
        this.timerId = setTimeout(() => {
          this.showScoreBtn.set(true);
        }, 2700);
      }
    } else {
      this.showScoreBtn.set(true);
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  chipDelay(i: number, base: number): string {
    return `${(base + i * 0.18).toFixed(2)}s`;
  }

  onBack(): void {
    this.router.navigate([this.state.getBackRoute('positioning')]);
  }

  onContinue(): void {
    this.router.navigate(['/score']);
  }
}

