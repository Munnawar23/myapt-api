import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // Tell Passport how to extract the token from the request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // We don't want to allow expired tokens
      ignoreExpiration: false,
      // The secret key to verify the token's signature
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });
  }

  // This method is called by Passport after it successfully validates the token.
  // The 'payload' is the decoded JSON from the JWT.
  // Whatever is returned from here is attached to the Request object as `req.user`.
  async validate(payload: { sub: string; username: string }): Promise<User> {
    // We use the 'sub' (subject), which is the user's ID, to find the full user object.
    const user = await this.usersService.getFullProfile(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    // Because we return the full User entity, the rest of the app (like our guards)
    // will have access to user.id, user.roles, and user.society_id.
    return user;
  }
}
