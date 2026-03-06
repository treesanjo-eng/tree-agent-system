import { queryRecentReports } from '../mcp/notion';
import { config } from '../config/index';

/**
 * Periodically or manually fetch recent Notion reports and 
 * perform actions based on them (e.g., summarize and notify CEO)
 */
export const syncNotionReports = async () => {
    if (!config.notion.databaseId) {
        console.warn('Notion database ID is not configured. Skipping sync.');
        return;
    }

    console.log('Fetching recent daily reports from Notion...');
    const reports = await queryRecentReports(config.notion.databaseId);

    // Here we would typically process these reports,
    // e.g. mapping them to our internal data structure, 
    // generating an LLM summary, and sending it via LINE or Telegram.

    console.log(`Successfully fetched ${reports.length} reports from Notion.`);
    return reports;
};
