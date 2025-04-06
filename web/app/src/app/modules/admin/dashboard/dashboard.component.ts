import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../services/notification-service.service';
import { ReportServiceService } from '../../services/report-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cashGlBalance:number = 0;
  assetBalance:number = 0;
  totalSell:number = 0;
  totalBuy:number = 0;
  dashboardSummary:any = {};
  entitySummary:any = {};
  showLoader:boolean = false;
  constructor(
    private reportService: ReportServiceService,
    private adminService: AdminService,
    private notificationService:NotificationService
  ) { }

  ngOnInit(): void {
    
    this.fetchDashboardSummary();
    this.fetchGlBalance();
    this.fetchEntitySummary();
    
  }
  fetchDashboardSummary(){
    this.showLoader = true;
    this.reportService.fetchDashboardSummary().subscribe({
      next:(res)=>{
        console.log(res)
        this.dashboardSummary = res.body;
      },
      error:(err)=>{

      },
      complete:()=>{
        this.showLoader = false;
      }
    })
  };
  fetchEntitySummary(){
    this.showLoader = true;
    this.reportService.fetchEntitySummary().subscribe({
      next:(res)=>{
        console.log(res)
        this.entitySummary = res.body;
      },
      error:(err)=>{

      },
      complete:()=>{
        this.showLoader = false;
      }
    })
  };
  fetchGlBalance(){
    this.adminService.getGlBalanceByType("CashGL").subscribe({
      next:(res)=>{
        this.cashGlBalance = res.body.balance;
      },
      error:(err)=>{
        this.notificationService.showErrorMessage("ERROR","Cash GL NOT FOUND","OK",500);
      }
    });

    this.adminService.getGlBalanceByType("AssetGL").subscribe({
      next:(res)=>{
        this.assetBalance = res.body.balance;
      },
      error:(err)=>{
        this.notificationService.showErrorMessage("ERROR","Asset GL NOT FOUND","OK",500);
      }
    })

  }
}
