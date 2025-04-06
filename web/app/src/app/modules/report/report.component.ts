import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  constructor(
    private sharedService:SharedService
  ) {
    this.sharedService.setParam("REPORTS");
  }

  ngOnInit(): void {
  }

}
