import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

export const ValidationPipe = new NestValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: false,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});
