import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineLabelComponent } from './timeline-label.component';

describe('TimelineLabelComponent', () => {
  let component: TimelineLabelComponent;
  let fixture: ComponentFixture<TimelineLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
