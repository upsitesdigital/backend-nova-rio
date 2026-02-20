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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ClientGuard } from '../auth/guards/client.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { AddCardUseCase } from './application/use-cases/card/add-card.use-case.js';
import { ListCardsUseCase } from './application/use-cases/card/list-cards.use-case.js';
import { RemoveCardUseCase } from './application/use-cases/card/remove-card.use-case.js';
import { SetDefaultCardUseCase } from './application/use-cases/card/set-default-card.use-case.js';
import { AddCardDto } from './dto/card/add-card.dto.js';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ClientGuard)
@Controller('cards')
export class CardsController {
  constructor(
    private addCardUseCase: AddCardUseCase,
    private listCardsUseCase: ListCardsUseCase,
    private removeCardUseCase: RemoveCardUseCase,
    private setDefaultCardUseCase: SetDefaultCardUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a new card' })
  @ApiCreatedResponse({ description: 'Card added successfully' })
  @ApiForbiddenResponse({ description: 'Only clients can manage cards' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  addCard(@CurrentUser() user: AuthUser, @Body() dto: AddCardDto) {
    return this.addCardUseCase.addCard(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List authenticated client cards' })
  @ApiOkResponse({ description: 'Returns list of client cards' })
  @ApiForbiddenResponse({ description: 'Only clients can manage cards' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listCards(@CurrentUser() user: AuthUser) {
    return this.listCardsUseCase.listCardsByClientId(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a card' })
  @ApiNoContentResponse({ description: 'Card removed successfully' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage cards' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  removeCard(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.removeCardUseCase.removeCardByIdAndClientId(id, user.id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set card as default' })
  @ApiOkResponse({ description: 'Card set as default' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage cards' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  setDefaultCard(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.setDefaultCardUseCase.setDefaultCardByIdAndClientId(id, user.id);
  }
}
