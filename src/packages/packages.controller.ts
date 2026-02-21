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
import { CreatePackageUseCase } from './application/use-cases/package/create-package.use-case.js';
import { DeletePackageUseCase } from './application/use-cases/package/delete-package.use-case.js';
import { GetPackageUseCase } from './application/use-cases/package/get-package.use-case.js';
import { ListPackagesUseCase } from './application/use-cases/package/list-packages.use-case.js';
import { ReactivatePackageUseCase } from './application/use-cases/package/reactivate-package.use-case.js';
import { UpdatePackageUseCase } from './application/use-cases/package/update-package.use-case.js';
import { CreatePackageDto } from './dto/package/create-package.dto.js';
import { ListPackagesQueryDto } from './dto/package/list-packages-query.dto.js';
import { UpdatePackageDto } from './dto/package/update-package.dto.js';

@ApiTags('Packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('packages')
export class PackagesController {
  constructor(
    private createPackageUseCase: CreatePackageUseCase,
    private listPackagesUseCase: ListPackagesUseCase,
    private getPackageUseCase: GetPackageUseCase,
    private updatePackageUseCase: UpdatePackageUseCase,
    private reactivatePackageUseCase: ReactivatePackageUseCase,
    private deletePackageUseCase: DeletePackageUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new package' })
  @ApiCreatedResponse({ description: 'Package created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createPackage(@Body() dto: CreatePackageDto) {
    return this.createPackageUseCase.createPackage(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List packages with optional filters' })
  @ApiOkResponse({ description: 'Returns paginated list of packages' })
  @ApiBadRequestResponse({ description: 'Service not found or inactive' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listPackages(@Query() query: ListPackagesQueryDto) {
    return this.listPackagesUseCase.listPackages(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by ID' })
  @ApiOkResponse({ description: 'Returns the package' })
  @ApiNotFoundResponse({ description: 'Package not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getPackageById(@Param('id', ParseIntPipe) id: number) {
    return this.getPackageUseCase.getPackageById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a package' })
  @ApiOkResponse({ description: 'Package updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Package not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updatePackage(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePackageDto) {
    return this.updatePackageUseCase.updatePackageById(id, dto);
  }

  @Patch(':id/reactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reactivate a deactivated package' })
  @ApiNoContentResponse({ description: 'Package reactivated successfully' })
  @ApiNotFoundResponse({ description: 'Package not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  reactivatePackage(@Param('id', ParseIntPipe) id: number) {
    return this.reactivatePackageUseCase.reactivatePackageById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a package' })
  @ApiNoContentResponse({ description: 'Package deactivated successfully' })
  @ApiNotFoundResponse({ description: 'Package not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deactivatePackage(@Param('id', ParseIntPipe) id: number) {
    return this.deletePackageUseCase.deactivatePackageById(id);
  }
}
