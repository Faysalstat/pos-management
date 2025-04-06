import { Component, OnInit } from '@angular/core';
import { AssestManagementService } from '../../services/assest-management.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-assets-management',
  templateUrl: './assets-management.component.html',
  styleUrls: ['./assets-management.component.css']
})
export class AssetsManagementComponent implements OnInit {
  assetsList:any[] = [];
  showLoader:boolean = false;
  constructor(
    private notificationService:NotificationService,
    private assetService :AssestManagementService

  ) { }

  ngOnInit(): void {
    this.fetchAssets();
  }
  fetchAssets(){
    this.showLoader = true;
    this.assetService.getAllAssets(null).subscribe({
      next:(res)=>{
        this.assetsList = res.body;
        this.showLoader = false;
      },
      error:(err)=>{
        console.log(err.message)
        this.showLoader = false;
      }
    })
  }

}
