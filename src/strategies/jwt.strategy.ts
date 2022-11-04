import User from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_KEY'),
    });
  }

  async validate(
    { iat, exp, id }: any,
    done: (error: Error, user: any) => void,
  ): Promise<boolean> {
    const timeDiff: number = exp - iat;
    if (timeDiff <= 0) {
      throw new UnauthorizedException();
    }

    const user: User = await this.userService.findOneByStrategy(id);

    done(null, user);

    return !!user;
  }
}
