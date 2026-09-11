import { Body, Controller, Get, Post } from "@nestjs/common";
import { AiAssistantService, AiAssistPayload } from "./ai-assistant.service.js";

@Controller()
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Get(["api/ai-status", "api/v1/ai-status"])
  async getAiStatus() {
    return this.aiAssistantService.checkAiStatus();
  }

  @Post(["api/ai-assist", "api/v1/ai-assist"])
  async chatAiAssist(@Body() body: AiAssistPayload) {
    return this.aiAssistantService.handleAiAssistRequest(body || ({} as AiAssistPayload));
  }
}
