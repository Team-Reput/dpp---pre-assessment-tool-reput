import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TraceabilityService } from './traceability.service';
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-traceability',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './traceability.html',
  styleUrl: './traceability.scss',
})
export class Traceability {
  // Used by the progress bar in the template ("STEP 7 / 12")
  readonly totalSteps = 12;
  readonly currentStep = 7;

  // Holds the form fields and their validation state
  form: FormGroup;

  // True while the API call is in flight — disables button, shows "Submitting..."
  isSubmitting = false;

  // Error message shown to the user (validation failure or API error)
  submitError = '';

  // Used by the template's @for loop to render the 3 radio cards.
  // Must be an ARRAY (not an object) because Angular's @for needs something iterable.
  readonly collectionOptions = [
    { value: 'yes', title: 'Yes, we collect this', description: 'Structured data exists and is current' },
    { value: 'partially', title: 'Partially', description: 'Some data exists, incomplete or ad hoc' },
    { value: 'not-yet', title: 'Not yet', description: 'No systematic data collection here' },
  ];

  // Used ONLY when building the payload — maps the short internal value
  // (e.g. 'yes') to the full readable label saved in the database
  readonly dataCollectedLabels: Record<string, string> = {
    yes: 'Yes, we collect this',
    partially: 'Partially',
    'not-yet': 'Not yet',
  };

  readonly systemOptions = [
    'OEKO-TEX Standard 100 / STeP certificate',
    'GOTS Transaction Certificate',
    'Cradle to Cradle Material Health Certificate',
    'ZDHC InCheck / MRSL conformance report',
    'Higg FEM verified score report',
    'Higg FSLM (social/labor) report',
    'Bill of Lading / Commercial Invoice',
    'Purchase Order / production docket',
    'Internal system only',
    'None yet',
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private traceabilityService: TraceabilityService,   // calls /api/traceability
    private assessmentState: AssessmentStateService       // holds ass_id from the Contact step
  ) {
    this.form = this.fb.group({
      dataCollected: ['', Validators.required],
      systems: this.fb.control<string[]>([]),
    });
  }

  // Used by the template to render one progress-bar segment per step
  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  // Controls whether the "Through which system(s)?" section is shown
  get showSystemsSection(): boolean {
    const value = this.form.get('dataCollected')?.value;
    return value === 'yes' || value === 'partially';
  }

  // Called when user clicks one of the 3 radio cards
  selectDataCollected(value: string): void {
    this.form.get('dataCollected')?.setValue(value);
  }

  // Called when user clicks a system/certificate pill — toggles it on/off
  toggleSystem(system: string): void {
    const ctrl = this.form.get('systems');
    const current: string[] = ctrl?.value ?? [];
    const next = current.includes(system)
      ? current.filter((s) => s !== system)
      : [...current, system];
    ctrl?.setValue(next);
  }

  // Used by the template to highlight a pill as selected
  isSystemSelected(system: string): boolean {
    const current: string[] = this.form.get('systems')?.value ?? [];
    return current.includes(system);
  }

  // Navigate back to the previous step
  onBack(): void {
    this.router.navigate(['/supply-chain']);
  }

  // Called when user clicks "Continue"
  onContinue(): void {
    // Step 1: block submission if required fields are missing
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError = 'Please select an option before continuing.';
      return;
    }

    // Step 2: make sure we know which assessment this belongs to
    const assId = this.assessmentState.getAssId();
    if (!assId) {
      this.submitError = 'Missing assessment ID — please start over from contact.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Step 3: build the payload — status uses the full label, not the short code
    const payload = {
      ass_id: assId,
      status: this.dataCollectedLabels[this.form.value.dataCollected],
      data: JSON.stringify(this.form.value.systems),
    };

    // Step 4: send it to the backend
    this.traceabilityService.saveTraceabilityData(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Traceability data saved:', response);
        this.router.navigate(['/sustainability']); // move to next step only after success
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}