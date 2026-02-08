import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AmenityBooking,
  BookingStatus,
} from 'src/database/entities/amenity-booking.entity';
import { Feedback } from 'src/database/entities/feedback.entity';
import {
  ServiceRequest,
  ServiceRequestStatus,
} from 'src/database/entities/service-request.entity';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(AmenityBooking)
    private bookingsRepository: Repository<AmenityBooking>,
    @InjectRepository(ServiceRequest)
    private serviceRequestsRepository: Repository<ServiceRequest>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) { }

  async getStats(adminUser: User) {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
    const societyId = adminUser.society_id;

    // Count APPROVED residents in the admin's society
    const residentCount = await this.usersRepository.count({
      where: {
        society_id: societyId,
        society_status: UserSocietyStatus.APPROVED,
      },
    });

    // Count upcoming bookings in the admin's society
    const upcomingBookings = await this.bookingsRepository.count({
      where: {
        status: BookingStatus.CONFIRMED,
        slot: {
          amenity: {
            society_id: societyId, // Deep relation query
          },
        },
      },
    });

    // Count open service requests in the admin's society
    const openServiceRequests = await this.serviceRequestsRepository.count({
      where: {
        status: Not(
          In([ServiceRequestStatus.RESOLVED, ServiceRequestStatus.CANCELED]),
        ),

        user: {
          society_id: societyId, // Deep relation query
        },
      },
    });

    // Get the 5 most recent feedback submissions from the admin's society
    const recentFeedback = await this.feedbackRepository.find({
      where: { society_id: societyId },
      order: { submitted_at: 'DESC' },
      take: 5,
      relations: ['user'],
    });

    // Sanitize user data (as before)
    const sanitizedFeedback = recentFeedback.map((fb) => {
      if (fb.user) {
        // Only return necessary, non-sensitive user info
        fb.user = { full_name: fb.user.full_name } as User;
      }
      return fb;
    });

    return {
      residentCount,
      upcomingBookings,
      openServiceRequests,
      recentFeedback: sanitizedFeedback,
    };
  }
}
