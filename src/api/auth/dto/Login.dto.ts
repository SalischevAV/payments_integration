import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

export class LoginDto {
	@IsEmail({}, { message: 'Wrong email format' })
	@IsNotEmpty({ message: 'Email is required' })
	email: string;

	@IsString()
	@IsNotEmpty({ message: 'Password is required' })
	@MinLength(6, {
		message: 'Min length 6 characters',
	})
	password: string;

	@IsOptional()
	@IsString()
	code: string;
}
