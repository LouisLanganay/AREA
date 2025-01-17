import { Service, Event, FieldGroup } from '../../../shared/Workflow';
import { PrismaService } from '../prisma/prisma.service';

const prismaService = new PrismaService();

class spotifyTools {
  constructor(private prisma: PrismaService) {}

  async createPlaylist(userId, spotifyID, name, description, isPublic) {
    const tokenData = await this.prisma.token.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } },
      select: { accessToken: true },
    });

    if (!tokenData || !tokenData.accessToken) {
      console.error('Access token not found');
      throw new Error('Access token not found for the user');
    }

    const accessToken = tokenData.accessToken;

    const body = JSON.stringify({
      name: name,
      description: description,
      public: isPublic,
    });

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/users/${spotifyID.value}/playlists`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: body,
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          'Failed to create playlist:',
          response.status,
          response.statusText,
          errorBody,
        );
        throw new Error(
          `Spotify API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Playlist created');
      return data;
    } catch (error) {
      console.error('Error creating playlist:', error.message);
      throw error;
    }
  }

  async checkPlayers(userId: string): Promise<boolean> {
    console.log('Checking playlist');
    const tokenData = await this.prisma.token.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } },
      select: { accessToken: true },
    });

    if (!tokenData || !tokenData.accessToken) {
      console.error('Access token not found');
      throw new Error('Access token not found for the user');
    }

    const accessToken = tokenData.accessToken;

    try {
      const response = await fetch(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 204) {
        console.log('No content: no music is currently playing.');
        return false;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Spotify API error: ${response.status} ${response.statusText}`,
          errorBody,
        );
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      return data.is_playing || false;
    } catch (error) {
      console.error('Error checking currently playing status:', error.message);
      return false;
    }
  }

  async skipMusic(userId) {
    const tokenData = await this.prisma.token.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } },
      select: { accessToken: true },
    });

    if (!tokenData || !tokenData.accessToken) {
      console.error('Access token not found');
      throw new Error('Access token not found for the user');
    }

    const accessToken = tokenData.accessToken;

    try {
      const response = await fetch(
        'https://api.spotify.com/v1/me/player/next',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status != 200) {
        if (response.status === 403) {
          throw new Error(
            `Spotify API error: You need to have a Premium account to do that`,
          );
        }
        throw new Error(
          `Spotify API error: ${response.status} ${response.statusText}`,
        );
      }

      console.log('Music is skip');
    } catch (error) {
      console.error(error);
      throw false;
    }
  }

  async followPlaylist(userId, playlistId) {
    const tokenData = await this.prisma.token.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } },
      select: { accessToken: true },
    });

    if (!tokenData || !tokenData.accessToken) {
      console.error('Access token not found');
      throw new Error('Access token not found for the user');
    }

    const accessToken = tokenData.accessToken;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/followers`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public: false,
          }),
        },
      );

      if (response.status != 200) {
        throw new Error(
          `Spotify API error: ${response.status} ${response.statusText}`,
        );
      }

      console.log('Playlist updated successfully');
    } catch (error) {
      console.error(error);
      throw false;
    }
  }

  async numberOfDevices(
    userId: string,
    numberMaxDevice: number,
  ): Promise<boolean> {
    const tokenData = await this.prisma.token.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } },
      select: { accessToken: true },
    });

    if (!tokenData || !tokenData.accessToken) {
      console.error('Access token not found');
      throw new Error('Access token not found for the user');
    }

    const accessToken = tokenData.accessToken;

    try {
      const response = await fetch(
        'https://api.spotify.com/v1/me/player/devices',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Spotify API error: ${response.status} ${response.statusText}`,
          errorBody,
        );
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      const numberOfDevices = data.devices?.length || 0;

      console.log(
        `Number of connected devices: ${numberOfDevices}. Check for ${numberMaxDevice}`,
      );

      if (numberOfDevices > numberMaxDevice) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking number of devices:', error.message);
      return false;
    }
  }
}

const spotiTools = new spotifyTools(prismaService);

export const EventCheckDevices: Event = {
  type: 'action',
  id_node: 'checkDevices',
  name: 'Check number of devices connected',
  description: 'Check the number of devices connected to your account',
  serviceName: 'spotify',
  fieldGroups: [
    {
      id: 'spotifyDetails',
      name: 'Spotify Details',
      description: 'Information about spotify',
      type: 'group',
      fields: [
        {
          id: 'numberMaxDevice',
          type: 'number',
          required: true,
          description: 'Number of max device connected',
        },
      ],
    },
  ],
  check: async (parameters: FieldGroup[]) => {
    const playlistDetails = parameters.find(
      (param) => param.id === 'spotifyDetails',
    );

    if (!playlistDetails) {
      console.error('spotify details not found');
      return false;
    }

    const numberMaxDevice = playlistDetails?.fields.find(
      (field) => field.id === 'numberMaxDevice',
    )?.value;
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;

    if (numberMaxDevice) {
      return spotiTools.numberOfDevices(userId, numberMaxDevice);
    } else {
      console.error('Missing required parameters: numberMaxDevice');
      return false;
    }
  },
};

export const EventCheckPlayer: Event = {
  type: 'action',
  id_node: 'checkListen',
  name: 'Check Listen',
  description: 'Check if a music is play',
  serviceName: 'spotify',
  fieldGroups: [],
  check: async (parameters: FieldGroup[]) => {
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;

    try {
      return spotiTools.checkPlayers(userId);
    } catch (error) {
      return false;
    }
  },
};

export const EventSkipToNext: Event = {
  type: 'reaction',
  id_node: 'skipToNext',
  name: 'Skip Music',
  description: 'Skip the music ( You need to have a premium account )',
  serviceName: 'spotify',
  fieldGroups: [],
  execute: (parameters: FieldGroup[]) => {
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;

    try {
      console.log('Skip To Next');
      return spotiTools.skipMusic(userId);
    } catch (error) {
      console.error('Skip Music', error);
    }
  },
};

export const EventFollowPlaylist: Event = {
  type: 'reaction',
  id_node: 'followPlaylist',
  name: 'Follow a playlist',
  description: 'Follow a playlist',
  serviceName: 'spotify',
  fieldGroups: [
    {
      id: 'playlistDetails',
      name: 'Playlist Details',
      description: 'Information about playlist',
      type: 'group',
      fields: [
        {
          id: 'playlistID',
          type: 'string',
          required: true,
          description: 'Spotify Playlist ID',
        },
      ],
    },
  ],
  execute: (parameters: FieldGroup[]) => {
    const playlistDetails = parameters.find(
      (param) => param.id === 'playlistDetails',
    );

    if (!playlistDetails) {
      console.error('playlist details not found');
      return false;
    }

    const playlistID = playlistDetails?.fields.find(
      (field) => field.id === 'playlistID',
    )?.value;
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;

    if (playlistID) {
      spotiTools.followPlaylist(userId, playlistID);
      return true;
    } else {
      console.error('Missing required parameters: playlistID');
      return false;
    }
  },
};

export const EventCreatePlaylist: Event = {
  type: 'reaction',
  id_node: 'createPlaylistSpotify',
  name: 'Create Playlist',
  description: 'Create a playlist',
  serviceName: 'spotify',
  fieldGroups: [
    {
      id: 'playlistDetails',
      name: 'Playlist Details',
      description: 'Information about playlist',
      type: 'group',
      fields: [
        {
          id: 'spotifyID',
          type: 'string',
          required: true,
          description: 'Spotify User ID',
        },
        {
          id: 'name',
          type: 'string',
          required: true,
          description: 'The name of the playlist',
        },
        {
          id: 'description',
          type: 'string',
          required: true,
          description: 'The description of the playlist',
        },
        {
          id: 'public',
          type: 'boolean',
          required: false,
          description: 'Check if the playlists is public',
        },
      ],
    },
  ],
  execute: (parameters: FieldGroup[]) => {
    console.log('execute create playlist');
    const playlistDetails = parameters.find(
      (param) => param.id === 'playlistDetails',
    );

    if (!playlistDetails) {
      console.error('playlist details not found');
      return false;
    }

    const spotifyID = playlistDetails?.fields.find(
      (field) => field.id === 'spotifyID',
    );
    const name = playlistDetails?.fields.find(
      (field) => field.id === 'name',
    )?.value;
    const description = playlistDetails?.fields.find(
      (field) => field.id === 'description',
    )?.value;
    let type = playlistDetails?.fields.find(
      (field) => field.id === 'public',
    )?.value;
    const userId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'user_id')?.value;

    if (name && description && spotifyID) {
      if (type == undefined) type = false;
      spotiTools.createPlaylist(userId, spotifyID, name, description, type);
      return true;
    } else {
      console.error(
        'Missing required parameters: name or description or spotifyID',
      );
      return false;
    }
  },
};

export const SpotifyService: Service = {
  id: 'spotify',
  name: 'Spotify',
  description: 'application for listen music',
  loginRequired: true,
  image:
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  Event: [],
  auth: {
    uri: '/auth/spotify/redirect',
    callback_uri: '/auth/spotify/callback',
  },
};
