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
