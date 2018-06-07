import { Subject } from 'rxjs/Subject';

export const WSServiceMock = {
  status$: new Subject(),
  pulse$: new Subject(),
  ws$: new Subject(),
  pastStatus$: new Subject(),
  setStatus: () => {},
};
