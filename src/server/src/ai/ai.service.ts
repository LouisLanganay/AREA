import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateWorkflowDto } from './dto/generate-workflow.dto';
import OpenAI from 'openai';
import { ServiceRegister } from 'src/service/register.service';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private serviceRegister: ServiceRegister
  ) {}

  async generateWorkflow(generateWorkflowDto: GenerateWorkflowDto) {
    const { openaiToken, prompt } = generateWorkflowDto;

    try {
      const openai = new OpenAI({
        apiKey: openaiToken,
      });

      // Récupérer la liste des services disponibles
      const availableServices = this.serviceRegister.getAllServices();
      console.log(availableServices);
      // Modifier le message système pour inclure les services disponibles
      const systemMessage = `Tu es un assistant spécialisé dans la création de workflows d'automatisation.
      Tu dois générer un workflow basé sur la description de l'utilisateur en utilisant UNIQUEMENT les services et actions/réactions disponibles ci-dessous:

      ${JSON.stringify(availableServices, null, 2)}

      Le format de réponse attendu doit imperativement etre un une string contenant un json de ce format, sans aucun autres caractères (JSON):
      {
        "name": "Nom court et descriptif du workflow",
        "description": "Description détaillée du workflow",
        "enabled": true,
        "triggers": [
          {
            "type": "action",
            "id_node": "dateReached",
            "name": "Date Reached",
            "description": "Trigger when a specific date and time is reached.",
            "serviceName": "timer",
            "fieldGroups": [
              {
                "id": "dateDetails",
                "name": "Date Details",
                "description": "Details of the target date and time",
                "type": "group",
                "fields": [
                  {
                    "id": "targetDate",
                    "type": "string",
                    "required": true,
                    "description": "The target date and time in ISO format (e.g., '2025-01-03T15:00:00Z').",
                    "value": "2025-01-03T15:00:00Z"
                  }
                ]
              }
            ],
            "children": []
          }
        ],
        "image": "https://example.com/workflow.png"
      }`;

      // Faire la requête à OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      });

      // Extraire et parser la réponse
      const workflowString = completion.choices[0].message.content;
      console.log("workflowString", workflowString);
      const workflow = JSON.parse(workflowString);
      console.log("workflow", workflow);

      // Valider la structure minimale du workflow
      if (!workflow.name || !workflow.description || !Array.isArray(workflow.triggers)) {
        throw new BadRequestException('Invalid workflow structure generated');
      }

      return {
        success: true,
        message: 'AI_WORKFLOW_GENERATION_SUCCESS',
        data: {
          prompt,
          workflow
        }
      };

    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException({
          success: false,
          message: 'AI_WORKFLOW_SYNTAX_ERROR_GENERATION',
          error: error.message
        });
      }

      throw new BadRequestException({
        success: false,
        message: 'AI_WORKFLOW_GENERATION_ERROR',
        error: error.message
      });
    }
  }

  async updateWorkflow(updateWorkflowDto: UpdateWorkflowDto) {
    const { workflow, openaiToken, prompt } = updateWorkflowDto;

    console.log(workflow, openaiToken, prompt);

    try {
      const openai = new OpenAI({
        apiKey: openaiToken,
      });

      const availableServices = this.serviceRegister.getAllServices();

      const systemMessage = `Tu es un assistant spécialisé dans la modification de workflows d'automatisation.
      Tu dois modifier le workflow existant basé sur la description de l'utilisateur en utilisant UNIQUEMENT les services et actions/réactions disponibles ci-dessous:

      ${JSON.stringify(availableServices, null, 2)}

      Voici le workflow actuel à modifier:
      ${JSON.stringify(workflow, null, 2)}

      Le format de réponse attendu doit imperativement être une string contenant un json du même format que le workflow actuel, sans aucun autres caractères (JSON).
      Conserve la structure existante et modifie uniquement les parties nécessaires selon la demande de l'utilisateur.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      });

      const workflowString = completion.choices[0].message.content;
      const workflowUpdated = JSON.parse(workflowString);
      console.log("reeeeeeeeeeeeeeeesult", workflowUpdated);
      console.log("workflow", workflowUpdated.triggers[0].fieldGroups[0]?.fields[0]);

      // Valider la structure minimale du workflow
      if (!workflowUpdated.name || !Array.isArray(workflowUpdated.triggers)) {
        throw new BadRequestException('Invalid workflow structure generated');
      }

      return {
        success: true,
        message: 'AI_WORKFLOW_UPDATE_SUCCESS',
        data: {
          prompt,
          workflow: workflowUpdated
        }
      };

    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException({
          success: false,
          message: 'AI_WORKFLOW_SYNTAX_ERROR_UPDATE',
          error: error.message
        });
      }

      throw new BadRequestException({
        success: false,
        message: 'AI_WORKFLOW_UPDATE_ERROR',
        error: error.message
      });
    }
  }
}