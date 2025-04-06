import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-gl-accounts-details',
  templateUrl: './gl-accounts-details.component.html',
  styleUrls: ['./gl-accounts-details.component.css']
})
export class GlAccountsDetailsComponent implements OnInit {
  parentGLList!:any[];
  childGLList!:any[];
  constructor(
    private adminService:AdminService
  ) { }

  ngOnInit(): void {
    this.fetchAllGL();
  }
  fetchAllGL(){
    this.adminService.getGlList().subscribe({
      next:(res)=>{
        this.parentGLList = res.body.parentGLList;
        this.childGLList = res.body.childGLList;
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

}
