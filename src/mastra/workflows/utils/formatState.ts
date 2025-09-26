import type { LaprasState } from "../../../types";
import { getTechSkillMaster } from "../../../utils/laprasApiClient";

const TECH_SKILL_EXPERIENCE_YEARS_LABEL_MAP: Record<number, string> = {
  0: "〜1年",
  1: "1〜2年",
  2: "2〜3年",
  3: "3〜5年",
  5: "5〜10年",
  10: "10年以上",
};

/**
 * LAPRAS状態をフォーマットして可読性の高い文字列に変換
 */
export async function formatState(state: LaprasState): Promise<string> {
  const experiences = state.experience_list
    .map((exp) => {
      // 期間のフォーマット
      const endDate = exp.end_year ? `${exp.end_year}/${exp.end_month || ""}` : "現在";
      const period = `${exp.start_year}/${exp.start_month} - ${endDate}`;

      // クライアントワークの場合の表示
      const clientInfo =
        exp.is_client_work && exp.client_company_name
          ? `\n**クライアント:** ${exp.client_company_name}`
          : "";

      // ポジション情報（複数ある場合の処理）
      const positionsList =
        exp.positions && exp.positions.length > 0
          ? exp.positions.map((pos) => `  - ${pos.job_position_name}`).join("\n")
          : null;

      // 説明文を改行で整形（句点で区切って箇条書き形式に）
      const descriptionFormatted = exp.description
        .split(/。/)
        .filter((line) => line.trim())
        .map((line) => `- ${line.trim()}。`)
        .join("\n");

      return `### ${exp.organization_name}
  **期間:** ${period}  
  ${positionsList ? `\n**職種:**\n${positionsList}\n` : ""}
  **役割・役職:** ${exp.position_name}${clientInfo}
  **プロジェクト・業務内容:**
  ${descriptionFormatted}`;
    })
    .join("\n\n---\n\n");

  let techSkills = "";
  try {
    const techSkillMaster = await getTechSkillMaster();
    const techSkillMasterMap = techSkillMaster.tech_skill_list.reduce(
      (acc, skill) => {
        acc[skill.id] = skill.name;
        return acc;
      },
      {} as Record<number, string>,
    );

    techSkills = state.tech_skill_list
      .map(
        (tech) =>
          `- ${techSkillMasterMap[tech.tech_skill_id]} (${TECH_SKILL_EXPERIENCE_YEARS_LABEL_MAP[tech.years]})`,
      )
      .join("\n");
  } catch (e) {
    console.error(e);
    techSkills = "（表示エラーが発生しました）";
  }

  return `# LAPRAS Career State

## 今後のキャリアでやりたいこと
${state.want_to_do}

## 職務要約
${state.job_summary}

## 職歴
${experiences}

## 経験技術・スキル・資格
${techSkills}
`;
}
