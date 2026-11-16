import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller.js';
import { ProfileCardsModule } from './profile-cards/profile-cards.module.js';

/** Un module par fonctionnalité ; les ajouter ici. */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ProfileCardsModule],
  controllers: [HealthController],
})
export class AppModule {}
