import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IdentificationService } from './identification.service';
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-identification',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './identification.html',
  styleUrl: './identification.scss',
})
export class Identification {
  readonly totalSteps = 12;
  readonly currentStep = 3;

  form: FormGroup;
  isSubmitting = false;
  submitError = '';

  // Maps the internal short value to the exact label shown on screen
  readonly dataCollectedLabels: Record<string, string> = {
    yes: 'Yes, we collect this',
    partially: 'Partially',
    'not-yet': 'Not yet',
  };

  readonly collectionOptions = [
    {
      value: 'yes',
      title: 'Yes, we collect this',
      description: 'Structured data exists and is current',
    },
    {
      value: 'partially',
      title: 'Partially',
      description: 'Some data exists, incomplete or ad hoc',
    },
    {
      value: 'not-yet',
      title: 'Not yet',
      description: 'No systematic data collection here',
    },
  ];

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
    private identificationService: IdentificationService,
    private assessmentState: AssessmentStateService
  ) {
    this.form = this.fb.group({
      dataCollected: ['', Validators.required],
      systems: this.fb.control<string[]>([]),
    });
  }

  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  get showSystemsSection(): boolean {
    const value = this.form.get('dataCollected')?.value;
    return value === 'yes' || value === 'partially';
  }

  selectDataCollected(value: string): void {
    this.form.get('dataCollected')?.setValue(value);
  }

  toggleSystem(system: string): void {
    const ctrl = this.form.get('systems');
    const current: string[] = ctrl?.value ?? [];
    const next = current.includes(system)
      ? current.filter((s) => s !== system)
      : [...current, system];
    ctrl?.setValue(next);
  }

  isSystemSelected(system: string): boolean {
    const current: string[] = this.form.get('systems')?.value ?? [];
    return current.includes(system);
  }

  onBack(): void {
    this.router.navigate(['/profile']);
  }

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

    // Step 3: build the payload
    const payload = {
      ass_id: assId,
      status: this.dataCollectedLabels[this.form.value.dataCollected], // full label text
      data: JSON.stringify(this.form.value.systems), // array → JSON string, e.g. '["GOTS Transaction Certificate"]'
    };

    // Step 4: send it to the backend
    this.identificationService.saveIdentification(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Identification saved:', response);
        this.router.navigate(['/material-comp']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}