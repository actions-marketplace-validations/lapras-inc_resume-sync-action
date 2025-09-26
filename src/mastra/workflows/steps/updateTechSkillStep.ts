import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  ExperienceApiParamsListSchema,
  JobSummarySchema,
  LaprasStateSchema,
  TechSkillApiParamsListSchema,
  WantToDoSchema,
} from "../../../types";
import { updateTechSkill as updateTechSkillApi } from "../../../utils/laprasApiClient";

/**
 * テックスキルを更新するステップ
 */
export const updateTechSkillStep = createStep({
  id: "update-tech-skill",
  description: "Update tech skill in LAPRAS",
  inputSchema: z.object({
    originalState: LaprasStateSchema,
    experienceParams: ExperienceApiParamsListSchema,
    jobSummary: JobSummarySchema,
    wantToDo: WantToDoSchema,
    techSkillParams: TechSkillApiParamsListSchema,
  }),
  outputSchema: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();

    logger?.info("Updating tech skill...");
    try {
      await updateTechSkillApi(inputData.techSkillParams);
      logger?.info("Tech skill updated successfully");
      return { success: true };
    } catch (error) {
      const errorMsg = `Failed to update tech skill: ${error instanceof Error ? error.message : String(error)}`;
      logger?.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },
});
