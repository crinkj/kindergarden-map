import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // CORS
  const staticOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
  ].filter((v): v is string => Boolean(v));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (staticOrigins.includes(origin)) return callback(null, true);
      if (/https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(ValidationPipe);

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`Backend is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
