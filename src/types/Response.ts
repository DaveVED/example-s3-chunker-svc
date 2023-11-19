import { HeatlhStatus } from "./Health";

export interface ApiResponse {
  data?: ApiData[] | HeatlhStatus;
  errors?: CustomErrorContent[];
}

export interface ApiData {
  type: string;
  id: string;
}

export type CustomErrorContent = {
  message: string;
  context?: { [key: string]: string };
};
