import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.css']
})
export class SaleComponent implements OnInit {

  constructor(
    private sharedService:SharedService
  ) {
    this.sharedService.setParam("SALE");
  }

  ngOnInit(): void {
  }

}
