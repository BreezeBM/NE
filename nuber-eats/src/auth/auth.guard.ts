import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    // !roles
    // 의 의미는 metadata가 없다는 의미이고, 즉 resolver는 public이라는 뜻이다.
    if (!roles) {
      return true;
    }
    // console.log(roles);
    // 메타 데이터를 가지고 있는 경우는 계속해서 user를 graphqlContext에서 가져와서
    // 만약에 resolver에 metadata가 있다면 유저가 로그인을 했다는 의미이다.
    // 만약에 graphqlContext에 유저가 없다면 유저에게 vaild token이 없거나 token을 아예보내지 않았다는 의미이다.
    // 그래서 이 guard는 false를 반환한다. 유저가 로그인 됐을거라고 기대했지만, 그렇지 않았다.
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    if (!user) {
      return false;
    }
    if (roles.includes('Any')) {
      return true;
    }
    // 만약에 metadata도 있고, 로그인된 유저도 있고 any도 있으면 모든 사람이 접근 가능하다.
    return roles.includes(user.role);
  }
}

/*
authentication은 너 누구야 라고 물어보는 것과 같다.
authorization은 이 resource에 접근할 수 있냐고 물어보는 것과 같다.
이 resolver에 접근할 수 있냐고 묻는게 authorization이다.

* 메타데이터를 get하기 위해서는 reflector class를 get해야한다.
    const role = this.reflector.get<>
여기서 우리는 원하는 것의 key를 get할 수 있다. 우리는 우리가 원하는 걸
알고 있고 그건 allowed roles이다.

target을 get하고 싶고 보통 target은 context.getHandler다.

가드는 true 또는 false를 반환한다. true가 나오면 request진행이 허용이 되고, false를 반환하면
다영히 진행될 수 없다. resolver에 metadata가 없으면 true를 반환하고
metadata가 resolver에 있으면 graphql의 ExcutionContext에서 user를 확인한다.
유저가 없다면 결국 false를 반환한다.


*/
