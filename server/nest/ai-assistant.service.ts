import { Injectable, Logger } from "@nestjs/common";
import fs from "node:fs";
import { DatabaseService } from "./database.service.js";

export interface ChatMessage {
  sender?: string;
  role?: string;
  text?: string;
  content?: string;
  message?: string;
}

export interface AiAssistContext {
  activePage?: string;
  role?: string;
  activeRole?: string;
  selectedMachine?: string;
  customRole?: string;
  customPlantProfile?: string;
  customPrompt?: string;
  selectedModel?: string;
  history?: ChatMessage[];
  liveTelemetryText?: string;
  activeAlarms?: Array<{ title?: string; message?: string; severity?: string; asset_id?: string }>;
}

export interface AiAssistPayload {
  message: string;
  context?: AiAssistContext;
}

export interface AiAssistResult {
  ok: boolean;
  online?: boolean;
  message?: string;
  reply?: string;
  source?: string;
  model?: string;
  host?: string;
  error?: string;
  timestamp?: string;
}

export interface AiStatusResult {
  ok: boolean;
  online: boolean;
  provider: string;
  engine: string;
  host?: string;
  activeModel: string;
  availableModels: string[];
  message?: string;
}

let lastWorkingMlxHost: string | null = null;

function isRunningInContainer(): boolean {
  return fs.existsSync("/.dockerenv") || process.env.RUNNING_IN_DOCKER === "true";
}

function resolveMlxHostCandidates(): string[] {
  const isDocker = isRunningInContainer();
  if (isDocker) {
    const list: string[] = [];
    if (lastWorkingMlxHost) list.push(lastWorkingMlxHost);
    if (process.env.MLX_HOST && !process.env.MLX_HOST.includes("127.0.0.1") && !process.env.MLX_HOST.includes("localhost")) {
      list.push(process.env.MLX_HOST);
    }
    list.push("http://host.orb.internal:8080", "http://host.docker.internal:8080", "http://127.0.0.1:8080");
    return [...new Set(list)];
  }
  if (process.env.MLX_HOST && !process.env.MLX_HOST.includes("host.docker.internal") && !process.env.MLX_HOST.includes("host.orb.internal")) {
    return [process.env.MLX_HOST];
  }
  return ["http://127.0.0.1:8080"];
}

function resolveOllamaHostCandidates(): string[] {
  const isDocker = isRunningInContainer();
  if (process.env.OLLAMA_HOST) {
    if (!isDocker && process.env.OLLAMA_HOST.includes("host.docker.internal")) {
      return ["http://127.0.0.1:11434"];
    }
    return [process.env.OLLAMA_HOST];
  }
  return isDocker
    ? ["http://host.orb.internal:11434", "http://host.docker.internal:11434", "http://127.0.0.1:11434"]
    : ["http://127.0.0.1:11434"];
}

const TELEMETRY_CACHE_TTL_MS = 5000;
const STATUS_CACHE_TTL_MS = 10000;
const OFFLINE_CACHE_TTL_MS = 1500;

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  private cachedTelemetrySnapshot: string | null = null;
  private lastTelemetryFetch = 0;

  private cachedStatus: AiStatusResult | null = null;
  private lastStatusCheckedAt = 0;

  constructor(private readonly database: DatabaseService) {}

  get mlxEnabled(): boolean {
    return process.env.MLX_ENABLED !== "false";
  }

  get mlxModel(): string {
    return process.env.MLX_MODEL || "mlx-community/Llama-3.2-1B-Instruct-4bit";
  }

  get mlxTimeoutMs(): number {
    return Number(process.env.MLX_TIMEOUT_MS || 25000);
  }

  get ollamaEnabled(): boolean {
    return process.env.OLLAMA_ENABLED === "true";
  }

  get ollamaModel(): string {
    return process.env.OLLAMA_MODEL || "qwen2.5:latest";
  }

  get ollamaTimeoutMs(): number {
    return Number(process.env.OLLAMA_TIMEOUT_MS || 180000);
  }

  async getLiveTelemetrySnapshot(): Promise<string> {
    const now = Date.now();
    if (this.cachedTelemetrySnapshot && now - this.lastTelemetryFetch < TELEMETRY_CACHE_TTL_MS) {
      return this.cachedTelemetrySnapshot;
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Telemetry DB snapshot timeout")), 2500)
      );

      const dbWork = async () => {
        const sections: string[] = [];

        // 1. Asset Process Summary
        try {
          const processSummary = await this.database.query(`
            SELECT a.process_type,
                   count(*)::int AS total,
                   count(*) FILTER (WHERE s.machine_state = 'running')::int AS running,
                   count(*) FILTER (WHERE s.machine_state = 'warning')::int AS warning,
                   count(*) FILTER (WHERE s.machine_state = 'fault')::int AS fault,
                   count(*) FILTER (WHERE s.machine_state = 'idle')::int AS idle,
                   count(*) FILTER (WHERE s.connected = TRUE OR comm.online = TRUE)::int AS connected
            FROM asset a
            LEFT JOIN asset_snapshot s ON s.asset_id = a.asset_id
            LEFT JOIN asset_communication_state comm ON comm.asset_id = a.asset_id
            WHERE a.active = TRUE
            GROUP BY a.process_type
            ORDER BY a.process_type
          `);

          if (processSummary.rows.length > 0) {
            sections.push("[RINGKASAN STATUS MESIN PRODUKSI]:");
            for (const row of processSummary.rows) {
              sections.push(
                `- ${String(row.process_type).toUpperCase()}: Total ${row.total} unit (Running: ${row.running}, Warning: ${row.warning}, Fault: ${row.fault}, Idle: ${row.idle}, Online: ${row.connected})`
              );
            }
          }
        } catch (err) {
          this.logger.debug(`Telemetry summary query: ${err}`);
        }

        // 2. Active Running Machines & Batches (Sample up to 15)
        try {
          const runningAssets = await this.database.query(`
            SELECT a.asset_id, a.process_type, a.display_name, s.machine_state,
                   COALESCE(r.batch_no, s.batch_no) AS batch_no,
                   COALESCE(r.progress_percent, s.progress_percent) AS progress_percent
            FROM asset a
            LEFT JOIN asset_snapshot s ON s.asset_id = a.asset_id
            LEFT JOIN LATERAL (
              SELECT run.batch_no, run.progress_percent
              FROM batch_process_run run
              WHERE run.asset_id = a.asset_id AND run.run_status IN ('RUNNING', 'HOLD')
              ORDER BY run.updated_at DESC
              LIMIT 1
            ) r ON TRUE
            WHERE a.active = TRUE AND s.machine_state IN ('running', 'warning', 'fault')
            ORDER BY a.process_type, a.asset_id
            LIMIT 15
          `);

          if (runningAssets.rows.length > 0) {
            sections.push("\n[MESIN AKTIF & BATCH BERJALAN]:");
            for (const r of runningAssets.rows) {
              const batchInfo = r.batch_no ? `Batch: ${r.batch_no} (${Number(r.progress_percent || 0).toFixed(0)}%)` : "Tanpa batch";
              sections.push(`- [${r.process_type}] ${r.asset_id} (${r.display_name}): Status=${String(r.machine_state).toUpperCase()}, ${batchInfo}`);
            }
          }
        } catch (err) {
          this.logger.debug(`Telemetry running machines query: ${err}`);
        }

        // 3. Key Instrument States (Latest Speeds, Temperatures, Loadcell, Widths)
        try {
          const instruments = await this.database.query(`
            SELECT process_type, asset_id, asset_name, parameter_code, signal_role,
                   engineering_unit, value_number, value_text, effective_quality
            FROM instrument_state
            WHERE active = TRUE AND effective_quality = 'GOOD'
              AND (
                parameter_code ILIKE '%TEMP%' OR
                parameter_code ILIKE '%SPEED%' OR
                parameter_code ILIKE '%OVERFEED%' OR
                parameter_code ILIKE '%LOADCELL%' OR
                parameter_code ILIKE '%WIDTH%' OR
                parameter_code ILIKE '%LEVEL%' OR
                parameter_code ILIKE '%OUTPUT%'
              )
            ORDER BY updated_at DESC
            LIMIT 30
          `);

          if (instruments.rows.length > 0) {
            sections.push("\n[PARAMETER INSTRUMEN & SENSOR TERKINI]:");
            for (const row of instruments.rows) {
              const valStr = row.value_number != null
                ? `${Number(row.value_number).toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${row.engineering_unit || ""}`.trim()
                : String(row.value_text || "-");
              sections.push(`- [${row.asset_id}] ${row.parameter_code || row.signal_role}: ${valStr}`);
            }
          }
        } catch (err) {
          this.logger.debug(`Telemetry instruments query: ${err}`);
        }

        // 4. Active Alarms
        try {
          const alarms = await this.database.query(`
            SELECT ae.alarm_code, ae.asset_id, ae.title, ae.severity, ae.occurred_at
            FROM alarm_event ae
            WHERE COALESCE(ae.event_state, 'ACTIVE') <> 'CLEARED'
            ORDER BY
              CASE UPPER(COALESCE(ae.severity, 'WARNING')) WHEN 'CRITICAL' THEN 0 WHEN 'WARNING' THEN 1 ELSE 2 END,
              ae.occurred_at DESC
            LIMIT 6
          `);

          if (alarms.rows.length > 0) {
            sections.push("\n[ALARM AKTIF SAAT INI]:");
            for (const al of alarms.rows) {
              sections.push(`- [${al.severity || "ALARM"}] ${al.asset_id || "SYSTEM"} - ${al.title || al.alarm_code}`);
            }
          } else {
            sections.push("\n[STATUS ALARM]: Tidak ada alarm aktif. Semua mesin beroperasi normal.");
          }
        } catch (err) {
          this.logger.debug(`Telemetry alarms query: ${err}`);
        }

        // 5. Solar Fueling Tanks
        try {
          const solarTanks = await this.database.query(`
            SELECT tank_code, tank_name, current_volume_liters, current_level_percent, quality
            FROM solar_tank_snapshot
            ORDER BY tank_code
          `);

          if (solarTanks.rows.length > 0) {
            sections.push("\n[STATUS TANGKI SOLAR FUELING]:");
            for (const tank of solarTanks.rows) {
              sections.push(
                `- ${tank.tank_name || tank.tank_code}: Volume ${Number(tank.current_volume_liters || 0).toLocaleString("id-ID")} L (${Number(tank.current_level_percent || 0).toFixed(1)}%)`
              );
            }
          }
        } catch {}

        return sections.join("\n");
      };

      const snapshot = await Promise.race([dbWork(), timeoutPromise]);
      if (snapshot) {
        this.cachedTelemetrySnapshot = snapshot;
        this.lastTelemetryFetch = now;
        return snapshot;
      }
    } catch (err) {
      this.logger.warn(`Failed to generate telemetry snapshot: ${err instanceof Error ? err.message : err}`);
      if (this.cachedTelemetrySnapshot) return this.cachedTelemetrySnapshot;
    }

    return "[INFO]: Data telemetri database sedang dimuat atau koneksi lokal lambat.";
  }

  buildSystemPrompt(context: AiAssistContext = {}): string {
    const activePage = context.activePage || "overview";
    const role = context.activeRole || context.role || "Operator";
    const liveTelemetry = context.liveTelemetryText || "";
    const selectedMachine = context.selectedMachine ? `Mesin Terpilih: ${context.selectedMachine}` : "";

    const customRole =
      context.customRole ||
      "Insinyur & Ahli Otomasi Digital / Smart Manufacturing System (MES) PT Sarana Makin Mulya (PT SMM)";

    const customPlantProfile =
      context.customPlantProfile ||
      "Pabrik tekstil terintegrasi pencelupan dan penyempurnaan kain (textile dyeing & finishing) mencakup: Jetflow (88 mesin celup kain), Calator (18 stenter & open width inspection), Dryer (6 mesin pengering kain), Kalender (21 mesin roll press finishing), Dispensing Bahan Kimia Otomatis, Utilities, dan Sistem Solar Fueling.";

    const customPromptSection = context.customPrompt ? `\nInstruksi Khusus Operator: ${context.customPrompt}\n` : "";

    const telemetrySection = liveTelemetry
      ? `\n### DATA TELEMETRI LIVE SISTEM MES & SENSOR OPERASIONAL (REALTIME DATABASE):\n${liveTelemetry}\n`
      : "";

    return `Kamu adalah ${customRole}.
Profil Pabrik & Karakteristik Sistem: ${customPlantProfile}
${customPromptSection}
Konteks Layar Saat Ini: Halaman=${activePage}, Role Pengguna=${role}${selectedMachine ? `, ${selectedMachine}` : ""}.
${telemetrySection}
Aturan Respon:
1. Kamu terhubung langsung ke data telemetri operasional MES PT SMM di atas. Jika pengguna/operator menanyakan status mesin (Jetflow, Calator, Dryer, Kalender, Chemical), batch no, progress celup, suhu, speed, overfeed, alarm, atau tangki solar, kamu WAJIB menjawab langsung dengan angka aktual beserta satuannya yang tertera pada data telemetri di atas secara profesional, ramah, dan percaya diri.
2. JANGAN PERNAH menolak atau mengatakan "saya tidak memiliki koneksi ke database operasional"! Kamu sudah memiliki snapshot database realtime di atas.
3. Berikan analisa teknis atau rekomendasi operasional singkat bila terdapat alarm, perbedaan suhu/kecepatan, atau mesin berstatus FAULT/WARNING.
4. Jawab to-the-point dalam Bahasa Indonesia profesional dengan format Markdown rapi (gunakan bold untuk angka penting dan bullet points untuk daftar).`;
  }

  async callMlxChat(message: string, context: AiAssistContext = {}): Promise<{ reply: string; model: string; source: string; host: string }> {
    if (!context.liveTelemetryText) {
      context.liveTelemetryText = await this.getLiveTelemetrySnapshot();
    }
    const candidateHosts = resolveMlxHostCandidates();
    const systemPrompt = this.buildSystemPrompt(context);

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (Array.isArray(context.history)) {
      for (const item of context.history.slice(-2)) {
        const role = item.sender === "user" || item.role === "user" ? "user" : "assistant";
        const content = item.text || item.content || item.message;
        if (content) messages.push({ role, content });
      }
    }
    messages.push({ role: "user", content: message });

    if (!this.cachedStatus) {
      await this.checkAiStatus();
    }
    const activeModel = this.cachedStatus?.activeModel || this.mlxModel;
    const available = this.cachedStatus?.availableModels || [activeModel];
    const targetModel = (context.selectedModel && available.includes(context.selectedModel) && !context.selectedModel.includes("7B"))
      ? context.selectedModel
      : activeModel;

    let lastErr: Error | null = null;
    for (const host of candidateHosts) {
      const cleanHost = host.replace(/\/+$/, "");
      const url = `${cleanHost}/v1/chat/completions`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.mlxTimeoutMs);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature: 0.4,
            max_tokens: 220,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`MLX server at ${cleanHost} responded with HTTP ${res.status}`);
        }

        const data = (await res.json()) as any;
        let content = data?.choices?.[0]?.message?.content?.trim();
        if (!content) {
          throw new Error(`MLX server at ${cleanHost} returned empty reply`);
        }

        content = content
          .replace(/<\|im_end\|>/g, "")
          .replace(/<\|endoftext\|>/g, "")
          .replace(/<\|eot_id\|>/g, "")
          .trim();
        lastWorkingMlxHost = cleanHost;

        return {
          reply: content,
          model: `mlx:${data.model || targetModel}`,
          source: "mlx",
          host: cleanHost,
        };
      } catch (err: any) {
        lastErr = err;
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastErr || new Error("Failed to connect to MLX server on port 8080");
  }

  async callOllamaChat(message: string, context: AiAssistContext = {}): Promise<{ reply: string; model: string; source: string; host: string }> {
    if (!context.liveTelemetryText) {
      context.liveTelemetryText = await this.getLiveTelemetrySnapshot();
    }
    const hostList = resolveOllamaHostCandidates();
    const systemPrompt = this.buildSystemPrompt(context);

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (Array.isArray(context.history)) {
      for (const item of context.history.slice(-3)) {
        const role = item.sender === "user" || item.role === "user" ? "user" : "assistant";
        const content = item.text || item.content || item.message;
        if (content) messages.push({ role, content });
      }
    }
    messages.push({ role: "user", content: message });

    const targetModel = context.selectedModel || this.ollamaModel;

    let lastError: Error | null = null;
    for (const host of hostList) {
      const cleanHost = host.replace(/\/+$/, "");
      const url = `${cleanHost}/api/chat`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.ollamaTimeoutMs);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: targetModel,
            messages,
            stream: false,
            options: {
              temperature: 0.5,
              num_ctx: 2048,
              num_predict: 350,
            },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Ollama at ${cleanHost} responded with HTTP ${res.status}`);
        }

        const data = (await res.json()) as any;
        const content = data?.message?.content?.trim();
        if (!content) {
          throw new Error(`Ollama at ${cleanHost} returned empty response`);
        }

        return {
          reply: content,
          model: `ollama:${data.model || targetModel}`,
          source: "ollama",
          host: cleanHost,
        };
      } catch (err: any) {
        this.logger.warn(`Ollama call to ${cleanHost} (${targetModel}) failed: ${err.message}`);
        lastError = err;
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError || new Error("Failed to connect to any Ollama host");
  }

  buildOfflineResponse(): AiAssistResult {
    const isExplicitlyDisabled = !this.ollamaEnabled && !this.mlxEnabled;
    return {
      ok: false,
      online: false,
      source: "offline",
      model: isExplicitlyDisabled ? "disabled" : "offline",
      error: isExplicitlyDisabled
        ? "Layanan AI sedang dinonaktifkan sementara."
        : "AI tidak terhubung. Server MLX Apple Silicon (port 8080) sedang offline.",
      reply: isExplicitlyDisabled
        ? "ℹ️ **Layanan AI Dinonaktifkan (Offline)**\n\nIntegrasi AI saat ini sedang dinonaktifkan di pengaturan server."
        : "⚠️ **AI Tidak Terhubung (Offline)**\n\nServer LLM lokal (MLX port 8080 / Ollama port 11434) saat ini tidak dapat dijangkau di http://127.0.0.1:8080. Pastikan model lokal aktif di host:\n```bash\npython3 -m mlx_lm server --model mlx-community/Llama-3.2-1B-Instruct-4bit --host 0.0.0.0 --port 8080 --max-tokens 200\n```",
      timestamp: new Date().toISOString(),
    };
  }

  async handleAiAssistRequest(payload: AiAssistPayload): Promise<AiAssistResult> {
    const { message, context = {} } = payload;
    if (!message || !message.trim()) {
      return { ok: false, error: "Pesan tidak boleh kosong" };
    }

    if (!this.ollamaEnabled && !this.mlxEnabled) {
      return this.buildOfflineResponse();
    }

    const targetModel = String(context.selectedModel || this.cachedStatus?.activeModel || this.mlxModel);
    const isMlxTarget = this.mlxEnabled && (!this.ollamaEnabled || targetModel.toLowerCase().includes("mlx"));

    if (isMlxTarget && this.mlxEnabled) {
      try {
        const mlxResult = await this.callMlxChat(message, context);
        return {
          ok: true,
          message,
          reply: mlxResult.reply,
          source: mlxResult.source,
          model: mlxResult.model,
          timestamp: new Date().toISOString(),
        };
      } catch (mlxErr) {
        if (this.ollamaEnabled) {
          try {
            const ollamaResult = await this.callOllamaChat(message, context);
            return {
              ok: true,
              message,
              reply: ollamaResult.reply,
              source: ollamaResult.source,
              model: ollamaResult.model,
              timestamp: new Date().toISOString(),
            };
          } catch {
            return this.buildOfflineResponse();
          }
        }
        return this.buildOfflineResponse();
      }
    } else if (this.ollamaEnabled) {
      try {
        const ollamaResult = await this.callOllamaChat(message, context);
        return {
          ok: true,
          message,
          reply: ollamaResult.reply,
          source: ollamaResult.source,
          model: ollamaResult.model,
          timestamp: new Date().toISOString(),
        };
      } catch (ollamaErr) {
        if (this.mlxEnabled) {
          try {
            const mlxResult = await this.callMlxChat(message, context);
            return {
              ok: true,
              message,
              reply: mlxResult.reply,
              source: mlxResult.source,
              model: mlxResult.model,
              timestamp: new Date().toISOString(),
            };
          } catch {
            return this.buildOfflineResponse();
          }
        }
        return this.buildOfflineResponse();
      }
    }

    return this.buildOfflineResponse();
  }

  async checkAiStatus(forceFresh = false): Promise<AiStatusResult> {
    const now = Date.now();
    const ttl = this.cachedStatus && this.cachedStatus.online ? STATUS_CACHE_TTL_MS : OFFLINE_CACHE_TTL_MS;
    if (!forceFresh && this.cachedStatus && now - this.lastStatusCheckedAt < ttl) {
      return this.cachedStatus;
    }

    if (!this.ollamaEnabled && !this.mlxEnabled) {
      this.cachedStatus = {
        ok: false,
        online: false,
        provider: "none",
        engine: "none",
        activeModel: "disabled",
        availableModels: [],
        message: "Layanan AI lokal dinonaktifkan sementara.",
      };
      this.lastStatusCheckedAt = now;
      return this.cachedStatus;
    }

    // 1. Check MLX-LM server first (port 8080)
    for (const host of resolveMlxHostCandidates()) {
      const cleanHost = host.replace(/\/+$/, "");
      try {
        const res = await fetch(`${cleanHost}/v1/models`, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          lastWorkingMlxHost = cleanHost;
          const data = (await res.json()) as any;
          const availableModels: string[] = (data.data || []).map((m: any) => m.id);
          this.cachedStatus = {
            ok: true,
            online: true,
            provider: "mlx",
            engine: "mlx",
            host: cleanHost,
            activeModel: availableModels[0] || this.mlxModel,
            availableModels: availableModels.length ? availableModels : [this.mlxModel],
          };
          this.lastStatusCheckedAt = now;
          return this.cachedStatus;
        }
      } catch {}
    }

    // 2. Check Ollama server (port 11434)
    if (this.ollamaEnabled) {
      for (const host of resolveOllamaHostCandidates()) {
        const cleanHost = host.replace(/\/+$/, "");
        try {
          const res = await fetch(`${cleanHost}/api/tags`, { signal: AbortSignal.timeout(1200) });
          if (res.ok) {
            const data = (await res.json()) as any;
            const availableModels: string[] = (data.models || []).map((m: any) => m.name);
            this.cachedStatus = {
              ok: true,
              online: true,
              provider: "ollama",
              engine: "ollama",
              host: cleanHost,
              activeModel: this.ollamaModel,
              availableModels,
            };
            this.lastStatusCheckedAt = now;
            return this.cachedStatus;
          }
        } catch {}
      }
    }

    this.cachedStatus = {
      ok: false,
      online: false,
      provider: "none",
      engine: "none",
      activeModel: "offline",
      availableModels: [],
      message: "Tidak dapat terhubung ke MLX-LM (port 8080) maupun Ollama (port 11434)",
    };
    this.lastStatusCheckedAt = now;
    return this.cachedStatus;
  }
}
