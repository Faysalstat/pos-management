import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../model/models';
import { AuthService } from '../../services/authService';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  message!:string;
  constructor(
    private router: Router, 
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService:NotificationService
    
    ) {}

  ngOnInit(): void {
    this.prepareForm(null);
  }
  prepareForm(formData: any) {
    formData = new User();

    this.loginForm = this.formBuilder.group({
      username: [formData.username, [Validators.required]],
      password: [formData.password, [Validators.required]],
      // address: [formData.personAddress],
    });
  }
  signIn(){
    const params:Map<string,any> = new Map();
    const user = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value,
    };
    params.set("user",user);
    this.authService.signIn(params).subscribe({
      next:(res)=>{
        console.log(res)
        if(res.isSuccess){
          localStorage.setItem('token', res.body.token);
          localStorage.setItem('userId', res.body.userid);
          localStorage.setItem('username', res.body.username);
          localStorage.setItem('personName', res.body.personName);
          localStorage.setItem('userRole',res.body.userRole);
          localStorage.setItem('clientId',res.body.clientId);
          localStorage.setItem('shopName',res.body.shopName);
          localStorage.setItem('shopAddress',res.body.shopAddress);
          localStorage.setItem('shopContactNo',res.body.shopContactNo);
          this.router.navigate(["/home"]);
        }else{
          this.notificationService.showMessage("ERROR!","Authentication Failed " + res.message,"OK",2000);
          
        }
      },
      error:(err)=>{
        this.notificationService.showErrorMessage("ERROR!",err.message,"OK",2000)
      },
      complete: ()=>{}
    })
  }
}
