import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit new feedback, a suggestion, or a complaint',
  })
  create(@Req() req, @Body() createDto: CreateFeedbackDto) {
    // Pass the entire user object to the service
    return this.feedbackService.create(req.user, createDto);
  }
}
