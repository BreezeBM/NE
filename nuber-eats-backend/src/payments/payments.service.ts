import { Injectable } from '@nestjs/common';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOuput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOuput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You are not allowed to do this.',
        };
      }
      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );
      // 식당 promoted 코드
      // 돈을 받으면 7일 동안 식당을 promote해준다.
      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      this.restaurants.save(restaurant);

      return {
        ok: true,
      };
    } catch {
      return { ok: false, error: 'Could not create payment.' };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user: user });
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load payments.',
      };
    }
  }
  // 날짜가 만료되었음에도 여전히 promoted되고 있는 restaurant를 체크한다.
  // forEach를 통해서, restaurant의 만료시점이 현재 날짜 보다 더 적은지 확인하는 것이다.
  // date는 숫자이기 때문에, 오늘보다 숫자가 더적으면 과거라는 의미이다.
  // typeOrm에 있는 operator가 있다. LessThan / LessThanOrEqul, MoreThan이 있다.
  // 식당중에 promotedUntil이 오늘보다 LessThan인 친구들을 찾으면 된다.
  @Interval(2000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    });
  }
}

//   @Cron('30 * * * * *', {
//     name: 'myJob',
//   })
//   checkForPayments() {
//     console.log('Checking for payments....(cron)');
//     const job = this.schedulerRegistry.getCronJob('myJob');
//     // console.log(job);
//     job.stop();
//   }

//   @Interval(5000)
//   checkForPaymentsI() {
//     console.log('Checking for payments....(interval)');
//   }

//   @Timeout(20000)
//   afterStarts() {
//     console.log('Congrats!');
//   }
