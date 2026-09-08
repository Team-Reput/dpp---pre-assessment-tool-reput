import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialOriginService } from './material-origin.service';
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-material-origin',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './material-origin.html',
  styleUrl: './material-origin.scss',
})
export class MaterialOrigin {
  readonly totalSteps = 12;
  readonly currentStep = 5;

  form: FormGroup;
  isSubmitting = false;
  submitError = '';

  // Maps internal short value → full label saved to DB (constraint dropped, see note above)
  readonly dataCollectedLabels: Record<string, string> = {
    yes: 'Yes, we collect this',
    partially: 'Partially',
    'not-yet': 'Not yet',
  };

  readonly collectionOptions = [
    { value: 'yes', title: 'Yes, we collect this', description: 'Structured data exists and is current' },
    { value: 'partially', title: 'Partially', description: 'Some data exists, incomplete or ad hoc' },
    { value: 'not-yet', title: 'Not yet', description: 'No systematic data collection here' },
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
    private materialOriginService: MaterialOriginService,
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
    const next = current.includes(system) ? current.filter((s) => s !== system) : [...current, system];
    ctrl?.setValue(next);
  }

  isSystemSelected(system: string): boolean {
    const current: string[] = this.form.get('systems')?.value ?? [];
    return current.includes(system);
  }

  onBack(): void {
    this.router.navigate(['/material-composition']);
  }

  onContinue(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError = 'Please select an option before continuing.';
      return;
    }

    const assId = this.assessmentState.getAssId();
    if (!assId) {
      this.submitError = 'Missing assessment ID — please start over from contact.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const payload = {
      ass_id: assId,
      status: this.dataCollectedLabels[this.form.value.dataCollected],
      data: JSON.stringify(this.form.value.systems),
    };

    this.materialOriginService.saveMaterialOrigin(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Material origin saved:', response);
        this.router.navigate(['/supply-chain']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}