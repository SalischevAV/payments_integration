import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	public async registerUser(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: RegisterDto
	) {
		return this.authService.registerUser(res, dto);
	}

	@Post('login')
	public async loginUser(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: LoginDto
	) {
		return this.authService.loginUser(res, dto);
	}

	@Get('logout')
	public logoutUser(@Res({ passthrough: true }) res: Response) {
		return this.authService.logoutUser(res);
	}
}
