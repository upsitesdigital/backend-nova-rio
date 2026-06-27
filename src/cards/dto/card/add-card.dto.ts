import { createZodDto } from 'nestjs-zod';
import { CardSchemas } from './add-card.schema.js';

export class AddCardDto extends createZodDto(CardSchemas.add) {}
