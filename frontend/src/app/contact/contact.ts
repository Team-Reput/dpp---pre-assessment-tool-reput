import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService } from './contact.service';
import { AssessmentStateService, ASSURE } from '../shared/assessment-state.service';

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
  isSubmitting = false;

  constructor(
    private router: Router,
    private contactService: ContactService,
    private assessmentState: AssessmentStateService
  ) {
    const existing = this.assessmentState.contact();
    this.name = existing.name || '';
    this.company = existing.company || '';
    this.email = existing.email || '';
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

    this.isSubmitting = true;
    const payload = {
      full_name: trimmedName,
      company: trimmedCompany,
      email: trimmedEmail,
    };

    this.contactService.saveContact(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response?.data?.ass_id) {
          this.assessmentState.setAssId(response.data.ass_id);
        }
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.isSubmitting = false;
        this.router.navigate(['/profile']);
      },
    });
  }
}
