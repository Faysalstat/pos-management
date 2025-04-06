import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  menuItems:any [] = [];
  userProfile!:any;
  constructor(
    private router:Router
  ) {
    this.menuItems = [
      {
        imgUrl:"icon-admin.png",
        title: "ADMIN",
        route: "/layout/admin"
      },
      {
        imgUrl:"icon-posh.png",
        title: "POS",
        route: "/layout/sale"
      },
      {
        imgUrl:"icon-client.png",
        title: "CLIENT",
        route: "/layout/client"
      },
      {
        imgUrl:"icon-cash.png",
        title: "CASH",
        route: "/layout/cash"
      },
      {
        imgUrl:"icon-stock.png",
        title: "SUPPLY",
        route: "/layout/supply"
      },
      {
        imgUrl:"icon-report.png",
        title: "REPORT",
        route: "/layout/reports"
      },
    ]
  }

  ngOnInit(): void {
    this.userProfile = localStorage.getItem('username');
  }
  logout(){
    console.log("You are logged out");
    localStorage.removeItem("token");
    this.router.navigate(['auth']);
  }

}
