import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

export interface AssessmentPhase {
  id: number;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-start-assessment',
  standalone: true,
   styleUrl: './start-assessment.scss',
  templateUrl: './start-assessment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartAssessmentComponent {
  private readonly router = inject(Router);

  /* ---------- Dynamic content (override from parent if needed) ---------- */
  @Input() badgeText = 'A tool for the textile industry';
  @Input() partnerName = 'BluWin';
  @Input() brandName = 'Reput.ai';
  @Input() scanLabelLines: string[] = ['DPP', 'READINESS', 'SCAN'];

  @Input() heading = 'How ready is your business for the Digital Product Passport?';
  @Input() description =
    'A guided check of what you already hold against the EU’s emerging textile DPP requirements. Yes or no answers, and nothing to upload.';

  @Input() reassurance =
    'Whatever you have, or don’t have yet, you’re in the right place. We’ll take this one step at a time, together.';

  @Input() buttonLabel = 'Start my assessment';

  /* ---------- Video ---------- */
  @Input() videoSrc = 'videos/dpp-readiness.mp4';
  @Input() posterSrc = 'images/dpp-readiness-poster.jpg';
  @Input() videoType = 'video/mp4';
  
  /** Optional WebVTT captions file, e.g. 'assets/videos/dpp-readiness.en.vtt' */
  @Input() captionsSrc = '';

  /* ---------- Navigation ---------- */
  /** Route to open when the user clicks "Start my assessment". Leave empty to only emit the event. */
  @Input() nextRoute = '/assessment/role';
  @Output() assessmentStarted = new EventEmitter<void>();

  readonly phases: AssessmentPhase[] = [
    { id: 1, title: 'Pick your role', subtitle: 'Brand, or a supply-chain tier' },
    { id: 2, title: 'Answer yes or no', subtitle: 'Questions made for your role' },
    { id: 3, title: 'Get your score', subtitle: 'Plus your next step with us' },
  ];

  /** Drives the short click animation on the CTA */
  readonly starting = signal(false);

  onStart(): void {
    if (this.starting()) return;
    this.starting.set(true);

    // let the click animation play before moving on
    setTimeout(() => {
      this.assessmentStarted.emit();
      if (this.nextRoute) {
        this.router.navigateByUrl(this.nextRoute);
      }
      this.starting.set(false);
    }, 320);
  }

  trackPhase(_: number, phase: AssessmentPhase): number {
    return phase.id;
  }
}