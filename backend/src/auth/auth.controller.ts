import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly service: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register ususario nuevo' })
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente', schema: { example: { id: '123e4567-e89b-12d3-a456-426614174000', email: 'juan@example.com' } } })
    @ApiResponse({ status: 400, description: 'Error de validación', schema: { example: { message: ['email tiene que tener @'] } } })
    @ApiResponse({ status: 409, description: 'Usuario ya existe'})
    async register(@Body() dto: RegisterDto) {
        return this.service.register(dto);
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login de usuario + tokens' })
    @ApiResponse({ status: 200, description: 'Login exitoso', schema: { example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } } })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas'})
    async login(@Body() dto: LoginDto) {
        return this.service.login(dto);
    }

    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Refrescar token' })
    @ApiResponse({ status: 200, description: 'Token refrescado exitosamente', schema: { example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } } })
    @ApiResponse({ status: 401, description: 'Token inválido o expirado'})
    async refresh(@Body() dto: RefreshDto) {
        return this.service.refresh(dto);
    }
}