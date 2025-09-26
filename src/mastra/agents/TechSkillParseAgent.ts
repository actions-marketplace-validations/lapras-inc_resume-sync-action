import { Agent } from "@mastra/core";
import { RawTechSkillSchema } from "../../types";
import { selectLLMModel } from "../../utils/llmSelector";

/**
 * 職務経歴書からTech Skillを抽出するエージェント
 */
export const techSkillParseAgent = new Agent({
  name: "tech-skill-parser",
  instructions: `あなたは職務経歴書からTech Skillを抽出する専門のアシスタントです。

以下の観点から「Tech Skill」を抽出してください：

抽出する内容
- 使用したことがある技術（言語、フレームワーク、ツール、データベース、インフラ、その他スキル）
- それぞれの使用経験年数を表す数値

重要:
- 職務経歴書に記載されていない内容は含めない
- 抽出する内容の記載がない場合は空文字列を返す
- 一年未満の場合は少数で表す（半年は0.5年）
`,
  model: () => selectLLMModel(),
});

/**
 * 職務経歴書からTech Skillを抽出する
 */
export async function parseTechSkill(resumeContent: string) {
  const result = await techSkillParseAgent.generate(
    `以下の職務経歴書からTech Skillを抽出してください。

# 職務経歴書
${resumeContent}`,
    {
      output: RawTechSkillSchema,
      maxRetries: 3,
    },
  );

  return result.object;
}
