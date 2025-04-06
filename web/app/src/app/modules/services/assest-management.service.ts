import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetUrls } from '../utils/urls.const';

@Injectable({
  providedIn: 'root'
})
export class AssestManagementService {

  constructor(private http: HttpClient) {}
  public addAssets(queryParams: Map<string, any>): Observable<any> {
    let model = queryParams.get('assetModel');
    model.clientId = localStorage.getItem('clientId');
    return this.http.post(AssetUrls.ADD_ASSET,model);
  }
  public getAllAssets(id:any): Observable<any> {
    let params = new HttpParams();
    let clientId = localStorage.getItem('clientId') || "";
    params = params.append('id', id);
    params = params.append('clientId', clientId);
    return this.http.get(AssetUrls.GET_ALL_ASSET, { params: params });
  }
}

