import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

export interface AssessmentPhase {
  id: number;
  title: string;
  subtitle: string;
}

export interface StartAssessmentDummyData {
  badgeText: string;
  partnerName: string;
  brandName: string;
  scanLabelLines: string[];
  heading: string;
  description: string;
  reassurance: string;
  buttonLabel: string;
  phases: AssessmentPhase[];
}

export const DUMMY_DATA: StartAssessmentDummyData = {
  badgeText: 'A TOOL FOR THE TEXTILE INDUSTRY',
  partnerName: 'BluWin',
  brandName: 'Reput.ai',
  scanLabelLines: ['DPP', 'READINESS', 'SCAN'],
  heading: 'How ready is your business for the Digital Product Passport?',
  description:
    'A guided check of what you already hold against the EU’s emerging textile DPP requirements. Yes or no answers, and nothing to upload.',
  reassurance:
    'Whatever you have, or don’t have yet, you’re in the right place. We’ll take this one step at a time, together.',
  buttonLabel: 'Start my assessment',
  phases: [
    { id: 1, title: 'Pick your role', subtitle: 'Brand, or a supply-chain tier' },
    { id: 2, title: 'Answer yes or no', subtitle: 'Questions made for your role' },
    { id: 3, title: 'Get your score', subtitle: 'Plus your next step with us' },
  ],
};

@Component({
  selector: 'app-start-assessment',
  standalone: true,
  styleUrl: './start-assessment.scss',
  templateUrl: './start-assessment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartAssessmentComponent implements AfterViewInit {
  private readonly router = inject(Router);

  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  readonly data = DUMMY_DATA;

  /* ---------- Dynamic content (override from parent if needed) ---------- */
  @Input() badgeText = DUMMY_DATA.badgeText;
  @Input() partnerName = DUMMY_DATA.partnerName;
  @Input() brandName = DUMMY_DATA.brandName;
  @Input() scanLabelLines: string[] = DUMMY_DATA.scanLabelLines;

  @Input() heading = DUMMY_DATA.heading;
  @Input() description = DUMMY_DATA.description;
  @Input() reassurance = DUMMY_DATA.reassurance;
  @Input() buttonLabel = DUMMY_DATA.buttonLabel;

  /* ---------- Video ---------- */
  @Input() videoSrc = 'videos/dpp-readiness.mp4';
  @Input() posterSrc = 'images/dpp-readiness-poster.jpg';
  @Input() videoType = 'video/mp4';

  /** Optional WebVTT captions file, e.g. 'assets/videos/dpp-readiness.en.vtt' */
  @Input() captionsSrc = '';

  /* ---------- Navigation ---------- */
  /** Route to open when the user clicks "Start my assessment". Leave empty to only emit the event. */
  @Input() nextRoute = '/espr-dpp';
  @Output() assessmentStarted = new EventEmitter<void>();

  readonly phases: AssessmentPhase[] = DUMMY_DATA.phases;

  /** Drives the short click animation on the CTA */
  readonly starting = signal(false);

  ngAfterViewInit(): void {
    const player = this.videoPlayer?.nativeElement;
    if (player && typeof player.play === 'function') {
      player.muted = true;
      player.play().catch(() => {
        // Ignore if autoplay is blocked by browser policy
      });
    }
  }

  onStart(): void {
    if (this.starting()) return;
    this.starting.set(true);

    this.assessmentStarted.emit();
    if (this.nextRoute) {
      this.router.navigateByUrl(this.nextRoute);
    }
    this.starting.set(false);
  }

  trackPhase(_: number, phase: AssessmentPhase): number {
    return phase.id;
  }
}
