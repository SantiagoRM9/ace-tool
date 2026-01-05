/**
 * Enhance Prompt Tool 实现
 */

import path from 'path';
import { IndexManager } from '../index/manager.js';
import { PromptEnhancer } from '../enhancer/PromptEnhancer.js';
import { EnhancerServer } from '../enhancer/EnhancerServer.js';
import { sendMcpLog } from '../mcpLogger.js';
import {
  getConfig,
  getTextExtensions,
  getExcludePatterns,
  getBatchSize,
  getMaxLinesPerBlob,
} from '../config.js';

// 全局单例
let enhancerServer: EnhancerServer | null = null;
const enhancerCache = new Map<string, PromptEnhancer>();

/**
 * 获取或创建 EnhancerServer 实例
 */
function getEnhancerServer(): EnhancerServer {
  if (!enhancerServer) {
    enhancerServer = new EnhancerServer();
  }
  return enhancerServer;
}

/**
 * 获取或创建 PromptEnhancer 实例
 */
function getPromptEnhancer(
  projectRoot: string,
  baseUrl: string,
  token: string
): PromptEnhancer {
  const cacheKey = `${projectRoot}:${baseUrl}`;

  if (!enhancerCache.has(cacheKey)) {
    const indexManager = new IndexManager(
      projectRoot,
      baseUrl,
      token,
      getTextExtensions(),
      getBatchSize(),
      getMaxLinesPerBlob(),
      getExcludePatterns()
    );

    const server = getEnhancerServer();
    const enhancer = new PromptEnhancer(indexManager, baseUrl, token, server);

    enhancerCache.set(cacheKey, enhancer);
  }

  return enhancerCache.get(cacheKey)!;
}

/**
 * Enhance Prompt Tool 执行函数
 */
export async function enhancePromptTool(args: {
  project_root_path?: string;
  prompt?: string;
  conversation_history?: string;
}): Promise<{ text: string }> {
  const { project_root_path, prompt, conversation_history } = args;

  // 验证必需参数
  if (!prompt) {
    throw new Error('Missing required parameter: prompt');
  }

  if (!conversation_history) {
    throw new Error('Missing required parameter: conversation_history');
  }

  // 获取配置
  const config = getConfig();
  const baseUrl = config.baseUrl;
  const token = config.token;

  // 确定项目根目录
  const projectRoot = project_root_path
    ? path.resolve(project_root_path)
    : process.cwd();

  sendMcpLog('info', `🎨 开始增强 prompt...`);
  sendMcpLog('info', `📂 项目路径: ${projectRoot}`);

  try {
    // 获取 PromptEnhancer 实例
    const enhancer = getPromptEnhancer(projectRoot, baseUrl, token);

    // 执行增强
    const enhancedPrompt = await enhancer.enhance(prompt, conversation_history);

    // 处理特殊返回值
    if (enhancedPrompt === '__END_CONVERSATION__') {
      sendMcpLog('info', '🛑 用户选择结束对话');
      return {
        text: 'User chose to end the conversation. Please stop and do not continue with any tasks.',
      };
    }

    // 正常返回增强后的 prompt（包括原始 prompt 的情况）
    return {
      text: enhancedPrompt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    sendMcpLog('error', `❌ Enhance prompt 失败: ${errorMessage}`);

    // 返回友好的错误信息
    if (errorMessage.includes('timeout')) {
      return {
        text: 'Enhancement timed out (8 minutes). Using original prompt: ' + prompt,
      };
    }

    throw error;
  }
}
