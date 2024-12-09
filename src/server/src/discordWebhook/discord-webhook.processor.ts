import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as https from 'https';

@Processor('discord-webhook') // Associe ce processeur à la queue 'discord-webhook'
export class DiscordWebhookProcessor extends WorkerHost {
    private readonly webhookUrl =
        'https://discordapp.com/api/webhooks/1313068186039619594/qLONNl4Skl1qT73WQvfi-zPvhWLFftq8YJZ-jeLinuSSqNAs2XN9x6uKmx_jX5Zz1_69';

    // Cette méthode est appelée automatiquement par BullMQ pour chaque tâche
    async process(job: Job<{ content: string }>): Promise<void> {
        const { content } = job.data;
        console.log(`Sending message: ${content}`);

        try {
            await this.sendDiscordMessage(content);
            console.log(`Message sent: ${content}`);
        } catch (error) {
            console.error('Failed to send message:', error.message);
        }
    }

    private async sendDiscordMessage(content: string): Promise<void> {
        const url = new URL(this.webhookUrl);

        const postData = JSON.stringify({ content });

        console.log('postData:', postData);

        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        return new Promise((resolve, reject) => {
            console.log('Sending request:', options);
            const req = https.request(options, (res) => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                } else {
                    reject(
                        new Error(`Failed with status code: ${res.statusCode}`),
                    );
                }
            });

            req.on('error', (e) => {
                reject(e);
            });

            req.write(postData);
            req.end();
        });
    }

    // Écoute des événements BullMQ (optionnel)
    @OnWorkerEvent('completed')
    onJobCompleted(job: Job) {
        console.log(`Job ${job.id} has been completed successfully.`);
    }

    @OnWorkerEvent('failed')
    onJobFailed(job: Job, error: Error) {
        console.error(`Job ${job.id} failed: ${error.message}`);
    }
}
