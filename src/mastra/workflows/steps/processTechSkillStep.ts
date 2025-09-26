import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { type RawTechSkill, TechSkillApiParamsListSchema } from "../../../types";
import { parseTechSkill } from "../../agents/TechSkillParseAgent";
import { getTechSkillMaster } from "../../../utils/laprasApiClient";


const formatName = (name: string) => {
  return name.replace(/\s+/g, "").toLowerCase();
};

const getExperienceYearsId = (experienceYears: number): number => {
  // tech skill経験年数と経験年数idのマッピング
  if (experienceYears < 1) return 0;
  if (experienceYears < 2) return 1;
  if (experienceYears < 3) return 2;
  if (experienceYears < 5) return 3;
  if (experienceYears < 10) return 5;
  return 10;
};
/**
 * 生のテックスキルデータをLAPRAS API用のパラメータ形式に変換する
 * @param rawTechSkill - エージェントによってパースされた生のテックスキルデータ
 * @returns LAPRAS APIに送信可能な形式のテックスキルパラメータ
 */
const buildParams = async (rawTechSkill: RawTechSkill) => {
  const techSkillMaster = await getTechSkillMaster();
  
  const techSkillMasterMap = techSkillMaster.tech_skill_list.reduce((acc, skill) => {
    acc[formatName(skill.name)] = skill.id;
    return acc;
  }, {} as Record<string, number>);

  // 生のテックスキルデータをAPI用の形式に変換
  const techSkills = rawTechSkill.tech_skills.reduce((acc, skill) => {
    const id = techSkillMasterMap[formatName(skill.name)];
    // masterに存在しないスキルはスキップ
    if (!id) {
      return acc;
    }
    
    // API用のパラメータ形式で追加
    acc.push({
      tech_skill_id: id,
      years: getExperienceYearsId(skill.experience_years),
    });
    return acc;
  }, [] as { tech_skill_id: number, years: number }[]);

  return { tech_skill_list: techSkills };
};

/**
 * キャリア目標をパースしてバリデーションするステップ
 */
export const processTechSkillStep = createStep({
  id: "process-tech-skill",
  description: "Process and validate tech skill",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    techSkillParams: TechSkillApiParamsListSchema,
  }),
  execute: async ({ inputData }) => {
    const rawTechSkill = await parseTechSkill(`${inputData.resumeContent}`);
    const techSkillParams = await buildParams(rawTechSkill);
    return { techSkillParams };
  },
});
