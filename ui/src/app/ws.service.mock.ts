import { Subject } from 'rxjs';

export const WSServiceMock = {
  status$: new Subject(),
  pulse$: new Subject(),
  ws$: new Subject(),
  pastStatus$: new Subject(),
  setStatus: () => {},
};
