```
user service
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity, Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
@Injectable()
export class UserService {
constructor(
@InjectRepository(User) private readonly users: Repository<User>,
@InjectRepository(Verification)
private readonly verifications: Repository<Verification>,
private readonly jwtService: JwtService,
) {}
async createAccount({
email,
password,
role,
}: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
try {
const exists = await this.users.findOne({ email });
if (exists) {
return { ok: false, error: 'There is a user with that email already' };
}
const user = await this.users.save(
this.users.create({ email, password, role }),
);
await this.verifications.save(
this.verifications.create({
user,
}),
);
return { ok: true };
} catch (e) {
return { ok: false, error: "Couldn't create account" };
}
}
async login({
email,
password,
}: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
make a JWT and give it to the user
try {
const user = await this.users.findOne(
{ email },
{ select: ['password'] },
);
if (!user) {
return {
ok: false,
error: 'User not found',
};
}
const passwordCorrect = await user.checkPassword(password);
if (!passwordCorrect) {
return {
ok: false,
error: 'Wrong password',
};
}
const token = this.jwtService.sign(user.id);
return {
ok: true,
token,
};
} catch (error) {
return {
ok: false,
error,
};
}
}
async findById(id: number): Promise<User> {
return this.users.findOne({ id });
}
async editProfile(
userId: number,
{ email, password }: EditProfileInput,
): Promise<User> {
const user = await this.users.findOne(userId);
if (email) {
user.email = email;
user.verified = false;
await this.verifications.save(this.verifications.create({ user }));
}
if (password) {
user.password = password;
}
return this.users.save(user);
}

async verifyEmail(code: string): Promise<boolean> {
try {
const verification = await this.verifications.findOne(
{ code },
{ relations: ['user'] },
);
if (verification) {
verification.user.verified = true;
console.log(verification.user);
this.users.save(verification.user);
return true;
}
throw new Error();
} catch (e) {
console.log(e);
return false;
}
}
}

// user resolver
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
CreateAccountInput,
CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
@Resolver((of) => User)
export class UserResolver {
constructor(private readonly usersService: UserService) {}
@Mutation((returns) => CreateAccountOutput)
async createAccount(
@Args('input') createAccountInput: CreateAccountInput,
): Promise<CreateAccountOutput> {
try {
const { ok, error } = await this.usersService.createAccount(
createAccountInput,
);
return {
ok,
error,
};
} catch (error) {
return {
error,
ok: false,
};
}
}
@Mutation((returns) => LoginOutput)
async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
try {
const { ok, error, token } = await this.usersService.login(loginInput);
return { ok, error, token };
} catch (error) {
return {
ok: false,
error,
};
}
}
@Query((returns) => User)
@UseGuards(AuthGuard)
me(@AuthUser() authUser: User) {
return authUser;
}
@UseGuards(AuthGuard)
@Query((returns) => UserProfileOutput)
async userProfile(
@Args() userProfileInput: UserProfileInput,
): Promise<UserProfileOutput> {
try {
const user = await this.usersService.findById(userProfileInput.userId);
if (!user) {
throw Error();
}
return {
ok: true,
user,
};
} catch (e) {
return {
error: 'User Not Found',
ok: false,
};
}
}
@UseGuards(AuthGuard)
@Mutation((returns) => EditProfileOutput)
async editProfile(
@AuthUser() authUser: User,
@Args('input') editProfileInput: EditProfileInput,
): Promise<EditProfileOutput> {
try {
await this.usersService.editProfile(authUser.id, editProfileInput);
return {
ok: true,
};
} catch (error) {
return {
ok: false,
error,
};
}
}

@Mutation((returns) => VerifyEmailOutput)
async verifyEmail(
@Args('input') { code }: VerifyEmailInput,
): Promise<VerifyEmailOutput> {
try {
await this.usersService.verifyEmail(code);
return {
ok: true,
};
} catch (error) {
return {
ok: false,
error,
};
}
}
}
```
