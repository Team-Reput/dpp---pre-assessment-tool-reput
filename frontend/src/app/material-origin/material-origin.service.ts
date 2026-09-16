import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MaterialOriginService {
  private apiUrl = `${environment.apiUrl}/material-origin`;

  constructor(private http: HttpClient) {}

  saveMaterialOrigin(data: { ass_id: number; status: string; data: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}