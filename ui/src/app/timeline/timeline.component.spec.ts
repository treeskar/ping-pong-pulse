import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLineComponent } from './timeline.component';
import { timeLineServiceMock } from './timeline.service.mock';
import { TimeLineService } from './timeline.service';
import { WSServiceMock } from '../ws.service.mock';
import { WSService } from '../ws.service';

describe('TimeLineComponent', () => {
  let component: TimeLineComponent;
  let fixture: ComponentFixture<TimeLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeLineComponent ],
      providers: [
        { provide: TimeLineService, useValue: timeLineServiceMock },
        { provide: WSService, useValue: WSServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
