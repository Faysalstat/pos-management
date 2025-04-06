import { Component, Input, OnInit } from '@angular/core';
import { ReceiptBody } from '../../model/models';

@Component({
  selector: 'app-printable-receipt',
  templateUrl: './printable-receipt.component.html',
  styleUrls: ['./printable-receipt.component.css']
})
export class PrintableReceiptComponent implements OnInit {
  @Input() receiptModel!:ReceiptBody;
  shopName:string;
  shopAddress!:string;
  shopContactNo!:string;
  tnxDate:Date = new Date();

  constructor() {
    this.shopName = localStorage.getItem('shopName') || "";
    this.shopAddress = localStorage.getItem('shopAddress') || "";
    this.shopContactNo = localStorage.getItem('shopContactNo') || "";
  }

  ngOnInit(): void {
    console.log(this.receiptModel);
  }
  formatCurrentDate(date:Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleString('en-US', options);
  }
}
