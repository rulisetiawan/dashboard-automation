import { OnModuleDestroy } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { DatabaseService } from "./database.service.js";

@WebSocketGateway({ namespace: "/realtime", cors: { origin: true, credentials: true } })
export class RealtimeGateway implements OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private poller?: NodeJS.Timeout;
  private dataVersion: string | null = null;
  private dataVersions: Record<string, string | null> = {};
  private tagLatestVersion: string | null = null;
  private communicationStates: Record<string, Record<string, unknown>> = {};

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

  @SubscribeMessage("asset:subscribe")
  async subscribeAsset(@ConnectedSocket() client: Socket, @MessageBody() payload?: { asset_id?: string }) {
    const assetId = String(payload?.asset_id || "").trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,64}$/.test(assetId)) {
      client.emit("asset:subscription-error", { message: "asset_id tidak valid" });
      return;
    }
    const asset = await this.database.query("SELECT asset_id FROM asset WHERE asset_id = $1 AND active = TRUE", [assetId]);
    if (!asset.rows[0]) {
      client.emit("asset:subscription-error", { asset_id: assetId, message: "asset tidak ditemukan" });
      return;
    }
    for (const room of client.rooms) {
      if (room.startsWith("asset:") && room !== `asset:${assetId}`) await client.leave(room);
    }
    await client.join(`asset:${assetId}`);
    client.emit("asset:subscribed", { asset_id: assetId, room: `asset:${assetId}`, snapshot_version: this.tagLatestVersion });
  }

  publishAlarm(lifecycle: "active" | "cleared", alarm: Record<string, unknown>) {
    this.server.emit(`alarm:${lifecycle}`, alarm);
    this.server.emit("dashboard:refresh", {
      data_version: new Date().toISOString(),
      sources: ["alarm_event", "alarm_rule_state"],
    });
  }

  publishDataRefresh(sources: string[]) {
    this.server?.emit("dashboard:refresh", {
      data_version: new Date().toISOString(),
      sources,
    });
  }

  async publishInstrumentTags(tagCodes: string[]) {
    if (!this.server || !tagCodes.length) return;
    const result = await this.database.query(`
      SELECT tag_code, asset_id, element_code, parameter_code, signal_role, engineering_unit,
             value_number, value_text, boolean_value, effective_quality, semantic_state,
             stale_after_seconds, source_ts, updated_at, freshness_mode,
             communication_quality, heartbeat_source_ts
      FROM instrument_state
      WHERE active = TRUE AND tag_code = ANY($1::text[])
      ORDER BY asset_id, element_code, parameter_code, tag_code
    `, [tagCodes]);
    const byAsset = new Map<string, Record<string, unknown>[]>();
    for (const row of result.rows) {
      const states = byAsset.get(row.asset_id) || [];
      states.push(this.instrumentStatePayload(row));
      byAsset.set(row.asset_id, states);
    }
    for (const [assetId, states] of byAsset) {
      this.server.to(`asset:${assetId}`).emit("instrument:delta", {
        asset_id: assetId,
        snapshot_version: new Date().toISOString(),
        states,
      });
    }
  }

  private async startPolling() {
    const [dataVersions, tagLatestVersion, communicationStates] = await Promise.all([
      this.readDataVersions(),
      this.readTagLatestVersion(),
      this.readCommunicationStates(),
    ]);
    this.dataVersions = dataVersions;
    this.dataVersion = this.latestVersion(dataVersions);
    this.tagLatestVersion = tagLatestVersion;
    this.communicationStates = communicationStates;
    this.poller = setInterval(() => void this.publishIfChanged(), 2000);
  }

  private async publishIfChanged() {
    try {
      const [nextVersions, signalChanges, nextCommunicationStates] = await Promise.all([
        this.readDataVersions(),
        this.readInstrumentChanges(this.tagLatestVersion),
        this.readCommunicationStates(),
      ]);
      const changedSources = Object.keys(nextVersions).filter((source) => nextVersions[source] !== this.dataVersions[source]);
      if (changedSources.length > 0) {
        this.dataVersions = nextVersions;
        this.dataVersion = this.latestVersion(nextVersions);
        this.server.emit("dashboard:refresh", {
          data_version: this.dataVersion,
          sources: changedSources,
        });
      }
      const communicationUpdatedAssets = new Set(
        Object.keys(nextCommunicationStates).filter(
          (assetId) => JSON.stringify(nextCommunicationStates[assetId]) !== JSON.stringify(this.communicationStates[assetId]),
        ),
      );
      const communicationChangedAssets = new Set(
        [...communicationUpdatedAssets].filter((assetId) => {
          const previous = this.communicationStates[assetId];
          const next = nextCommunicationStates[assetId];
          return previous?.connectionStatus !== next?.connectionStatus || previous?.connected !== next?.connected;
        }),
      );
      this.communicationStates = nextCommunicationStates;

      for (const assetId of communicationUpdatedAssets) {
        this.server.emit("asset:communication", nextCommunicationStates[assetId]);
      }

      if (signalChanges.length > 0 || communicationChangedAssets.size > 0) {
        if (signalChanges.length > 0) {
        this.tagLatestVersion = new Date(signalChanges[signalChanges.length - 1].updated_at).toISOString();
        }
        const byAsset = new Map<string, Record<string, unknown>[]>();
        for (const row of signalChanges) {
          if (communicationChangedAssets.has(row.asset_id)) continue;
          const state = this.instrumentStatePayload(row);
          const states = byAsset.get(row.asset_id) || [];
          states.push(state);
          byAsset.set(row.asset_id, states);
        }
        for (const assetId of communicationChangedAssets) {
          const rows = await this.readAssetInstrumentStates(assetId);
          byAsset.set(assetId, rows.map((row) => this.instrumentStatePayload(row)));
        }
        for (const [assetId, states] of byAsset) {
          this.server.to(`asset:${assetId}`).emit("instrument:delta", {
            asset_id: assetId,
            snapshot_version: this.tagLatestVersion,
            states,
          });
        }
      }
    } catch {
      // Kegagalan polling tidak menghentikan gateway; siklus berikutnya akan mencoba ulang.
    }
  }

  private async readTagLatestVersion() {
    const result = await this.database.query<{ data_version: Date | string | null }>("SELECT MAX(updated_at) AS data_version FROM tag_latest");
    const value = result.rows[0]?.data_version;
    if (!value) return null;
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }

  private async readInstrumentChanges(after: string | null) {
    if (!after) return [];
    const result = await this.database.query(`
      SELECT tag_code, asset_id, element_code, parameter_code, signal_role, engineering_unit,
             value_number, value_text, boolean_value, effective_quality, semantic_state,
             stale_after_seconds, source_ts, updated_at, freshness_mode,
             communication_quality, heartbeat_source_ts
      FROM instrument_state
      WHERE active = TRUE AND updated_at > $1::timestamptz
      ORDER BY updated_at, tag_code
    `, [after]);
    return result.rows;
  }

  private async readAssetInstrumentStates(assetId: string) {
    const result = await this.database.query(`
      SELECT tag_code, asset_id, element_code, parameter_code, signal_role, engineering_unit,
             value_number, value_text, boolean_value, effective_quality, semantic_state,
             stale_after_seconds, source_ts, updated_at, freshness_mode,
             communication_quality, heartbeat_source_ts
      FROM instrument_state
      WHERE active = TRUE AND asset_id = $1
      ORDER BY element_code, parameter_code, tag_code
    `, [assetId]);
    return result.rows;
  }

  private instrumentStatePayload(row: Record<string, any>) {
    return {
      tagCode: row.tag_code,
      elementCode: row.element_code,
      parameterCode: row.parameter_code,
      signalRole: row.signal_role,
      engineeringUnit: row.engineering_unit,
      value: row.value_number == null ? row.value_text : Number(row.value_number),
      booleanValue: row.boolean_value,
      quality: row.effective_quality,
      semanticState: row.semantic_state,
      staleAfterSeconds: Number(row.stale_after_seconds),
      sourceTs: row.source_ts,
      updatedAt: row.updated_at,
      freshnessMode: row.freshness_mode,
      communicationQuality: row.communication_quality,
      heartbeatSourceTs: row.heartbeat_source_ts,
    };
  }

  private async readCommunicationStates() {
    const result = await this.database.query(`
      SELECT asset_id, heartbeat_tag_code, heartbeat_value, effective_quality, online,
             stale_after_seconds, source_ts
      FROM asset_communication_state
      ORDER BY asset_id
    `);
    return Object.fromEntries(result.rows.map((row) => [
      row.asset_id,
      {
        assetId: row.asset_id,
        heartbeatTagCode: row.heartbeat_tag_code,
        heartbeatValue: row.heartbeat_value,
        connectionStatus: row.effective_quality,
        connected: row.online === true,
        heartbeatStaleAfterSeconds: Number(row.stale_after_seconds || 30),
        heartbeatSourceTs: row.source_ts,
      },
    ]));
  }

  private latestVersion(versions: Record<string, string | null>) {
    return Object.values(versions).filter((value): value is string => Boolean(value)).sort().at(-1) || null;
  }

  private async readDataVersions() {
    const knownSources = ["asset_snapshot", "utility_snapshot", "chemical_transaction", "alarm_event", "production_batch", "batch_process_run", "process_deviation_rule", "process_target_execution", "process_setpoint_change_event", "process_deviation_event"];
    const result = await this.database.query<{ source: string; data_version: Date | string | null }>(`
      SELECT source, MAX(changed_at) AS data_version
      FROM (
        SELECT 'asset_snapshot'::text AS source, updated_at AS changed_at FROM asset
        UNION ALL SELECT 'asset_snapshot', updated_at FROM asset_snapshot
        UNION ALL SELECT 'utility_snapshot', updated_at FROM utility_snapshot
        UNION ALL SELECT 'chemical_transaction', created_at FROM chemical_transaction
        UNION ALL SELECT 'alarm_event', GREATEST(created_at, COALESCE(cleared_at, created_at), COALESCE(acknowledged_at, created_at)) FROM alarm_event
        UNION ALL SELECT 'production_batch', updated_at FROM production_batch
        UNION ALL SELECT 'batch_process_run', updated_at FROM batch_process_run
        UNION ALL SELECT 'process_deviation_rule', updated_at FROM process_deviation_rule
        UNION ALL SELECT 'process_target_execution', updated_at FROM process_target_execution
        UNION ALL SELECT 'process_setpoint_change_event', created_at FROM process_setpoint_change_event
        UNION ALL SELECT 'process_deviation_event', updated_at FROM process_deviation_event
      ) AS dashboard_changes
      GROUP BY source
    `);
    const versions = Object.fromEntries(knownSources.map((source) => [source, null])) as Record<string, string | null>;
    for (const row of result.rows) {
      if (!row.data_version) continue;
      versions[row.source] = row.data_version instanceof Date ? row.data_version.toISOString() : new Date(row.data_version).toISOString();
    }
    return versions;
  }
}
