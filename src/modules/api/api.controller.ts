import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllApiRequiredPermission } from './api.constant';
import { ApiService } from './api.service';

@ApiTags('api')
@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @ApiOperation({ summary: 'Get all APIs have required permission' })
  @Get('list')
  getApiRequired() {
    return AllApiRequiredPermission;
  }
}
