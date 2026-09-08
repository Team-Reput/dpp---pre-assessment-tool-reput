import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface AssessmentPhase {
  phase: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-start-assessment',
  standalone: true,
   styleUrl: './start-assessment.scss',
  templateUrl: './start-assessment.html',
})
export class StartAssessmentComponent {
  readonly phases: AssessmentPhase[] = [
    {
      phase: 'PHASE 1',
      title: 'Tell us what you hold',
      description: 'Across the 8 core DPP datasets',
    },
    {
      phase: 'PHASE 2',
      title: 'We check extended coverage',
      description: 'Against further ESPR data points',
    },
    {
      phase: 'PHASE 3',
      title: 'Get your readiness score',
      description: 'Plus a prioritised next-step plan',
    },
  ];

  constructor(private router: Router) {}

  onStartAssessment(): void {
    this.router.navigate(['/contact']);
  }
}