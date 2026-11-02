import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface EsprTab {
  id: string;
  label: string;
  key: string;
  more: string;
}

export interface LadderRung {
  id: string;
  label: string;
  title: string;
  text: string;
}

export interface EsprDppDummyData {
  brandEyebrow: string;
  partnerName: string;
  brandName: string;
  taglineLines: string[];
  heading: string;
  subheading: string;
  ladderTitle: string;
  ladderHint: string;
  assure: string;
  backLabel: string;
  continueLabel: string;
  tabs: EsprTab[];
  ladder: LadderRung[];
}

export const DUMMY_DATA: EsprDppDummyData = {
  brandEyebrow: 'A TOOL FOR THE TEXTILE INDUSTRY',
  partnerName: 'BluWin',
  brandName: 'Reput.ai',
  taglineLines: ['DPP', 'READINESS', 'SCAN'],
  heading: 'ESPR and the DPP, in a minute',
  subheading: 'Tap through the basics. Skip anything you already know.',
  ladderTitle: 'Who supplies what for a DPP?',
  ladderHint: 'Tap a tier to see what it usually contributes. Brands bring it together. Everyone upstream feeds it.',
  assure: 'You don’t need to remember any of this. We’ll keep the jargon light and guide you through the rest.',
  backLabel: 'Back',
  continueLabel: 'Continue',
  tabs: [
    {
      id: 'espr',
      label: 'What is ESPR?',
      key: 'The EU’s rulebook for products that last longer, repair easily and recycle well.',
      more: 'It sets requirements product group by group. Textiles are a priority group, with the textile rules expected around 2027. That timing is still indicative.',
    },
    {
      id: 'dpp',
      label: 'What is a DPP?',
      key: 'A digital record that travels with a product.',
      more: 'It’s linked to the product by a unique ID and a data carrier such as a QR code, and can hold materials, substances, where and how it was made, and how to repair or recycle it.',
    },
    {
      id: 'who',
      label: 'Who makes it?',
      key: 'Whoever places the product on the EU market, usually the brand.',
      more: 'Importers and manufacturers can also be responsible. Everyone upstream supplies the data the brand needs. Textile DPP requirements are still being finalised.',
    },
    {
      id: 'open',
      label: 'What’s still open?',
      key: 'The final data fields, access rules and timeline.',
      more: 'These come with the textile delegated act. So treat this scan as a readiness check against emerging requirements, not a legal checklist.',
    },
  ],
  ladder: [
    {
      id: 'brand',
      label: 'Brand',
      title: 'Brand / product owner.',
      text: 'Product identity, design, consumer information, repair and reuse information, and ownership of the DPP.',
    },
    {
      id: 't1',
      label: 'Tier 1',
      title: 'Garment manufacturer.',
      text: 'Bill of materials, production site, trims, material lots and testing.',
    },
    {
      id: 't2',
      label: 'Tier 2',
      title: 'Fabric / wet processor.',
      text: 'Fibre composition, dyeing and finishing, chemicals used, performance tests and process data.',
    },
    {
      id: 't3',
      label: 'Tier 3',
      title: 'Fibre / yarn supplier.',
      text: 'Origin, composition, recycled or virgin status and chain of custody.',
    },
    {
      id: 'chem',
      label: 'Chemicals',
      title: 'Chemical manufacturer.',
      text: 'Product identity, safety data sheets, substances of concern and compliance certificates.',
    },
  ],
};

@Component({
  selector: 'app-espr-dpp',
  standalone: true,
  styleUrl: './espr-dpp.scss',
  templateUrl: './espr-dpp.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EsprDppComponent {
  private readonly router = inject(Router);

  readonly data = DUMMY_DATA;

  /* ---------- Copy ---------- */
  @Input() heading = DUMMY_DATA.heading;
  @Input() subheading = DUMMY_DATA.subheading;
  @Input() ladderTitle = DUMMY_DATA.ladderTitle;
  @Input() ladderHint = DUMMY_DATA.ladderHint;
  @Input() assure = DUMMY_DATA.assure;

  /* ---------- Navigation ---------- */
  @Input() backRoute = '/start-assessment';
  @Input() nextRoute = '/contact';
  @Output() back = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();

  readonly tabs: EsprTab[] = DUMMY_DATA.tabs;
  readonly ladder: LadderRung[] = DUMMY_DATA.ladder;

  /* ---------- State ---------- */
  readonly activeTabIndex = signal(0);
  readonly activeRungId = signal<string | null>(null);

  readonly activeTab = computed(() => this.tabs[this.activeTabIndex()]);
  readonly activeRung = computed(() => this.ladder.find(r => r.id === this.activeRungId()) ?? null);

  selectTab(i: number): void {
    this.activeTabIndex.set(i);
  }

  /** Arrow-key navigation for the tab list (accessibility) */
  onTabKey(event: KeyboardEvent, index: number): void {
    const last = this.tabs.length - 1;
    let next = index;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;

    event.preventDefault();
    this.selectTab(next);
    (event.currentTarget as HTMLElement).parentElement
      ?.querySelectorAll<HTMLElement>('[role="tab"]')[next]
      ?.focus();
  }

  selectRung(id: string): void {
    this.activeRungId.set(id);
  }

  onBack(): void {
    this.back.emit();
    if (this.backRoute) this.router.navigateByUrl(this.backRoute);
  }

  onContinue(): void {
    this.continue.emit();
    if (this.nextRoute) this.router.navigateByUrl(this.nextRoute);
  }
}

export { EsprDppComponent as EsprDpp };

