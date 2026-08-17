import { FastifyInstance } from 'fastify';
import { loadConfig } from '../config/config.loader.js';

export async function configRoutes(app: FastifyInstance) {
  app.get('/api/config', async (_req, reply) => {
    try {
      const config = loadConfig();
      return reply.code(200).send(config);
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: 'Failed to load configuration' });
    }
  });
}
