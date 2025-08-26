import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Delivery,
  DeliveryCreator,
  DeliveryStatus,
} from 'src/database/entities/delivery.entity';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { DeliveryAction } from './dto/respond-to-delivery.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { DeliveryQueryDto } from './dto/delivery-query.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private deliveriesRepository: Repository<Delivery>,
  ) { }

  // Find all deliveries for a user, defaulting to only PENDING_APPROVAL
  async findPendingForUser(userId: string): Promise<Delivery[]> {
    return this.deliveriesRepository.find({
      where: {
        resident_id: userId,
        status: DeliveryStatus.PENDING_APPROVAL,
      },
      order: {
        arrival_time: 'DESC',
      },
    });
  }

  async findForUser(
    userId: string,
    query: DeliveryQueryDto,
  ): Promise<Delivery[]> {
    // 1. Start building the 'where' clause.
    // We explicitly type it to ensure correctness.
    const whereClause: FindOptionsWhere<Delivery> = {
      resident_id: userId,
    };

    // 2. If a status filter is provided, add it to the clause.
    if (query.status) {
      whereClause.status = query.status;
    }

    // 3. Construct the final options object with the completed 'where' clause.
    const findOptions: FindManyOptions<Delivery> = {
      where: whereClause,
      order: {
        arrival_time: 'DESC',
      },
    };

    return this.deliveriesRepository.find(findOptions);
  }

  async create(
    userId: string,
    createDto: CreateDeliveryDto,
  ): Promise<Delivery> {
    const newDelivery = this.deliveriesRepository.create({
      ...createDto,
      resident_id: userId,
      status: DeliveryStatus.EXPECTED, // Pre-registered deliveries are 'EXPECTED'
      created_by: DeliveryCreator.TENANT, // Mark that the tenant created this
    });

    return this.deliveriesRepository.save(newDelivery);
  }

  // Respond to a specific delivery
  async respond(
    userId: string,
    deliveryId: string,
    action: DeliveryAction,
    otp?: string, // Add optional OTP parameter
  ): Promise<Delivery> {
    const delivery = await this.deliveriesRepository.findOneBy({
      id: deliveryId,
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${deliveryId} not found.`);
    }

    // Ensure the user responding is the intended resident
    if (delivery.resident_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to respond to this delivery.',
      );
    }

    // You might want to add business logic here.
    // For example, perhaps OTP can only be updated if the delivery is currently PENDING_APPROVAL
    if (delivery.status !== DeliveryStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Cannot respond to this delivery in its current state.');
    }

    // Update the status based on the action
    if (action === DeliveryAction.APPROVE) {
      delivery.status = DeliveryStatus.APPROVED;
    } else if (action === DeliveryAction.DENY) {
      delivery.status = DeliveryStatus.DENIED;
    }

    // If an OTP is provided, update it
    if (otp !== undefined) {
      delivery.otp = otp;
    }

    return await this.deliveriesRepository.save(delivery);
  }

  async updateDeliveryOtp(
    userId: string,
    deliveryId: string,
    otp: string,
  ): Promise<Delivery> {
    const delivery = await this.deliveriesRepository.findOneBy({
      id: deliveryId,
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${deliveryId} not found.`);
    }

    // Ensure only the resident who owns the delivery can update its OTP
    if (delivery.resident_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this delivery.',
      );
    }

    delivery.otp = otp; // Update the OTP
    return this.deliveriesRepository.save(delivery);
  }
}
