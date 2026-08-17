import { FastifyInstance } from 'fastify';
import { fetchAllDepartures } from '../services/mvg.service.js';

export async function transitRoutes(app: FastifyInstance) {
  app.get('/api/transit', async (_req, reply) => {
    try {
      const transitData = await fetchAllDepartures();
      return reply.code(200).send(transitData);
    } catch (error: any) {
      app.log.error(error);
      return reply.code(502).send({
        error: 'Failed to fetch transit departures from MVG',
        message: error?.message || 'Unknown error',
      });
    }
  });
}
