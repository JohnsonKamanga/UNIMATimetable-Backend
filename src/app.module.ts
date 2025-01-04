import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { TimetableModule } from './timetable/timetable.module';
import { AuthModule } from './auth/auth.module';
import { CoursetotimetableModule } from './coursetotimetable/coursetotimetable.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env'
  }),
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService)=>({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    database: configService.get<string>('DATABASE_NAME'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    username: configService.get<string>('DATABASE_USERNAME'),
    port: configService.get<number>('DATABASE_PORT'),
    autoLoadEntities: true,
    synchronize: true,
  }),
  inject: [ConfigService]
}),
UserModule,
CourseModule,
TimetableModule,
AuthModule,
CoursetotimetableModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
