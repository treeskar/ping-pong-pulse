import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TimeLineService } from './timeline.service';
import { merge } from 'rxjs/observable/merge';
import { interval } from 'rxjs/observable/interval';
import { Subscription } from 'rxjs/Subscription';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { scan, map, tap, debounceTime, filter, startWith } from 'rxjs/operators'
import * as moment from 'moment';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { StatusService } from '../status.service';
import { switchMap } from 'rxjs/internal/operators';

interface ITick {
  data: boolean;
  date: number;
}

@Component({
  selector: 'app-timeline',
  template: '',
  styleUrls: ['./timeline.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeLineComponent implements OnInit, OnDestroy {

  width: number;
  height: number;
  transition: any = d3.transition().duration(500);
  minuteScale: any;
  hourScale: any;
  dayScale: any;
  svg: any;
  subscription: Subscription;
  activeTick: any;
  dataCache: Array<ITick>;
  bisector = d3.bisector((tick: ITick) => tick.date).left;

  margin = {
    left: 0,
    right: 70,
    top: 10,
    bottom: 10,
  };

  constructor(public timeLineService: TimeLineService, public statusService: StatusService, private element: ElementRef) { }

  get minuteScaleDomain() {
    const currentDate = moment();
    const beforeMinute = moment().subtract(1, 'minute');
    return [beforeMinute.toDate(), currentDate.toDate()]
  }

  get hourScaleDomain() {
    const beforeMinute = moment().subtract(1, 'minute');
    const beforeHour = moment().subtract(1, 'hour');
    return [beforeHour.toDate(), beforeMinute.toDate()]
  }

  get dayScaleDomain() {
    const beforeHour = moment().subtract(1, 'hour');
    const beforeDay = moment().subtract(1, 'day');
    return [beforeDay.toDate(), beforeHour.toDate()]
  }

  onOver(position, marker) {
    marker.style('transform', `translateY(${position}px)`);
  }

  updateMarkerLabel(position, marker) {
    if (typeof position !== 'number') {
      marker.select('.label').text(position);
      return;
    }
    const date = this.getDateByPosition(position - this.margin.top);
    const text = moment(date).fromNow();
    marker.select('.label')
      .text(() => ['Invalid date', 'a few seconds ago'].includes(text) ? 'Now' : text);
  }

  updateActiveTick(top, marker) {
    this.activeTick = {
      top,
      date: marker.select('.label').text(),
      freeze: true,
    };

    if (this.activeTick.date === 'Now') {
      return this.statusService.setStatus(this.activeTick.date);
    }

    const date = this.getDateByPosition(top - this.margin.top);
    const index = this.bisector(this.dataCache, date);
    const value = this.dataCache[index - 1] ? 'playing' : 'idle';
    return this.statusService.setStatus(moment(date).format('DD/MM/YYYY HH:mm:SS'), value);
  }

  ngOnInit() {
    this.width = this.element.nativeElement.offsetWidth - this.margin.left - this.margin.right;
    this.height = this.element.nativeElement.offsetHeight - this.margin.top - this.margin.bottom;
    this.dataCache = [];
    this.minuteScale = d3.scaleTime()
      .domain(this.minuteScaleDomain)
      .rangeRound([this.height * 0.15, this.margin.top]);
    this.hourScale = d3.scaleTime()
      .domain(this.hourScaleDomain)
      .rangeRound([this.height * 0.3, this.height * 0.15]);
    this.dayScale = d3.scaleTime()
      .domain(this.dayScaleDomain)
      .rangeRound([this.height, this.height * 0.3]);

    this.svg = d3.select(this.element.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.activeTick = { top: this.margin.top, date: 'Now', freeze: true };
    const marker = d3.select(this.element.nativeElement).append('div')
      .attr('class', 'marker')
      .style('transform', `translateY(${this.margin.top}px)`);

    marker.append('span')
      .attr('class','label')
      .text(this.activeTick.date);

    const convertEventToPosition = map((event: MouseEvent) => event.clientY);

    const svgElement = this.element.nativeElement.querySelector('svg');
    this.subscription = fromEvent(svgElement, 'mousemove')
      .pipe(
        convertEventToPosition,
        tap(position => {
          this.activeTick.freeze = false;
          this.onOver(position, marker);
        }),
        debounceTime(50),
        filter(() => (!this.activeTick.freeze)),
      )
      .subscribe((position) => this.updateMarkerLabel(position, marker));

    this.subscription.add(
      this.statusService.status$
        .pipe(
          filter((status) => (status.date === 'Now' && this.activeTick.date !== 'Now')),
        )
        .subscribe(() => {
          this.activeTick = { top: this.margin.top, date: 'Now', freeze: true };
          this.onOver(this.activeTick.top, marker);
          this.updateMarkerLabel(this.activeTick.date, marker);
        }),
    );

    this.subscription.add(
      fromEvent(svgElement, 'click')
        .pipe(convertEventToPosition)
        .subscribe(position => {
          this.onOver(position, marker);
          this.updateActiveTick(position, marker);
        }),
    );

    this.subscription.add(
      fromEvent(this.element.nativeElement, 'mouseleave')
        .subscribe(() => {
          this.onOver(this.activeTick.top, marker);
          this.updateMarkerLabel(this.activeTick.date, marker);
          this.activeTick.freeze = true;
        }),
    );

    this.svg.append('g')
      .attr('class', 'axis axisRight minuteScale')
      .attr('transform', `translate(${(this.width)}, 0)`)
      .call(
        d3.axisRight(this.minuteScale)
          .ticks(2)
          .tickFormat(d3.timeFormat('%H:%M:%S')),
      );

    this.svg.append('g')
      .attr('class', 'axis axisRight hourScale')
      .attr('transform', `translate(${(this.width)}, 0)`)
      .call(
        d3.axisRight(this.hourScale)
          .ticks(3)
          .tickFormat(d3.timeFormat('%H:%M')),
      );

    this.svg.append('g')
      .attr('class', 'axis axisRight dayScale')
      .attr('transform', `translate(${(this.width)}, 0)`)
      .call(
        d3.axisRight(this.dayScale)
          .ticks(5)
          .tickFormat(d3.timeFormat('%H:%M')),
      );

    merge(
      this.data$,
      interval(1000).pipe(map( () => this.dataCache )),
    )
      .subscribe(data => this.render(data));
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
          if (Array.isArray(data)) return data;
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
        tap(data => this.dataCache = data),
      )
  }

  getDateByPosition(y) {
    const scale = [this.minuteScale, this.hourScale, this.dayScale]
      .find((scale) => {
        const [max, min] = scale.range();
        return max >= y && min <= y;
      });
    if (!scale) {
      return null
    }
    return scale.invert(y);
  }

  tickScale(date) {
    const diff = Date.now() - date;
    if (diff <= 1000 * 60) {
      return this.minuteScale(date);
    }
    if (diff <= 1000 * 60 * 60) {
      return this.hourScale(date);
    }
    return this.dayScale(date);
  }

  findTickStart(tick, index, data) {
    const nexTick = data[index + 1];
    return nexTick ? this.tickScale(tick.date) : 0;
  }

  findTickEnd(tick, index, data) {
    const nexTick = data[index + 1];
    return nexTick ? this.tickScale(nexTick.date) : this.tickScale(tick.date);
  }

  render(data: Array<ITick>) {
    this.minuteScale.domain(this.minuteScaleDomain);
    this.hourScale.domain(this.hourScaleDomain);
    this.dayScale.domain(this.dayScaleDomain);

    this.svg.select('.minuteScale')
      // .interrupt()
      // .transition(this.transition)
      .call(
        d3.axisRight(this.minuteScale)
          .ticks(2)
          .tickFormat(d3.timeFormat('%H:%M:%S')),
      );

    this.svg.select('.hourScale')
      // .interrupt()
      // .transition(this.transition)
      .call(
        d3.axisRight(this.hourScale)
          .ticks(3)
          .tickFormat(d3.timeFormat('%H:%M')),
      );

    this.svg.select('.dayScale')
      // .interrupt()
      // .transition(this.transition)
      .call(
        d3.axisRight(this.dayScale)
          .ticks(5)
          .tickFormat(d3.timeFormat('%H:%M')),
      );

    const update = this.svg.selectAll('.bar')
      .data(data, d => d.date);

    update
      .exit()
      // .interrupt()
      //.transition(this.transition)
      .attrs({
        y1: (tick, index, bars) => bars[index].getAttribute('y2'),
      })
      .remove();

    update
      //.interrupt()
      //.transition(this.transition)
      //.delay(500)
      .attrs({
        y1: (tick, index) => this.findTickStart(tick, index, data),
        y2: (tick, index) => this.findTickEnd(tick, index, data),
        x1: this.margin.left,
        x2: this.margin.left,
      });

    update
      .enter()
      .append('line')
      .attrs({
        y1: (tick, index) => this.findTickEnd(tick, index, data),
        y2: (tick, index) => this.findTickEnd(tick, index, data),
        x1: this.margin.left,
        x2: this.margin.left,
      })
      // .interrupt()
      // .transition(this.transition)
      .attrs({
        class: tick => `bar ${tick.data ? 'playing' : 'idle'}`,
        y1: (tick, index) => this.findTickStart(tick, index, data),
        y2: (tick, index) => this.findTickEnd(tick, index, data),
        x1: this.margin.left,
        x2: this.margin.left,
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
