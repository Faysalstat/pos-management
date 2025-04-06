import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductUrls } from '../utils/urls.const';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {}

  public addProduct(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('product');
    payload.clientId = clientId;
    return this.http.post(ProductUrls.ADD_PRODUCT,payload);
  }
  public fetchAllProduct(queryParams: Map<string, any>): Observable<any> {
    let params = new HttpParams();
    params = params.append('offset',queryParams.get('offset'));
    params = params.append('limit',queryParams.get('limit'));
    params = params.append('brandName',queryParams.get('brandName').trim());
    params = params.append('categoryName',queryParams.get('categoryName').trim());
    params = params.append('code',queryParams.get('code').trim());
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ProductUrls.FETCH_ALL_PRODUCT,{params:params});
  }

  public fetchAllProductForDropDown(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ProductUrls.FETCH_ALL_PRODUCT_FOR_DROPDOWN,{params:params});
  }

  public fetchProductById(productId:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('id',productId);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ProductUrls.FETCH_PRODUCT_BY_ID,{params:params});
  }
  public fetchAllPackagingCategory(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ProductUrls.FETCH_ALL_PACKAGING_CATEGORY,{params:params});
  }
  public fetchAllProductCategory(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ProductUrls.FETCH_ALL_PRODUCT_CATEGORY,{params:params});
  }
  public fetchAllUnitType(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ProductUrls.FETCH_ALL_UNIT_TYPE,{params:params});
  }
  public fetchProductByCode(queryParams: Map<string, any>): Observable<any> {
    let params = new HttpParams();
    params = params.append('code',queryParams.get('code').trim());
    params = params.append('name',queryParams.get('name').trim());
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ProductUrls.FETCH_PRODUCT_BY_CODE,{params:params});
  }
  public fetchAllBrandName(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ProductUrls.FETCH_PRODUCT_BRAND_NAME,{params:params});
  }
  public addProductCategory(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('model');
    payload.clientId = clientId;
    return this.http.post(ProductUrls.ADD_PRODUCT_CATEGORY, payload);
  }
  public addPackagingCategory(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('model');
    payload.clientId = clientId;
    return this.http.post(ProductUrls.ADD_PACKAGING_CATEGORY, payload);
  }
  public addUnitType(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('model');
    payload.clientId = clientId;
    return this.http.post(ProductUrls.ADD_UNIT_TYPE, payload);
  }
  public addBrnadName(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('model');
    payload.clientId = clientId;
    return this.http.post(ProductUrls.ADD_BRAND_NAME, payload);
  }
// Delete 
  public deleteUnitType(unitId:any): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = {
      unitId:unitId,
      clientId:clientId
    }
    return this.http.post(ProductUrls.DELETE_UNIT_TYPE, payload);
  }
  public deleteBrandName(brandId:any): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = {
      brandId:brandId,
      clientId:clientId
    }
    return this.http.post(ProductUrls.DELETE_BRAND_NAME, payload);
  }
  public deleteProductCategory(categoryId:any): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = {
      categoryId:categoryId,
      clientId:clientId
    }
    return this.http.post(ProductUrls.DELETE_PRODUCT_CATEGORY, payload);
  }
  public deletePackagingCategory(categoryId:any): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = {
      categoryId:categoryId,
      clientId:clientId
    }
    return this.http.post(ProductUrls.DELETE_PACKAGING_CATEGORY, payload);
  }
}
