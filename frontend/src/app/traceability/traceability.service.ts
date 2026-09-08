import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TraceabilityService {
  private apiUrl = 'http://localhost:5000/api/traceability';

  constructor(private http: HttpClient) {}

  saveTraceabilityData(data: { ass_id: number; status: string; data: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}