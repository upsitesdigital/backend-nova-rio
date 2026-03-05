import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateServiceUseCase } from './application/use-cases/service/create-service.use-case.js';
import { DeleteServiceUseCase } from './application/use-cases/service/delete-service.use-case.js';
import { GetServiceUseCase } from './application/use-cases/service/get-service.use-case.js';
import { ListServicesUseCase } from './application/use-cases/service/list-services.use-case.js';
import { UpdateServiceUseCase } from './application/use-cases/service/update-service.use-case.js';
import { CreateServiceDto } from './dto/service/create-service.dto.js';
import { ListServicesQueryDto } from './dto/service/list-services-query.dto.js';
import { UpdateServiceDto } from './dto/service/update-service.dto.js';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(
    private createServiceUseCase: CreateServiceUseCase,
    private listServicesUseCase: ListServicesUseCase,
    private getServiceUseCase: GetServiceUseCase,
    private updateServiceUseCase: UpdateServiceUseCase,
    private deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  @Get('public')
  @ApiOperation({ summary: 'List active services (public)' })
  @ApiOkResponse({ description: 'Returns paginated list of active services' })
  listPublicServices(@Query() query: ListServicesQueryDto) {
    return this.listServicesUseCase.listActiveServices(query);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Create a new service' })
  @ApiCreatedResponse({ description: 'Service created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createService(@Body() dto: CreateServiceDto) {
    return this.createServiceUseCase.createService(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'List all active services' })
  @ApiOkResponse({ description: 'Returns paginated list of active services' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listServices(@Query() query: ListServicesQueryDto) {
    return this.listServicesUseCase.listActiveServices(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Get a service by ID' })
  @ApiOkResponse({ description: 'Returns the service' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getServiceById(@Param('id', ParseIntPipe) id: number) {
    return this.getServiceUseCase.getServiceById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Update a service' })
  @ApiOkResponse({ description: 'Service updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateService(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.updateServiceUseCase.updateServiceById(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Soft delete a service' })
  @ApiNoContentResponse({ description: 'Service deactivated successfully' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deactivateService(@Param('id', ParseIntPipe) id: number) {
    return this.deleteServiceUseCase.deactivateServiceById(id);
  }
}
