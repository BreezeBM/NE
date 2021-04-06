# 3.3 Recap

여기 TypeOrmModule에 Restaurant라고 하는 entity를 가지고 있어
그래서 Restaurant가 DB가 된다. 옵션중에 logging을 true로 설정을
했다. 그 이유는 DB에서 돌아가는 모든 로그들을 확인하기 위해서다. 그리고 production 환경이 아니면 logging이 되지 않도록 변경을 했다. retaurants.module에서 한 것은 Restaurant를 import 했다. 여기서 forFeature는 TypeOrmModule이 특정 feature를 import 할 수 있게 해준다. 이경우에는 Restaurant.entity다.

Resolver는 이미 한번 작성해 보았기 때문에 새로운 것은 아니다. 새롭게 추가된 건 RestaurantService를 import한 것이다. RestaurantService는 providers에 추가되어야 한다.
**providers: [RestaurantResolver, RestaurantService]**
이렇게 되야 class에 inject를 할 수 있다. 그리고 유저가 RestaurantResolver로 가면 getAll()을 return을 한다.
service로 가면 getAll function이 this.restaurants.find()를 return하는 것을 볼 수 있다.

```
 getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }
```

여기서 restaurants는 restaurant entity의 repository다.

retaurant entity에서 **@ObjectType**옆에 **@Entity, @Column** 등등 필요한 데코레이터를 작성하면 자동으로 데이터 베이스에 모델을 생성하고 graphQL에 스키마를 작성할 수 있다.

# 3.5 Mapped Type

**Entity와 graphQL**은 통합되어 만들어 지고 있는데, **Dto파일**만 그렇지 않다.
이번 강의에서 3가지 한번에 만들 수 있도록 해보겠다!
**Mapped Type**은 base type을 바탕으로 다른 버전들을 만들 수 있게 해준다. 공식문서에는 4가지의 Mapped Type이 존재한다.

**Partial / Pick / Omit / Intersection**

1. Partial Type
   Partial Type은 base type, base class를 가져다가 export 하고 이 모든 필드가 required가 아닌 class를 만들어 준다.

2. Pick Type
   Pick Type는 input type에서 몇가지 property를 선택해 새로운 class를 만들어 준다.

```
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

예를 들어 이런 entity가 있다고 할때 email input을 update 하고 싶다. password와 firstName은 제외하고 그래서 email만 선택(pick)하는걸 pcikType이 해준다.

```
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, ['email'] as const) {}
```

즉 특정 프로퍼티를 선택하는 것이다.

3. Omit Type
   Omit Type이 바로 이 강의해서 사용해볼 것이다. 이 타입은 base class 에서 class를 만드는데 몇몇 필드를 제외하고 만드는거다. 2번째 타입의 엔티티 예시에서

```
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, ['email'] as const) {}
```

이렇게 Omit 타입으로 작성을 하면 이메일만 빼고, 즉 password와 firstname만 변경한다.

Omit type은 InputType에만 적용이 되는데 Restaurant는 Object타입이다. 우리는 **결과로 Omit type**이 나오길 원하는데,

```
export class CreateRestaurantDto extends OmitType(Restaurant, ['id'], ) {}
```

이대로 작성하게 되면 Object Type의 Restaurant가 나오게 된다.

```
@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
```

3번째의 인자값에 InputType을 작성해 주면 return 값으로 inputtype이 나온다.

다른방법으로는 restaurant.entity에 가서

```
@InputType({isAbstract: true})
@ObjectType()
```

이렇게 작성을 한다. 이 inputtype이 스키마에 포함되지 않길 원한다는 뜻이다. isAbstract를 쓰면 이걸 어디선가 복사해서 쓴다는 의미이다.

# 3.7 Update Restaurant part One

```
@Mutation((returns) => Boolean)
  async updateRestaurant(
    @Args('id') id: number,
    @Args('data') data: UpdateRestaurantDto,
  ) {
    return true;
  }
```

이렇게 되면 Args를 여러개를 보내줘야 하기때문에, 싫어할 수도 있다. 그래서 id와 UpdateRestaurnatDto를 합쳐보자! Restaurant가 아니라, createRestaurantDto를 Partial Type으로 하는 이유는 UpdateRestaurnatDto는 id가 꼭 필요하기 때문이다.

```
@InputType()
export class UpdateRestaurantInputType extends PartialType(
  CreateRestaurantDto,
) {}

@ArgsType()
export class UpdateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
```

다시 이렇게 작성을 진행했고,

@ArgsType을 쓰고 나서는 해당하는 Args()에는 비워 둬야 한다.

# 4.7 Hsahing Password

##### listener & subscriber

listener는 기본적으로 entity에 무슨 일이 생길 때 실행되는 것이다. 특정 entity event를 listen하는 사용자 로직이 있는 method를 가질 수 있다. **총 7가지**가 있다.

```
@Entity()
export class Post {
  @AfterLoad()
  updateCounters()
    if(this.likeCount === undefined)
       this.likeCount = 0;
}
```

이런식으로 function을 만들 수 있다. 예를 들어 매번 post를 load할 때마다, load한 다음에 뭔가 다른걸 할 수 있다. 이것들은 특정 event를 기반으로 한 function을 불러줄 decorator들 이다.

**@BeforeInsert**는 typeORM은 entity가 insert가 되기 전에 이것을 불러준다. @BeforeInsert는 User entity에 작성했다.

# 5.1 Generating JWT

**app.module.ts**안에 ConfigModule내부에 필요한 모듈을 설치하고, SECRET_KEY과 같은 설정이 필요한 것을 설정할 수 있다. 예를 들어 configService를 요청하게 되면 nestjs가 이미 configModule의 존재를 인지하고 필요한 정보를 전달해 준다. 단순히 constructor에서 요청하기만 하면 된다.

# 5.2 JWT and Modules

이전 강의에서 ConfigService를 적용했다. 이것을 가능하게 만들어 준 것이 **'dependenct injection'**이라는 거다. **'dependenct injection'** nestjs는 아주 굉장하기 때문에 우리가 원하는 class만 적어주면 nestjs가 우리를 위해서 그 정보를 가져다 준다.
이전에 app.module에서 ConfigModule을 만들었다. 그곳에 여러 옵션들도 설정해 주었다. 즉, 그 module이 어딘가에 존재하고 있고, 정보가 있다는 의미이다. **nestjs는 단순히 app.module에서 configModule을 작성만 해도 configService를 가질 수 있게 된다.** 즉 users.module에서 그 ConfigService를 요청하는 것만으로도 우리가 원하는 것을 불러올 수 있다.

**우리만의 token module을 만들어 본다.**
모듈의 종류는 2가지가 존재하는데, 첫번째는 'static module'이다. 'static module'은 어떤 설정도 되어있지 않은 모듈이다. 두번째는 'Dynamic Module'이다. 동적인 모듈은 설정이 다 적용되어 있는 모듈을 뜻한다. '동적인 모듈'은 사실 결과적으로 '정적인 모듈'이 된다는 사실이다. 이번에 해볼 것은
반환되는 값으로 우리가 설정한 옵션들이 존재하는 사앹의 정적인 모듈을 내보내는 것이다.

# 5.8 GraphQL Context

**request context**는 각 request에서 사용이 가능하다. context가 함수로 정의되면 매 request마다 호출이 된다. 이것은 req property를 포함한 object를 express로부터 받는다. context에 property를 넣으면 resolver안에서 사용할 수 있다. apollo server, graphql은 context를 가지고 있고 context에 어떤 것들을 지정하더라도 resolver에서 확인할 수 있다. context는 함수로 정의되고 매 request마다 매번 호출되며 req property를 가진 object를 받는다.
app.module에서 작성한다.

```
GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({ req }) => ({ user: req['user'] }),
    }),
```

지금 request user를 그냥 graphql resolver의 context를 통해 공유할 뿐이다.

작성 후 users.resolver.ts **me**작성

token을 보내고, 그 token을 requset로 보내게 된다. 그 req가 NestModule에서 잠시 멈추게 된다. JwtMiddleware가 먼저 받게 되고, 모듈이 token을 찾고 req user에 넣어준다. req가 GraphQLModule로 와서 context 안으로 들어오게 된다. context를 함수로 호출하게 되면 HTTP request property로 주어진다.

me가 섹시하지 않으니, Guard에 대해서 배워보자. request를 멈추게 한다.

# 5.9 AuthGuard

authorization이라는 module을 만들어 본다. authorization으로 guard를 만든다.
use가드는 뭔가 이전에 프로젝트에서 활용했던 if(req.session.id)가 있는지 없는지 여부를 물어보았듯이 없으면 통과가 안되게 만든 장치인것 같다. 이과정은 누가 자원을 요청하는지 확인하는 과정이다. token으로 identity를 확인하는 것이다. authorization은 user가 어떤 일을 하기 전에 permission을 가지고 있는지 확인하는 과정이다.

# 5.11 Recap

##### authentication 작동 원리

우선 header에 token을 보낸다. 헤더는 http기술인데 그 기술을 사용하기 위해서 미들웨어를 만들었다. 만든 미들웨어는 헤더를 가져다가 우리가 만든 jwtService.verify()를 사용한다. 여기서 id를 찾게되면, 우리가 만든 userService를 사용해 해당 id를 가진 user를 찾는다.
userService는 typeORM의 findOne 함수를 쓰는 findbyId를 가지고 있다. 데이터 베이스에서 유저를 찾으면 그 유저를 requset object에 붙여서 보낸다. 이 미들웨어를 가장 먼저 만나기 때문에 우리가 원하는대로 request object를 변경할 수 있다. 그렇게 되면 이 미들웨어를 만난 request object를 모든 resolver에서 사용할 수 있다.
만약에 토큰이 없거나, 에러가 있다면 다르게는 토큰으로 유저를 찾을 수가 없다면 requset에는 아무덕도 붙을 수가 없다.

app.module의 context를 보면 apollo server의 context나 graphql의 context는 모든 resolver에 정보를 보낼 수 있는 property다. context get이 매 request마다 호출될 것이다.

guard는 function의 기능을 보충해 준다. 그러면 이 function은 true나 false를 반환해야 한다.
ExecutionContext는 nestjs의 context이다.

```
const gqlContext = GqlExecutionContext.create(context).getContext();
```

여기에서의 작업은 ExecutionContext를 찾아다가 GqlExecutionContext로 바꿔야 한다. 그리고 graphql의 getContext가 있는데, gqlcontext가

```
context: ({ req }) => ({ user: req['user'] }),
```

여기에 있는 context와 같다. 우린 이제 컨텍스트에서 user를 찾는다. Auth가드에서 user가 있다면 true를 아니면 false를 반환한다.

**request**의 여정은 다음과 같다.
3

1. 미들웨어에서 시작한다.
2. 아폴로 서버의 컨텍스트를 거친다.
3. authGuard를 거친다.
4. 마지막으로 resolver에 도착한다.
5. AuthUser 데코레이터가 context를 gqlcontext로 변경한다.
6. gql context에서 user를 가져오면 user를 반환한다.

# 5.15 updateProfile part Three

@BeforeUpdate를 했지만, 비밀번호가 해쉬가 된 채로 데이터 베이스에 입력되지 않았다. 이유는 update()메소드는 단순히 디비에 query만 보낼뿐이다. 그래서 BeforeUpdate를부르지 못한다. BeforeUpdate는 특정 entity를 update해야 부를 수 있다. update는 entity를 업데이트 하지 않는다. 그래서 **save로** 변경한다.

# 6.3 Verifying User part Two

이전에 users.service.ts서 verifyEmail을 실행할 때 User정보를 save로 업데이트를 한다. 그럴때 마다, hash된 비밀번호가 다시 hash가 되는 이슈가 발생했다. 해결할 수 있는 방법은 save를 할때 password를 선택하지 않거나,

```
// user.entity.ts

 @Column({ select: false })
  @Field((type) => String)
  password: string;
```

이 의미는 콘솔로그를 찍으면 알겠지만, user에 더이상 **password가 포함되지 않고 나온다.**
의미하는 내용은 만약에 새로운 비밀번호를 제외한 객체가 있고 그것을 save()로 전달을 하게 되면 typeORM은 비밀번호가 변경되지 않았다고 생각을 한다. 그래서 새로운 비밀번호를 추가하지 않을 것이다.

2번째 방법은 hashPassword로 가서 코드를 수정해 주었고 의미는 만약 **save()로 전달된 object에 password가 있으면**, 그 때 password를 hash한다.

# 7.4

우리는 jest와 mock을 이용해서 우리의 코드에서 특정 부분의 리턴값을 속일 수 있었다. 우리의 코드가 어떻게 반응하는지 보기 위해서 말이다. 이경우에는 findOne을 속였다. 실제하면 findONe은 DB로 postgresql로 갔어야 했는데, 이게 실제로 일어나길 바라면 테스트 하기 전에 진짜 유저를 만들어야 한다. 그리고 이 테스트는 Integration 테스트를 의미한다. 왜냐하면 많은 부분들이 작동하고 GraphQL, TypeERm, Resolver, Repository, Service를 전부테스트 하기 때문이다.

단지 지금은 츄저 서비스에서 createAccount만 테스트를 하고 싶다. 그래서 함수를 실행하기 전에 findOne은 이값을 리턴할거라고 전해준다. 즉 우리는 리턴값을 속이는 거다. 우리는 테스트중인 실제코드로 들어가서 값을 바꾼다.

# 10.4 role-based authentication

```
  @Role(['Owner'])
  @Role(['Any'])
```

@Role를 만들어 줌으로써, resolver의 접근에 대해서 owner만, 또는 client, Delivery그리고 모두가 접근 할 수 있게 만들었다.

이제 테스트 할수 있도록 authorization guard에 metadata를 넣어야 한다. 메타데이터를 get하기 위해서는 reflector class를 get해야한다.

이전에는 가드때문에 막혔지만, 이제는 resolver에 metadata를 설정해 놓게 되면서 접근이 가능하게 된다.
resolver에 metadata가 없으면 그건 resolver가 public resolver.라는 뜻이다.

이 파트 **총정리**
만약에 **메타 데이터**나 **@Role**가 없으면 resolver가 public이라는 의미이다. 그렇기 때문에 return true를 작성하게 된다. 만약에 메타데이터가 있으면, 우리는 user가 있기를 기대한다. 만약에 우리가 user를 기대하고 있는데 user를 찾지 못하면 우리는 false를 리턴해

**메타데이터**는 **resolver의 extra data다**.

이후에는 role decorator를 사용했다. authentication은 끝이다. 왜냐면 여기 authorization guard에 보면 app guard이기 때문에 모든 곳에 적용되고 그건 nestjs가 멋지기 때문이다. 이 app Guard가 작동하는 방법은이런거다. 일단 **reflector**에서 roles key를 가져오고, 이 때 key는 **SetMetadata의 key의 이름**과 일치 해야 한다. 왜냐면 키 밸류로 저장이 되기 때문이다.

# 10.9 Edit Restaurant part Three

**Custom Repository** 직접 funtions을 정의할 수 있게 해준다.

# 10.13 Categories part Two

```
type Category {
  id: ...
  createdAt: ...
  updatedAt: ...
  ...
  ...
  ...
  ...
  restaurantCount: ...
}
```

restaurantCount의 **부모는 Category이다**. 여기서 parent를 받아와야 한다. 니코의 경우에는 "mexican food"라고 넣어 놓고 count가 80인데, 이때 Count의 부모는 mexican-food이고

Note the corresponding use of the **@Parent()** method parameter decorator to then extract a reference to that parent object in the field resolver.

```
@ResolveField((type) => Int)
  retaurantCount(@Parent() category: Category): number {
    console.log(category);
    return 80;
  }
```

이렇게 해서 콘솔을 확인해 보면 category를 다 가져오는 것을 확인 할 수가 있다. 즉 category를 받아옴.

# 11.12 getOrders part One

가게 주인은 모든 주문을 보고 싶어 하고, 고객은 자신이 주문한 것을 보고 싶어 한다. 그리고 배달원은 자신이 배달한 모든 주문을 보고 싶어 한다.

# 12.0 Subscrition Part One

Subscrition은 어떤 것을 return 하는지에 따라 정해진다.

```
@Subscription(returns => String)
  orderSubscription() {

  }
```

@Subscription(returns => String) GraphQL은 string을 반환한다고 생각하지만, orderSubscription은 Stringd을 반환하지 않는다. 대신 **asyncIterator**을 반환한다.

GraphQL Subscription을 위해서

```
npm i graphql-subscriptions
```

를 설치한다.
설치를 하면 인스턴스가 생성이된다. 이 인스턴스는 PubSub이라는 인스턴스이다. **PubSub**은 **publish and subscribe**를 말한다. 이걸로 app내부에서 메세지를 교환할 수 있다.

```
    return pubsub.asyncIterator()
```

asyncIterator의 인자에는 trigger, 즉 우리가 기다리는 이벤트를 말한다. 아무 문자열이나 들어가도 상관은 없다.

```
    return pubsub.asyncIterator('hotpotatos')

```

**hotpotatos**라는 이벤트를 듣고 싶으면 이 subscription을 사용하면 된다. 또 살펴봐야하는 한가지는 웹소켓에 연결할 수 없다. 지금은 Http프로토콜에서 실행이되고 있다. WS(웹소켓)도 프로토콜이고 이것은 Real Time을 처리하는 Web Socket을 말한다. 따라서 우리는 Web Socket을 활성화 해야한다. Query / Mutation은 HTTP가 필요하고, Subscription은 WB가 필요하다.

```
GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      context: ({ req }) => ({ user: req['user'] }),
    })
```

installSubscriptionHandlers: true를 추가해 주었다. 이 설정으로 끝이 나는 건 아니다. Subscription이 연결하는 방법이 우리가 API를 연결하는 방법과 다르다.

# 12.1 Subscription part Two

HTTP에는 request라는 것이 있다. 웹소켓에는 request가 없다. 대신 connection이라는 것이 있다. 웹소켓은 HTTP와 다르다. 웹 소켓은 다른 연결방법이 있다. 다루는 방법이 다르다. HTTP통신은 계속해서 토큰을 보내는데, 웹소켓은 딱 한번만 토큰을 보낸다. 연결을 시작할 때 토큰을 보내는데 연결이 끝나지는 않는다. 그래서 많은 이벤트를 받고 보낼 수 있다. 토큰을 다시 보낼 필요가 없다.

potatoReady()는 asyncIterator(hotpotatos)를 발생시키는 작업을 진행해야 한다.

```
@Mutation((returns) => Boolean)
  potatoReady() {
    pubsub.publish()
    return true;
  }
```

publish는 2개의 인자를 받는다. 하나는 'triggerName'과 payload이다. payload는 객체여야하고, 안에는 resolver 함수의 이름이 있어야 한다. payload에 객체의 키로는 method function을 넣고, 메세지를 넣으면 된다.

````
@Mutation((returns) => Boolean)
  potatoReady() {
   pubsub.publish('hotPotatos', {
      readyPotato: 'Your potato is ready. love you.',
    });
    return true;
  }

  @Subscription((returns) => String)
  readyPotato() {
    return pubsub.asyncIterator('hotpotatos');
  }
```triggerName은 둘다 동일해야한다.


# 12.2 Subscription Authentication part One
현재 jwtModule은 subscription에서는 활용하는것이 어렵다. 이유는 HTTP통신으로 하는 것이 아니기 때문에 req,res가 없다. 그래서 웹소켓과 HTTP둘다 사용할 수 있는 방법을 찾아야 한다. 바로 **Guard**다. 가드가 웹 소켓과 HTTP를 위해서 호출이 되었다. Guard는 HTTP든 웹 소켓이든 모든 graphQL resolver에 대해 호출된다.

이전에는 HTTP를 통해 웹사이트로 request가 왔는데, 가장 먼저 찾은 것은 jwt middleware이다. jwt middleware는 헤더에서 토큰을 가져와서 유저를 찾았다. 그리고 jwt middleware는 찾은 유저를 req에 넣었다 그리고
```
GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      context: ({ req, connection }) => {
        if (req) {
          return { user: req['user'] };
        } else {
          console.log(connection);
        }
      },
```
graphQl context function이 request내부에서 유저를 가져와 context.user에 넣어 주었다.
```
auth.guard.ts
    const user: User = gqlContext['user'];
```
그래서 여기에 contex.user에 넣어 줬다. GraphQLModule에 작성한게 두번째 방어선이기 때문이다. 그런데 이제 jwt middleware가 없기 때문에 첫번째 방어선으로 올라갔다. 그래서 GraphQLModule.forRoot안에 있는 context가 가드에 context를 제공한다는 말이된다.

이제 왜 readyPotato를 보낼 때 마다 request undefined를 얻는지 이해할 수 있다. 왜 내 context는 이거밖에 없을까? connection이 있을 때, context에 아무것도 보내지 않고 있으니까, 'Connection'은 웹 소켓이 클라이언트와 서버간의 연결을 설정하려고 할 때 발생한다.

request가 존재하면 가드에 request를 보낸다. request전체를 다 보내지 않아도 된다 필요한 부분만 보내면 된다.
````

# 12.4 PUB_SUB

이 모듈이 생성이 되면 useValue로 new PubSub을 사용해서 app전체에 provide할 예정이다.
common모듈이 생성되면 PubSub도 생성된다. 그러면 어디서든지 import할 수 있다.
orders Service의 Constructor나 PubSub을 사용하고 싶은 모든 곳에서
**@Inject(PUB_SUB) private readonly pubSub: PubSub**
해주면 된다.

# 12.5 Subscription Filter

필터를 하는 이유는 우리 가게에만 들어오는 주문만을 확인하고 싶기 때문이다. 다른 가게에 들어온 주문을 받아야 할 이유가 없다.
subscription decorator를 보면 option이 있는데 그중 하나가 바로 filter이다. filter에는 payload, variables, context를 주고 true, false를 반환하도록 만든다.

variables는 listening을 시작하기 전에 subscription에 준 variables를 가진 object이다. 그리고 potatoId는 내가 listening을 시작하기 전 subscription에 준 variable에서 온 거다.

subscription에는 **potatoId: 1**을 전송하고 potatoReady에 **potatoId에 99**를 전송한다. 이렇게 하면 payload에는 99가 있고, variables에는 1이 있다는 의미이다. 이대로 실행을 진행하게 되면 아무것도 나오지 않는다. 반대로 **potatoReady에 potatoId에 1**을 전송하게 되면 잘 작동된다.

# 12.6 Subscription Resolve

filter function은 현재 listening하는 사용자가 update알림을 받아야 하는지 말아야 하는지 결정해, 이게 바로 filter function이 해야하는 일이다. 기억해야 되는 부분은 첫번째 argument는 payload이다. 두번째는 resolver의 variables이다. 세번째는 context다. context는 User를 사용할 수 있는데 이후에 다루어 보기로 한다.

filter에서 조건을 만족하면 true를 반환한다. ready된 potato유저가 listening하고 있는 potato가 같은 경우에

다음 option은 **resolve**이다. 이건 사용자가 받은 update 알림의 형태를 바꾸어주는 일을 한다. 4개의 인자를 받는다. payload,args, context, info를 받고 있다.

### 중요

filter는 true / false를 반환해야하고, resolve는 subscription이 알려야하는걸 반환하면된다. 이렇게 resolve는 ouput을 변형시켜주는 일을 한다. 그러니까 중요한건 resolve이다. 왜냐면 resolver가 최정적으로 return 하는 값은 asyncIterator가 되기 뙈문엔 이렇게 하는 보편적이다. subscription function에서 varialbes를 가지고 asyncIterator를 return 한다. 유저가 update알림을 받을지 말지는 filter가 결정하고 resolve는 subscription의 output모습을 바꿔준다.

##### Orders Subscription

1. Pending Order (s: newOrder) (t: createOrder(newOrder))
2. Order Status (Customer, Delivery, Owner) (s: OrderUpdate) (t: editOrder(orderUpdate))
3. Pending Pickup Order (Delivery) (s: orderUpdate)
   9t: editOrder(orderUpdate))

유저가 order를 만들 때 createorder라는 resolver를 사용한다. 그러면 newOrder라는 event를 trigger 할텐데 이 때, restaurant owner가 newOrder event를 listening하고 있다가, 유저가 order를 만들면 restaurant owner 가 본인 restaurant에 새로 들어오는 order를 listening할거야 끝!

owner가 order를 승인하고 주문한 사람의 주문이 승인되면 화면에서 **주문현황**을 보여줄 것이다. 그러면 두 사용자에게 무슨 일이 생길까? 주문이 cooking중인 걸 보게 된다. owner가 우리가 여기에 만들어 놓은 editOrder resolver를 사용해서 음식이 cooked되었다고 알리면 orderupdate event를 trigger하게 된다. 이 orderUpdate event는 customer와 owner가 listening을 하고 있을 것이다. 그런데 주문현황 이벤트가 발생하고 주문 상태가 cooked이면 배달하는 사람도 이 이벤트를 listneing할거고 그러면 해당 주문에 배달원이 등록되고 모두가 상태를 볼 수 있다. 고객은 주문이 승인되고 픽업되고 요리되고 배달되는 모든 과정을 볼 수 있다. 주인은 주문이 픽업되고 배달되는 것을 본다. 그리고 배달원은 생각보다 많은 것을 보지는 않는다. pending pickup order부터 할일이 생긴다.왜냐면 배달원은 주문을 픽업하고 유저에게 가져다주고 완료 버튼을 누른다. 그래서 우리는 3개의 resolver을 만들어야 한다.

하나는 주인이 식당에 들어오는 주문을 listening하기 위한 것이고, 다른 하나는 고객, 배달원, 주인이 특정 id의 업데이트가 되는 것을 보기위한 것이다.

```
@Mutation((returns) => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number) {
    await this.pubSub.publish('hotPotatos', {
      readyPotato: potatoId,
    });
    return true;
  }

  @Subscription((returns) => String, {
    filter: ({ readyPotato }, { potatoId }) => {
      // console.log(payload, variables, context);
      return readyPotato === potatoId;
    },
    resolve: (readyPotato) =>
      `Your potato with the id ${readyPotato} is ready!`,
  })
  @Role(['Any'])
  readyPotato(@Args('potatoId') potatoId: number) {
    return this.pubSub.asyncIterator('hotPotatos');
  }
```

# 12.7 pendingOrders Subscription part One

```
@Subscription()
```

이제 새로운 order가 들어오면 해당 order를 반환한다.
NEW PENDING ORDER를 trigger할 수 있는건, createOrder service뿐이어야한다.

# 12.9 cookedOreder

entity를 create할 때는 save method가 create된 entity를 return할거야 그리고 entity를 save할 때는 entity 전체를 return하지 않을거야, console.log()로 확인해 보면 save는 전체 order에 대한 것을 다 가져오지 못한다.

```
if (user.role === UserRole.Owner) {
  if (status === OrderStatus.Cooked) {
    await this.pubSub.publish(NEW_COOKED_ORDER, {
      cookedOrders: { ...order, status },
    });
  }
}
```

...order는 이전에 찾은 order이기 때문에 아직은 cooking으로 되어 있다. cooked로 변경하기 위해서 status를 입력해줘서 상태를 변경한다.
save를 사용하고 나서 바로 그 데이터를 보내면 온전하게 데이터가 배달원에게 가지 않기때문에 위와 같은 방식으로 코드를 작성해서 배달원에게 전송을 해주어야 한다.

# 12.10 orderUpdates part One

**Eager Relationship**에대해서 배운다.
먼저 우리는 이전의 코드에서 order를 load할때 email을 받지 못했다. 즉, customer를 달라고 하지 않았다.

예를 들어서 order를 load했을 때 배달원, 고객, 식당이 뭔지 알고싶다고 해보자, driverId와 customerId가 있지만 대부분은 order를 가지고 driver, restauran, customer를 보여준다. 그렇다면 order정보를 받아올 때 고객과 배달원 정보도 같이 받아야 된다. 다만 프론트 쪽에서는 레스토랑 정보를 받아올 때 주인의 이메일 또는 주인을 기본값으로 받아와야할 이유가 없다. 그런데 DB에서는 order를 받아 올때 고객과 배달원을 같이 load할 필요가 있다.

이전에는 relations: ['restaurant', 'customer', 'driver']를 사용해서 다 받아왔지만, 지금은 다 받을 필요가 없을 때 사용하는 것이 eager Relationship이다.

**Eager Relationship**은 DB에서 entity를 load할 때 마다 자동으로 load되는 relationship을 말한다. 또 **Lazy Relationship**도 있다. 한 번 access하면 load가 된다. 이 relation의 type은 promise이다.
예시를 보면 Promise<categories> promise타입의 categories가 있다. 그래서 내가 원하는 relation에 대해서 await을 해야한다. 그러면 await order.customer을 해야한다. 이 코드를 access해야 typeOrm이 customer를 load한다 이게 바로 lazy relation이다.

# 13.5 Task Sceduling is Awesome

decoratoy로 작업하는 것을 'declarative'식이라고 한다.
