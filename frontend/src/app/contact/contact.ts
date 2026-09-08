import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from './contact.service';
import { AssessmentStateService } from '../shared/assessment-state.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  styleUrl: './contact.scss',
  templateUrl: './contact.html',
})
export class Contact {
  // Used by the progress bar in the template ("STEP 1 / 12")
  readonly totalSteps = 12;
  readonly currentStep = 1;

  // Holds the 3 form fields and their validation rules
  contactForm: FormGroup;

  // True while the API call is in flight — disables the button, shows "Submitting..."
  isSubmitting = false;

  // Holds an error message to show the user if something goes wrong
  submitError = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private contactService: ContactService,          // calls the backend /api/assessment-contact endpoint
    private assessmentState: AssessmentStateService   // stores ass_id so later steps can reuse it
  ) {
    // Define form fields and validation rules
    this.contactForm = this.fb.group({
      fullName: ['', Validators.required],
      company: ['', Validators.required],
      workEmail: ['', [Validators.required, Validators.email]],
    });
  }

  // Used by the template to render one progress-bar segment per step
  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  // Navigate back to the previous screen
  onBack(): void {
    this.router.navigate(['/start-assessment']);
  }

  // Called when the user clicks "Continue"
  onContinue(): void {
    // Step 1: block submission if required fields are empty/invalid
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched(); // shows red/error styling on empty fields
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Step 2: build the payload — keys must match what the backend controller expects
    const payload = {
      full_name: this.contactForm.value.fullName,
      company: this.contactForm.value.company,
      email: this.contactForm.value.workEmail,
    };

    // Step 3: send it to the backend
    this.contactService.saveContact(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Save the returned ass_id so Profile (and every later step) can link to this record
        this.assessmentState.setAssId(response.data.ass_id);
        this.router.navigate(['/profile']); // move to next step only after success
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Something went wrong. Please try again.';
        console.error('API error:', err);
      }
    });
  }
}