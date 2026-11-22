import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  register(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/register`, credentials);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/login`, credentials);
  }

  getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/items/`);
  }

  addItem(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/items/`, formData);
  }

  updateItem(id: number, itemData: any, username: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/items/${id}`, {
      ...itemData,
      username: username
    });
  }

  deleteItem(id: number, username: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/items/${id}?username=${encodeURIComponent(username)}`);
  }
}