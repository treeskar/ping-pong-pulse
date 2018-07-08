import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { TimeLineService } from './timeline.service';
import { merge } from 'rxjs/observable/merge';
import { interval } from 'rxjs/observable/interval';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { Subject } from 'rxjs/Subject';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { scan, map, withLatestFrom, mapTo, mergeMap, filter, startWith, distinctUntilChanged, tap, debounceTime } from 'rxjs/operators';
import * as moment from 'moment';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { WSService } from '../ws.service';
import { WindowRefService } from '../window-ref.service';
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

export interface ITick {
  data: boolean;
  date: number;
}

interface IZoomTransform {
  k: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('flyInOut', [
      state('*', style({
        opacity: 1,
        transform: 'scale(1) translate(10%, -10%)',
      })),
      transition('void => *', [
        style({ opacity: 0, transform: 'scale(0) translate(10%, -10%)'}),
        animate(300),
      ]),
      transition('* => void', [
        animate(300, style({ opacity: 0, transform: 'scale(0) translate(10%, -10%)'})),
      ])
    ]),
  ]
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
  zoom: any;
  showResetButton$: Observable<boolean>;
  markerText$: Observable<string>;
  translateMarker$: Observable<string>;
  onMoveToEnd$: Subject<number> = new Subject();
  subscription: Subscription = new Subscription();
  margin = {
    left: 0,
    right: 70,
    top: 10,
    bottom: 10,
  };
  initialZoomScale = 15;

  constructor(
    public timeLineService: TimeLineService,
    public statusService: WSService,
    private element: ElementRef,
    public windowRef: WindowRefService
  ) {}

  ngOnInit() {
    this.width = this.element.nativeElement.offsetWidth - this.margin.left - this.margin.right;
    this.height = this.element.nativeElement.offsetHeight - this.margin.top - this.margin.bottom;
    this.svg = this.initSVG();

    // Initiate Zoom
    const zoom$: Subject<any> = new Subject();
    this.zoom = this.initZoom()
      .on('zoom', () => zoom$.next(d3.event.transform));
    this.gZoom = this.svg
      .call(svg => this.initZoomGroup(svg))
      .call(this.zoom);

    this.scale = d3.scaleTime().domain(this.getScaleDomain()).range([this.height, 0]);
    this.currentScale = this.scale;
    const timeFormatter = d3.timeFormat('%H:%M:%S');
    this.axis = d3.axisRight(this.scale).tickFormat(timeFormatter);
    this.gAxis = this.svg.append('g')
      .call(group => this.initAxisGroup(group));

    const data$ = this.getDataStream();
    const click$ = fromEvent(this.svg.node(), 'click').pipe(
      map((event: MouseEvent) => event.clientY),
    );
    this.handleClick(click$, data$);
    this.handleMarkerReset(zoom$);
    const markerPosition$ = this.getMarkerPositionStream(click$);
    const markerDate$ = this.getMarkerDateStream(markerPosition$);
    this.translateMarker$ = this.getTranslateMarkerStream(markerPosition$, zoom$, markerDate$);
    this.markerText$ = this.getMarkerTextStream(markerDate$);
    const zoomUpdate$ = this.getZoomUpdateStream(zoom$, data$);
    const dataUpdate$ = this.getDataUpdateStream(zoom$, data$);
    const resize$ = this.getResizeStream(zoom$, data$);
    this.showResetButton$ = this.getResetButtonStream(zoom$);

    this.subscription.add(
      merge(zoomUpdate$, dataUpdate$, resize$)
        .subscribe((res: any) => this.render(res.data, res.zoomTransform)),
    );
  }

  getScaleDomain() {
    const to = moment().subtract(24, 'hour');
    return [to.toDate(), moment().toDate()];
  }

  initSVG() {
    return d3.select(this.element.nativeElement)
      .append('svg')
      .attr('width', this.element.nativeElement.offsetWidth)
      .attr('class', 'time-line-svg')
      .attr('perserveAspectRatio', 'xMidYMax')
      .call(svg => this.fitToContainer(svg))
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  initZoom() {
    return d3.zoom()
      .scaleExtent([1.1, 20])
      .translateExtent([[0, 0], [this.width, this.height]])
      .duration(300);
  }

  initZoomGroup(svg) {
    return svg.append('rect')
      .attrs({
        class: 'zoom',
        width: this.width + this.margin.right,
        height: this.height,
      });
  }

  initAxisGroup(group) {
    return group.attr('class', 'axis axisRight scale')
      .attr('transform', `translate(${(this.width)}, 0)`)
      .call(this.axis);
  }

  fitToContainer(svg) {
    return svg
      .attr('height', this.element.nativeElement.offsetHeight)
      .attr('viewBox', `0 0 ${this.element.nativeElement.offsetWidth} ${this.element.nativeElement.offsetHeight}`);
  }

  moveTo(scale, x = 0, y = 0) {
    this.gZoom
      .transition()
      .duration(1500)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.scale(scale).translate(x, y),
      )
      .on('end', () => this.onMoveToEnd$.next(y + this.margin.top));
  }

  reset() {
    this.statusService.setStatus('Now');
    this.moveTo(this.initialZoomScale, 0, 0);
  }

  handleClick(click$, data$) {
    const bisector = d3.bisector((tick: ITick) => tick.date).left;
    const clickSub = click$.pipe(
      map((y: number) => this.currentScale.invert(y - this.margin.top)),
      withLatestFrom(data$, (date, data: Array<ITick>) => ({
        date,
        tick: data[bisector(data, date) - 1],
      })),
      map(({ date, tick }) => ({
        date: moment(date).format('DD/MM/YYYY HH:mm:SS'),
        data: tick && tick.data ? 'playing' : 'idle',
      })),
    )
      .subscribe(({ date, data }) => this.statusService.setStatus(date, data));
    this.subscription.add(clickSub);
  }

  handleMarkerReset(zoom$) {
    const resetMarkerSub = this.statusService.status$
      .pipe(
        map(status => status.date),
        distinctUntilChanged(),
        filter(date => date === 'Now'),
        withLatestFrom(zoom$, (date, zoomTransform) => zoomTransform),
        filter((zoomTransform: IZoomTransform) => zoomTransform.y !== 0),
        map(zoomTransform => zoomTransform.k),
        startWith(this.initialZoomScale),
      )
      .subscribe(scale => this.moveTo(scale));
    this.subscription.add(resetMarkerSub);
  }

  getResizeStream(zoom$, data$) {
    return fromEvent(this.windowRef.nativeWindow, 'resize')
      .pipe(
        debounceTime(300),
        tap(() => { this.height = this.element.nativeElement.offsetHeight - this.margin.top - this.margin.bottom; }),
        tap(() => this.fitToContainer(d3.select('app-timeline .time-line-svg'))),
        tap(() => d3.select('app-timeline .zoom').attr('height', this.height)),
        tap(() => this.scale.range([this.height, 0])),
        tap(() => this.zoom.translateExtent([[0, 0], [this.width, this.height]])),
        withLatestFrom(zoom$, (e, zoomTransform) => zoomTransform),
        withLatestFrom(data$, (zoomTransform, data) => ({ zoomTransform, data }))
      );
  }

  getDataStream() {
    const gameStatus$ = this.statusService.pulse$
      .pipe(
        map(({ data }) => ({ date: Date.now(), data: data === 'playing' })),
      );

    return this.timeLineService.data$
      .pipe(
        switchMap(data => (
          gameStatus$.pipe(startWith(data))
        )),
        scan((acc, data) => (
          Array.isArray(data) ? data : [...acc, data]
        ), []),
        map((data: Array<ITick>) => (
          data.reduce((acc, tick) => (
            !acc[acc.length - 1] || acc[acc.length - 1].data !== tick.data ? [...acc, tick] : acc
          ), [])
        )),
      );
  }

  getDataUpdateStream(zoom$, data$) {
    return merge(
      data$,
      interval(1000, animationFrame).pipe(
        withLatestFrom(data$, (time, data) => data),
      ),
    )
      .pipe(
        withLatestFrom(zoom$, (data, zoomTransform) => ({ data, zoomTransform })),
      );
  }

  getMarkerTextStream(markerDate$) {
    return markerDate$.pipe(
      map((date: Date) => (date.getTime() > Date.now() ? new Date() : date)),
      map(date => moment(date).fromNow()),
      map((text: string) => ['Invalid date', 'a few seconds ago', 'in a few seconds'].includes(text) ? 'Now' : text),
      distinctUntilChanged(),
      startWith('Now'),
    );
  }

  getMarkerPositionStream(click$) {
    const status$ = this.statusService.status$
      .pipe(
        filter(status => status.date === 'Now'),
        mapTo(this.margin.top),
      );
    const mouseMove$ = fromEvent(this.svg.node(), 'mousemove')
      .pipe(map((event: MouseEvent) => event.clientY));
    const mouseLeave$ = fromEvent(this.svg.node(), 'mouseleave');

    return merge(click$, status$, this.onMoveToEnd$)
      .pipe(
        startWith(this.margin.top),
        mergeMap(y => (
          merge(mouseMove$.pipe(startWith(y)), mouseLeave$.pipe(mapTo(y)))
        )),
        filter(y => y >= this.margin.top),
      );
  }

  getMarkerDateStream(markerPosition$: Observable<number>) {
    return markerPosition$.pipe(
      map(y => (y - this.margin.top || 0)),
      startWith(0),
      map((y: any) => this.currentScale.invert(y)),
    );
  }

  getTranslateMarkerStream(markerPosition$, zoom$, markerDate$) {
    const zoomMarkerPosition$ = zoom$
      .pipe(
        withLatestFrom(markerDate$, (zoom, date) => date),
        map((date) => (this.currentScale(date) + this.margin.top)),
        map(y => y < this.margin.top ? this.margin.top : y),
      );
    return merge(markerPosition$, zoomMarkerPosition$)
      .pipe(
        startWith(this.margin.top),
        map(y => `translateY(${y}px)`),
      );
  }

  getZoomUpdateStream(zoom$, data$) {
    return zoom$
      .pipe(
        withLatestFrom(data$, (zoomTransform, data) => ({ zoomTransform, data})),
      );
  }

  getResetButtonStream(zoom$) {
    return combineLatest(
      zoom$,
      this.statusService.status$,
      ({ k, y }, { date }) => ({ k, y, date }),
    ).pipe(
      map(({ k, y, date }) => (k !== this.initialZoomScale || y !== 0 || date !== 'Now')),
    );
  }

  findBarY1(scale, index, data) {
    const nexTick = data[index + 1];
    return nexTick ? scale(data[index].date) : 0;
  }

  findBarY2(scale, index, data) {
    const nexTick = data[index + 1];
    return nexTick ? scale(nexTick.date) : scale(data[index].date);
  }

  render(data: Array<ITick>, zoomTransform) {
    this.scale = this.scale.domain(this.getScaleDomain());
    if (zoomTransform) {
      this.currentScale = zoomTransform.rescaleY(this.scale);
    }
    // update axes
    this.gAxis.call(this.axis.scale(this.currentScale));
    // update bars
    const relevantData = data.filter(tick => this.currentScale(tick.date) >= 0.1);
    const bars = this.svg.selectAll('.bar').data(relevantData, tick => tick.date);
    bars
      .enter()
      .append('line')
      .attrs({
        class: tick => `bar ${tick.data ? 'playing' : 'idle'}`,
        x1: this.margin.left,
        x2: this.margin.left,
      })
      .merge(bars)
      .attrs({
        y1: (tick, index) => this.findBarY1(this.currentScale, index, relevantData),
        y2: (tick, index) => this.findBarY2(this.currentScale, index, relevantData),
      });
    bars.exit()
      .attr('y1', (tick, index, lines) => lines[index].getAttribute('y2'))
      .remove();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
