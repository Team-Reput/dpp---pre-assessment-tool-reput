import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AssessmentStateService,
  PERSONA_OPTIONS,
  ASSURE,
} from '../shared/assessment-state.service';

export const DUMMY_DATA = {
  eyebrow: 'A Tool for the Textile Industry',
  brandLeft: 'BluWin',
  brandRight: 'Reput.ai',
  tag: 'DPP Readiness Scan',
  heading: 'Where do you sit in the textile value chain?',
  subtitle: 'Pick the role closest to yours. We’ll only ask what’s relevant to you.',
  personaOptions: PERSONA_OPTIONS,
  assureText: ASSURE.profile,
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  readonly data = DUMMY_DATA;

  constructor(
    private router: Router,
    public assessmentState: AssessmentStateService
  ) {}

  get selectedPersona(): string {
    return this.assessmentState.profile().persona;
  }

  selectPersona(val: 'brand' | 'supplier'): void {
    this.assessmentState.setPersona(val);
  }

  onBack(): void {
    this.router.navigate(['/contact']);
  }

  onContinue(): void {
    if (!this.selectedPersona) return;
    this.router.navigate(['/tier-follow']);
  }
}
