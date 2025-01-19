# **HOW TO CREATE A SERVICE**

## **Overview**

Services are essential components in **LinkIt**, enabling integration with various external APIs like Spotify or YouTube. This guide explains how to create and integrate a new service, add actions and reactions, and handle OAuth authentication.

---

## **Create the service**

We gonna use spotify as an exemple

Create the file:
   - `/src/server/service/spotify.service.ts`
   
This is all you need to create a service in his file:
```typescript
export const SpotifyService: Service = {
  id: 'spotify',
  name: 'Spotify',
  description: 'Service for integrating Spotify functionality through the API',
  loginRequired: true,
  image:
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  Event: [],
  auth: {
    uri: '/auth/spotify/redirect',
    callback_uri: '/auth/spotify/callback',
  },
};
```
and add it to the main.ts in the `defineAllService` function :
```typescript
export async function defineAllService(allService: any) {
    allService.addService(SpotifyService);
}
```
---
## **Create an Action / Reaction**


For add an event (Action / Reaction) you need to add it to the `defineAllService` function :
```typescript
export async function defineAllService(allService: any) {
    allService.addService(SpotifyService);
    
    allService.addEventToService('spotify', EventFollowPlaylist);
    allService.addEventToService('spotify', EventCheckPlayer);
}
```

You can find the access token by doing this :
```typescript
const tokenData = await this.prisma.token.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } },
      select: { accessToken: true },
    });
```
---
### **Creating a Reaction**

A reaction defines what happens when a workflow triggers a specific event. Here's an example of a reaction that follows a Spotify playlist:

The logic of the reaction is run in the `execute` function.
```typescript
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
```
---
### **Creating an Action**

Here an Action.

The only difference is the type and the function to execute, for an action it's `check` who return a `Promise<boolean>`
```typescript
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
```
---
### **Workflow Information**
In reactions and actions, you can access workflow-specific information, such as:

- **workflow_id**: The unique ID of the workflow.
- **workflow_name**: The name of the workflow.
- **workflow_enabled**: A boolean indicating if the workflow is enabled.
- **user_id**: The ID of the user executing the workflow.

You can add more workflow-related data in `monitor.event.ts`.

---
## **Adding Authentication**


If the service requires OAuth authentication, implement the following routes in `auth.controller.ts`.

### Redirect Route
This route generates a URL to redirect users to the service's OAuth page:
```typescript
  @Get('spotify/redirect')
  spotifyAuthRedirect(): { redirectUrl: string } {
    const redirectUrl = this.spotifyAuthService.generateAuthUrl();
    return { redirectUrl };
  }
```

### Callback Route
This route handles the response after the user authenticates, exchanges the authorization code for access tokens, and stores them in the database:
```typescript
  @Post('spotify/callback')
  @UseGuards(AuthGuard('jwt'))
  async getSpotifyCallback(@Body('code') code: string, @Req() req: any) {
    if (!code) {
      throw new BadRequestException('Code is missing');
    }
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is missing');
    }
    try {
      console.log('AUTH: Exchanging code for tokens');
      await this.spotifyAuthService.getAccessToken(code, userId);
      return { message: 'Tokens stored in the database' };
    } catch (error) {
      throw new BadRequestException({
        err_code: 'SPOTIFY_TOKEN_EXCHANGE_FAILED',
        details: error.message,
      });
    }
  }
```

---

## **Summary**
To create a service:

1. Define the service in its own file.
2. Register the service and attach events in defineAllService.
3. Implement actions and reactions.
4. Add OAuth authentication routes for services requiring user login.

This process ensures services are modular, extensible, and easy to integrate into the LinkIt workflow system.