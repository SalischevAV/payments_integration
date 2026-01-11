import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';

@Module({
	imports: [AuthModule, HealthcheckModule],
})
export class ApiModule {}
