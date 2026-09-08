import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ExtendedDataService } from './extended-data.service';
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-extended-data',
  standalone: true,
  imports: [],
  templateUrl: './extended-data.html',
  styleUrl: './extended-data.scss',
})
export class ExtendedData {
  readonly totalSteps = 12;
  readonly currentStep = 11;

  // True while the API call is in flight
  isSubmitting = false;

  // Error message shown to the user
  submitError = '';

  readonly dataPoints = [
    'Unique Product ID / Operator ID / Facility ID',
    'Product category, model/version, HS/TARIC code',
    'Robustness/durability score',
    'Substances of Concern (name, location, concentration, safe-use info)',
    'Recyclability score',
    '% recycled content + origin/type',
    '% organic material',
    'Product Environmental Footprint / performance class',
    'Product carbon footprint / performance class',
    'Care instructions',
    'Repair instructions / repair-service information',
    'End-of-life: disassembly, reuse, recycling, disposal',
    'Warranty / commercial guarantee duration',
    'Declaration of Conformity, technical documentation, certificates',
    'Mechanical/durability test results',
    'Third-party conformity verification / evidence',
  ];

  selected: string[] = [
    'Unique Product ID / Operator ID / Facility ID',
    '% recycled content + origin/type',
    'Product carbon footprint / performance class',
    'Declaration of Conformity, technical documentation, certificates',
    'Third-party conformity verification / evidence',
  ];

  constructor(
    private router: Router,
    private extendedDataService: ExtendedDataService,   // calls /api/extended-data
    private assessmentState: AssessmentStateService       // holds ass_id from the Contact step
  ) {}

  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  toggle(item: string): void {
    this.selected = this.selected.includes(item)
      ? this.selected.filter((i) => i !== item)
      : [...this.selected, item];
  }

  isSelected(item: string): boolean {
    return this.selected.includes(item);
  }

  onBack(): void {
    this.router.navigate(['/social-labor']);
  }

  onContinue(): void {
    // Step 1: make sure we know which assessment this belongs to
    const assId = this.assessmentState.getAssId();
    if (!assId) {
      this.submitError = 'Missing assessment ID — please start over from contact.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Step 2: build the payload — selected items array → JSON string
    const payload = {
      ass_id: assId,
      data_points: JSON.stringify(this.selected),
    };

    // Step 3: send it to the backend
    this.extendedDataService.saveExtendedData(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Extended data saved:', response);
        this.router.navigate(['/structure']); // move to next step only after success
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}