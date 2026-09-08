import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private apiUrl = 'http://localhost:5000/api/score';

  constructor(private http: HttpClient) {}

  // Calls GET /api/score/:ass_id — note this is a GET, not a POST
  getScore(assId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${assId}`);
  }




  // NEW — add this method here, inside ScoreService
  sendReportEmail(assId: number): Observable<any> {
    return this.http.post('http://localhost:5000/api/email-report', { ass_id: assId });
  }
}