import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssestManagementService } from '../../services/assest-management.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-add-assets',
  templateUrl: './add-assets.component.html',
  styleUrls: ['./add-assets.component.css']
})
export class AddAssetsComponent implements OnInit {
  showLoader:boolean = false;
  assetAddingForm!: FormGroup;
  description: string = ''
  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private assestService: AssestManagementService
  ) { }

  ngOnInit(): void {
    this.prepareForm();
  }

  prepareForm() {
    this.assetAddingForm = this.formBuilder.group({
      assetName: ['',[Validators.required]],
      purchaseDate: [''],
      buyingPrice: [0,[Validators.required]],
      presentValue: [0],
      quantity: [0],
      discription:[''],
      status: ['']
    });
  }

  addAsset(){
    this.showLoader = true;
    if(this.assetAddingForm.invalid){
      this.showLoader = false;
      this.notificationService.showErrorMessage("INVALID FORM","INVALID FORM","OK",300);
      return;
    }
    let assetModel = this.assetAddingForm.value;
    assetModel.discription = this.description;
    const params:Map<string,any> = new Map();
    params.set("assetModel",assetModel);
    this.assestService.addAssets(params).subscribe({
      next:(res)=>{
        this.showLoader = false;
        console.log(res);
        this.assetAddingForm.reset();
        this.description = '';
      },
      error:(err)=>{
        this.showLoader = false;
        console.log(err.message);
      }
    })
  }

}
