import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ServiceRegister, defaultFieldGroup, EventMonitor} from "./service/register.service";
import { TestService, EventCheckFreezingTemperature } from "./service/meteo.service";
import {FieldGroup} from "../../shared/Workflow";

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

  const user_1 = new ServiceRegister();
  user_1.addService(TestService);

  const user_1_service = user_1.getServiceById("testService");
  user_1.addEventToService(user_1_service.id, EventCheckFreezingTemperature);
  console.log(user_1_service)

  const user_1_event = user_1.getEventByIdInService(user_1_service.id, "checkFreezingTemperature");
  const params: FieldGroup = {
    id: "locationDetails",
    name: "GPS Position",
    description: "GPS position with latitude dans longitude",
    type: "position",
    fields: [
      { id: "latitude", type: "number", required: true, description: "The latitude format : xx.xxx", value: 48.12 },
      { id: "longitude", type: "number", required: true, description: "The longitude format : xx.xxx", value: -1.7025}
    ]
  }

  if (user_1_event) {
    if (user_1_event.type === "Reaction") {
      user_1_event.execute([params]);
    } else {
      const monitor = new EventMonitor();

      monitor.startMonitoring(user_1_event, params, 60000);
    }
  }

  await app.listen(8080, '0.0.0.0');
}
bootstrap();
