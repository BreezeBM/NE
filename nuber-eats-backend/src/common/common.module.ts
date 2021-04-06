import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: new PubSub(),
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}

/*
이 모듈이 생성이 되면 useValue로 new PubSub을 사용해서 app전체에 provide할 예정이다. 
common모듈이 생성되면 PubSub도 생성된다. 그러면 어디서든지 import할 수 있다. 
orders Service의 Constructor나 PubSub을 사용하고 싶은 모든 곳에서 
? @Inject(PUB_SUB) private readonly pubSub: PubSub
해주면 된다. 
*/
