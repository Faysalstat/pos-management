import { Component, OnInit } from '@angular/core';
import * as CanvasJSAngularChart from '../../../../assets/canvas/canvasjs.angular.component';
import { ReportServiceService } from '../../services/report-service.service';
var CanvasJSChart = CanvasJSAngularChart.CanvasJSChart;

@Component({
  selector: 'app-visual-dashboard',
  templateUrl: './visual-dashboard.component.html',
  styleUrls: ['./visual-dashboard.component.css'],
})
export class VisualDashboardComponent implements OnInit {
  chart: any;
  months: any[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  chartOptions = {};
  constructor(
	private reportService: ReportServiceService
  ) {
	this.fetchVisualSummary();
  }

  ngOnInit(): void {
	
  }

  fetchVisualSummary(){
	this.reportService.fetchVisualDetails().subscribe({
		next:(res)=>{
			console.log(res);
			let monthlySaleModel = res.body.sale;
			let monthlyOrderCountModel = res.body.orderCount;
			let monthlyPurchaseModel = res.body.purchase;
			this.chartOptions = {
				animationEnabled: true,
				theme: 'light2',
				title: {
				  text: 'Revenue Analysis',
				},
				axisY: {
				  title: 'Number of Orders',
				  includeZero: true,
				},
				axisY2: {
				  title: 'Total Revenue',
				  includeZero: true,
				  labelFormatter: (e: any) => {
					var suffixes = ['', 'Lac', 'M', 'B'];
			
					var order = Math.max(
					  Math.floor(Math.log(e.value) / Math.log(10000)),
					  0
					);
					if (order > suffixes.length - 1) order = suffixes.length - 1;
			
					var suffix = suffixes[order];
					return 'BDT' + e.value / Math.pow(100000, order) + suffix;
				  },
				},
				toolTip: {
				  shared: true,
				},
				legend: {
				  cursor: 'pointer',
				  itemclick: function (e: any) {
					if (
					  typeof e.dataSeries.visible === 'undefined' ||
					  e.dataSeries.visible
					) {
					  e.dataSeries.visible = false;
					} else {
					  e.dataSeries.visible = true;
					}
					e.chart.render();
				  },
				},
				data: [
				  {
					type: 'column',
					showInLegend: true,
					name: 'Sale',
					axisYType: 'secondary',
					yValueFormatString: 'BDT #,###',
					dataPoints: [
					  { label: 'Jan', y: monthlySaleModel.jan },
					  { label: 'Feb', y: monthlySaleModel.feb },
					  { label: 'Mar', y: monthlySaleModel.mar},
					  { label: 'Apr', y: monthlySaleModel.apr },
					  { label: 'May', y: monthlySaleModel.may },
					  { label: 'Jun', y: monthlySaleModel.jun },
					  { label: 'Jul', y: monthlySaleModel.jul },
					  { label: 'Aug', y: monthlySaleModel.aug },
					  { label: 'Sep', y: monthlySaleModel.sep },
					  { label: 'Oct', y: monthlySaleModel.oct },
					  { label: 'Nov', y: monthlySaleModel.nov },
					  { label: 'Dec', y: monthlySaleModel.dec },
					],
				  },
				  {
					type: 'column',
					showInLegend: true,
					name: 'Purchase',
					axisYType: 'secondary',
					yValueFormatString: 'BDT #,###',
					dataPoints: [
					  { label: 'Jan', y: monthlyPurchaseModel.jan },
					  { label: 'Feb', y: monthlyPurchaseModel.feb },
					  { label: 'Mar', y: monthlyPurchaseModel.mar },
					  { label: 'Apr', y: monthlyPurchaseModel.apr },
					  { label: 'May', y: monthlyPurchaseModel.may },
					  { label: 'Jun', y: monthlyPurchaseModel.jun },
					  { label: 'Jul', y: monthlyPurchaseModel.jul },
					  { label: 'Aug', y: monthlyPurchaseModel.aug },
					  { label: 'Sep', y: monthlyPurchaseModel.sep },
					  { label: 'Oct', y: monthlyPurchaseModel.oct },
					  { label: 'Nov', y: monthlyPurchaseModel.nov },
					  { label: 'Dec', y: monthlyPurchaseModel.dec },
					],
				  },
				  {
					type: 'spline',
					showInLegend: true,
					name: 'No of Orders',
					dataPoints: [
					  { label: 'Jan', y: monthlyOrderCountModel.jan },
					  { label: 'Feb', y: monthlyOrderCountModel.feb },
					  { label: 'Mar', y: monthlyOrderCountModel.mar },
					  { label: 'Apr', y: monthlyOrderCountModel.apr },
					  { label: 'May', y: monthlyOrderCountModel.may },
					  { label: 'Jun', y: monthlyOrderCountModel.jun },
					  { label: 'Jul', y: monthlyOrderCountModel.jul },
					  { label: 'Aug', y: monthlyOrderCountModel.aug },
					  { label: 'Sep', y: monthlyOrderCountModel.sep },
					  { label: 'Oct', y: monthlyOrderCountModel.oct },
					  { label: 'Nov', y: monthlyOrderCountModel.nov },
					  { label: 'Dec', y: monthlyOrderCountModel.dec },
					],
				  },
				],
			  };
		},
		error:(err)=>{
			console.log(err);
		}
	})
  }
}
