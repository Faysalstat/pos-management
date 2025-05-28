// barcode.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-barcode',
  templateUrl: './barcode.component.html',
  styleUrls: ['./barcode.component.css']
})
export class BarcodeComponent {
  @Input() code: string = '';
  @Input() price: number = 0;
  @Input() shopName: string = 'Talukdar BABY SHOP';
  @Input() labelSize: 'small' | 'large' = 'large';
  @Input() showPrintButton: boolean = true;

  printLabel() {
    const labelElement = document.getElementById(`label-${this.code}`);
    if (!labelElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Calculate dimensions in inches (1cm = 0.393701 inches)
    const widthIn = this.labelSize === 'small' ? 0.5 * 0.393701 : 1 * 0.393701;
    const heightIn = this.labelSize === 'small' ? 1 * 0.393701 : 1.5 * 0.393701;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label</title>
          <style>
            @page {
              size: ${widthIn}in ${heightIn}in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .print-label {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-around;
              font-family: monospace;
              page-break-inside: avoid;
            }
            .shop-name, .price {
              margin: 0;
              padding: 0;
              text-align: center;
              width: 100%;
            }
            .shop-name {
              font-size: ${this.labelSize === 'small' ? '3pt' : '5pt'};
              font-weight: bold;
            }
            .price {
              font-size: ${this.labelSize === 'small' ? '4pt' : '6pt'};
            }
            .barcode-container {
              width: 100%;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            svg {
              width: 100%;
              height: auto;
              max-height: ${this.labelSize === 'small' ? '15px' : '25px'};
              margin: 0;
              padding: 0;
            }
            .barcode-number {
              font-family: monospace;
              font-size: ${this.labelSize === 'small' ? '3pt' : '4pt'};
              margin: 0;
              margin-top: -4px;
              padding: 0;
              text-align: center;
              width: 100%;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 100);">
          ${labelElement.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}