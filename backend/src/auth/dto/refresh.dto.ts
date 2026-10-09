import { ApiProperty } from '@nestjs/swagger';
import { IsString } from "class-validator";

export class RefreshDto {
    @ApiProperty({
        description: 'El refreshToken que regresó POST /auth/login',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIuLi4ifQ.firma',
    })
    @IsString()
    refreshToken: string;
}