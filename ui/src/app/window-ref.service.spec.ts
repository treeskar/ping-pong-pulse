import { TestBed } from '@angular/core/testing';

import { WindowRefService } from './window-ref.service';

describe('WSService', () => {
  let windowRefService: WindowRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowRefService]
    });
    windowRefService = TestBed.get(WindowRefService);
  });

  it('should be created', () => {
    expect(windowRefService).toBeTruthy();
  });

  it('get Window', () => {
    expect(windowRefService.nativeWindow).toBe(window);
  });

});
