import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config/config.loader.js';
import { configRoutes } from './routes/config.route.js';
import { transitRoutes } from './routes/transit.route.js';
import { weatherRoutes } from './routes/weather.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Enable CORS for frontend dev server
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'OPTIONS'],
  });

  // Register API Routes
  await app.register(configRoutes);
  await app.register(weatherRoutes);
  await app.register(transitRoutes);

  // Health check
  app.get('/api/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  // Resolve frontend static dist path
  const candidateFrontendPaths = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
  ];

  let frontendDistPath: string | null = null;
  for (const p of candidateFrontendPaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
      frontendDistPath = p;
      break;
    }
  }

  if (frontendDistPath) {
    app.log.info(`[Static] Serving frontend from ${frontendDistPath}`);
    await app.register(fastifyStatic, {
      root: frontendDistPath,
      prefix: '/',
    });

    // Fallback for SPA routing
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/')) {
        return reply.code(404).send({ error: 'API endpoint not found' });
      }
      return reply.sendFile('index.html');
    });
  } else {
    app.log.warn('[Static] Frontend dist not found. API mode only.');
    app.get('/', async (_req, reply) => {
      return reply.type('text/html').send(`
        <html>
          <body style="font-family: sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem;">
            <h1>Raspberry Pi Dashboard - Backend Active</h1>
            <p>API endpoints are live:</p>
            <ul>
              <li><a style="color: #38bdf8;" href="/api/config">/api/config</a></li>
              <li><a style="color: #38bdf8;" href="/api/weather">/api/weather</a></li>
              <li><a style="color: #38bdf8;" href="/api/transit">/api/transit</a></li>
              <li><a style="color: #38bdf8;" href="/api/health">/api/health</a></li>
            </ul>
            <p>To serve the full frontend UI, run <code>npm run build:frontend</code>.</p>
          </body>
        </html>
      `);
    });
  }

  // Pre-load initial configuration
  loadConfig();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`\n🚀 Dashboard Server running on http://${HOST}:${PORT}`);
    console.log(`📱 Open in Chromium Kiosk: http://localhost:${PORT}\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
