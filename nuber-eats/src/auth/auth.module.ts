import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}

/*
APP_GUARD는 nestjs에서 제공된 constant다.
guard를 모든 곳에서 사용하고 싶다면 그냥 APP_GUARD를 provide
하면 된다.
*/
