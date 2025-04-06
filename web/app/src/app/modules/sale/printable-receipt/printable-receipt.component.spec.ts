import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintableReceiptComponent } from './printable-receipt.component';

describe('PrintableReceiptComponent', () => {
  let component: PrintableReceiptComponent;
  let fixture: ComponentFixture<PrintableReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintableReceiptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintableReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
