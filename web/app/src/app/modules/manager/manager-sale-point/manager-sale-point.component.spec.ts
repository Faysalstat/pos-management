import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerSalePointComponent } from './manager-sale-point.component';

describe('ManagerSalePointComponent', () => {
  let component: ManagerSalePointComponent;
  let fixture: ComponentFixture<ManagerSalePointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagerSalePointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerSalePointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
