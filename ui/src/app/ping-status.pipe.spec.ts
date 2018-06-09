import { PingStatusPipe } from './ping-status.pipe';

describe('PingStatusPipe', () => {
  let pipe: PingStatusPipe;

  beforeEach(() => {
    pipe = new PingStatusPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('translate idle', () => {
    expect(pipe.transform('idle')).toBe('Ping Pong is waiting for you');
  });

  it('translate unknown string', () => {
    expect(pipe.transform('unknown')).toBe('');
  });
});
