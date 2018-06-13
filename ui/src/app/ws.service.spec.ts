import { TestBed, inject } from '@angular/core/testing';

import { WSService } from './ws.service';
import { WindowRefService } from './window-ref.service';
import { WindowRefServiceMock } from './window-ref.service.mock';

describe('WSService', () => {
  let wSService: WSService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WSService,
        { provide: WindowRefService, useValue: WindowRefServiceMock },
      ]
    });
    wSService = TestBed.get(WSService);
  });

  it('should be created', inject([WSService], (service: WSService) => {
    expect(service).toBeTruthy();
  }));

  it('update Version', () => {
    const windowRef = TestBed.get(WindowRefService);
    spyOn(windowRef.nativeWindow.location, 'reload');
    wSService.ws$.next({ cmd: 'VERSION', data: 'new' });
    expect(windowRef.nativeWindow.location.reload).toHaveBeenCalled();
  });

  it('set GAME_STATUS', () => {
    const spyFn = { init: () => {} };
    spyOn(spyFn, 'init');
    wSService.status$.next({ date: 'Now', data: 'idle' });
    wSService.status$.subscribe(spyFn.init);
    wSService.ws$.next({ cmd: 'GAME_STATUS', value: 'yes' });
    expect(spyFn.init).toHaveBeenCalledWith({ date: 'Now', data: 'playing' });
  });

  it('set status', () => {
    const spyFn = { init: () => {} };
    const tick = { date: '01/01/2017', data: 'idle'};
    spyOn(spyFn, 'init');
    wSService.ws$.next({ cmd: 'GAME_STATUS', value: 'no' });
    wSService.setStatus(tick.date, tick.data);
    wSService.status$.subscribe(spyFn.init);
    expect(spyFn.init).toHaveBeenCalledWith(tick);
  });

});
