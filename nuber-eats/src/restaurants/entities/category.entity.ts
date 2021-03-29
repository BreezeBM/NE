import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CatergoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field((type) => [Restaurant])
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}

/*
category는 one to many가 필요하다. 카테고리는 많은 레스토랑을 가질 수 있다.
카테고리를 지울 때 레스토랑은 지우면 안된다는 점을 고려해야한다.

  @Field((type) => Category, { nullable: true }) : 그래프 큐엘을 위한 지시사항
레스토랑 쪽에 이렇게 설정했다. 이유는 카테고리를 지울 때 레스토랑을 지우면 안되기 때문이다.

@ManyToOne((type) => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
레스토랑은 카테고리를 가질 수 있고, 만약에 카테고리가 지워지면 레스토랑은 카테고리를 가지지 않게 된다.
*/
