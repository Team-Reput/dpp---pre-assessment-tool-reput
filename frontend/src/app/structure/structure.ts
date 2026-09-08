import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StructureService } from './structure.service';
import { ScoreService } from '../score/score.service';   // ⬅ NEW
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './structure.html',
  styleUrl: './structure.scss',
})
export class Structure {
  readonly totalSteps = 12;
  readonly currentStep = 12;

  form: FormGroup;
  isSubmitting = false;
  submitError = '';

  readonly options = [
    { value: 'one-central-system', title: 'One central system', description: 'Certification and product data live in a single source of truth' },
    { value: 'scattered', title: 'Scattered across systems', description: 'Data sits with different certifiers, spreadsheets, or teams' },
    { value: 'partly-centralized', title: 'Partly centralized', description: 'Some categories consolidated, others still fragmented' },
    { value: 'not-sure', title: 'Not sure', description: 'No clear view of where all the data currently lives' },
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private structureService: StructureService,
    private scoreService: ScoreService,               // ⬅ NEW
    private assessmentState: AssessmentStateService
  ) {
    this.form = this.fb.group({
      dataLocation: ['', Validators.required],
    });
  }

  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  select(value: string): void {
    this.form.get('dataLocation')?.setValue(value);
  }

  onBack(): void {
    this.router.navigate(['/extended-data']);
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

    const selectedOption = this.options.find(o => o.value === this.form.value.dataLocation);

    const payload = {
      ass_id: assId,
      structure: selectedOption ? selectedOption.title : this.form.value.dataLocation,
    };

    // Step 1: save the structure answer
    this.structureService.saveStructure(payload).subscribe({
      next: () => {
        // Step 2: once saved, immediately fetch the score (structure feeds into scoring,
        // so we call the score API only AFTER the save confirms it's in the database)
        this.scoreService.getScore(assId).subscribe({
          next: (scoreResponse) => {
            this.isSubmitting = false;
            this.assessmentState.setScoreData(scoreResponse); // cache it for the Score screen
            this.router.navigate(['/score']); // navigate only once the score is ready
          },
          error: (err) => {
            this.isSubmitting = false;
            this.submitError = 'Could not calculate your score. Please try again.';
            console.error('Score API error:', err);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}