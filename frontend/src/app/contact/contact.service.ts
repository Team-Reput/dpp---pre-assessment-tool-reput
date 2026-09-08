import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:5000/api/assessment-contact';

  constructor(private http: HttpClient) {}

  saveContact(data: { full_name: string; company: string; email: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}