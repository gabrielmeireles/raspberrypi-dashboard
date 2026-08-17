import { FastifyInstance } from 'fastify';
import { fetchWeatherData } from '../services/weather.service.js';

export async function weatherRoutes(app: FastifyInstance) {
  app.get('/api/weather', async (_req, reply) => {
    try {
      const weather = await fetchWeatherData();
      return reply.code(200).send(weather);
    } catch (error: any) {
      app.log.error(error);
      return reply.code(502).send({
        error: 'Failed to fetch weather data from upstream provider',
        message: error?.message || 'Unknown error',
      });
    }
  });
}
