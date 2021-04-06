import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Payment } from './entities/payment.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';

// TypeOrmModule.forFeature([Payment] Entitiy를 입력하는 자리
//   imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
// 레스토랑이 들어온 이유는, service에서 restaurant entitiy가 필요하기 때문.
@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentService, PaymentResolver],
})
export class PaymentsModule {}
