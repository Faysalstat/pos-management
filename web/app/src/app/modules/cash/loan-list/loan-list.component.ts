import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportServiceService } from '../../services/report-service.service';

@Component({
  selector: 'app-loan-list',
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.css'],
})
export class LoanListComponent implements OnInit {
  loanList: any[] = [];
  constructor(
    private reportService: ReportServiceService,
    private route: Router) {}

  ngOnInit(): void {
    this.fetchLoanRegistry();
  }
  fetchLoanRegistry() {
    this.reportService.fetchLoanList().subscribe({
      next: (res) => {
        console.log(res.body);
        this.loanList = res.body;
      },
    });
  }

  viewDetails(id:any){
    this.route.navigate(["/layout/cash/loan-details",id]);
  }
}
