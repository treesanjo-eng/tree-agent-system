import { Client as NotionClient } from '@notionhq/client';
import { config } from '../config/index';

// Notion Client instance
export const notionClient = new NotionClient({
    auth: config.notion.botToken,
});

/**
 * Queries a database in Notion to get recent daily reports.
 * Used for fetching Notion updates.
 * @param databaseId The ID of the Notion database to query
 */
export const queryRecentReports = async (databaseId: string) => {
    try {
        // @ts-ignore: type definition for query is sometimes missing depending on the version
        const response = await (notionClient.databases as any).query({
            database_id: databaseId,
            sorts: [
                {
                    timestamp: 'created_time',
                    direction: 'descending',
                },
            ],
            // We can add filters here, to e.g. only get reports from today
            // filter: {
            //     property: 'Date',
            //     date: {
            //         equals: new Date().toISOString().split('T')[0]
            //     }
            // }
        });
        return response.results;
    } catch (error) {
        console.error('Failed to query Notion database:', error);
        return [];
    }
};
