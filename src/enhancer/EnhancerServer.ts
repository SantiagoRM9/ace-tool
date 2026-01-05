/**
 * Enhancer Server - HTTP 服务器和 Session 管理
 * 提供 Web UI 交互界面
 */

import http from 'http';
import crypto from 'crypto';
import { ENHANCER_UI_HTML } from './templates.js';
import { sendMcpLog } from '../mcpLogger.js';

/**
 * Session 数据结构
 */
interface SessionData {
  id: string;
  enhancedPrompt: string;
  originalPrompt: string; // 保存原始 prompt
  conversationHistory: string; // 保存对话历史
  blobNames: string[]; // 保存 blob 列表
  status: 'pending' | 'completed' | 'timeout';
  createdAt: number;
  promise: Promise<string> | null;
  resolve: ((value: string) => void) | null;
  reject: ((reason: Error) => void) | null;
}

/**
 * Enhancer HTTP 服务器
 */
export class EnhancerServer {
  private server: http.Server | null = null;
  private port: number = 3000;
  private sessions: Map<string, SessionData> = new Map();
  private readonly TIMEOUT_MS = 8 * 60 * 1000; // 8 分钟

  /**
   * 启动 HTTP 服务器
   */
  async start(): Promise<void> {
    if (this.server) {
      return; // 已启动
    }

    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    await new Promise<void>((resolve, reject) => {
      this.server!.listen(this.port, () => {
        sendMcpLog('info', `🌐 Enhancer 服务器已启动: http://localhost:${this.port}`);
        resolve();
      }).on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          sendMcpLog('warning', `⚠️ 端口 ${this.port} 已被占用，尝试使用其他端口`);
          this.port++;
          this.server = null;
          this.start().then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * 获取服务器端口
   */
  getPort(): number {
    return this.port;
  }

  /**
   * 创建新的 Session
   */
  createSession(
    enhancedPrompt: string,
    originalPrompt: string,
    conversationHistory: string,
    blobNames: string[]
  ): string {
    const sessionId = crypto.randomUUID();
    const session: SessionData = {
      id: sessionId,
      enhancedPrompt,
      originalPrompt,
      conversationHistory,
      blobNames,
      status: 'pending',
      createdAt: Date.now(),
      promise: null,
      resolve: null,
      reject: null,
    };

    // 创建 Promise 用于等待用户操作
    session.promise = new Promise((resolve, reject) => {
      session.resolve = resolve;
      session.reject = reject;

      // 8 分钟超时
      setTimeout(() => {
        if (session.status === 'pending') {
          session.status = 'timeout';
          this.sessions.delete(sessionId);
          reject(new Error('User interaction timeout (8 minutes)'));
        }
      }, this.TIMEOUT_MS);
    });

    this.sessions.set(sessionId, session);
    sendMcpLog('info', `📝 创建 Session: ${sessionId}`);

    return sessionId;
  }

  /**
   * 等待 Session 完成
   */
  async waitForSession(sessionId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.promise) {
      throw new Error('Session promise not initialized');
    }

    try {
      const result = await session.promise;
      return result;
    } finally {
      this.sessions.delete(sessionId);
    }
  }

  /**
   * 处理 HTTP 请求
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    try {
      const url = new URL(req.url!, `http://localhost:${this.port}`);

      // 设置 CORS 头
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // 处理 OPTIONS 请求
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (url.pathname === '/enhance' && req.method === 'GET') {
        this.serveEnhancerUI(res);
      } else if (url.pathname === '/api/session' && req.method === 'GET') {
        this.getSessionData(url.searchParams.get('session'), res);
      } else if (url.pathname === '/api/submit' && req.method === 'POST') {
        this.handleSubmit(req, res);
      } else if (url.pathname === '/api/re-enhance' && req.method === 'POST') {
        this.handleReEnhance(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } catch (error) {
      sendMcpLog('error', `❌ 请求处理错误: ${error}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }

  /**
   * 返回 Web UI HTML
   */
  private serveEnhancerUI(res: http.ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(ENHANCER_UI_HTML);
  }

  /**
   * 获取 Session 数据
   */
  private getSessionData(sessionId: string | null, res: http.ServerResponse): void {
    if (!sessionId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session ID is required' }));
      return;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        enhancedPrompt: session.enhancedPrompt,
        status: session.status,
        createdAt: session.createdAt,
        timeoutMs: this.TIMEOUT_MS,
      })
    );
  }

  /**
   * 处理用户提交
   */
  private handleSubmit(req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { sessionId, content } = JSON.parse(body);

        if (!sessionId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session ID is required' }));
          return;
        }

        const session = this.sessions.get(sessionId);

        if (!session) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found' }));
          return;
        }

        if (session.status !== 'pending') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session already completed or timed out' }));
          return;
        }

        // 标记为完成
        session.status = 'completed';

        // 处理特殊标记
        if (content === '__USE_ORIGINAL__') {
          sendMcpLog('info', `📝 用户选择使用原始 prompt`);
          session.resolve!(session.originalPrompt);
        } else if (content === '__END_CONVERSATION__') {
          sendMcpLog('info', `🛑 用户选择结束对话`);
          session.resolve!('__END_CONVERSATION__');
        } else {
          session.resolve!(content);
        }

        sendMcpLog('info', `✅ Session ${sessionId} 已完成`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        sendMcpLog('error', `❌ 提交处理错误: ${error}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });

    req.on('error', (error) => {
      sendMcpLog('error', `❌ 请求错误: ${error}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request error' }));
    });
  }

  /**
   * 处理继续增强请求
   */
  private handleReEnhance(req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { sessionId, currentPrompt } = JSON.parse(body);

        if (!sessionId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session ID is required' }));
          return;
        }

        const session = this.sessions.get(sessionId);

        if (!session) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found' }));
          return;
        }

        // 调用增强逻辑（需要从 PromptEnhancer 传入）
        if (!this.enhanceCallback) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Enhance callback not configured' }));
          return;
        }

        sendMcpLog('info', `🔄 继续增强 Session: ${sessionId}`);

        try {
          const newEnhancedPrompt = await this.enhanceCallback(
            currentPrompt,
            session.conversationHistory,
            session.blobNames
          );

          // 更新 session 的增强内容
          session.enhancedPrompt = newEnhancedPrompt;

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ enhancedPrompt: newEnhancedPrompt }));
        } catch (error) {
          sendMcpLog('error', `❌ 继续增强失败: ${error}`);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Enhancement failed: ' + (error as Error).message }));
        }
      } catch (error) {
        sendMcpLog('error', `❌ 继续增强请求处理错误: ${error}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });

    req.on('error', (error) => {
      sendMcpLog('error', `❌ 请求错误: ${error}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request error' }));
    });
  }

  private enhanceCallback: ((prompt: string, history: string, blobs: string[]) => Promise<string>) | null = null;

  /**
   * 设置增强回调函数
   */
  setEnhanceCallback(callback: (prompt: string, history: string, blobs: string[]) => Promise<string>): void {
    this.enhanceCallback = callback;
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        sendMcpLog('info', '🛑 Enhancer 服务器已停止');
        this.server = null;
        resolve();
      });
    });
  }
}
