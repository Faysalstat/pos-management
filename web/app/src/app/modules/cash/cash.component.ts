import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.css']
})
export class CashComponent implements OnInit {

  constructor(
    private sharedService:SharedService
  ) {
    this.sharedService.setParam("CASH");
  }

  ngOnInit(): void {
  }

}
