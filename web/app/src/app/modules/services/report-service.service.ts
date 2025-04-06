import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountUrls, ReportUrls } from '../utils/urls.const';

@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {
  
  constructor(private http: HttpClient) {}

  public fetchTransactionRecord(queryParams: Map<string, any>): Observable<any> {
    let params = new HttpParams();
    params = params.append('offset',queryParams.get('offset'));
    params = params.append('limit',queryParams.get('limit'));
    params = params.append('tnxType',queryParams.get('tnxType').trim());
    params = params.append('voucherNo',queryParams.get('voucherNo').trim());
    params = params.append('transactionCategory',queryParams.get('transactionCategory').trim());
    params = params.append('fromDate',queryParams.get('fromDate'));
    params = params.append('toDate',queryParams.get('toDate'));
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.TRANSACTION_REPORT,{params:params});
  }

  public fetchAccountHistoryRecord(queryParams: Map<string, any>): Observable<any> {
    let params = new HttpParams();
    // params = params.append('offset',queryParams.get('offset'));
    // params = params.append('limit',queryParams.get('limit'));
    params = params.append('tnxType',queryParams.get('tnxType'));
    // params = params.append('isCredit',queryParams.get('isCredit'));
    // params = params.append('isDebit',queryParams.get('isDebit'));
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.ACCOUNT_HISTORY_REPORT,{params:params});
  }

  public fetchOrderListRecord(queryParams:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('deliveryStatus',queryParams.deliveryStatus.trim());
    params = params.append('invoiceNo',queryParams.invoiceNo.trim());
    params = params.append('orderNo',queryParams.orderNo.trim());
    params = params.append('offset',queryParams.offset);
    params = params.append('limit',queryParams.limit);
    params = params.append('productCode',queryParams.productCode.trim());
    params = params.append('fromDate',queryParams.fromDate);
    params = params.append('toDate',queryParams.toDate);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.SALE_ORDER_REPORT,{params:params});
  }

  public fetchSupplyOrderListRecord(queryParams:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('deliveryStatus',queryParams.deliveryStatus);
    params = params.append('invoiceNo',queryParams.invoiceNo.trim());
    params = params.append('orderNo',queryParams.orderNo.trim());
    params = params.append('offset',queryParams.offset.trim());
    params = params.append('limit',queryParams.limit.trim());
    params = params.append('productCode',queryParams.productCode.trim());
    params = params.append('fromDate',queryParams.fromDate);
    params = params.append('toDate',queryParams.toDate);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.SUPPLY_ORDER_REPORT,{params:params});
  }
  public fetchStockListRecord(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.STOCK_REPORT,{params:params});
  }
  public fetchDashboardSummary(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.DASHBORAD_SUMMARY,{params:params});
  }

  public fetchEntitySummary(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.DASHBORAD_ENTITY_SUMMARY,{params:params});
  }

  public fetchProfitReport(queryParams: Map<string, any>): Observable<any> {
    let params = new HttpParams();
    params = params.append('offset',queryParams.get('query').offset);
    params = params.append('limit',queryParams.get('query').limit);
    params = params.append('fromDate',queryParams.get('query').fromDate);
    params = params.append('toDate',queryParams.get('query').toDate);
    params = params.append('invoiceNo',queryParams.get('query').invoiceNo.trim());
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.PROFIT_REPORT_SUMMARY,{params:params});
  }

  public fetchLoanList(): Observable<any>{
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(AccountUrls.FETCH_ALL_LOAN,{params:params});
  }

  public fetchLoanDetails(id:any): Observable<any>{
    let params = new HttpParams();
    params = params.append('loanAccountId',id);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(AccountUrls.FETCH_LOAN_DETAILS_BY_ID,{params:params});
  }
  public fetchVisualDetails(): Observable<any>{
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.VISUAL_SUMMARY,{params:params});
  }
  public fetchStockSaleReport(queryParams:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('offset',queryParams.offset);
    params = params.append('limit',queryParams.limit);
    params = params.append('productCode',queryParams.productCode.trim());
    params = params.append('fromDate',queryParams.fromDate);
    params = params.append('toDate',queryParams.toDate);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.STOCK_SALE_REPORT,{params:params});
  }

  public fetchStockSupplyReport(queryParams:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('offset',queryParams.offset);
    params = params.append('limit',queryParams.limit);
    params = params.append('productCode',queryParams.productCode.trim());
    params = params.append('fromDate',queryParams.fromDate);
    params = params.append('toDate',queryParams.toDate);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ReportUrls.STOCK_SUPPLY_REPORT,{params:params});
  }

}
