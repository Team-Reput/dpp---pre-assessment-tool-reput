import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AssessmentStateService,
  TECHNICAL_CATEGORIES,
  SECTION_GUIDE,
  HELP_NOTE,
} from '../shared/assessment-state.service';
import { ShirtDockComponent } from '../shared/shirt-dock/shirt-dock';

export const DUMMY_DATA = {
  eyebrow: 'A Tool for the Textile Industry',
  brandLeft: 'BluWin',
  brandRight: 'Reput.ai',
  tag: 'DPP Readiness Scan',
  catKey: 'waste_eol',
  category: TECHNICAL_CATEGORIES.find((c) => c.key === 'waste_eol')!,
  sectionGuide: SECTION_GUIDE['waste_eol'],
  helpNote: HELP_NOTE['waste_eol'],
};

@Component({
  selector: 'app-waste-eol',
  standalone: true,
  imports: [CommonModule, ShirtDockComponent],
  templateUrl: './waste-eol.html',
  styleUrl: './waste-eol.scss',
})
export class WasteEol implements OnInit {
  readonly data = DUMMY_DATA;
  readonly catKey = 'waste_eol';
  readonly stepKey = 'cat:waste_eol';
  focusedIdx: number | null = null;

  constructor(
    private router: Router,
    public state: AssessmentStateService
  ) {}

  ngOnInit(): void {
    this.state.ensureCategoryAnswers(this.catKey);
  }

  get cat() {
    return this.data.category;
  }

  get items(): string[] {
    return this.state.getCategoryItems(this.catKey);
  }

  get answers(): (boolean | null)[] {
    const cd = this.state.categoryData()[this.catKey];
    const items = this.items;
    if (!cd || !Array.isArray(cd.answers) || cd.answers.length !== items.length) {
      return new Array(items.length).fill(null);
    }
    return cd.answers;
  }

  get answeredCount(): number {
    return this.answers.filter((v) => v !== null).length;
  }

  get progressPct(): number {
    return this.items.length ? (this.answeredCount / this.items.length) * 100 : 0;
  }

  get navHint(): string {
    const left = this.items.length - this.answeredCount;
    return left ? `${left} skipped` : 'All answered';
  }

  get showHelpNote(): boolean {
    return this.answers.some((v) => v !== true);
  }

  get stepMeta() {
    return this.state.getStepMeta(this.stepKey);
  }

  get segments(): number[] {
    return Array.from({ length: this.stepMeta.total }, (_, i) => i);
  }

  formatNum(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  setAnswer(index: number, val: boolean): void {
    this.state.setCategoryAnswer(this.catKey, index, val);
    const nextUnanswered = this.answers.findIndex((a, idx) => idx > index && a === null);
    if (nextUnanswered !== -1) {
      this.focusedIdx = nextUnanswered;
      setTimeout(() => {
        if (this.focusedIdx === nextUnanswered) this.focusedIdx = null;
      }, 900);
    }
  }

  onBack(): void {
    this.router.navigate([this.state.getBackRoute(this.stepKey)]);
  }

  onContinue(): void {
    this.router.navigate([this.state.getNextRoute(this.stepKey)]);
  }
}

