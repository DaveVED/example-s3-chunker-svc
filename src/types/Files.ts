export interface FileUploadResult {
  eTag: string;
  location: string;
  versionId: string;
}

export type FileUploadParts = {
  PartNumber: number;
  ETag: string;
};

export interface ValidatedFileStorageInput {
  user: string;
  formatedFilePath: string;
  originalName: string;
  buffer: Buffer;
}
