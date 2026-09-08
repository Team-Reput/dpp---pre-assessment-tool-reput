import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComplianceService } from './compliance.service';
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './compliance.html',
  styleUrl: './compliance.scss',
})
export class Compliance {
  readonly totalSteps = 12;
  readonly currentStep = 9;

  form: FormGroup;
  isSubmitting = false;
  submitError = '';

  readonly collectionOptions = [
    { value: 'yes', title: 'Yes, we collect this', description: 'Structured data exists and is current' },
    { value: 'partially', title: 'Partially', description: 'Some data exists, incomplete or ad hoc' },
    { value: 'not-yet', title: 'Not yet', description: 'No systematic data collection here' },
  ];

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
    private complianceService: ComplianceService,
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
    this.router.navigate(['/sustainability']);
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

    this.complianceService.saveComplianceData(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Compliance data saved:', response);
        this.router.navigate(['/social-labor']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}