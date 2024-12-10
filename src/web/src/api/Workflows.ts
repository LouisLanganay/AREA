import axios from 'axios';
import { getWorkflowResponse } from '@/interfaces/api/Workflows';
import { Workflow } from '@/interfaces/Workflows';

export const getWorkflows = async (): Promise<Workflow[]> => {
  //const response = await axios.get<Service[]>(`${import.meta.env.VITE_API_URL}/services`);
  return [
    {
      "id": "github-push-workflow-1",
      "name": "GitHub Push Notifications",
      "description": "Send notifications when a push occurs on GitHub repository",
      "image": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      "enabled": true,
      "nodes": [
        {
          "id": "github-push-reaction",
          "type": "reaction",
          "name": "GitHub Push Event",
          "description": "Triggers when a push occurs on the repository",
          "service": {
            "id": "github",
            "name": "GitHub",
            "description": "GitHub Integration Service"
          },
          "fieldGroups": [
            {
              "id": "repo-config",
              "name": "Repository Configuration",
              "description": "Configure the repository to watch",
              "type": "repository",
              "fields": [
                {
                  "id": "repository",
                  "type": "string",
                  "description": "Repository Name",
                  "value": "username/repository",
                  "required": true
                }
              ]
            }
          ],
          "nodes": [
            {
              "id": "main-branch-discord",
              "type": "action",
              "name": "Send Discord Message",
              "description": "Send embed message to Discord for main branch pushes",
              "service": {
                "id": "discord",
                "name": "Discord",
                "description": "Discord Integration Service"
              },
              "conditions": [
                {
                  "id": "check-main-branch",
                  "operator": "equals",
                  "variable": "branch",
                  "value": "main",
                  "type": "string"
                }
              ],
              "fieldGroups": [
                {
                  "id": "discord-config",
                  "name": "Discord Configuration",
                  "description": "Configure Discord message settings",
                  "type": "discord",
                  "fields": [
                    {
                      "id": "server_id",
                      "type": "string",
                      "description": "Server ID",
                      "value": "123456789",
                      "required": true
                    },
                    {
                      "id": "channel_id",
                      "type": "string",
                      "description": "Channel ID",
                      "value": "987654321",
                      "required": true
                    }
                  ]
                },
                {
                  "id": "message-config",
                  "name": "Message Configuration",
                  "description": "Configure the embed message",
                  "type": "message",
                  "fields": [
                    {
                      "id": "embed_title",
                      "type": "string",
                      "description": "Embed Title",
                      "value": "New Push to Main Branch",
                      "required": true
                    },
                    {
                      "id": "embed_color",
                      "type": "string",
                      "description": "Embed Color",
                      "value": "#00ff00",
                      "required": true
                    }
                  ]
                }
              ],
              "variables": [
                {
                  "id": "commit_msg",
                  "name": "%commit_message%",
                  "description": "The commit message",
                  "type": "string",
                  "value": null
                },
                {
                  "id": "author",
                  "name": "%author_name%",
                  "description": "The author of the commit",
                  "type": "string",
                  "value": null
                }
              ],
              "nodes": []
            },
            {
              "id": "other-branch-email",
              "type": "action",
              "name": "Send Email Notification",
              "description": "Send email for non-main branch pushes",
              "service": {
                "id": "gmail",
                "name": "Gmail",
                "description": "Gmail Integration Service"
              },
              "conditions": [
                {
                  "id": "check-not-main-branch",
                  "operator": "not_equals",
                  "variable": "branch",
                  "value": "main",
                  "type": "string"
                }
              ],
              "fieldGroups": [
                {
                  "id": "email-config",
                  "name": "Email Configuration",
                  "description": "Configure email settings",
                  "type": "email",
                  "fields": [
                    {
                      "id": "to",
                      "type": "string",
                      "description": "To",
                      "value": "louislanganay@gmail.com",
                      "required": true
                    },
                    {
                      "id": "subject",
                      "type": "string",
                      "description": "Subject",
                      "value": "New push to %branch_name% branch",
                      "required": true
                    },
                    {
                      "id": "body",
                      "type": "string",
                      "description": "Body",
                      "value": "A new push was made to %branch_name% branch\n\nCommit: %commit_message%\nAuthor: %author_name%\nRepository: %repository_name%",
                      "required": true
                    }
                  ]
                }
              ],
              "variables": [
                {
                  "id": "branch_name",
                  "name": "%branch_name%",
                  "description": "The name of the branch",
                  "type": "string",
                  "value": null
                },
                {
                  "id": "commit_msg",
                  "name": "%commit_message%",
                  "description": "The commit message",
                  "type": "string",
                  "value": null
                },
                {
                  "id": "author",
                  "name": "%author_name%",
                  "description": "The author of the commit",
                  "type": "string",
                  "value": null
                },
                {
                  "id": "repo_name",
                  "name": "%repository_name%",
                  "description": "The name of the repository",
                  "type": "string",
                  "value": null
                }
              ],
              "nodes": []
            }
          ]
        }
      ]
    },
    {
      "id": "slack-message-workflow-2",
      "name": "Slack Message Notifications",
      "description": "Send notifications to Slack when a new message is posted",
      "image": "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
      "enabled": false,
      "nodes": [
        {
          "id": "slack-message-reaction",
          "type": "reaction",
          "name": "Slack Message Event",
          "description": "Triggers when a new message is posted in a Slack channel",
          "service": {
            "id": "slack",
            "name": "Slack",
            "description": "Slack Integration Service"
          },
          "fieldGroups": [
            {
              "id": "channel-config",
              "name": "Channel Configuration",
              "description": "Configure the Slack channel to watch",
              "type": "channel",
              "fields": [
                {
                  "id": "channel",
                  "type": "string",
                  "description": "Channel Name",
                  "value": "general",
                  "required": true
                }
              ]
            }
          ],
          "nodes": [
            {
              "id": "send-email-on-slack-message",
              "type": "action",
              "name": "Send Email Notification",
              "description": "Send email when a new message is posted in Slack",
              "service": {
                "id": "gmail",
                "name": "Gmail",
                "description": "Gmail Integration Service"
              },
              "conditions": [],
              "fieldGroups": [
                {
                  "id": "email-config",
                  "name": "Email Configuration",
                  "description": "Configure email settings",
                  "type": "email",
                  "fields": [
                    {
                      "id": "to",
                      "type": "string",
                      "description": "To",
                      "value": "example@example.com",
                      "required": true
                    },
                    {
                      "id": "subject",
                      "type": "string",
                      "description": "Subject",
                      "value": "New Slack Message in %channel_name%",
                      "required": true
                    },
                    {
                      "id": "body",
                      "type": "string",
                      "description": "Body",
                      "value": "A new message was posted in %channel_name% channel\n\nMessage: %message_content%\nAuthor: %author_name%",
                      "required": true
                    }
                  ]
                }
              ],
              "variables": [
                {
                  "id": "channel_name",
                  "name": "%channel_name%",
                  "description": "The name of the Slack channel",
                  "type": "string",
                  "value": null
                },
                {
                  "id": "message_content",
                  "name": "%message_content%",
                  "description": "The content of the Slack message",
                  "type": "string",
                  "value": null
                },
                {
                  "id": "author",
                  "name": "%author_name%",
                  "description": "The author of the Slack message",
                  "type": "string",
                  "value": null
                }
              ],
              "nodes": []
            }
          ]
        }
      ]
    }
  ];
};

export const updateWorkflow = async (id: string, data: Partial<Workflow>) => {
  const response = await axios.patch<Workflow>(`${import.meta.env.VITE_API_URL}/workflows/${id}`, data, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });
  return response.data;
};

export const deleteWorkflow = async (id: string) => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/workflows/${id}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });
  return response.data;
};

export const getWorkflow = async (id: string, token: string): Promise<getWorkflowResponse> => {
  const response = await axios.get<getWorkflowResponse>(`${import.meta.env.VITE_API_URL}/workflows/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get workflow');
  }

  return response.data;
};
