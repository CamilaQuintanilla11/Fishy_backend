import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString,} from 'class-validator';

export class CreateRolDto {
  @ApiProperty({ example: 'moderador' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'mod_gate' })
  @IsString()
  @IsNotEmpty()
  gatename: string;
}