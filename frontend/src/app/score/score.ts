import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AssessmentStateService,
  ASSURE,
  TIER_LABELS,
  NEXT_LEVEL,
  WHERE_TO_FIND,
  HELP_NOTE,
  REPUT_URL,
  DEMO_URL,
  ScoreRow,
} from '../shared/assessment-state.service';
import { ShirtDockComponent } from '../shared/shirt-dock/shirt-dock';
import { QuestionService } from '../shared/question.service';
import { ScoreService } from './score.service';

export const DUMMY_DATA = {
  eyebrow: 'A Tool for the Textile Industry',
  brandLeft: 'BluWin',
  brandRight: 'Reput.ai',
  tag: 'DPP Readiness Scan',
  assureResults: ASSURE.results,
  reputUrl: REPUT_URL,
  reputPlatformUrl: 'https://www.reput.ai/',
  demoUrl: DEMO_URL,
  whereHeading: 'Where this information usually lives',
  whereSub: 'General pointers to help you start collecting. Not a full list.',
  disclaimer:
    'Legal Disclaimer: This readiness scan and report are provided for general informational purposes only and are based on current and draft EU Ecodesign for Sustainable Products Regulation (ESPR) information. Final Digital Product Passport (DPP) data fields, access rules, and compliance timelines for textiles remain subject to the forthcoming EU textile delegated act. This assessment does not constitute legal advice, a formal compliance determination, or an official certification.',
  scoreHexColor: '#0a8f9e',
};

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [CommonModule, FormsModule, ShirtDockComponent],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score implements OnInit, OnDestroy {
  readonly data = DUMMY_DATA;
  private platformId = inject(PLATFORM_ID);
  private scoreService = inject(ScoreService);
  private questionService = inject(QuestionService);

  // Tells Angular to redraw this screen. Needed after async work (HTTP replies, timers),
  // because plain properties changed there are not noticed automatically.
  private cdr = inject(ChangeDetectorRef);

  // Gauge geometry matching gaugeSVG(pct, color)
  readonly r = 62;
  readonly cx = 90;
  readonly cy = 90;
  readonly circ = 2 * Math.PI * 62;
  readonly arc = 2 * Math.PI * 62 * 0.75;

  // Score from the database. While null (loading or failed), the local calculation is used.
  private apiSummary: { total: number; max: number; rows: ScoreRow[] } | null = null;
  loadingScore = true;
  scoreError = '';

  // "Answered X of Y · Z Yes" line
  apiTotal = 0;
  apiAnswered = 0;
  apiYes = 0;

  // Supplier referral form state
  refFormOpen = false;
  refName = '';
  refEmail = '';
  badRefName = false;
  badRefEmail = false;
  refSubmitted = false;

    // "Contact us" popup
  contactOpen = false;
  emailCopied = false;
  readonly teamEmail = 'admin@reput.co.in';
  readonly reputSiteUrl = 'https://www.reput.ai/#about';

  // Email / report / toast / demo state
  emailSending = false;
  emailSent = false;
  mailBannerOn = false;
  reportViewOn = false;
  toastText = '';
  toastOn = false;

  private mailBannerTimer: ReturnType<typeof setTimeout> | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    public state: AssessmentStateService
  ) {}

  ngOnInit(): void {
    // Browser only, so SSR does not send a second request from the server
    if (!isPlatformBrowser(this.platformId)) return;

    this.saveSubmission();
    this.loadScore();
  }

  ngOnDestroy(): void {
    if (this.mailBannerTimer) clearTimeout(this.mailBannerTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('rv-open');
    }
  }

  // Load the score from the database (one GET request, no retries)
  private loadScore(): void {
    const assId = this.state.getAssId();
    if (!assId) {
      this.loadingScore = false;
      this.scoreError = 'We could not find your assessment. Please go back and enter your details again.';
      return;
    }

    // Wait until the last clicked answers are saved, then ask for the score
    this.questionService.whenIdle().then(() => {
      this.scoreService.getScore(assId).subscribe({
        next: (res) => {
          this.loadingScore = false;
          if (res?.success && res.data) {
            this.apiSummary = this.mapApiToSummary(res.data);
            this.apiTotal = Number(res.data.total_questions ?? 0);
            this.apiAnswered = Number(res.data.answered_count ?? 0);
            this.apiYes = Number(res.data.yes_count ?? 0);
          } else {
            this.scoreError = res?.message || 'Could not load your score.';
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loadingScore = false;
          console.error('Score load failed:', err);
          this.scoreError = 'Could not load your score. Showing your local result.';
          this.cdr.markForCheck();
        },
      });
    });
  }

  // Converts the database result into the shape the screen already uses.
  // The database gives one overall percentage, so the gauge uses it directly.
  // The section cards keep using the local answers.
  private mapApiToSummary(d: any): { total: number; max: number; rows: ScoreRow[] } {
    const local = this.state.computeScores();
    return { total: Number(d.score_percentage ?? 0), max: 100, rows: local.rows };
  }

  // Uses the database result when we have it, otherwise the local calculation
  get scoreSummary() {
    return this.apiSummary ?? this.state.computeScores();
  }

  get pct(): number {
    const sc = this.scoreSummary;
    return sc.max ? Math.round((sc.total / sc.max) * 100) : 0;
  }

  get gaugeOffset(): number {
    return this.arc * (1 - this.pct / 100);
  }

  get band() {
    const sc = this.scoreSummary;
    return this.state.bandFor(sc.total, sc.max);
  }
    // First sentence only, e.g. "You're starting from a real foundation."
  get bandFirstLine(): string {
    const s = String(this.band?.sub ?? '').trim();
    const m = s.match(/^.*?[.!?](?=\s|$)/);
    return m ? m[0] : s;
  }

  get bandHexColor(): string {
    return this.data.scoreHexColor;
  }

  get isSupplier(): boolean {
    return this.state.profile().persona === 'supplier';
  }

  get companyName(): string {
    return this.state.contact().company || 'Your company';
  }

  get contactName(): string {
    return this.state.contact().name || '';
  }

  get contactEmail(): string {
    return this.state.contact().email || 'your email';
  }

  get todayShort(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  get todayLong(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  get scopeLabel(): string {
    const p = this.state.profile();
    return this.isSupplier ? TIER_LABELS[p.tier] || 'Supply Chain Partner' : 'Brand / company-wide';
  }

  get nextLevel() {
    const v = this.state.profile().visibility;
    return NEXT_LEVEL[v] || NEXT_LEVEL['unsure'];
  }

  get rows(): ScoreRow[] {
    return this.scoreSummary.rows;
  }

  get activeCategoriesWithDetails() {
    const pk = this.state.personaKey();
    const cd = this.state.categoryData();
    const rows = this.rows;
    return this.state.activeCategories().map((cat) => {
      const items = cat.items[pk] || [];
      const answers = cd[cat.key]?.answers || [];
      const row = rows.find((r) => r.key === cat.key)!;
      return {
        cat,
        items,
        answers,
        row,
        where: WHERE_TO_FIND[cat.key] || '',
        help: HELP_NOTE[cat.key] || '',
      };
    });
  }

  formatNum(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  whereStatusClass(score: number): string {
    return ['to-build', 'partly', 'covered'][score] || 'to-build';
  }

  whereStatusLabel(score: number): string {
    return ['To build', 'Partly there', 'Covered'][score] || 'To build';
  }

  reportPillClass(score: number): string {
    return ['p0', 'p1', 'p2'][score] || 'p0';
  }

  whereChips(key: string): string[] {
    return String(WHERE_TO_FIND[key] || '')
      .replace(/\.$/, '')
      .split(/,\s*(?:and\s+)?/)
      .filter(Boolean);
  }

  whereDelay(i: number): string {
    return `${(i * 0.05).toFixed(2)}s`;
  }

  openRefForm(): void {
    this.refFormOpen = true;
  }

  submitRef(event: Event): void {
    event.preventDefault();
    const name = this.refName.trim();
    const email = this.refEmail.trim();
    const okN = name.length > 1;
    const okE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    this.badRefName = !okN;
    this.badRefEmail = !okE;
    if (!okN || !okE) return;

    this.state.addReferral({
      supplierName: name,
      supplierEmail: email,
      tier: this.state.profile().visibility,
    });
    this.refSubmitted = true;

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        window.open(REPUT_URL.replace('#about', ''), '_blank', 'noopener');
      }, 1100);
    }
  }

  certToast(): void {
    this.openReport();
  }

  showToast(msg: string): void {
    this.toastText = msg;
    this.toastOn = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastOn = false;
      this.cdr.markForCheck();
    }, 3200);
    this.cdr.markForCheck();
  }

  // "Email me the full report": the backend uses the email saved at contact time
  reportToast(): void {
    if (this.emailSending) return;

    const assId = this.state.getAssId();
    if (!assId) {
      this.showToast('Missing assessment details. Please start again.');
      return;
    }

    this.emailSending = true;
    this.cdr.markForCheck();

        // Same card that is shown on screen (null for suppliers, who don't see it)
    const nl = !this.isSupplier ? this.nextLevel : null;
    const nextLevelPayload = nl
      ? { eyebrow: nl.eyebrow, title: nl.title, body: nl.body, cta: nl.cta }
      : null;

    
    this.scoreService.sendReportEmail(assId, nextLevelPayload).subscribe({
      next: () => {
        this.emailSending = false;
        this.emailSent = true;
        this.mailBannerOn = true;
        if (this.mailBannerTimer) clearTimeout(this.mailBannerTimer);
        this.mailBannerTimer = setTimeout(() => {
          this.mailBannerOn = false;
          this.cdr.markForCheck();
        }, 9000);
        this.cdr.markForCheck();   // redraw: the button changes from "Sending…" to "✓ Report sent"
      },
      error: (err) => {
        console.error('Email report failed:', err);
        this.emailSending = false;
        this.showToast('Could not send the report. Please try again.');
        this.cdr.markForCheck();
      },
    });
  }

  dismissMailBanner(): void {
    this.mailBannerOn = false;
  }

    openContact(): void {
    this.contactOpen = true;
  }

  closeContact(): void {
    this.contactOpen = false;
  }

  async copyTeamEmail(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      await navigator.clipboard.writeText(this.teamEmail);
    } catch {
      // Fallback for browsers that block the clipboard API
      const t = document.createElement('textarea');
      t.value = this.teamEmail;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    this.emailCopied = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.emailCopied = false;
      this.cdr.markForCheck();
    }, 2000);
  }

  openReport(): void {
    this.reportViewOn = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add('rv-open');
    }
  }

  closeReport(): void {
    this.reportViewOn = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('rv-open');
    }
  }

  printReport(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }

  downloadReport(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const doc = this.buildReportDocument();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
    a.download =
      'DPP_Readiness_Report_' + (this.state.contact().company || 'report').replace(/[^\w]+/g, '_') + '.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  bookDemo(): void {
    this.state.bookDemo();
  }

  restart(): void {
    this.state.restart();
    this.router.navigate(['/start-assessment']);
  }

  private esc(s: string): string {
    return String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c)
    );
  }

  private saveSubmission(): void {
    try {
      const sc = this.scoreSummary;
      const pk = this.state.personaKey();
      const cd = this.state.categoryData();
      const sub = {
        submittedAt: new Date().toISOString(),
        supplierReferrals: this.state.referrals(),
        contact: { ...this.state.contact() },
        persona: this.state.profile().persona,
        tier: this.isSupplier ? this.state.profile().tier : null,
        visibility: !this.isSupplier ? this.state.profile().visibility : null,
        exportMarkets: [...this.state.markets()],
        score: { points: sc.total, max: sc.max, percent: this.pct },
        answers: this.state.activeCategories().map((c) => ({
          section: c.key,
          items: (c.items[pk] || []).map((q, i) => ({
            question: q,
            answer: cd[c.key]?.answers?.[i] ?? null,
          })),
        })),
      };
      localStorage.setItem('dpp_last_submission', JSON.stringify(sub));
    } catch {
      // ignore storage errors
    }
  }

  private buildReportDocument(): string {
    const css = `
      .rpt{font-family:'Inter',system-ui,sans-serif;color:#10303b;line-height:1.55;max-width:760px;margin:0 auto;padding:28px 22px 40px}
      .rpt h1{font-size:24px;margin:0 0 4px;color:#0b4a5f} .rpt h2{font-size:15px;margin:26px 0 10px;color:#0b4a5f;border-bottom:1px solid #d6e6ea;padding-bottom:6px}
      .rpt .top{background:linear-gradient(120deg,#0a9ab8,#0b4a5f);color:#fff;border-radius:16px;padding:20px 22px;margin-bottom:18px}
      .rpt .top small{display:block;opacity:.8;font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
      .rpt .top h1{color:#fff} .rpt .meta{font-size:12.5px;opacity:.9}
      .rpt .score{display:flex;gap:18px;align-items:center;border:1px solid #d6e6ea;border-radius:14px;padding:16px 18px}
      .rpt .score b{font-size:40px;line-height:1} .rpt .score .lab{font-weight:700;font-size:16px}
      .rpt .score p{margin:4px 0 0;font-size:13px;color:#4a6670}
      .rpt table{width:100%;border-collapse:collapse;font-size:13px} .rpt td,.rpt th{padding:8px 6px;border-bottom:1px solid #e3eef1;text-align:left;vertical-align:top}
      .rpt th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b8791}
      .rpt .pill{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
      .rpt .p2{background:#dff5ee;color:#0a7a5a} .rpt .p1{background:#fdf0d0;color:#8a6208} .rpt .p0{background:#fbe0dc;color:#a8321f}
      .rpt .sec{border:1px solid #e3eef1;border-radius:12px;padding:12px 14px;margin-bottom:10px;break-inside:avoid}
      .rpt .sec h3{margin:0 0 6px;font-size:14px;display:flex;justify-content:space-between;gap:8px}
      .rpt .qa{font-size:12.5px;display:flex;justify-content:space-between;gap:12px;padding:3px 0;color:#2c4a55}
      .rpt .qa i{font-style:normal;font-weight:700;white-space:nowrap} .rpt .y{color:#0a7a5a} .rpt .n{color:#a8321f} .rpt .s{color:#8a6208}
      .rpt .help{margin-top:8px;font-size:12.5px;background:#f8f1e8;border:1px solid #e6d3b8;border-radius:8px;padding:8px 10px;color:#6a4a1f}
      .rpt .where{font-size:12.5px;color:#4a6670;margin-top:6px}
      .rpt .free{margin-top:18px;border:1.5px dashed #0a9ab8;border-radius:12px;padding:12px 14px;background:#eef9fb;font-size:13px}
      .rpt .tiny{font-size:10.5px;color:#7d949c;margin-top:18px}
    `;
    const lbl = ['To build', 'Partly there', 'Covered'];
    const cls = ['p0', 'p1', 'p2'];
    const secs = this.activeCategoriesWithDetails
      .map(
        (d) => `<div class="sec"><h3><span>${this.esc(d.cat.label)}</span><span class="pill ${cls[d.row.score]}">${lbl[d.row.score]} · ${d.row.yes}/${d.row.total}</span></h3>
        ${d.items
          .map(
            (q, i) =>
              `<div class="qa"><span>${this.esc(q)}</span><i class="${d.answers[i] === true ? 'y' : d.answers[i] === false ? 'n' : 's'}">${d.answers[i] === true ? 'Yes' : d.answers[i] === false ? 'No' : 'Skipped (counted as No)'}</i></div>`
          )
          .join('')}
        <div class="where"><b>Where this usually lives:</b> ${this.esc(d.where)}</div>
        ${d.row.score < 2 ? `<div class="help"><b>How we can help:</b> ${this.esc(d.help)}</div>` : ''}
      </div>`
      )
      .join('');
    const nl = !this.isSupplier ? this.nextLevel : null;
    const body = `<div class="rpt">
      <div class="top"><small>DPP Readiness Scan · BluWin × Reput.ai</small><h1>Full readiness report</h1>
        <div class="meta">${this.esc(this.companyName)} · ${this.esc(this.contactName)} · ${this.esc(this.scopeLabel)} · ${this.todayLong}</div></div>
      <div class="score"><b style="color:${this.bandHexColor}">${this.pct}%</b><div><div class="lab" style="color:${this.bandHexColor}">DPP Readiness Score</div><p>${this.esc(this.band.sub)}</p></div></div>
      <h2>Section summary</h2>
      <table><tr><th>Section</th><th>Status</th><th>Yes</th></tr>
        ${this.rows
          .map(
            (r) =>
              `<tr><td>${this.esc(r.label)}</td><td><span class="pill ${cls[r.score]}">${lbl[r.score]}</span></td><td>${r.yes}/${r.total}</td></tr>`
          )
          .join('')}</table>
      <h2>Your answers, section by section</h2>${secs}
      ${nl ? `<h2>Your next level</h2><p><b>${this.esc(nl.title)}</b><br>${this.esc(nl.body)}</p>` : ''}
      <div class="free"><b>1 DPP is free for you to create.</b> Book a demo with us and we’ll build your first Digital Product Passport together: ${this.esc(REPUT_URL)}</div>
      <div class="tiny">${this.esc(this.data.disclaimer)}</div>
    </div>`;
    return (
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DPP Readiness Report</title><style>body{margin:0;background:#fff}' +
      css +
      '</style></head><body>' +
      body +
      '</body></html>'
    );
  }
}