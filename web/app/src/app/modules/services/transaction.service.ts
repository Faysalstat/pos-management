import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TransactionUrls } from '../utils/urls.const';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private http: HttpClient) {}

  public fetchAllTransactionReason(): Observable<any> {
    let params = new HttpParams();
    params = params.append('clientId',localStorage.getItem('clientId') || "");
    return this.http.get(TransactionUrls.FETCH_TRANSACTION_REASONS,{params:params});
  }

  public addTransactionReason(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('model');
    payload.clientId = clientId;
    return this.http.post(TransactionUrls.ADD_TNX_REASON,payload);
  }
  public deleteTransactionReason(id:any): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = {
      id:id,
      clientId:clientId
    }
    return this.http.post(TransactionUrls.DELETE_TNX_REASON,{id:id});
  }
  public doExpense(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('expenseModel');
    payload.clientId = clientId;
    return this.http.post(TransactionUrls.DO_EXPENSE_TRANSACTION,payload);
  }
  public doDeposit(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('depositModel');
    payload.clientId = clientId;
    return this.http.post(TransactionUrls.DO_DEPOSIT_TRANSACTION, payload);
  }
  public paySalary(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('salaryModel');
    payload.clientId = clientId;
    return this.http.post(TransactionUrls.DO_SALARY_TRANSACTION, payload);
  }

  public payInstallment(queryParams: Map<string, any>): Observable<any> {
    let clientId = localStorage.getItem('clientId') || "";
    let payload = queryParams.get('installment');
    payload.clientId = clientId;
    return this.http.post(TransactionUrls.DO_LOAN_INSTALLMENT_TRANSACTION, payload);
  }
}
