import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TimeLineService } from './timeline.service';

describe('TimeLineService', () => {
  let timeLineService: TimeLineService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeLineService],
      imports: [ HttpClientTestingModule ]
    });
    timeLineService = TestBed.get(TimeLineService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(timeLineService).toBeTruthy();
  });

  it('check data', () => {
    const testData = [{ date: '01/02/2018', value: 'yes' }];
    timeLineService.data$.subscribe((data) => {
      expect(data).toEqual(testData);
    });

    const req = httpTestingController.expectOne('/api/stats?range=24');
    expect(req.request.method).toEqual('GET');
    req.flush(testData);
  });

});
