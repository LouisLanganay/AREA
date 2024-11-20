import axios from 'axios';
import { Service } from '../../../shared/Workflow';

const API_BASE_URL = "http://localhost:8080/api";

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
    },
    {
      id: "discord",
      name: "Discord",
      description: "Manage Discord channels and messages",
      enabled: true,
      image: "https://w7.pngwing.com/pngs/1023/637/png-transparent-discord-hd-logo.png",
      actions: [
        {
          id: "send_message",
          name: "Send Message",
          description: "Send a message to a channel"
        }
      ],
      reactions: [
        {
          id: "add_reaction",
          name: "Add Reaction",
          description: "Add a reaction to a message"
        }
      ]
    },
    {
      id: "slack",
      name: "Slack",
      description: "Manage Slack channels and messages",
      enabled: true,
      image: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
      actions: [
        {
          id: "post_message",
          name: "Post Message",
          description: "Post a message to a channel"
        }
      ],
      reactions: [
        {
          id: "add_emoji",
          name: "Add Emoji",
          description: "Add an emoji reaction to a message"
        }
      ]
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Manage Gmail emails and labels",
      enabled: true,
      image: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",
      actions: [
        {
          id: "send_email",
          name: "Send Email",
          description: "Send an email to a recipient"
        },
        {
          id: "mark_as_read",
          name: "Mark as Read",
          description: "Mark an email as read"
        }
      ],
      reactions: [
        {
          id: "add_label",
          name: "Add Label",
          description: "Add a label to an email"
        }
      ]
    }
  ];
};
