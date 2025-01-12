export const team = [
  {
    name: 'Louis Langanay',
    role: 'home.team.roles.frontend',
    image: '/assets/team/louis.langanay@epitech.eu.jpg'
  },
  // ... reste des données team
];

export const stack = [
  {
    title: 'home.stack.services.discord.title',
    description: 'home.stack.services.discord.description',
    icon: '/assets/stack/discord-icon.svg'
  },
  // ... reste des données stack
];

export const exampleNodes = [
  {
    id: '1',
    type: 'node',
    position: { x: 0, y: 0 },
    data: {
      // ... données du node
    }
  },
  // ... autres nodes
];

export const exampleEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
];
