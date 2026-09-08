import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from './profile.service';
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  // Used to render the step progress bar (e.g. "STEP 2 / 13")
  readonly totalSteps = 13;
  readonly currentStep = 2;
  readonly assessingTypeLabels: Record<string, string> = {
  brand: 'A brand, assessing a single product',
  facility: 'A facility, assessing full supply chain',
};

  // Holds all form fields and their validation state
  form: FormGroup;

  // Tracks whether the API call is in progress (used to disable button / show "Submitting...")
  isSubmitting = false;

  // Holds any error message shown to the user (API failure, missing ass_id, or incomplete form)
  submitError = '';

  // Dropdown options for "Primary product category"
  readonly productCategories = [
    'Apparel & garments',
    'Fabric & textiles',
    'Footwear',
    'Home textiles',
    'Technical / industrial textiles',
    'Chemical suppliers',
  ];

  // Dropdown options for "Annual export volume"
  readonly exportVolumes = [
    'Under 1M units / year',
    '1M – 10M units / year',
    '10M – 50M units / year',
    '50M+ units / year',
  ];

  // Multi-select pill options for "Primary export markets"
  readonly exportMarketOptions = ['EU', 'UK', 'USA', 'China', 'Other'];

  // Radio-card options for "Production tiers included"
  readonly tierOptions = [
    {
      value: 'tier1',
      title: 'Tier 1 only',
      description: 'Final-stage manufacturing / assembly',
    },
    {
      value: 'tier1-2',
      title: 'Tier 1 + Tier 2',
      description: 'Includes fabric/component suppliers',
    },
    {
      value: 'tier1-2-3',
      title: 'Tier 1 + 2 + 3',
      description: 'Includes raw material / farm-level suppliers',
    },
    {
      value: 'not-sure',
      title: 'Not sure',
      description: 'No clear view of tiers included',
    },
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private profileService: ProfileService,       // calls the backend /api/profile endpoint
    private assessmentState: AssessmentStateService // holds the ass_id created during the Contact step
  ) {
    // Define all form fields and which ones are required
    this.form = this.fb.group({
      assessingType: ['', Validators.required],           // "brand" or "facility" — set via selectAssessingType()
      productOrCategory: [''],                             // only required if assessingType === 'brand'
      primaryProductCategory: ['', Validators.required],
      annualExportVolume: ['', Validators.required],
      exportMarkets: this.fb.control<string[]>([]),         // array of selected pills, e.g. ['EU', 'UK']
      productionTiers: ['', Validators.required],           // set via selectProductionTier()
    });
  }

  // Used by the progress bar in the template to render one segment per step
  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  // Controls whether the "Product or category being assessed" field is shown
  get isBrandSelected(): boolean {
    return this.form.get('assessingType')?.value === 'brand';
  }

  // Called when user clicks the "brand" or "facility" radio card
  selectAssessingType(type: 'brand' | 'facility'): void {
    this.form.get('assessingType')?.setValue(type);

    // productOrCategory is only required when assessing a single brand/product
    const productOrCategoryCtrl = this.form.get('productOrCategory');
    if (type === 'brand') {
      productOrCategoryCtrl?.setValidators(Validators.required);
    } else {
      productOrCategoryCtrl?.clearValidators();
      productOrCategoryCtrl?.setValue('');
    }
    productOrCategoryCtrl?.updateValueAndValidity();
  }

  // Called when user clicks a production-tier radio card
  selectProductionTier(value: string): void {
    this.form.get('productionTiers')?.setValue(value);
  }

  // Called when user clicks an export-market pill — toggles it on/off
  toggleExportMarket(market: string): void {
    const ctrl = this.form.get('exportMarkets');
    const current: string[] = ctrl?.value ?? [];
    const next = current.includes(market)
      ? current.filter((m) => m !== market)  // remove if already selected
      : [...current, market];                 // add if not selected
    ctrl?.setValue(next);
  }

  // Used by the template to highlight a pill as selected
  isMarketSelected(market: string): boolean {
    const current: string[] = this.form.get('exportMarkets')?.value ?? [];
    return current.includes(market);
  }

  // Navigate back to the previous step
  onBack(): void {
    this.router.navigate(['/contact']);
  }

  // Called when user clicks "Continue"
  onContinue(): void {
    // Step 1: block submission if required fields are missing
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // triggers red/error styling on empty required fields
      this.submitError = 'Please fill in all required fields before continuing.';
      return;
    }

    // Step 2: make sure we know which assessment (ass_id) this profile belongs to
    const assId = this.assessmentState.getAssId();
    if (!assId) {
      this.submitError = 'Missing assessment ID — please start over from contact.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Step 3: build the payload — keys must match what the backend controller expects
    const payload = {
  ass_id: assId,
  assessing_scope: this.assessingTypeLabels[this.form.value.assessingType], // ⬅ full label text now
  product_category: this.form.value.productOrCategory,
  primary_product_category: this.form.value.primaryProductCategory,
  export_volume: this.form.value.annualExportVolume,
  export_markets: (this.form.value.exportMarkets as string[]).join(','),
  tier: this.form.value.productionTiers,
};

    // Step 4: send it to the backend
    this.profileService.saveProfile(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Profile saved:', response);
        this.router.navigate(['/identification']); // move to next step only after success
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}