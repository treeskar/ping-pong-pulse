import { PingStatusPipe } from './ping-status.pipe';

describe('PingStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new PingStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
