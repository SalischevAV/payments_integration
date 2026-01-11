import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getCorsConfig } from 'config';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const logger = new Logger('Bootstrap');
	const config = app.get(ConfigService);

	app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')));

	app.enableCors(getCorsConfig(config));
	app.useGlobalPipes(new ValidationPipe());

	const port = config.getOrThrow<number>('HTTP_PORT');
	const host = config.get<string>('HTTP_HOST');
	try {
		await app.listen(port);
		logger.log(`Application is running on: ${host}:${port}`);
	} catch (error) {
		logger.error('Failed to start application', error);
		process.exit(1);
	}
}
bootstrap();
