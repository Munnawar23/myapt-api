import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Delivery,
  DeliveryStatus,
} from 'src/database/entities/delivery.entity';
import { Repository } from 'typeorm';
import { DeliveryAction } from './dto/respond-to-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private deliveriesRepository: Repository<Delivery>,
  ) {}

  // Find all deliveries for a user, defaulting to only PENDING_APPROVAL
  async findForUser(userId: string): Promise<Delivery[]> {
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

  // Respond to a specific delivery
  async respond(
    userId: string,
    deliveryId: string,
    action: DeliveryAction,
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

    // Update the status based on the action
    if (action === DeliveryAction.APPROVE) {
      delivery.status = DeliveryStatus.APPROVED;
    } else if (action === DeliveryAction.DENY) {
      delivery.status = DeliveryStatus.DENIED;
    }

    return this.deliveriesRepository.save(delivery);
  }
}
