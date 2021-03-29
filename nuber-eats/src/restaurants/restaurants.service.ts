import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categories.findOne({ slug: categorySlug });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }
}

/* 
.create를 부르면 restaurant의 instance를 생성하지만, 데이터베이스에는 저장하지 않는다. 
newRestaurant를 아직 완성시키지 않았기 때문에 이 특징은 우리에게 도움이 된다.
그렇기 때문에 저장하기 전에 우리는 newRestaurant.owner를 완성시켜야 한다.
이 조건을 만족하기 위해서 createRestaurantInput을 조금 수정한다.
그리고 OmitType을 사용하는 대신에 pickType를 사용한다. 

const categoryName = createRestaurantInput.categoryName.trim()
trim은 앞뒤 빈칸을 다 지워준다. 
*/
