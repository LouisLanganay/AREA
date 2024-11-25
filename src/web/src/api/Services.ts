import { Service } from '../../../shared/Workflow';

export const getServices = async (): Promise<Service[]> => {
  //const response = await axios.get<Service[]>(`${API_BASE_URL}/services`);
  return [
    {
      id: "github",
      name: "GitHub",
      description: "Manage GitHub repositories and issues",
      enabled: true,
      image: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      actions: [
        {
          id: "create_issue",
          name: "Create Issue",
          description: "Create a new issue in a repository"
        },
        {
          id: "close_issue",
          name: "Close Issue",
          description: "Close an existing issue"
        }
      ],
      reactions: [
        {
          id: "add_label",
          name: "Add Label",
          description: "Add a label to an issue"
        }
      ]
    },
    {
      id: "youtube",
      name: "YouTube",
      description: "Manage YouTube videos and playlists",
      enabled: false,
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/512px-YouTube_full-color_icon_%282017%29.svg.png",
      actions: [
        {
          id: "upload_video",
          name: "Upload Video",
          description: "Upload a new video to a channel"
        }
      ],
      reactions: [
        {
          id: "add_to_playlist",
          name: "Add to Playlist",
          description: "Add a video to a playlist"
        }
      ]
    }
  ];
};
