import http from 'http';
import createApp from './app';
import { env } from './config/env';
import { socketService } from './services/socket.service';
import { CronService } from './services/cron.service';
import { prisma } from './config/prisma';

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.io
socketService.initialize(server);

// Initialize background cron scheduler
CronService.init();

server.listen(env.PORT, () => {
  console.log(`🚀 Velozity Server running on http://localhost:${env.PORT}`);
  console.log(`📡 WebSocket server listening on port ${env.PORT}`);
  console.log(`🌿 Environment: ${env.NODE_ENV}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  CronService.stop();

  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  });

  // Force exit after 10s if stuck
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
