import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IdentificationService {
  private apiUrl = `${environment.apiUrl}/identification`;

  constructor(private http: HttpClient) {}

  saveIdentification(data: {
    ass_id: number;
    status: string;
    data: string; // JSON-stringified array of selected systems
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}