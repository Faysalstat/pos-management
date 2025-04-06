import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SharedService  {   
  constructor() { } 
  private paramSource = new BehaviorSubject("");
  sharedData = this.paramSource.asObservable();
  setParam(param:string) { this.paramSource.next(param)}    
}