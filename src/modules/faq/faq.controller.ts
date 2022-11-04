import { Auth } from '@decorators/roles.decorator';
import { FaqApis } from '@modules/api/api.constant';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { List } from '@utils/list-response';
import { I18n, I18nContext } from 'nestjs-i18n';
import { DeleteResult } from 'typeorm';
import { CreateFaqDto } from './dto/create-faq.dto';
import { ListFaqDto } from './dto/list-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import FAQ from './entities/faq.entity';
import { FaqService } from './faq.service';

@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Auth(FaqApis.ADD_FAQ)
  @ApiOperation({
    summary: 'Create a FAQ, role ADMIN or role have permission ADD_FAQ',
  })
  @Post()
  create(@Body() createFaqDto: CreateFaqDto): Promise<FAQ> {
    return this.faqService.create(createFaqDto);
  }

  @ApiOperation({ summary: 'Find all FAQs' })
  @Get()
  find(@Query() query: ListFaqDto): Promise<List<FAQ>> {
    return this.faqService.find(query);
  }

  @ApiOperation({ summary: 'Find a FAQ' })
  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<FAQ> {
    return this.faqService.findOne(+id, i18n.lang);
  }

  @Auth(FaqApis.EDIT_FAQ)
  @ApiOperation({
    summary: 'Update a FAQ, role ADMIN or role have permission EDIT_FAQ',
  })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto,
    @I18n() i18n: I18nContext,
  ): Promise<FAQ> {
    return this.faqService.update(+id, updateFaqDto, i18n.lang);
  }

  @Auth(FaqApis.DELETE_FAQ)
  @ApiOperation({
    summary: 'Delete a FAQ, role ADMIN or role have permission DELETE_FAQ',
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.faqService.remove(+id, i18n.lang);
  }
}
