import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AssessmentStateService,
  MARKET_OPTIONS,
  ASSURE,
} from '../shared/assessment-state.service';

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
    public assessmentState: AssessmentStateService
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
    this.router.navigate([this.assessmentState.getNextRoute('market')]);
  }
}

