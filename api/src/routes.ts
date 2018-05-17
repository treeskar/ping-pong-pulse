import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import { broadcastPulse } from './websocket';
import { PingGlobal } from './global';
import config from './config';
import { logger } from './logger';

declare const global: PingGlobal;

declare global {
  namespace Express {
    interface Request {
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
    success: true,
    message: 'Enjoy your token!',
    token: token
  });
}

function authenticateMiddleware(req: Request, res: Response, next: Function) {
  const token = req.body.token || req.query.token || req.headers['authorization'];
  if (!token) {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }

  jwt.verify(token, config.jwtSecret, (error: jwt.JsonWebTokenError, decoded: any) => {
   if (error) {
     return res.json({
       success: false,
       message: 'Failed to authenticate token.'
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
