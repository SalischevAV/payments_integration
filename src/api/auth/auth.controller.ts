import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	public async registerUser(@Body() dto: RegisterDto) {
		return this.authService.registerUser(dto);
	}

	@Post('login')
	public async loginUser(@Body() dto: LoginDto) {
		return this.authService.loginUser(dto);
	}
}
