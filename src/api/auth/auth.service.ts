import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { Response } from 'express';
import { PrismaService } from 'infra/prisma/prisma.service';
import { isDev, ms, StringValue } from 'libs/utils';

import { LoginDto, RegisterDto } from './dto';
import { JwtPayload } from './types';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	private readonly JWT_ACCESS_TOKEN_TTL: StringValue;
	private readonly JWT_REFRESH_TOKEN_TTL: StringValue;

	private readonly COOKIE_DOMAIN: string;

	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {
		this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow<StringValue>(
			'JWT_ACCESS_TOKEN_TTL'
		);
		this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<StringValue>(
			'JWT_REFRESH_TOKEN_TTL'
		);
		this.COOKIE_DOMAIN =
			this.configService.getOrThrow<string>('COOKIE_DOMAIN');
	}

	public async registerUser(
		res: Response,
		{ email, password, name }: RegisterDto
	) {
		const candidate = await this.prismaService.user.findUnique({
			where: { email },
		});
		if (candidate) {
			throw new ConflictException('Email already registered');
		} else {
			try {
				const newUser = await this.prismaService.user.create({
					data: {
						email,
						password: await hash(password),
						name,
					},
				});
				return this.authUser(res, newUser);
			} catch (error) {
				this.logger.error(error);
				throw InternalServerErrorException;
			}
		}
	}
	public async loginUser(res: Response, { email, password }: LoginDto) {
		const user = await this.prismaService.user.findUnique({
			where: { email },
		});
		if (!user) {
			throw new NotFoundException('Wrong auth data');
		}

		const isValidPassword = await verify(user.password, password);
		if (!isValidPassword) {
			throw new NotFoundException('Wrong auth data');
		}

		return await this.authUser(res, user);
	}
	//TODO delete token from DB
	public logoutUser(res: Response) {
		return this.setCookie(res, '', new Date(0));
	}

	private async authUser(res: Response, user: User) {
		const { accessToken, refreshToken, refreshTokenExpires } =
			await this.generateTokens(user);
		this.setCookie(res, refreshToken, refreshTokenExpires);
		return accessToken;
	}

	private async generateTokens({ id }: User) {
		const payload: JwtPayload = {
			id,
		};
		const refreshTokenExpires = new Date(
			Date.now() + ms(this.JWT_REFRESH_TOKEN_TTL)
		);
		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.JWT_ACCESS_TOKEN_TTL,
		});
		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.JWT_REFRESH_TOKEN_TTL,
		});

		await this.prismaService.user.update({
			where: { id },
			data: { refreshToken },
		});

		return {
			accessToken,
			refreshToken,
			refreshTokenExpires,
		};
	}

	private setCookie(response: Response, value: string, expires: Date) {
		response.cookie('refreshToken', value, {
			httpOnly: true,
			domain: this.COOKIE_DOMAIN,
			expires,
			secure: !isDev(this.configService),
			sameSite: 'lax',
		});
	}
}
