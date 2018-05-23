import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pingStatus'
})
export class PingStatusPipe implements PipeTransform {

  translation = {
    idle: 'Ping Pong is waiting for you',
    playing: 'Game in progress…',
    loading: 'Connecting...',
  };

  transform(status: string): string {
    return this.translation[status] || '';
  }

}
