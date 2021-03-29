import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
/*
우리가 하는건 우리가 role을 전달 할 수 있도록 허용해 주는 것이다. 
이 롤을 메타데이터에 넣어준다. 실제로 짠 코드에서는 roles배열이 roles metadata key
에 저장이 된다. 

? role에 any가 있다. any라는 건 유저가 로그인 되어 있으면 좋다는 의미이다.

*/
