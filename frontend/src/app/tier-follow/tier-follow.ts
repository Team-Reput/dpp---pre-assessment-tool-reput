import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AssessmentStateService,
  VISIBILITY_OPTIONS,
  TIER_OPTIONS,
  ASSURE,
  OptionItem,
} from '../shared/assessment-state.service';
import { ProfileService } from '../profile/profile.service';

export const DUMMY_DATA = {
  eyebrow: 'A Tool for the Textile Industry',
  brandLeft: 'BluWin',
  brandRight: 'Reput.ai',
  tag: 'DPP Readiness Scan',
  stepTag: 'Your role',
  brandHeading: 'How far can you see into your supply chain?',
  supplierHeading: 'Which part of the chain are you in?',
  brandSub: 'Tell us how many tiers you have visibility on. We’ll use it to point you to your next step.',
  supplierSub: 'We’ll tailor the questions to what your role can realistically provide.',
  visibilityOptions: VISIBILITY_OPTIONS,
  tierOptions: TIER_OPTIONS,
  assureBrand: ASSURE.tierBrand,
  assureSupplier: ASSURE.tierSupplier,
};

@Component({
  selector: 'app-tier-follow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tier-follow.html',
  styleUrl: './tier-follow.scss',
})
export class TierFollow {
  readonly data = DUMMY_DATA;

  constructor(
    private router: Router,
    public assessmentState: AssessmentStateService,
    private profileService: ProfileService
  ) {}

  get isBrand(): boolean {
    return this.assessmentState.profile().persona === 'brand';
  }

  get options(): OptionItem[] {
    return this.isBrand ? this.data.visibilityOptions : this.data.tierOptions;
  }

  get currentSelection(): string {
    const p = this.assessmentState.profile();
    return this.isBrand ? p.visibility : p.tier;
  }

  get stepMeta() {
    return this.assessmentState.getStepMeta('tierfollow');
  }

  get segments(): number[] {
    return Array.from({ length: this.stepMeta.total }, (_, i) => i);
  }

  selectOption(val: string): void {
    if (this.isBrand) {
      this.assessmentState.setVisibility(val as 'tier1' | 'tier12' | 'tier123' | 'unsure');
    } else {
      this.assessmentState.setTier(val as 'tier1' | 'tier2' | 'tier3' | 'chemical');
    }
  }

  onBack(): void {
    this.router.navigate([this.assessmentState.getBackRoute('tierfollow')]);
  }

  onContinue(): void {
    if (!this.currentSelection) return;

    const assId = this.assessmentState.getAssId();
    if (assId && !this.isBrand) {
      this.profileService
        .saveProfile({
          ass_id: assId,
          assessing_scope: 'Supply Chain Partner',
          product_category: '',
          primary_product_category: this.currentSelection,
          export_volume: '1M – 10M units / year',
          export_markets: 'EU',
          tier: this.currentSelection,
        })
        .subscribe({ error: () => {} });
    }

    this.router.navigate([this.assessmentState.getNextRoute('tierfollow')]);
  }
}

