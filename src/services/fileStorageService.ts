import {
  CompleteMultipartUploadCommand,
  CompleteMultipartUploadCommandInput,
  CompleteMultipartUploadOutput,
  CreateMultipartUploadCommand,
  CreateMultipartUploadCommandInput,
  CreateMultipartUploadOutput,
  S3Client,
  UploadPartCommand,
  UploadPartCommandInput,
  UploadPartCommandOutput,
} from "@aws-sdk/client-s3";
import { FileUplaodResult, FileUploadParts } from "../types/Files";

export class FileStorage {
  private s3Client: S3Client;

  constructor(private readonly bucketName: string) {
    this.s3Client = new S3Client({});
  }

  private async createMultipartUpload(
    key: string,
  ): Promise<CreateMultipartUploadOutput> {
    const input: CreateMultipartUploadCommandInput = {
      Bucket: this.bucketName,
      Key: key,
    };

    const command = new CreateMultipartUploadCommand(input);
    const response = await this.s3Client.send(command);

    return response;
  }

  private async completeMultipartUpload(
    key: string,
    parts: FileUploadParts[],
    uploadId: string,
  ): Promise<CompleteMultipartUploadOutput> {
    const input: CompleteMultipartUploadCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      MultipartUpload: { Parts: parts },
      UploadId: uploadId,
    };

    const command = new CompleteMultipartUploadCommand(input);
    const response = await this.s3Client.send(command);

    return response;
  }

  private async uploadFilePart(
    body: Buffer,
    key: string,
    partNumber: number,
    uploadId: string,
  ): Promise<UploadPartCommandOutput> {
    const input: UploadPartCommandInput = {
      Body: body,
      Bucket: this.bucketName,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
    };

    const command = new UploadPartCommand(input);
    const response = await this.s3Client.send(command);

    return response;
  }

  private async uploadFileParts(
    key: string,
    uploadId: string,
    fileData: Buffer,
  ): Promise<FileUploadParts[]> {
    const chunkSize = 5 * 1024 * 1024; // 5MB chunk size
    const totalParts = Math.ceil(fileData.length / chunkSize);
    const uploadPartResults: FileUploadParts[] = [];

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(start + chunkSize, fileData.length);
      const partData = fileData.slice(start, end);

      const response = await this.uploadFilePart(
        partData,
        key,
        partNumber,
        uploadId,
      );

      if (!response.ETag) {
        throw new Error("S3 upload part did not return an eTag.");
      }

      uploadPartResults.push({ PartNumber: partNumber, ETag: response.ETag });
    }

    return uploadPartResults;
  }

  public async createFile(
    fileData: Buffer,
    filePath: string,
  ): Promise<FileUplaodResult> {
    const multipartUpload = await this.createMultipartUpload(filePath);

    if (!multipartUpload.Key || !multipartUpload.UploadId) {
      throw new Error("Bucket, Key, or UploadId is null or undefined.");
    }

    const { Key, UploadId } = multipartUpload;

    const parts = await this.uploadFileParts(Key, UploadId, fileData);
    const response = await this.completeMultipartUpload(Key, parts, UploadId);

    if (!response.ETag || !response.Location || !response.VersionId) {
      throw new Error(
        "Complete Multi part upload did not have correct meta data.",
      );
    }

    const fileResponse: FileUplaodResult = {
      eTag: response.ETag,
      location: response.Location,
      versionId: response.VersionId,
    };

    return fileResponse;
  }
}
