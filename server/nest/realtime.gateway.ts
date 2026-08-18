import { OnModuleDestroy } from "@nestjs/common";
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { DatabaseService } from "./database.service.js";

@WebSocketGateway({ namespace: "/realtime", cors: { origin: true, credentials: true } })
export class RealtimeGateway implements OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private poller?: NodeJS.Timeout;
  private dataVersion: string | null = null;

  constructor(private readonly database: DatabaseService) {}

  afterInit() {
    void this.startPolling();
  }

  async onModuleDestroy() {
    if (this.poller) clearInterval(this.poller);
  }

  @SubscribeMessage("dashboard:subscribe")
  subscribe(@ConnectedSocket() client: Socket) {
    client.emit("dashboard:status", { connected: true, data_version: this.dataVersion, transport: "websocket" });
  }

  private async startPolling() {
    this.dataVersion = await this.readDataVersion();
    this.poller = setInterval(() => void this.publishIfChanged(), 2000);
  }

  private async publishIfChanged() {
    try {
      const nextVersion = await this.readDataVersion();
      if (nextVersion === this.dataVersion) return;
      this.dataVersion = nextVersion;
      this.server.emit("dashboard:refresh", {
        data_version: nextVersion,
        sources: ["asset_snapshot", "utility_snapshot", "chemical_transaction", "alarm_event", "batch_process_run"],
      });
    } catch {
      // Kegagalan polling tidak menghentikan gateway; siklus berikutnya akan mencoba ulang.
    }
  }

  private async readDataVersion() {
    const result = await this.database.query<{ data_version: Date | string | null }>(`
      SELECT MAX(changed_at) AS data_version
      FROM (
        SELECT updated_at AS changed_at FROM asset
        UNION ALL SELECT updated_at FROM asset_snapshot
        UNION ALL SELECT updated_at FROM utility_snapshot
        UNION ALL SELECT created_at FROM chemical_transaction
        UNION ALL SELECT created_at FROM alarm_event
        UNION ALL SELECT updated_at FROM batch_process_run
      ) AS dashboard_changes
    `);
    const value = result.rows[0]?.data_version;
    if (!value) return null;
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
