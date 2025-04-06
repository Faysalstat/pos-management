import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApprovalUrls, ClientUrls, ConfigUrls, InventoryUrls, TransactionUrls } from '../utils/urls.const';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient) {}

  public issueSalesOrder(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('invoice');
    requestModel.clientId = clientId;
    return this.http.post(InventoryUrls.ISSUE_SALES_ORDER,requestModel);
  }
  public issueBuyOrder(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('order');
    requestModel.clientId = clientId;
    return this.http.post(InventoryUrls.ISSUE_SUPPLY_ORDER,requestModel);
  }

  public doNewPaymentTransaction(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('payment');
    requestModel.clientId = clientId;
    return this.http.post(InventoryUrls.ISSUE_DO_PAYMENT,requestModel);
  }
  public issueSupplyOrderDelievery(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('delivery');
    requestModel.clientId = clientId;
    return this.http.post(InventoryUrls.DO_SUPPLY_ORDER_DELIVERY,requestModel);
  }
  public updateSupplyInvoice(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('invoice');
    requestModel.clientId = clientId;
    return this.http.post(InventoryUrls.UPDATE_SUPPLY_INVOICE,requestModel);
  }

  public updateSaleInvoice(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('invoice');
    requestModel.clientId = clientId;
    return this.http.post(InventoryUrls.UPDATE_SALE_INVOICE,requestModel);
  }
  public fetchAllSupplyInvoice(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let params = new HttpParams();
    params = params.append('offset',queryParams.get('query').offset);
    params = params.append('limit',queryParams.get('query').limit);
    params = params.append('code',queryParams.get('query').code.trim());
    params = params.append('invoiceNo',queryParams.get('query').invoiceNo.trim());
    params = params.append('clientId',clientId);
    // params = params.append('isDue',queryParams.get('query').isDue);
    params = params.append('fromDate',queryParams.get('query').fromDate);
    params = params.append('toDate',queryParams.get('query').toDate);
    params = params.append('deliveryStatus',queryParams.get('query').deliveryStatus.trim());
    return this.http.get(InventoryUrls.FETCH_SUPPLY_ORDER_LIST,{params:params});
  }

  public fetchSupplyInvoiceById(invoiceId:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('invoiceId',invoiceId);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(InventoryUrls.FETCH_SUPPLY_ORDER_BY_ID,{params:params});
  }

  // sale 
  public fetchAllSaleInvoice(queryParams: Map<string, any>): Observable<any> {
    let params = new HttpParams();
    params = params.append('offset',queryParams.get('query').offset);
    params = params.append('limit',queryParams.get('query').limit);
    params = params.append('contactNo',queryParams.get('query').contactNo.trim());
    params = params.append('invoiceNo',queryParams.get('query').invoiceNo.trim());
    params = params.append('issuedBy',queryParams.get('query').issuedBy.trim());
    params = params.append('fromDate',queryParams.get('query').fromDate);
    params = params.append('toDate',queryParams.get('query').toDate);
    params = params.append('deliveryStatus',queryParams.get('query').deliveryStatus.trim());
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(InventoryUrls.FETCH_SALE_ORDER_LIST,{params:params});
  }
  public fetchSaleInvoiceById(invoiceId:any): Observable<any> {
    let params = new HttpParams();
    params = params.append('invoiceId',invoiceId);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(InventoryUrls.FETCH_SALE_ORDER_BY_ID,{params:params});
  }

// config service 
  public getConfigByName(configName:any): Observable<any> {
    let params = new HttpParams();
    let clientId = localStorage.getItem('clientId') || "";
    params = params.append('configName',configName);
    params = params.append('clientId',clientId);
    return this.http.get(ConfigUrls.GET_CONFIG,{params:params});
  }


  public sendToApproval(queryParams: Map<string, any>): Observable<any> {
    let approvale = queryParams.get('approval');
    approvale.state = 'OPEN';
    let clientId = localStorage.getItem('clientId') || "";
    approvale.clientId = clientId;
    return this.http.post(ApprovalUrls.SEND_TO_APPROVAL, approvale);
  }
  public declineApproval(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('task');
    requestModel.clientId = clientId;
    return this.http.post(ApprovalUrls.DECLINE_APPROVE_TASK,requestModel);
  }
  public fetchTaskList(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let params = new HttpParams();
    params = params.append('clientId',clientId);
    return this.http.get(ApprovalUrls.GET_TASK_LIST,{params:params});
  }
  public fetchTaskById(id:any): Observable<any> {
    let params = new HttpParams();
    params = params.append("taskId",id);
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(ApprovalUrls.GET_TASK_BY_ID,{params:params});
  }


  // Transactions 
  public doPaymentTransaction(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('payment');
    requestModel.clientId = clientId;
    return this.http.post(TransactionUrls.DO_PAYMENT_TRANSACTION,requestModel);
  }

  public issueSaleOrderReturn(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('return');
    requestModel.clientId = clientId;
    return this.http.post(InventoryUrls.ISSUE_SALE_ORDER_RETURN,requestModel);
  }
  public issueSupplyOrderReturn(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let requestModel =  queryParams.get('return');
    requestModel.clientId = clientId;
    return this.http.post(InventoryUrls.ISSUE_SUPPLY_ORDER_RETURN,requestModel);
  }
}

