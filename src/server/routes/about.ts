import { About } from '../shared/types';

export function getAbout(req: any, res: any) {
  const about: About = {
    client: {
      host: req.headers.host || 'localhost:8081'
    },
    server: {
      current_time: Math.floor(Date.now() / 1000),
      services: [
        {
          name: "GitHub",
          description: "GitHub Integration Service",
          actions: [
            {
              name: "Push Event",
              description: "Triggers when a push occurs on the repository"
            }
          ],
          reactions: [
            {
              name: "Create Issue",
              description: "Creates a new issue in a repository"
            }
          ]
        }
      ]
    }
  };

  res.json(about);
}
