import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/notification-service.service';
import { ProductService } from '../../services/product-service.service';
import * as JsBarcode from 'jsbarcode'; // Add this import

@Component({
  selector: 'app-product-config',
  templateUrl: './product-config.component.html',
  styleUrls: ['./product-config.component.css']
})
export class ProductConfigComponent implements OnInit {
  productAddingForm!: FormGroup;
  categories!: any[];
  packagingCategories!: any[];
  brandNames!: any[];
  units!: any[];
  showLoader:boolean = false;
  isEdit:boolean = false;
  product!:any;
  errMsg:string ='';
  barcodeData:any;
  constructor(
    private activatedRoute:ActivatedRoute,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private notificationService: NotificationService,
    private route : Router
    ) {
     }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((parameter) => {
      if(parameter['id']){
        let id = parameter['id'];
        this.isEdit = true;
        this.fetchProductById(id);
        
      }else{
        this.isEdit = false;
        console.log("create");
      }
      
      
    });
    this.prepareForm();
    this.fetchPackagingCategory();
    this.fetchProductCategory();
    this.fetchUnitType();
    this.fetchBrandName();
  }
  fetchProductById(id: any) {
    this.showLoader = true;
    this.productService.fetchProductById(id).subscribe({
      next: (res) => {
        if (res.body) {
          this.product = res.body.product;
          this.setFormValue();
          this.productAddingForm.get('productCode')?.disable();
          
          // Generate CODE128 barcode if not provided by backend
          if (res.body.barcode) {
            this.barcodeData = `data:image/png;base64,${res.body.barcode}`;
          } else {
            this.generateBarcode(this.product.productCode);
          }
        }
        this.showLoader = false;
      },
      error: (err) => {
        this.notificationService.showMessage("ERROR", "Error Occurred", "OK", 300);
        this.showLoader = false;
      }
    });
  }

  generateBarcode(code: string) {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, code, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: false,
        margin: 10
      });
      this.barcodeData = canvas.toDataURL('image/png');
    } catch (e) {
      console.error('Barcode generation error:', e);
      this.barcodeData = null;
    }
  }
  prepareForm() {
    this.productAddingForm = this.formBuilder.group({
      productCode: ['',[Validators.required,Validators.pattern('^[0-9]*$')]],
      productName: ['',[Validators.required]],
      productCategory: ['',[Validators.required]],
      unitType: ['',[Validators.required]],
      quantity: [0],
      brandName:['',[Validators.required]],
      costPricePerUnit: [0],
      sellingPricePerUnit: [0],
      packagingCategory:['',[Validators.required]],
      unitPerPackage:[0]
    });
  }
  
  fetchPackagingCategory(){
    this.packagingCategories = [{ label: 'Select category', value: '' }];
    this.productService.fetchAllPackagingCategory().subscribe({
      next:(res)=>{
        let categories = res.body;
        if(res.body){
          categories.map((elem:any)=>{
            let category = { label: elem.key, value: elem.value }
            this.packagingCategories.push(category);
        })
        }
      },
      error:(err)=>{
        this.notificationService.showMessage("FAILED!","Packaging Category Fetching Failed","OK",1000);
      }
    })
  }
  addProduct() {
    if (this.productAddingForm.invalid) {
      this.notificationService.showErrorMessage("INVALID FORM","Please Input Required Fields","OK",600);
      return;
    }
    this.showLoader = true;
    let productModel = this.productAddingForm.value;
    productModel.isEdit = this.isEdit;
    const params:Map<string,any> = new Map();
    params.set("product",productModel);
    console.log(productModel);
    this.productService.addProduct(params).subscribe({
      next:(res)=>{
        if(res.isUpdated){
          // this.productAddingForm.reset();
          this.notificationService.showMessage("SUCCESS!","Product Added Successfuly","OK",500);
        }else{
          this.productAddingForm.reset();
          this.notificationService.showMessage("SUCCESS!","Product Updated Successfuly","OK",500);
          this.product = res.body;
          this.prepareForm();
        }
        this.showLoader = false;
        
      },
      error:(err)=>{
        this.showLoader = false;
        this.notificationService.showMessage("FAILED!","Product Add Failed","OK",1000);
      },
      complete:()=>{
        this.showLoader = false;
      }
    })
  }
  setFormValue(){
    this.productAddingForm = this.formBuilder.group({
      id: this.product.id,
      productCode: this.product.productCode || "",
      productName: this.product.productName || "",
      productCategory: this.product.productCategory || "",
      unitType: this.product.unitType || "",
      quantity:this.product.quantity || "",
      brandName:this.product.brandName|| "",
      costPricePerUnit:this.product.costPricePerUnit|| "",
      sellingPricePerUnit:this.product.sellingPricePerUnit|| "",
      packagingCategory:this.product.packagingCategory|| "",
      unitPerPackage:this.product.unitPerPackage|| "",
    });
  }

  fetchProductCategory(){
    this.categories = [{ label: 'Select Category', value: '' }];
    this.productService.fetchAllProductCategory().subscribe({
      next:(res)=>{
        if(res.body){
          let categoryList = res.body;
          categoryList.map((elem:any)=>{
            let option = {label:elem.key,value: elem.value};
            this.categories.push(option);
          })
        }else{
          this.notificationService.showErrorMessage("ERROR","No Product Category Found","OK",500);
        }
      }
    })
  }

  fetchUnitType(){
    this.units = [{ label: 'Select Unit Type', value: '' }];
    this.productService.fetchAllUnitType().subscribe({
      next:(res)=>{
        if(res.body){
          let unitList = res.body;
          unitList.map((elem:any)=>{
            let option = {label:elem.key,value: elem.value};
            this.units.push(option);
          })
        }else{
          this.notificationService.showErrorMessage("ERROR","No Unit Type Found","OK",500);
        }
      }
    })
  }
  checkDuplicateProduct(){
    const params: Map<string, any> = new Map();
    params.set("code",this.productAddingForm.get('productCode')?.value);
    params.set("name",'');
    if(!this.isEdit){
      this.productService.fetchProductByCode(params).subscribe({
        next:(res)=>{
          if(res.isExist){
            this.productAddingForm.get('productName')?.disable();
            this.productAddingForm.get('productCategory')?.disable();
            this.productAddingForm.get('unitType')?.disable();
            this.productAddingForm.get('quantity')?.disable();
            this.productAddingForm.get('brandName')?.disable();
            this.productAddingForm.get('costPricePerUnit')?.disable();
            this.productAddingForm.get('sellingPricePerUnit')?.disable();
            this.productAddingForm.get('packagingCategory')?.disable();
            this.productAddingForm.get('unitPerPackage')?.disable();
            this.errMsg = "**This Product Already Exits"
          }else{
            this.productAddingForm.get('productName')?.enable();
            this.productAddingForm.get('productCategory')?.enable();
            this.productAddingForm.get('unitType')?.enable();
            this.productAddingForm.get('quantity')?.enable();
            this.productAddingForm.get('brandName')?.enable();
            this.productAddingForm.get('costPricePerUnit')?.enable();
            this.productAddingForm.get('sellingPricePerUnit')?.enable();
            this.productAddingForm.get('packagingCategory')?.enable();
            this.productAddingForm.get('unitPerPackage')?.enable();
            this.errMsg = ""
          }
        }
      })
    }
  }
  fetchBrandName(){
    this.brandNames = [{ label: 'Select Brand Name', value: '' }];
    this.productService.fetchAllBrandName().subscribe({
      next:(res)=>{
        if(res.body){
          let brandNames = res.body;
          brandNames.map((elem:any)=>{
            let option = {label:elem.key,value: elem.value};
            this.brandNames.push(option);
          })
        }else{
          this.notificationService.showErrorMessage("ERROR","No Brand Name Found","OK",500);
        }
      }
    })
  }
  
  printReport() {
    const printContents = document.getElementById('printable');
    if (printContents) {
      const win = window.open('', '_blank');
      win?.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Barcode Label</title>
            <style>
              @page {
                size: 1.5in 1in;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Courier New', monospace;
              }
              .barcode-label {
                width: 1.5in;
                height: 1in;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                text-align: center;
                padding: 2px;
                box-sizing: border-box;
              }
              .barcode-image {
                width: 100%;
                height: 40px;
                object-fit: contain;
              }
              .product-code {
                font-size: 12px;
                font-weight: bold;
              }
              .product-name {
                font-size: 9px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
              }
              .product-price {
                font-size: 11px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="barcode-label">
              <img src="${this.barcodeData}" class="barcode-image" alt="Barcode">
              <div class="product-code">${this.product?.productCode}</div>
              <div class="product-name">${this.product?.productName}</div>
              <div class="product-price">MRP: ${this.product?.sellingPricePerUnit} BDT</div>
            </div>
            <script>
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            </script>
          </body>
        </html>
      `);
      win?.document.close();
    }
  }

}

