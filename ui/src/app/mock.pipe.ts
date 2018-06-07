import {Injectable, Pipe, PipeTransform} from '@angular/core';

export function mockPipeGenerator(name: string, transform?: Function) {
  @Pipe({
    name,
    pure: true,
  })
  @Injectable()
  class MockPipe implements PipeTransform {

    transform(value: any): any {
      return typeof transform === 'function' ? transform(value) : value;
    }

  }
  return MockPipe;
}
