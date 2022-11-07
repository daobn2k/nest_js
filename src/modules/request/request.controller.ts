import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@decorators/roles.decorator';
import { GetAuthUser } from '@decorators/user.decorator';
import User from '@modules/user/entities/user.entity';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ListRequestDto } from './dto/list-request.dto';
import { List } from '@utils/list-response';
import Request from './entities/request.entity';

@ApiTags('requests')
@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  // @Auth()
  @Post()
  create(
    @Body() createRequestDto: CreateRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.requestService.create(createRequestDto, i18n.lang);
  }

  // @Auth()
  @ApiOperation({ summary: 'Find all request' })
  @Get()
  find(@Query() query: ListRequestDto): Promise<List<Request>> {
    return this.requestService.find(query);
  }
  //  find by id request
  // @Auth()
  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.requestService.findOne(+id, i18n.lang);
  }
  // @Auth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.requestService.update(+id, updateRequestDto, i18n.lang);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.requestService.remove(+id, i18n.lang);
  }
}
