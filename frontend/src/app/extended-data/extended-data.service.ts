import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExtendedDataService {
  private apiUrl = 'http://localhost:5000/api/extended-data';

  constructor(private http: HttpClient) {}

  saveExtendedData(data: { ass_id: number; data_points: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}