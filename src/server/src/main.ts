import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ServiceRegister } from './service/register.service';
import { EventMonitor } from './service/monitor.event';
import {
  WeatherService,
  EventCheckTemperature,
  EventGetWeatherForecast,
} from './service/meteo.service';
import { MailTestService, EventSendMail } from './service/mailTest.service';
import {
  discordService, EventBanUserDiscord, EventjoinGuildDiscord,
  EventlistenMessageDiscord,
  EventsendMessageDiscord,
} from './service/discord.service';
import {
  EventAddGoogleCalendar,
  EventIsNewEvent,
  gcalendarService,
  ListenEventGcalendar,
} from './service/gcalendar.service';
import {
  TimerService,
  EventDateReached,
  EventDayAndTimeReached,
} from './service/timer.service';
import { MailerService } from './service/mailer.service';

export async function defineAllService(allService: any) {
  allService.addService(discordService);
  allService.addService(TimerService);
  allService.addService(MailTestService);
  allService.addService(MailerService);
  allService.addService(WeatherService);
  allService.addService(gcalendarService);

  allService.addEventToService('discord', EventlistenMessageDiscord);
  allService.addEventToService('discord', EventsendMessageDiscord);
  allService.addEventToService('discord', EventBanUserDiscord);
  allService.addEventToService('discord', EventjoinGuildDiscord);

  allService.addEventToService('weather', EventCheckTemperature);
  allService.addEventToService('weather', EventGetWeatherForecast);

  allService.addEventToService('mailTest', EventSendMail);

  allService.addEventToService('timer', EventDateReached);
  allService.addEventToService('timer', EventDayAndTimeReached);

  allService.addEventToService('gcalendar', ListenEventGcalendar);
  allService.addEventToService('gcalendar', EventAddGoogleCalendar);
  // allService.addEventToService('gcalendar', EventIsNewEvent);

  return allService;
}

async function handlleAllServices(allService: ServiceRegister) {
  const monitor = new EventMonitor();
  monitor.startAutoFetchAndCheck(allService.getAllServices());
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('API linkit')
    .setDescription('API documentation for linkit project')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  const allService = app.get(ServiceRegister);
  await handlleAllServices(await defineAllService(allService));

  // =============== FOR TEST ONLY =============== //
  // console.log('============== DEBUG ================');
  //
  // const user_1 = new ServiceRegister();
  // user_1.addService(TestService);
  // user_1.addService(discordService);
  //
  // const user_1_all_service = user_1.getAllServices();
  // console.log(user_1_all_service);
  // const user_1_service = user_1.getServiceById('testService');
  // const user_1_service2 = user_1.getServiceById('discord');
  //
  // user_1.addEventToService(user_1_service.id, EventCheckFreezingTemperature);
  // user_1.addEventToService(user_1_service2.id, EventnotifyUserDiscord);
  //
  // const user_1_event = user_1.getEventByIdInService(
  //   user_1_service.id,
  //   'checkFreezingTemperature',
  // );
  // const user_1_event2 = user_1.getEventByIdInService(
  //   user_1_service2.id,
  //   'notifyUserDiscord',
  // );
  //
  // const params: FieldGroup = {
  //   id: 'locationDetails',
  //   name: 'GPS Position',
  //   description: 'GPS position with latitude dans longitude',
  //   type: 'position',
  //   fields: [
  //     {
  //       id: 'latitude',
  //       type: 'number',
  //       required: true,
  //       description: 'The latitude format : xx.xxx',
  //       value: 48.12,
  //     },
  //     {
  //       id: 'longitude',
  //       type: 'number',
  //       required: true,
  //       description: 'The longitude format : xx.xxx',
  //       value: -1.7025,
  //     },
  //   ],
  // };
  // console.log(user_1_service);
  // console.log('=====================================');
  // try {
  //   const node1 = user_1.transformEventToNode(
  //     user_1_service.id,
  //     user_1_event.id,
  //   );
  //   const node2 = user_1.transformEventToNode(
  //     user_1_service2.id,
  //     user_1_event2.id,
  //   );
  //   user_1.addChildNode(node1, node2);
  //   console.log('Generated Node:', node1);
  // } catch (error) {
  //   console.error('Error generating Node:', error.message);
  // }
  //
  // if (user_1_event) {
  //   if (user_1_event.type === 'Reaction') {
  //     user_1_event.execute([params]);
  //   } else {
  // const monitor = new EventMonitor();
  // await monitor.monitoringAllActions();
  // monitor.startMonitoring(user_1_event, params, 60000);
  // }
  // }
  //
  // console.log('=====================================');

  await app.listen(8080, '0.0.0.0');
}

bootstrap();
