import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/database/entities/role.entity';
import { Flat } from 'src/database/entities/flat.entity';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { Society } from 'src/database/entities/society.entity';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private usersService: UsersService,
    private jwtService: JwtService,

    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Society) private societyRepository: Repository<Society>,
  ) { }

  async register(
    registerDto: RegisterDto,
  ): Promise<Omit<User, 'password_hash'>> {
    const society = await this.societyRepository.findOneBy({
      id: registerDto.societyId,
    });
    if (!society) {
      throw new BadRequestException('Invalid Society ID provided.');
    }

    // Start a query runner for the transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user with this email already exists
      const existingUser = await queryRunner.manager.findOneBy(User, {
        email: registerDto.email,
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt();
      const password_hash = await bcrypt.hash(registerDto.password, salt);


      // Find the default 'USER' role
      const userRole = await this.roleRepository.findOneBy({
        role_name: 'USER',
      });
      if (!userRole) {
        // This is a critical setup error. In a real app, you'd seed this role.
        throw new Error(
          'Default "USER" role not found. Please seed the database.',
        );
      }

      // Create new User entity
      const newUser = queryRunner.manager.create(User, {
        full_name: registerDto.full_name,
        email: registerDto.email,
        password_hash,
        phone_number: registerDto.phone_number,
        roles: [userRole], // Assign the default USER role

        society_id: registerDto.societyId, // <-- Set society_id
        society_status: UserSocietyStatus.PENDING, // <-- Set status to PENDING
      });
      const savedUser = await queryRunner.manager.save(newUser);

      // Create new Flat entity and link it to the user
      const newFlat = queryRunner.manager.create(Flat, {
        flat_number: registerDto.flat_number,
        block: registerDto.block,
        owner_id: savedUser.id,
      });
      await queryRunner.manager.save(newFlat);

      // If all operations succeed, commit the transaction
      await queryRunner.commitTransaction();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash: _, ...result } = savedUser;
      return result;
    } catch (err) {
      // If any error occurs, roll back the transaction
      await queryRunner.rollbackTransaction();
      throw err; // Re-throw the original error
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  }

  // Checks if a user's credentials are valid
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    console.log('user', user);
    if (
      user &&
      user.password_hash &&
      (await bcrypt.compare(pass, user.password_hash))
    ) {
      const { password_hash, ...result } = user;
      console.log('result', result);
      return result;
    }
    return null;
  }

  // Generates a JWT for a valid user
  async login(user: any) {
    const payload = { username: user.email, sub: user.id }; // 'sub' is standard for subject (user ID)
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
