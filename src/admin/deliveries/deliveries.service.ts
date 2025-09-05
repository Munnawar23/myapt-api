import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Delivery,
  DeliveryCreator,
  DeliveryStatus,
} from 'src/database/entities/delivery.entity';
import { Flat } from 'src/database/entities/flat.entity';
import { Repository } from 'typeorm';
import { GuardCreateDeliveryDto } from './dto/guard-create-delivery.dto';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { DeliveryAction } from 'src/deliveries/dto/respond-to-delivery.dto';

@Injectable()
export class DeliveriesAdminService {
  constructor(
    @InjectRepository(Delivery)
    private deliveriesRepository: Repository<Delivery>,
    @InjectRepository(Flat)
    private flatsRepository: Repository<Flat>,
  ) {}

  async createForApproval(
    createDto: GuardCreateDeliveryDto,
  ): Promise<Delivery> {
    // 1. Find the flat to get the resident's ID
    const flat = await this.flatsRepository.findOneBy({
      id: createDto.flat_id,
    });
    if (!flat || !flat.owner_id) {
      throw new NotFoundException(
        `Flat with ID ${createDto.flat_id} not found or has no owner.`,
      );
    }

    // 2. Create the new delivery record
    const newDelivery = this.deliveriesRepository.create({
      ...createDto,
      resident_id: flat.owner_id,
      // CRITICAL: Set status to PENDING_APPROVAL
      status: DeliveryStatus.PENDING_APPROVAL,
      created_by: DeliveryCreator.GUARD,
    });

    return this.deliveriesRepository.save(newDelivery);
  }

  async findByOrderId(orderId: string): Promise<Delivery> {
    const delivery = await this.deliveriesRepository.findOne({
      where: {
        order_id: orderId,
        status: DeliveryStatus.EXPECTED, // Only find deliveries that are expected
      },
      // Include resident details so the guard knows who it's for
      relations: ['resident'],
    });

    if (!delivery) {
      throw new NotFoundException(
        `Expected delivery with Order ID "${orderId}" not found.`,
      );
    }

    // Sanitize user data before returning
    if (delivery.resident) {
      delete delivery.resident.password_hash;
    }

    return delivery;
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Delivery>> {
    const { limit, offset, search, sortBy, sortOrder } = query;

    const queryBuilder =
      this.deliveriesRepository.createQueryBuilder('delivery');
    queryBuilder.innerJoinAndSelect('delivery.resident', 'resident');

    if (search) {
      // Search by company, order ID, or resident's name
      queryBuilder.where(
        '(delivery.company_name ILIKE :search OR delivery.order_id ILIKE :search OR resident.full_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    let sortColumn = `delivery.${sortBy}`;
    if (sortBy === 'full_name') sortColumn = `resident.full_name`;
    queryBuilder.orderBy(sortColumn, sortOrder);

    queryBuilder.offset(offset).limit(limit);

    const data = await queryBuilder.getMany();
    return new PaginatedResponse(data, total, limit, query.page);
  }

  async updatedDeliveryStatus(
      deliveryId: string,
      status: DeliveryStatus,
    ): Promise<Delivery> {
      const delivery = await this.deliveriesRepository.findOneBy({
        id: deliveryId,
      });
  
      if (!delivery) {
        throw new NotFoundException(`Delivery with ID ${deliveryId} not found.`);
      }

      delivery.status = status;
  
      // Ensure the user responding is the intended resident
      // if (delivery.resident_id !== userId) {
      //   throw new ForbiddenException(
      //     'You are not authorized to respond to this delivery.',
      //   );
      // }
  
      // // You might want to add business logic here.
      // // For example, perhaps OTP can only be updated if the delivery is currently PENDING_APPROVAL
      // if (delivery.status !== DeliveryStatus.PENDING_APPROVAL) {
      //   throw new BadRequestException('Cannot respond to this delivery in its current state.');
      // }
  
      // Update the status based on the action
      // if (action === DeliveryAction.APPROVE) {
      //   delivery.status = DeliveryStatus.APPROVED;
      // } else if (action === DeliveryAction.DENY) {
      //   delivery.status = DeliveryStatus.DENIED;
      // }
  
      // If an OTP is provided, update it
      // if (otp !== undefined) {
      //   delivery.otp = otp;
      // }
  
      return await this.deliveriesRepository.save(delivery);
    }


}
