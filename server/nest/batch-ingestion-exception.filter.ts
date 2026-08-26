import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Response } from "express";

const postgresErrors: Record<string, { status: number; error: string; message: string }> = {
  "22P02": { status: 400, error: "Invalid database value", message: "Format UUID, angka, atau timestamp tidak sesuai." },
  "23502": { status: 400, error: "Missing required value", message: "Ada field wajib database yang belum diisi." },
  "23503": { status: 404, error: "Referenced data not found", message: "Batch, asset, atau reference terkait belum terdaftar." },
  "23505": { status: 409, error: "Duplicate identifier", message: "Identifier sudah dipakai oleh record lain. Gunakan identifier yang sama untuk update record yang sama." },
  "23514": { status: 400, error: "Constraint violation", message: "Nilai payload melanggar aturan database." },
};

@Catch()
export class BatchIngestionExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const detail = exception.getResponse();
      response.status(status).json(typeof detail === "string" ? { statusCode: status, message: detail } : detail);
      return;
    }
    const requestId = randomUUID();
    const databaseCode = String(exception?.code || "UNEXPECTED_ERROR");
    const mapped = postgresErrors[databaseCode] || {
      status: 500,
      error: "Batch ingestion failed",
      message: "Request tidak dapat diproses. Periksa format payload dan server log menggunakan request_id.",
    };
    console.error(`[BatchIngestion:${requestId}]`, {
      code: databaseCode,
      message: exception?.message,
      detail: exception?.detail,
      constraint: exception?.constraint,
    });
    response.status(mapped.status).json({
      statusCode: mapped.status,
      error: mapped.error,
      message: mapped.message,
      request_id: requestId,
      database_code: databaseCode,
      ...(process.env.NODE_ENV === "production" ? {} : { diagnostic: exception?.message || "Unknown error" }),
    });
  }
}

