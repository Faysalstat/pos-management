import { Component, OnInit } from '@angular/core';
import { Account } from '../../model/models';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
  balance:number = 0;
  glAccount:Account = new Account();
  constructor(
    private adminService:AdminService
  ) { }

  ngOnInit(): void {
  this.fetchGlBalance()
  }
  fetchGlBalance(){
    this.adminService.getGlBalanceByType("INVENTORY_GL").subscribe({
      next:(res)=>{
        console.log(res);
        this.glAccount = res.body;
        // this.balance = this.glAccount.balance;
      }
    })

  }
  updateBalance(event:any){
    this.fetchGlBalance()
  }
}
