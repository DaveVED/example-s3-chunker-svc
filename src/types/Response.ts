import { HeatlhStatus } from "./Health";

export interface ApiResponse {
  data?: ApiData[] | HeatlhStatus;
  errors?: ApiError[];
}

export interface ApiError {
  source?: { pointer: string };
  title?: string;
  detail: string;
}

export interface ApiData {
  type: string;
  id: string;
}

export type CustomErrorContent = {
  message: string;
  context?: { [key: string]: any };
};
