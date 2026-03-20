import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { KindergartenModule } from './modules/kindergarten/kindergarten.module';
import { RegionModule } from './modules/region/region.module';
import { SyncModule } from './modules/sync/sync.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    PrismaModule,
    KindergartenModule,
    RegionModule,
    SyncModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
