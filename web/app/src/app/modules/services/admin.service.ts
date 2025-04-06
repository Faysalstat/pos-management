import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountUrls, ApprovalUrls, ConfigUrls } from '../utils/urls.const';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {}
  public approveTask(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('payload');
    payload.clientId = clientId;
    
    return this.http.post(ApprovalUrls.APPROVE_TASK,payload);
  }

  public getModules(roleName:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('roleName', roleName);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ConfigUrls.GET_ROLE_WISE_MENU, { params: params });
  }

  public getGlBalanceByType(glType:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('glType', glType);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(AccountUrls.FETCH_GL_DETAILS_BY_TYPE, { params: params });
  }
  public getGlList(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(AccountUrls.FETCH_GL_ACCOUNTS, { params: params });
  }
}
