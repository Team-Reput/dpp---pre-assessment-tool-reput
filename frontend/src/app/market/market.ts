import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AssessmentStateService,
  MARKET_OPTIONS,
  ASSURE,
} from '../shared/assessment-state.service';
import { ProfileService } from '../profile/profile.service';

export const DUMMY_DATA = {
  eyebrow: 'A Tool for the Textile Industry',
  brandLeft: 'BluWin',
  brandRight: 'Reput.ai',
  tag: 'DPP Readiness Scan',
  stepTag: 'Your markets',
  heading: 'Where do you sell?',
  subtitle:
    'Select your primary export markets. This helps us line your readiness up with the right regulations as they arrive.',
  marketOptions: MARKET_OPTIONS,
  assureText: ASSURE.market,
};

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market.html',
  styleUrl: './market.scss',
})
export class Market {
  readonly data = DUMMY_DATA;

  constructor(
    private router: Router,
    public assessmentState: AssessmentStateService,
    private profileService: ProfileService
  ) {}

  get selectedMarkets(): string[] {
    return this.assessmentState.markets();
  }

  get stepMeta() {
    return this.assessmentState.getStepMeta('market');
  }

  get segments(): number[] {
    return Array.from({ length: this.stepMeta.total }, (_, i) => i);
  }

  isSelected(market: string): boolean {
    return this.selectedMarkets.includes(market);
  }

  toggleMarket(market: string): void {
    this.assessmentState.toggleMarket(market);
  }

  onBack(): void {
    this.router.navigate([this.assessmentState.getBackRoute('market')]);
  }

  onContinue(): void {
    if (!this.selectedMarkets.length) return;

    const assId = this.assessmentState.getAssId();
    if (assId) {
      const p = this.assessmentState.profile();
      const isSupplier = p.persona === 'supplier';
      this.profileService
        .saveProfile({
          ass_id: assId,
          assessing_scope: isSupplier
            ? 'Supply Chain Partner'
            : 'A brand, assessing a single product',
          product_category: isSupplier ? '' : 'Apparel & garments',
          primary_product_category: isSupplier
            ? p.tier || 'tier1'
            : 'Apparel & garments',
          export_volume: '1M – 10M units / year',
          export_markets: this.selectedMarkets.join(','),
          tier: isSupplier ? p.tier || 'tier1' : p.visibility || 'tier1',
        })
        .subscribe({ error: () => {} });
    }

    this.router.navigate([this.assessmentState.getNextRoute('market')]);
  }
}

