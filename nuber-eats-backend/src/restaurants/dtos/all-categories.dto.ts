import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  @Field((type) => [Category], { nullable: true })
  categories?: Category[];
}

/*
categories? 물음표는 값이 있을수도 있고 없을 수도 있다는 말이기 때문에
graphql한테도 이 부분을 알려줘야 해서, Field에 nullable: true를 한다.
*/
