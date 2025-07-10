import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParkingZone } from 'src/database/entities/parking-zone.entity';
import { ParkingSlot } from 'src/database/entities/parking-slot.entity';
import { ParkingRequest } from 'src/database/entities/parking-request.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateParkingRequestDto } from './dto/create-parking-request.dto';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(ParkingZone)
    private zonesRepository: Repository<ParkingZone>,
    @InjectRepository(ParkingSlot)
    private slotsRepository: Repository<ParkingSlot>,
    @InjectRepository(ParkingRequest)
    private requestsRepository: Repository<ParkingRequest>,
  ) {}

  async getOverview(userId: string) {
    // 1. Get the user's assigned slot
    const assignedSlot = await this.slotsRepository.findOne({
      where: { assigned_to_user_id: userId },
      relations: ['zone'], // Include zone details
    });

    // 2. Get all zones and calculate their occupancy
    const zones = await this.zonesRepository.find();
    const zoneOverviews = await Promise.all(
      zones.map(async (zone) => {
        const occupiedCount = await this.slotsRepository.count({
          where: { zone_id: zone.id, assigned_to_user_id: Not(IsNull()) },
        });
        return {
          ...zone,
          occupiedSlots: occupiedCount,
          availableSlots: zone.total_capacity - occupiedCount,
          occupancyPercentage: Math.round(
            (occupiedCount / zone.total_capacity) * 100,
          ),
        };
      }),
    );

    return {
      myAssignedSlot: assignedSlot,
      zoneOverviews,
    };
  }

  async createRequest(
    userId: string,
    createDto: CreateParkingRequestDto,
  ): Promise<ParkingRequest> {
    const newRequest = this.requestsRepository.create({
      requester_id: userId,
      ...createDto,
    });
    return this.requestsRepository.save(newRequest);
  }
}
