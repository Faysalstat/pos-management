import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalConfigComponent } from './approval-config.component';

describe('ApprovalConfigComponent', () => {
  let component: ApprovalConfigComponent;
  let fixture: ComponentFixture<ApprovalConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
