export interface ApiResponse<T> {
  data?: T;
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
