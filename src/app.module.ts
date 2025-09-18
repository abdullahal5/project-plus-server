import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './User/user.module';
import { PrismaModule } from './Prisma/prisma.module';
import { AuthModule } from './Auth/auth.module';
import { CoreModule } from './core/core.module';
import { ProjectModule } from './Project/project.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { TaskModule } from './Task/task.module';
import { NotificationsModule } from './Notifications/notifications.module';
import { ReportsModule } from './Reports/reports.module';
import { SearchModule } from './Search/search.module';

@Controller()
class RootController {
  @Get('/')
  check() {
    return { message: 'Hello from NestJS 🚀' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    CoreModule,
    ProjectModule,
    TaskModule,
    NotificationsModule,
    ReportsModule,
    SearchModule,

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req, res }) => ({ req, res }),
    }),
  ],
  controllers: [RootController],
})
export class AppModule {}
