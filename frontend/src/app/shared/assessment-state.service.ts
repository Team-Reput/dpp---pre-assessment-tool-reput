import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssessmentStateService {
  private assId: number | null = null;
  private scoreData: any = null;   // ⬅ NEW — holds the fetched score response

  setAssId(id: number): void {
    this.assId = id;
  }

  getAssId(): number | null {
    return this.assId;
  }

  // NEW — store the score API response so the Score screen doesn't need to re-fetch it
  setScoreData(data: any): void {
    this.scoreData = data;
  }

  // NEW — retrieve the stored score, or null if not fetched yet
  getScoreData(): any {
    return this.scoreData;
  }
}