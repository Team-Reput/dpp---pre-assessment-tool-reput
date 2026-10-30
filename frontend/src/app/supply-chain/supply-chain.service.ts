import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupplyChainService {
  private apiUrl = `${environment.apiUrl}/supply-chain`;

  constructor(private http: HttpClient) {}

  saveSupplyChain(data: { ass_id: number; status: string; data: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}