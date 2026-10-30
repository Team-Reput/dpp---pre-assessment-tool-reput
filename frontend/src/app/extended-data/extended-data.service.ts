import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExtendedDataService {
  private apiUrl = `${environment.apiUrl}/extended-data`;

  constructor(private http: HttpClient) {}

  saveExtendedData(data: { ass_id: number; data_points: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}