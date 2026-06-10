import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApproveClientUseCase } from './application/use-cases/client/approve-client.use-case.js';
import { GetClientUseCase } from './application/use-cases/client/get-client.use-case.js';
import { ListClientsUseCase } from './application/use-cases/client/list-clients.use-case.js';
import { RejectClientUseCase } from './application/use-cases/client/reject-client.use-case.js';
import { ListClientsQueryDto } from './dto/client/list-clients-query.dto.js';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN_MASTER, AdminRole.ADMIN_BASIC)
@Controller('clients')
export class ClientsController {
  constructor(
    private listClientsUseCase: ListClientsUseCase,
    private getClientUseCase: GetClientUseCase,
    private approveClientUseCase: ApproveClientUseCase,
    private rejectClientUseCase: RejectClientUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List clients with optional filters' })
  @ApiOkResponse({ description: 'Returns list of clients' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listClients(@Query() query: ListClientsQueryDto) {
    return this.listClientsUseCase.listClients(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiOkResponse({ description: 'Returns the client' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getClientById(@Param('id', ParseIntPipe) id: number) {
    return this.getClientUseCase.getClientById(id);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Approve a pending client' })
  @ApiNoContentResponse({ description: 'Client approved successfully' })
  @ApiBadRequestResponse({ description: 'Client is not in PENDING status' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  approveClientById(@Param('id', ParseIntPipe) id: number) {
    return this.approveClientUseCase.approveClientById(id);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reject a pending client' })
  @ApiNoContentResponse({ description: 'Client rejected successfully' })
  @ApiBadRequestResponse({ description: 'Client is not in PENDING status' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  rejectClientById(@Param('id', ParseIntPipe) id: number) {
    return this.rejectClientUseCase.rejectClientById(id);
  }
}
