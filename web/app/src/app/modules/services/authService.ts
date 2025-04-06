import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthenticationUrls,
  ConfigUrls,
} from '../utils/urls.const';
import { CLIENT_ID } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  public signIn(queryParams: Map<string, any>): Observable<any> {
    let userModel = queryParams.get('user');
    userModel.clientId = CLIENT_ID;
    return this.http.post(AuthenticationUrls.LOGIN, queryParams.get('user'));
  }
  public signOut(queryParams: Map<string, any>): Observable<any> {
    return this.http.post(AuthenticationUrls.SIGN_OUT, queryParams.get('user'));
  }

  public getModules(roleName: any): Observable<any> {
    let params = new HttpParams();
    params = params.append('roleName', roleName);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ConfigUrls.GET_ROLE_WISE_MENU, { params: params });
  }
  public addUser(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let userModel = queryParams.get('user');
    userModel.clientId = clientId;
    return this.http.post(AuthenticationUrls.ADD_USER,userModel);
  }
  public checkExistingUser(userName: any): Observable<any> {
    let params = new HttpParams();
    params = params.append('userName', userName);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(AuthenticationUrls.CHECK_EXISTING_USER, { params: params });
  }
  public getAllUser(username: any): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let params = new HttpParams();
    params = params.append('username', username);
    params = params.append('clientId', clientId);
    return this.http.get(AuthenticationUrls.GET_ALL_USER, { params: params });
  }
  public isLoggedIn(token:any):Promise<any>{
    let params = new HttpParams();
    params = params.append("token",token);
    return this.http.get(AuthenticationUrls.CHECK_IS_LOGGEDIN,{params:params}).toPromise();
  }
}