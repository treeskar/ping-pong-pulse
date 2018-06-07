import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { TimeLineService } from './timeline.service';
import { merge } from 'rxjs/observable/merge';
import { interval } from 'rxjs/observable/interval';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { Subject } from 'rxjs/Subject';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { scan, map, tap, withLatestFrom, mapTo, mergeMap, filter, startWith, distinctUntilChanged } from 'rxjs/operators';
import * as moment from 'moment';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { WSService } from '../ws.service';
import { switchMap } from 'rxjs/internal/operators';

moment.updateLocale('en', {
  relativeTime : {
    future: 'in %s',
    past: (value) => (value === 'Now' ? value : `${value} ago`),
    s  : 'Now',
    ss : '%d sec',
    m:  'a min',
    mm: '%d min',
    h:  'an h',
    hh: '%d h',
    d:  'a day',
    dd: '%d days',
    M:  'a month',
    MM: '%d months',
    y:  'a year',
    yy: '%d years'
  }
});

interface ITick {
  data: boolean;
  date: number;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeLineComponent implements OnInit, OnDestroy {

  width: number;
  height: number;
  scale: any;
  currentScale: any;
  axis: any;
  gAxis: any;
  svg: any;
  gZoom: any;
  dataCache: Array<ITick>;
  bisector = d3.bisector((tick: ITick) => tick.date).left;
  zoom: any;
  markerPosition$: Observable<number>;
  click$: Observable<number>;
  mouseLeave$: Observable<number>;
  mouseMove$: Observable<number>;
  zoomMarkerPosition$: Observable<number>;
  status$: Observable<number>;
  markerDate$: Observable<Date>;
  markerText$: Observable<string>;
  translate$: Observable<string>;
  zoom$: Subject<any> = new Subject();
  subscription: Subscription = new Subscription();

  margin = {
    left: 0,
    right: 70,
    top: 10,
    bottom: 10,
  };

  constructor(public timeLineService: TimeLineService, public statusService: WSService, private element: ElementRef) { }

  get scaleDomain() {
    const to = moment().subtract(24, 'hour');
    return [to.toDate(), moment().toDate()];
  }

  updateCurrentStatus(y) {
    const date = this.scale.invert(y - this.margin.top);
    const index = this.bisector(this.dataCache, date);
    const tick = this.dataCache[index - 1];
    const value = tick && tick.data ? 'playing' : 'idle';
    return this.statusService.setStatus(moment(date).format('DD/MM/YYYY HH:mm:SS'), value);
  }

  ngOnInit() {
    this.width = this.element.nativeElement.offsetWidth - this.margin.left - this.margin.right;
    this.height = this.element.nativeElement.offsetHeight - this.margin.top - this.margin.bottom;
    this.dataCache = [];

    this.svg = d3.select(this.element.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.zoom = d3.zoom()
      .scaleExtent([1, 15])
      .translateExtent([[0, 0], [this.width, this.height]])
      .duration(300)
      .on('zoom', () => this.zoom$.next(d3.event.transform));

    this.scale = d3.scaleTime()
      .domain(this.scaleDomain)
      .range([this.height, 0]);
    this.currentScale = this.scale;

    this.axis = d3.axisRight(this.scale)
      .tickFormat(d3.timeFormat('%H:%M:%S'));

    this.gAxis = this.svg.append('g')
      .attr('class', 'axis axisRight scale')
      .attr('transform', `translate(${(this.width)}, 0)`)
      .call(this.axis);

    this.gZoom = this.svg.append('rect')
      .attrs({
        class: 'zoom',
        width: this.width + this.margin.right,
        height: this.height,
      })
      .call(this.zoom)
      .transition()
      .duration(1500);

    const mapEventToY = map((event: MouseEvent) => event.clientY);

    this.click$ = fromEvent(this.element.nativeElement, 'click')
      .pipe(mapEventToY);
    this.mouseMove$ = fromEvent(this.element.nativeElement, 'mousemove')
      .pipe(mapEventToY);

    this.mouseLeave$ = fromEvent(this.element.nativeElement, 'mouseleave');
    this.status$ = this.statusService.status$.pipe(
      filter(status => status.date === 'Now'),
      mapTo(this.margin.top),
    );
    this.markerPosition$ = merge(
      this.click$,
      this.status$
    )
      .pipe(
        startWith(this.margin.top),
        mergeMap(y => (
          merge(this.mouseMove$.pipe(startWith(y)), this.mouseLeave$.pipe(mapTo(y)))
        )),
        filter(y => y >= this.margin.top),
      );

    this.markerDate$ = this.markerPosition$.pipe(
      map(y => (y - this.margin.top || 0)),
      startWith(0),
      map((y: any) => this.currentScale.invert(y)),
    );

    this.zoomMarkerPosition$ = this.zoom$
      .pipe(
        withLatestFrom(this.markerDate$, (zoom, date) => date),
        map((date) => (this.currentScale(date) + this.margin.top)),
        map(y => y < this.margin.top ? this.margin.top : y),
      );
    this.translate$ = merge(this.markerPosition$, this.zoomMarkerPosition$)
      .pipe(
        startWith(this.margin.top),
        map(y => `translateY(${y}px)`),
      );

    this.markerText$ = this.markerDate$.pipe(
      map(date => (date.getTime() > Date.now() ? new Date() : date)),
      map(date => moment(date).fromNow()),
      map(text => ['Invalid date', 'a few seconds ago', 'in a few seconds'].includes(text) ? 'Now' : text),
      distinctUntilChanged(),
      startWith('Now'),
    );

    const zoomSub = this.zoom$
      .pipe(
        withLatestFrom(this.data$, (zoomTransform, data) => ({ zoomTransform, data})),
      )
      .subscribe(({ zoomTransform, data }) => this.scaleRender(data, zoomTransform));
    this.subscription.add(zoomSub);

    const dataSub = merge(
      this.data$,
      interval(1000, animationFrame).pipe(
        withLatestFrom(this.data$, (time, data) => data)
      ),
    )
      .subscribe(data => {
        this.dataRender(data);
        this.scaleRender(data);
      });
    this.subscription.add(dataSub);
    this.moveTo(15, 0);
  }

  moveTo(scale, x = 0, y = 0) {
    this.gZoom.call(
      this.zoom.transform,
      d3.zoomIdentity.scale(scale).translate(x, y),
    );
  }

  get data$() {
    const gameStatus$ = this.statusService.pulse$
      .pipe(
        map((status) => ({ date: Date.now(), data: status === 'playing' })),
      );

    return this.timeLineService.data$
      .pipe(
        switchMap(data => (
          gameStatus$.pipe(startWith(data))
        )),
        scan((acc, data) => {
          if (Array.isArray(data)) {
            return data;
          }
          acc.push(data);
          return acc;
        }, []),
        map((data) => (
          data.reduce((acc, tick, index) => {
            if (!acc[acc.length] || acc[acc.length].data !== tick.data) {
              acc.push(tick);
            }
            return acc;
          }, [])
        )),
      );
  }

  findTickStart(tick, index, data, scale = this.scale) {
    const nexTick = data[index + 1];
    return nexTick ? scale(tick.date) : 0;
  }

  findTickEnd(tick, index, data, scale = this.scale) {
    const nexTick = data[index + 1];
    const position = nexTick ? scale(nexTick.date) : scale(tick.date);
    return position < 0 ? 0 : position;
  }

  scaleRender(data: Array<ITick>, zoomTransform?: any) {
    if (zoomTransform) {
      this.currentScale = zoomTransform.rescaleY(this.scale);
    }
    // update axes
    this.gAxis
      .call(this.axis.scale(this.currentScale));
    // update bars
    this.svg.selectAll('.bar')
      .transition()
      .duration(300)
      .attrs({
        y1: (tick, index) => this.findTickStart(tick, index, data, this.currentScale) || 0,
        y2: (tick, index) => this.findTickEnd(tick, index, data, this.currentScale) || 0,
        x1: this.margin.left,
        x2: this.margin.left,
      });
  }

  dataRender(data: Array<ITick>) {
    this.scale.domain(this.scaleDomain);
    const update = this.svg.selectAll('.bar')
      .data(data, d => d.date);

    update.exit().remove();
    update.enter()
      .append('line')
      .attr('class', tick => `bar ${tick.data ? 'playing' : 'idle'}`);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
