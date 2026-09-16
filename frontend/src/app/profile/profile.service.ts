import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  saveProfile(data: {
    ass_id: number;
    assessing_scope: string;
    product_category: string;
    primary_product_category: string;
    export_volume: string;
    export_markets: string;
    tier: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}