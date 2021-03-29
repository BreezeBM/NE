import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // @SetMetadata('role', UserRole.Owner)
  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
}
/*
@Mutation((returns) => CreateRestaurantOutput)
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,

user가 임의로 레스토랑의 owner를 설정할 수 없게 만들어야 한다.  
레스토랑의 owner로 로그인한 유저한테 레스토랑 설정을 받아야 한다.

@AuthUser() authUser: User,를 활용해서 유저의 정보를 가지고 온다.


? Owner가 레스토랑의 이름을 선택할 수 있다. 
if문으로 고객, 점주, 배달원을 다 처리하지 않고
* @SetMetaData 데코레이터를 활용한다.
resolver에 그냥 데이터를 저장하는 것이다.

? @SetMetadata('roles', UserRole.Owner)
! 즉 roles는 이제 UserRole.Owner이다.

다만 니코는 이방법도 귀찮고 싫다고 해서 자신만의 데코레이터를
만들었다. 
*/
