// healthService.ts
import { HeatlhStatus } from "../types/Health";

export const status = (): HeatlhStatus => {
  const healthStatus: HeatlhStatus = {
    status: "UP",
    version: "v1",
    releaseId: "0.1.0",
    description: "Health of chunker service.",
  };

  return healthStatus;
};
