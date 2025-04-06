import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  constructor(
    private sharedService:SharedService
  ) {
    this.sharedService.setParam("SUPPLY");
  }

  ngOnInit(): void {
  }

}
