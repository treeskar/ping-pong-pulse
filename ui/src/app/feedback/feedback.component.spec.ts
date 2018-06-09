import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackComponent } from './feedback.component';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  const email = 'test@gmail.com';
  const subject = 'subject';
  const cc = 'cc@gmail.com';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    component.email = email;
    component.subject = subject;
    component.cc = cc;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate right mailto link', () => {
    expect(component.link).toBe(`mailto:${email}?subject=${subject}&cc=${cc}`);
  });
});
