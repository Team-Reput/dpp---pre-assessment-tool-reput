import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, EMPTY } from 'rxjs';
import { concatMap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// One row from dbo.fn_get_all_questions()
export interface ApiQuestion {
  que_id: number;
  role: string;
  section_name: string;
  question: string;
  tier_level: string;
}

export type AnswerPayload = {
  ass_id: number;
  role: string;
  tier_level: string;
  que_id: number;
  ans: 'Yes' | 'No';
};

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // All questions. Empty until loaded.
  readonly rows = signal<ApiQuestion[]>([]);
  private loading = false;

  // Answers wait here and are sent one after another, in click order
  private queue = new Subject<AnswerPayload>();
  private pendingCount = 0;
  private waiters: Array<() => void> = [];

  constructor() {
    this.queue
      .pipe(
        concatMap((p) =>
          this.http.post(`${this.base}/answered-que`, p).pipe(
            catchError((e) => {
              console.error('Save answer failed', e);
              return EMPTY; // one failed save must not stop the queue
            }),
            finalize(() => this.done())
          )
        )
      )
      .subscribe();
  }

  private done(): void {
    this.pendingCount--;
    if (this.pendingCount <= 0) {
      this.pendingCount = 0;
      this.waiters.forEach((resolve) => resolve());
      this.waiters = [];
    }
  }

  // GET /api/questions. Runs only once, even if called many times.
  load(): void {
    if (this.loading || this.rows().length) return;
    this.loading = true;
    this.http.get<any>(`${this.base}/questions`).subscribe({
      next: (res) => {
        this.rows.set(res?.data ?? []);
        this.loading = false;
      },
      error: (e) => {
        console.error('Load questions failed', e);
        this.loading = false;
      },
    });
  }

  // POST /api/answered-que. The server updates the row if (ass_id, que_id) already exists.
  save(p: AnswerPayload): void {
    this.pendingCount++;
    this.queue.next(p);
  }

  // Same as save (kept so other files keep compiling)
  queueAnswer(p: AnswerPayload): void {
    this.save(p);
  }

  // Nothing waits any more, so there is nothing to clear
  clearPending(): void {}

  // Resolves when every answer sent so far has finished saving
  whenIdle(): Promise<void> {
    if (this.pendingCount === 0) return Promise.resolve();
    return new Promise((resolve) => this.waiters.push(resolve));
  }
}