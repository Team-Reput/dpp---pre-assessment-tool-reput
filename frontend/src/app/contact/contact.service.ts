import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/assessment-contact`;  

  constructor(private http: HttpClient) {}

  saveContact(data: { full_name: string; company: string; email: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}