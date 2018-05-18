import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import config from './config';
import { IPingGlobal } from './global';
import { logger } from './logger';
import { broadcastPulse } from './websocket';

declare const global: IPingGlobal;

declare global {
  namespace Express {
    interface Request { // tslint:disable-line interface-name
      decoded?: any
    }
  }
}

async function authenticateController(req: Request, res: Response) {
  const isSpyValid = await global.SpyModel.validate(req.body.name, req.body.password);
  if (!isSpyValid) {
    return res.json({ success: false, message: 'Authentication failed. Wrong password.' });
  }
  const token = jwt.sign(
    { name: req.body.name },
    config.jwtSecret,
    { expiresIn: '1h' },
  );

  res.setHeader('authorization', token);

  res.json({
    message: 'Enjoy your token!',
    success: true,
    token
  });
}

function authenticateMiddleware(req: Request, res: Response, next: () => void) {
  const token = req.body.token || req.query.token || req.headers.authorization;
  if (!token) {
    return res.status(403).send({
      message: 'No token provided.',
      success: false
    });
  }

  jwt.verify(token, config.jwtSecret, (error: jwt.JsonWebTokenError, decoded: any) => {
   if (error) {
     return res.json({
       message: 'Failed to authenticate token.',
       success: false
     });
   }
   req.decoded = decoded;
   next();
  });
}

function savePulseController(req: Request, res: Response) {
  global.PingModel.savePulse(req.body.pulse);
  logger.info(`Got pulse state: ${req.body.pulse}`);
  broadcastPulse(req.body.pulse);
  res.send('Pong');
}

async function getStatsController(req: Request, res: Response) {
  const range = Number.parseInt(req.query.range);
  const pulseStats = await global.PingModel.getPulseStats(range);
  res.send(pulseStats);
}

const apiRoutes = Router();

apiRoutes.get('/ping', (req, res) => res.send('Pong'));
apiRoutes.post('/authenticate', authenticateController);
apiRoutes.post('/pulse', savePulseController);
apiRoutes.get('/stats', getStatsController);

export { apiRoutes }
