import { Test, TestingModule } from '@nestjs/testing';
import { AboutController } from './about.controller';

describe('AboutController', () => {
  let aboutController: AboutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AboutController],
    }).compile();

    aboutController = module.get<AboutController>(AboutController);
  });

  it('should return valid about data', () => {
    // Mock de l'adresse IP
    const mockIp = ':1';

    // Exécution de la méthode
    const result = aboutController.getAbout({ ip: mockIp } as any, mockIp);

    expect(result).toHaveProperty('client');
    expect(result.client).toHaveProperty('host', mockIp);

    expect(result).toHaveProperty('server');
    expect(result.server).toHaveProperty('current_time');
    expect(result.server.current_time).toBeGreaterThan(0);

    expect(result.server).toHaveProperty('services');
    expect(result.server.services).toBeInstanceOf(Array);
    expect(result.server.services[0]).toHaveProperty('name', 'facebook');
    expect(result.server.services[0].actions[0]).toHaveProperty(
      'name',
      'new_message_in_group',
    );
    expect(result.server.services[0].actions[0]).toHaveProperty(
      'description',
      'A new message is posted in the group',
    );
  });
});
