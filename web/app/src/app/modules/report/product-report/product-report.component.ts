import { Component, OnInit } from '@angular/core';
import { ExcelExportService } from '../../services/excel-export.service';

@Component({
  selector: 'app-product-report',
  templateUrl: './product-report.component.html',
  styleUrls: ['./product-report.component.css']
})
export class ProductReportComponent implements OnInit {

  constructor(
    private excelExportService: ExcelExportService
  ) { 
    
  }

  ngOnInit(): void {
  }

}
