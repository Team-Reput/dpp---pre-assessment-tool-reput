import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// What we send to the backend (the last 3 are optional, the DB stores NULL if missing)
export interface ContactPayload {
  full_name: string;
  company: string;
  email: string;
  role?: string;
  tier_level?: string;
  export_market_country?: string;
}

// What the backend sends back
export interface ContactResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: { ass_id: number } | null;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // Changed: new API route (was /assessment-contact)
  private apiUrl = `${environment.apiUrl}/contact-details`;

  constructor(private http: HttpClient) {}

  saveContact(data: ContactPayload): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, data);
  }

    // POST /api/contact-details/profile
  saveProfile(data: { ass_id: number; role: string; tier_level: string; export_market_country: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/profile`, data);
}
}