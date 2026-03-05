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
  ApiConflictResponse,
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
import { CreateUnitUseCase } from './application/use-cases/unit/create-unit.use-case.js';
import { DeleteUnitUseCase } from './application/use-cases/unit/delete-unit.use-case.js';
import { GetUnitUseCase } from './application/use-cases/unit/get-unit.use-case.js';
import { ListUnitsUseCase } from './application/use-cases/unit/list-units.use-case.js';
import { UpdateUnitUseCase } from './application/use-cases/unit/update-unit.use-case.js';
import { ValidateServiceCoverageUseCase } from './application/use-cases/unit/validate-service-coverage.use-case.js';
import { CreateUnitDto } from './dto/unit/create-unit.dto.js';
import { ListUnitsQueryDto } from './dto/unit/list-units-query.dto.js';
import { UpdateUnitDto } from './dto/unit/update-unit.dto.js';
import { ValidateCoverageQueryDto } from './dto/unit/validate-coverage-query.dto.js';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(
    private createUnitUseCase: CreateUnitUseCase,
    private listUnitsUseCase: ListUnitsUseCase,
    private getUnitUseCase: GetUnitUseCase,
    private updateUnitUseCase: UpdateUnitUseCase,
    private deleteUnitUseCase: DeleteUnitUseCase,
    private validateServiceCoverageUseCase: ValidateServiceCoverageUseCase,
  ) {}

  @Get('validate-coverage')
  @ApiOperation({ summary: 'Validate if a CEP is within service coverage area' })
  @ApiOkResponse({ description: 'Returns coverage validation result' })
  @ApiBadRequestResponse({ description: 'Invalid CEP or coordinates unavailable' })
  validateServiceCoverage(@Query() query: ValidateCoverageQueryDto) {
    return this.validateServiceCoverageUseCase.validateCoverageByCep(query.cep);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiCreatedResponse({ description: 'Unit created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Unit name already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createUnit(@Body() dto: CreateUnitDto) {
    return this.createUnitUseCase.createUnit(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'List all units' })
  @ApiOkResponse({ description: 'Returns paginated list of units' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listUnits(@Query() query: ListUnitsQueryDto) {
    return this.listUnitsUseCase.listUnits(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Get a unit by ID' })
  @ApiOkResponse({ description: 'Returns the unit' })
  @ApiNotFoundResponse({ description: 'Unit not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getUnitById(@Param('id', ParseIntPipe) id: number) {
    return this.getUnitUseCase.getUnitById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiOkResponse({ description: 'Unit updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Unit name already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateUnitById(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitDto) {
    return this.updateUnitUseCase.updateUnitById(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiNoContentResponse({ description: 'Unit deleted successfully' })
  @ApiNotFoundResponse({ description: 'Unit not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteUnitById(@Param('id', ParseIntPipe) id: number) {
    return this.deleteUnitUseCase.deleteUnitById(id);
  }
}
