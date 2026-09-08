import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialCompService } from './material-comp.service';
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-material-comp',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './material-comp.html',
  styleUrl: './material-comp.scss',
})
export class MaterialComp {
  // Used by the progress bar in the template ("STEP 4 / 12")
  readonly totalSteps = 12;
  readonly currentStep = 4;

  // Holds the form fields and their validation state
  form: FormGroup;

  // True while the API call is in flight — disables button, shows "Submitting..."
  isSubmitting = false;

  // Error message shown to the user (validation failure or API error)
  submitError = '';

  // Maps the internal short value (used for UI logic/highlighting) to the
  // full readable label that actually gets saved to the database.
  // NOTE: requires the CHECK CONSTRAINT on
  // dbo.assessment_material_composition.status to be removed — see Step 1 above.
  readonly dataCollectedLabels: Record<string, string> = {
    yes: 'Yes, we collect this',
    partially: 'Partially',
    'not-yet': 'Not yet',
  };

  // Radio card options shown on screen — "value" is the internal short code,
  // "title"/"description" are what the user actually sees
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

  // Pill toggle options shown only when "Yes" or "Partially" is selected
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
    private materialCompService: MaterialCompService,   // calls /api/material-comp
    private assessmentState: AssessmentStateService       // holds ass_id from the Contact step
  ) {
    // Define form fields and validation rules
    this.form = this.fb.group({
      dataCollected: ['', Validators.required],   // 'yes' | 'partially' | 'not-yet'
      systems: this.fb.control<string[]>([]),     // array of selected certificate/system names
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
      ? current.filter((s) => s !== system)  // remove if already selected
      : [...current, system];                 // add if not selected
    ctrl?.setValue(next);
  }

  // Used by the template to highlight a pill as selected
  isSystemSelected(system: string): boolean {
    const current: string[] = this.form.get('systems')?.value ?? [];
    return current.includes(system);
  }

  // Navigate back to the previous step
  onBack(): void {
    this.router.navigate(['/identification']);
  }

  // Called when user clicks "Continue"
  onContinue(): void {
    // Step 1: block submission if required fields are missing
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // shows red/error styling on empty required fields
      this.submitError = 'Please select an option before continuing.';
      return;
    }

    // Step 2: make sure we know which assessment (ass_id) this belongs to
    const assId = this.assessmentState.getAssId();
    if (!assId) {
      this.submitError = 'Missing assessment ID — please start over from contact.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Step 3: build the payload — status is converted from short code to full label
    // before sending, since the database column now accepts free text
    const payload = {
      ass_id: assId,
      status: this.dataCollectedLabels[this.form.value.dataCollected], // full label text
      data: JSON.stringify(this.form.value.systems), // array → JSON string for storage
    };

    // Step 4: send it to the backend
    this.materialCompService.saveMaterialComposition(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Material composition saved:', response);
        this.router.navigate(['/material-origin']); // move to next step only after success
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}