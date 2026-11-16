import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
// Pas de `await` au niveau racine : le lanceur de Vercel intercepte listen() et attendrait indéfiniment.
void bootstrap();
