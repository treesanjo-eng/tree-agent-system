export class DailyReportService {
    constructor() { }

    async processInput(input: string): Promise<string> {
        // 日報処理のフェーズ1: 入力をパース
        // 将来ここにLLMによる要約や集計ロジックを注入する
        console.log(`Processing daily report: ${input}`);
        return `日報を受領しました。順次処理いたします。: ${input.substring(0, 20)}...`;
    }
}

export const dailyReportService = new DailyReportService();
