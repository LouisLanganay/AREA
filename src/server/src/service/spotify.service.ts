import { Service, Event, FieldGroup } from '../../../shared/Workflow';

export const SpotifyService: Service = {
  id: 'spotify',
  name: 'Spotify Service',
  description: 'application for listen music',
  loginRequired: true,
  image: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  Event: [],
  auth: {
    uri: '/auth/spotify/redirect',
    callback_uri: '/auth/spotify/callback',
  },
};
