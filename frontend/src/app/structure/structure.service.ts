import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StructureService {   // capital S — Angular convention for class names
  private apiUrl = 'http://localhost:5000/api/structure';

  constructor(private http: HttpClient) {}

  saveStructure(data: { ass_id: number; structure: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}