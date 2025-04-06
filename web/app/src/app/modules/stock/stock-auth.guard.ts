import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/authService';
import { NotificationService } from '../services/notification-service.service';

@Injectable({
  providedIn: 'root'
})
export class StockAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ){}
  canActivate(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const idToken = localStorage.getItem('token');
    return this.verifyStock(idToken);
  }
  async verifyStock(token: any) {
    if (!token) {
      this.router.navigate(['auth']);
    }
    let authenticated = await this.authService.isLoggedIn(token);
    if (authenticated.body.userRole == 'ADMIN' || authenticated.body.userRole == 'MANAGER') {
      console.log('Welcome to admin panel');
    }else if (authenticated.body.userRole == 'SALER') {
      this.notificationService.showErrorMessage("WARNING!!","You Are Not Permited To Access Stock Panel","OK",1000);
      this.router.navigate(['home']);
    } else {
      this.notificationService.showErrorMessage("WARNING!!","You Are Not Logged In","OK",1000);
      console.log('You are not permited to admin panel');
      this.router.navigate(['auth']);
    }
    return authenticated.body.status;
  }
  
}

