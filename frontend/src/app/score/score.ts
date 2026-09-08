import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ScoreService } from './score.service';
import { AssessmentStateService } from '../shared/assessment-state.service';


interface CategoryRow {
  label: string;
  percent: number;
  status: 'gap' | 'strong' | 'score';
  statusText: string;
}

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score implements OnInit {
  // These start as defaults and get overwritten once the API responds
  readinessPercent = 0;
  stageLabel = 'Loading...';
  stageDescription = '';
  scopeLabel = 'Scope: full facility / supply chain readiness.';

  categories: CategoryRow[] = [];

  nextSteps: string[] = [];

  isLeaving = false;
  gaugeAnimated = false;
  loadError = '';
 

  constructor(
    private router: Router,
    private scoreService: ScoreService,
    private assessmentState: AssessmentStateService,
    private cdr: ChangeDetectorRef,
  ) {}

 ngOnInit(): void {
  const assId = this.assessmentState.getAssId();

  if (!assId) {
    this.loadError = 'Missing assessment ID — please start over from contact.';
    return;
  }

  // If Structure already fetched the score for us, use it directly — no loading flicker
  const cachedScore = this.assessmentState.getScoreData();
  if (cachedScore) {
    this.applyScoreResponse(cachedScore);
    return;
  }

  // Fallback: fetch it ourselves (covers direct navigation, page refresh, etc.)
  this.scoreService.getScore(assId).subscribe({
    next: (response) => {
      this.applyScoreResponse(response);
    },
    error: (err) => {
      this.loadError = 'Could not load your score. Please try again.';
      console.error('Score API error:', err);
      this.cdr.detectChanges();
    }
  });
}

// Applies a score API response (whether cached or freshly fetched) to the screen
private applyScoreResponse(response: any): void {
  const sections = response.data.sections;

  this.readinessPercent = Math.round(response.data.overall_score);

  this.categories = [
    this.buildRow('Product Identification', sections.identification),
    this.buildRow('Material Composition', sections.material_composition),
    this.buildRow('Material Origin', sections.material_origin),
    this.buildRow('Supply Chain Data', sections.supply_chain),
    this.buildRow('Traceability Data', sections.traceability),
    this.buildRow('Sustainability Data', sections.sustainability),
    this.buildRow('Compliance & Certification', sections.compliance),
    this.buildRow('Social & Labor Data', sections.social_labor),
    this.buildRow('Extended data points', sections.extended_data),
    this.buildRow('Data structure', sections.structure),
  ];

  this.buildNextSteps();
  this.setStageInfo(this.readinessPercent);

  setTimeout(() => {
    this.gaugeAnimated = true;
    this.cdr.detectChanges();
  }, 50);

  this.cdr.detectChanges();
}

  // Converts a raw 0-100 score into a category row with a status label
  private buildRow(label: string, percent: number): CategoryRow {
    let status: 'gap' | 'strong' | 'score' = 'gap';
    let statusText = 'GAP';

    if (percent >= 70) {
      status = 'strong';
      statusText = 'STRONG';
    } else if (percent >= 40) {
      status = 'score';
      statusText = `${Math.round(percent)}%`;
    } else {
      status = 'gap';
      statusText = 'GAP';
    }

    return { label, percent, status, statusText };
  }

  // Sets the headline stage label/description based on the overall score
  private setStageInfo(percent: number): void {
    if (percent >= 70) {
      this.stageLabel = 'Strong Foundation';
      this.stageDescription =
        'Your data is well structured and mostly complete. A few gaps remain, but you are close to full DPP readiness.';
    } else if (percent >= 40) {
      this.stageLabel = 'Developing';
      this.stageDescription =
        'You have real structured data in several areas, with clear gaps still to close before full readiness.';
    } else {
      this.stageLabel = 'Early Stage';
      this.stageDescription =
        'You are starting from a real foundation, not zero — but data is fragmented. A structured roadmap will save significant rework later.';
    }
  }

  // Half-circle circumference (radius 80) instead of full circle
get circumference(): number {
  return Math.PI * 80;
}

get gaugeLength(): number {
  return this.circumference; // no 0.75 multiplier needed — it's already a half circle
}

get gaugeOffset(): number {
  if (!this.gaugeAnimated) {
    return this.gaugeLength;
  }
  return this.gaugeLength - (this.gaugeLength * this.readinessPercent / 100);
}

  onRetake(): void {
    this.isLeaving = true;
    setTimeout(() => {
      this.router.navigate(['/start-assessment']);
    }, 380);
  }

  onEmailReport(): void {
  const assId = this.assessmentState.getAssId();
  if (!assId) return;

  this.scoreService.sendReportEmail(assId).subscribe({
    next: () => {
      alert('Report sent! Check your inbox.');
    },
    error: (err: any) => {
      console.error('Email error:', err);
      alert('Could not send the report. Please try again.');
    }
  });
}



  // Builds next-step suggestions dynamically from whichever categories are still gaps
private buildNextSteps(): void {
  const gapCategories = this.categories.filter(c => c.status === 'gap');
  const steps: string[] = [];

  for (const cat of gapCategories) {
    steps.push(`Prioritise closing the gap in ${cat.label} — this is currently marked as not yet collected.`);
  }

  // Always end with a general next step
  steps.push('Schedule a walkthrough with your regional BluWin contact to turn this into a phased DPP readiness roadmap.');

  this.nextSteps = steps;
}
}
