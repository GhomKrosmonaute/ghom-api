import { Module } from '@nestjs/common';
import { GithubModule } from '../github/github.module.js';
import { ProfileCardsController } from './profile-cards.controller.js';

@Module({
  imports: [GithubModule],
  controllers: [ProfileCardsController],
})
export class ProfileCardsModule {}
