import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { StatusComponent } from './status.component';
import { WSService } from '../ws.service';
import { WSServiceMock } from '../ws.service.mock';
import { mockPipeGenerator } from '../mock/pipe.mock';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        StatusComponent,
        mockPipeGenerator('pingStatus'),
      ],
      providers: [{ provide: WSService, useValue: WSServiceMock }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('set date', () => {
    const date = '01/10/2018';
    component.date = date;
    fixture.detectChanges();
    expect(component.isNow).toBeFalsy();
    expect(component.cacheDate).toBe(date);
  });

  it('set date to Now', () => {
    component.date = 'Now';
    fixture.detectChanges();
    expect(component.isNow).toBeTruthy();
    expect(component.cacheDate).toBe('Now');
  });

  it('go back', () => {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    component.isNow = false;
    fixture.detectChanges();
    const wsService = TestBed.get(WSService);
    spyOn(wsService, 'setStatus');
    const button = fixture.debugElement.query(By.css('.button'));
    button.triggerEventHandler('click', null);
    expect(wsService.setStatus).toHaveBeenCalledWith('Now');
  });
});
