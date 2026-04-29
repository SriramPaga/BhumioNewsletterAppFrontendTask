import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { isUUID } from 'class-validator';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser =
      await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
    if (existingUser) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    if (!createUserDto.organizationId) {
      throw new BadRequestException(
        'organizationId is required',
      );
    }

    const organization =
      await this.organizationRepository.findOne({
        where: {
          id: createUserDto.organizationId,
        },
      });

    if (!organization) {
      throw new ConflictException(
        'Organization does not exist',
      );
    }

    const user = new User();
    user.email = createUserDto.email;
    user.password = await bcrypt.hash(
      createUserDto.password,
      10,
    );
    user.fullName = createUserDto.fullName;
    user.role = createUserDto.role;
    user.organization = organization;

    return this.userRepository.save(user);
  }

  async findByEmail(
    email: string,
  ): Promise<User> {
    const user =
      await this.userRepository.findOne({
        where: { email },
        relations: ['organization'],
      });
    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }
    return user;
  }

  async findByEmailForAuth(
    email: string,
  ): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect(
        'user.organization',
        'organization',
      )
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    if (!id) {
      throw new NotFoundException(
        'Invalid ID parameter',
      );
    }

    const user =
      await this.userRepository.findOne({
        where: { id },
        relations: ['organization'],
      });
    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto?: Partial<CreateUserDto>,
  ): Promise<User> {
    if (!isUUID(id))
      throw new BadRequestException(
        'Invalid UUID format',
      );

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect(
        'user.organization',
        'organization',
      )
      .where('user.id = :id', { id })
      .getOne();

    if (!user)
      throw new NotFoundException(
        'User not found',
      );

    if (
      !updateUserDto ||
      Object.keys(updateUserDto).length === 0
    ) {
      throw new BadRequestException(
        'No update data provided',
      );
    }

    if (updateUserDto?.fullName)
      user.fullName = updateUserDto.fullName;
    if (updateUserDto?.email)
      user.email = updateUserDto.email;
    if (updateUserDto?.password) {
      user.password = await bcrypt.hash(
        updateUserDto.password,
        10,
      );
    }
    if (updateUserDto?.role)
      user.role = updateUserDto.role;

    if (updateUserDto.organizationId) {
      const organization =
        await this.organizationRepository.findOne(
          {
            where: {
              id: updateUserDto.organizationId,
            },
          },
        );
      if (organization)
        user.organization = organization;
    }

    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async updateRefreshToken(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userRepository.update(id, {
      refreshTokenHash,
    });
  }

  async getUserIfRefreshTokenMatches(
    id: string,
    refreshToken: string,
  ): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .leftJoinAndSelect(
        'user.organization',
        'organization',
      )
      .where('user.id = :id', { id })
      .getOne();

    if (!user || !user.refreshTokenHash)
      return null;

    const isMatching = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isMatching) return null;

    return user;
  }
}
