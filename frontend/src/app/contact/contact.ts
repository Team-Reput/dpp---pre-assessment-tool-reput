import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService } from './contact.service';
import { AssessmentStateService, ASSURE } from '../shared/assessment-state.service';
import { QuestionService } from '../shared/question.service';

export const DUMMY_DATA = {
  eyebrow: 'A Tool for the Textile Industry',
  brandLeft: 'BluWin',
  brandRight: 'Reput.ai',
  tag: 'DPP Readiness Scan',
  heading: 'Where should we send your results?',
  subtitle: 'Tell us who you are and we’ll send your readiness summary when you finish.',
  assureText: ASSURE.contact,
  fields: {
    name: {
      label: 'Full name',
      placeholder: 'Your name',
      err: 'Please add your name.',
    },
    company: {
      label: 'Company',
      placeholder: 'Company or facility name',
      err: 'Please add your company.',
    },
    email: {
      label: 'Work email',
      placeholder: 'you@company.com',
      err: 'Please use a valid email address.',
    },
  },
  sampleContact: {
    name: 'alice',
    company: 'xyzz',
    email: 'alice@xyzz.in',
  },
};

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './contact.scss',
  templateUrl: './contact.html',
})
export class Contact {
  readonly data = DUMMY_DATA;

  name = '';
  company = '';
  email = '';

  badName = false;
  badCompany = false;
  badEmail = false;

  // Not used any more (the screen does not wait for the API).
  // Kept only so contact.html compiles if it still mentions them.
  isSubmitting = false;
  errorMessage = '';

  // Remembers what is already saved in the database, so pressing
  // Back and then Continue does not create a second contact row.
  private savedKey = '';

  constructor(
    private router: Router,
    private contactService: ContactService,
    private assessmentState: AssessmentStateService,
    private questionService: QuestionService
  ) {
    const existing = this.assessmentState.contact();
    this.name = existing.name || '';
    this.company = existing.company || '';
    this.email = existing.email || '';

    // If this person already has an ass_id, these details are already saved
    if (this.assessmentState.getAssId()) {
      this.savedKey = this.keyOf(this.name, this.company, this.email);
    }
  }

  // One text that stands for "name + company + email" (ignores capitals and spaces)
  private keyOf(name: string, company: string, email: string): string {
    return [name, company, email].map((v) => v.trim().toLowerCase()).join('|');
  }

  onBack(): void {
    this.router.navigate(['/espr-dpp']);
  }

  submitContact(): void {
    const trimmedName = this.name.trim();
    const trimmedCompany = this.company.trim();
    const trimmedEmail = this.email.trim();

    const okName = trimmedName.length > 1;
    const okCompany = trimmedCompany.length > 1;
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail);

    this.badName = !okName;
    this.badCompany = !okCompany;
    this.badEmail = !okEmail;

    this.assessmentState.setContact({
      name: trimmedName,
      company: trimmedCompany,
      email: trimmedEmail,
    });

    if (!okName || !okCompany || !okEmail) {
      return;
    }

    const key = this.keyOf(trimmedName, trimmedCompany, trimmedEmail);
    const alreadySaved = !!this.assessmentState.getAssId() && key === this.savedKey;

    // Save in the background. We do NOT wait for the answer here.
    // Skipped when the same details were already saved (Back → Continue).
    if (!alreadySaved) {
      this.contactService
        .saveContact({
          full_name: trimmedName,
          company: trimmedCompany,
          email: trimmedEmail,
          role: '',
          tier_level: '',
          export_market_country: '',
        })
        .subscribe({
          next: (response: any) => {
            // When the reply arrives, keep the ass_id for the later screens
            const assId =
              response?.data?.ass_id ??
              (typeof response?.data === 'number' ? response.data : null);
            if (response?.success && assId) {
              this.assessmentState.setAssId(Number(assId));
              this.savedKey = key;
            }
          },
          error: (err: unknown) => {
            console.error('Save contact failed:', err);
          },
        });
    }

    // Load the questions once (the service ignores repeated calls)
    this.questionService.load();

    // Go to the next screen straight away
    this.router.navigate(['/profile']);
  }
}
