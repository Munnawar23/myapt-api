import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParkingZone } from 'src/database/entities/parking-zone.entity';
import { ParkingSlot } from 'src/database/entities/parking-slot.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateZoneDto } from './dto/create-zone.dto';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class ParkingAdminService {
  constructor(
    @InjectRepository(ParkingZone)
    private zonesRepository: Repository<ParkingZone>,
    @InjectRepository(ParkingSlot)
    private slotsRepository: Repository<ParkingSlot>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  // --- Zone Management ---
  async createZone(createDto: CreateZoneDto): Promise<ParkingZone> {
    const newZone = this.zonesRepository.create(createDto);
    return this.zonesRepository.save(newZone);
  }

  async findAllZones(): Promise<ParkingZone[]> {
    return this.zonesRepository.find({ relations: ['slots'] });
  }

  // --- Slot Management ---
  async createSlot(createDto: CreateSlotDto): Promise<ParkingSlot> {
    const zone = await this.zonesRepository.findOneBy({
      id: createDto.zone_id,
    });
    if (!zone)
      throw new NotFoundException(
        `Parking Zone with ID ${createDto.zone_id} not found.`,
      );
    const newSlot = this.slotsRepository.create(createDto);
    return this.slotsRepository.save(newSlot);
  }

  async findAllSlots(zoneId?: string): Promise<ParkingSlot[]> {
    const whereClause = zoneId ? { zone_id: zoneId } : {};
    return this.slotsRepository.find({
      where: whereClause,
      relations: ['zone', 'assigned_user'],
    });
  }

  async assignSlot(slotId: string, userId: string): Promise<ParkingSlot> {
    const slot = await this.slotsRepository.findOneBy({ id: slotId });
    if (!slot)
      throw new NotFoundException(`Parking Slot with ID ${slotId} not found.`);
    if (slot.assigned_to_user_id)
      throw new ConflictException(
        `Slot ${slot.slot_number} is already assigned.`,
      );

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);

    slot.assigned_to_user_id = userId;
    return this.slotsRepository.save(slot);
  }

  async unassignSlot(slotId: string): Promise<ParkingSlot> {
    const slot = await this.slotsRepository.findOneBy({ id: slotId });
    if (!slot)
      throw new NotFoundException(`Parking Slot with ID ${slotId} not found.`);

    slot.assigned_to_user_id = null;
    return this.slotsRepository.save(slot);
  }

  async deleteSlot(slotId: string): Promise<void> {
    const result = await this.slotsRepository.delete(slotId);
    if (result.affected === 0)
      throw new NotFoundException(`Parking Slot with ID ${slotId} not found.`);
  }
}
