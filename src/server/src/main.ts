import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

import {ServiceRegister, defaultFieldGroup} from './service/register.service';
import {EventMonitor} from './service/monitor.event';
import {
    TestService,
    EventCheckFreezingTemperature, EventSendMail,
} from './service/meteo.service';
import {
    discordService,
    EventgetMessageDiscord,
    EventnotifyUserDiscord,
} from './service/discord.service';
import { TimerService } from './service/timer.service';
import {FieldGroup} from '../../shared/Workflow';
import {updateUserDto} from './users/dto/update-user.dto';

async function defineAllService(app: any) {
    const allService = app.get(ServiceRegister);

    allService.addService(discordService);
    allService.addService(TestService);
    allService.addService(TimerService);

    allService.addEventToService('discord', EventnotifyUserDiscord);
    allService.addEventToService('discord', EventgetMessageDiscord);
    allService.addEventToService('testService', EventCheckFreezingTemperature);
    allService.addEventToService('testService', EventSendMail);

    const monitor = new EventMonitor();
    await monitor.monitoringWorkflows(await allService.getAllServices());
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

    await defineAllService(app);

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
