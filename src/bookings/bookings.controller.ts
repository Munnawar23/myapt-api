import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';

@ApiTags('Bookings')
@ApiBearerAuth() // <-- Apply to the whole controller
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: "Get the authenticated user's booking history" })
  findForUser(@Req() req, @Query() query: BookingQueryDto) {
    const userId = req.user.id;
    return this.bookingsService.findForUser(userId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new amenity booking' })
  create(@Req() req, @Body() createBookingDto: CreateBookingDto) {
    // Pass the entire user object from the request to the service
    return this.bookingsService.create(req.user, createBookingDto);
  }
}
