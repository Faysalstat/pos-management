import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import {
  ADMINMENUITEM,
  CASHMENUITEM,
  CLIENTMENUITEM,
  MENUITEM,
  REPORTMENUITEM,
  SALEMENUITEM,
  SUPPLYMENUITEM,
} from './menuItem.model';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
  model: any[] = [];

  constructor(
    public layoutService: LayoutService,
    private sharedService: SharedService
  ) {
    this.sharedService.sharedData.subscribe((data) => {
      // this.model = MENUITEM;
      console.log('This is ' + data + ' module');
      switch (data) {
        case 'SALE':
          this.model = SALEMENUITEM;
          break;
        case 'ADMIN':
          this.model = ADMINMENUITEM;
          break;
        case 'SUPPLY':
          this.model = SUPPLYMENUITEM;
          break;
        case 'CLIENT':
          this.model = CLIENTMENUITEM;
          break;
        case 'CASH':
          this.model = CASHMENUITEM;
          break;
        case 'REPORTS':
          this.model = REPORTMENUITEM;
          break;
      }
    });
  }

  ngOnInit() {
    // this.model = MENUITEM;
  }
}
