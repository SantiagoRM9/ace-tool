/**
 * Prompt Enhancer 模板
 * 基于 Augment VSCode 插件的官方模板
 */

/**
 * 增强 Prompt 的模板
 * 包含对话历史和原始 prompt 的占位符
 */
export const ENHANCE_PROMPT_TEMPLATE = `⚠️ NO TOOLS ALLOWED ⚠️

Here is an instruction that I'd like to give you, but it needs to be improved.
Rewrite and enhance this instruction to make it clearer, more specific, less ambiguous,
and correct any mistakes. Do not use any tools: reply immediately with your answer,
even if you're not sure. Consider the context of our conversation history when enhancing
the prompt.

Conversation history:
{conversation_history}

Reply with the following format:

### BEGIN RESPONSE ###
Here is an enhanced version of the original instruction that is more specific and clear:
<augment-enhanced-prompt>enhanced prompt goes here</augment-enhanced-prompt>

### END RESPONSE ###

Here is my original instruction:

{original_prompt}`;

/**
 * Web UI 的 HTML 模板
 */
export const ENHANCER_UI_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prompt Enhancer - ACE Tool</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
      max-width: 1000px;
      width: 100%;
      overflow: hidden;
    }

    .header {
      background: white;
      color: #333;
      padding: 30px;
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #333;
    }

    .header p {
      font-size: 14px;
      color: #666;
    }

    .countdown {
      margin-top: 12px;
      padding: 8px 16px;
      background: #f0f0f0;
      border-radius: 6px;
      display: inline-block;
      font-size: 13px;
      font-weight: 500;
      color: #555;
    }

    .countdown.warning {
      background: #fff3cd;
      color: #856404;
    }

    .countdown.danger {
      background: #f8d7da;
      color: #721c24;
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .content {
      padding: 30px;
    }

    .section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .editor-wrapper {
      position: relative;
    }

    textarea {
      width: 100%;
      min-height: 350px;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.6;
      resize: vertical;
      transition: border-color 0.3s;
      background: #fafafa;
    }

    textarea:focus {
      outline: none;
      border-color: #333;
      background: white;
    }

    .char-count {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.9);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      color: #666;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-box {
      background: #f9f9f9;
      border-left: 4px solid #333;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .info-box p {
      font-size: 14px;
      color: #555;
      line-height: 1.6;
    }

    .buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 25px;
    }

    button {
      padding: 12px 28px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .send-btn {
      background: #333;
      color: white;
      box-shadow: none;
    }

    .send-btn:hover:not(:disabled) {
      background: #000;
    }

    .send-btn:active:not(:disabled) {
      background: #000;
    }

    .send-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }

    .cancel-btn {
      background: white;
      color: #666;
      border: 2px solid #e0e0e0;
    }

    .cancel-btn:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }

    .re-enhance-btn {
      background: white;
      color: #333;
      border: 2px solid #333;
    }

    .re-enhance-btn:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #000;
    }

    .re-enhance-btn:disabled {
      background: #f5f5f5;
      color: #ccc;
      border-color: #e0e0e0;
      cursor: not-allowed;
    }

    .status {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
      display: none;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .status.success {
      background: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
      display: block;
    }

    .status.error {
      background: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
      display: block;
    }

    .loading {
      display: none;
      text-align: center;
      padding: 40px;
    }

    .loading.active {
      display: block;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #333;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .keyboard-hint {
      font-size: 12px;
      color: #999;
      text-align: center;
      margin-top: 15px;
    }

    .keyboard-hint kbd {
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 11px;
    }

    @media (max-width: 768px) {
      body {
        padding: 10px;
      }

      .header {
        padding: 20px;
      }

      .header h1 {
        font-size: 22px;
      }

      .content {
        padding: 20px;
      }

      textarea {
        min-height: 250px;
        font-size: 13px;
      }

      .buttons {
        flex-direction: column-reverse;
      }

      button {
        width: 100%;
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        Prompt Enhancer
      </h1>
      <p>Review and refine your enhanced prompt</p>
      <div class="countdown" id="countdown">⏱️ 加载中...</div>
    </div>

    <div class="content">
      <div class="loading" id="loading">
        <div class="spinner"></div>
        <p>Loading your enhanced prompt...</p>
      </div>

      <div id="mainContent" style="display: none;">
        <div class="info-box">
          <p>
            <strong>💡 提示：</strong>AI 已经根据对话历史和代码上下文增强了你的 prompt。
            你可以在下方编辑器中进一步修改，然后点击"发送"继续。
          </p>
        </div>

        <div class="section">
          <div class="section-title">Enhanced Prompt</div>
          <div class="editor-wrapper">
            <textarea
              id="promptText"
              placeholder="Your enhanced prompt will appear here..."
              spellcheck="false"
            ></textarea>
            <div class="char-count" id="charCount">0 字符</div>
          </div>
        </div>

        <div class="buttons">
          <button class="cancel-btn" onclick="endConversation()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            结束对话
          </button>
          <button class="re-enhance-btn" id="reEnhanceBtn" onclick="reEnhance()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            继续增强
          </button>
          <button class="cancel-btn" onclick="useOriginal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
            使用原始
          </button>
          <button class="send-btn" id="sendBtn" onclick="sendPrompt()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            发送增强
          </button>
        </div>

        <div class="keyboard-hint">
          快捷键: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 发送增强 | <kbd>Esc</kbd> 结束对话
        </div>

        <div id="status" class="status"></div>
      </div>
    </div>
  </div>

  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    const promptText = document.getElementById('promptText');
    const charCount = document.getElementById('charCount');
    const loading = document.getElementById('loading');
    const mainContent = document.getElementById('mainContent');
    const countdownEl = document.getElementById('countdown');

    let countdownInterval = null;
    let sessionCreatedAt = null;
    let sessionTimeoutMs = null;

    // 更新字符计数
    function updateCharCount() {
      const count = promptText.value.length;
      charCount.textContent = count + ' 字符';
    }

    promptText.addEventListener('input', updateCharCount);

    // 格式化时间显示
    function formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return minutes + ':' + seconds.toString().padStart(2, '0');
    }

    // 更新倒计时显示
    function updateCountdown() {
      if (!sessionCreatedAt || !sessionTimeoutMs) return;

      const now = Date.now();
      const elapsed = now - sessionCreatedAt;
      const remaining = sessionTimeoutMs - elapsed;

      if (remaining <= 0) {
        countdownEl.textContent = '⏱️ 已超时';
        countdownEl.className = 'countdown danger';
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        return;
      }

      const remainingMinutes = remaining / 60000;

      // 更新样式
      if (remainingMinutes <= 1) {
        countdownEl.className = 'countdown danger';
      } else if (remainingMinutes <= 3) {
        countdownEl.className = 'countdown warning';
      } else {
        countdownEl.className = 'countdown';
      }

      countdownEl.textContent = '⏱️ 剩余时间: ' + formatTime(remaining);
    }

    // 启动倒计时
    function startCountdown(createdAt, timeoutMs) {
      sessionCreatedAt = createdAt;
      sessionTimeoutMs = timeoutMs;

      updateCountdown();

      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      countdownInterval = setInterval(updateCountdown, 1000);
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        sendPrompt();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        endConversation();
      }
    });

    // 加载 session 数据
    if (!sessionId) {
      loading.style.display = 'none';
      mainContent.style.display = 'block';
      showStatus('错误: 未提供 session ID', 'error');
    } else {
      loading.classList.add('active');

      fetch('/api/session?session=' + encodeURIComponent(sessionId))
        .then(r => r.json())
        .then(data => {
          promptText.value = data.enhancedPrompt;
          updateCharCount();
          loading.classList.remove('active');
          mainContent.style.display = 'block';
          promptText.focus();

          // 启动倒计时
          if (data.createdAt && data.timeoutMs) {
            startCountdown(data.createdAt, data.timeoutMs);
          }
        })
        .catch(err => {
          loading.classList.remove('active');
          mainContent.style.display = 'block';
          showStatus('加载失败: ' + err.message, 'error');
        });
    }

    function reEnhance() {
      const currentContent = promptText.value.trim();

      if (!currentContent) {
        showStatus('请输入内容后再增强', 'error');
        return;
      }

      const reEnhanceBtn = document.getElementById('reEnhanceBtn');
      const sendBtn = document.getElementById('sendBtn');

      reEnhanceBtn.disabled = true;
      sendBtn.disabled = true;
      reEnhanceBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border-width: 2px; margin: 0;"></div> 增强中...';

      fetch('/api/re-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          currentPrompt: currentContent
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }

        promptText.value = data.enhancedPrompt;
        updateCharCount();
        showStatus('✅ 增强成功！你可以继续编辑或发送', 'success');

        reEnhanceBtn.disabled = false;
        sendBtn.disabled = false;
        reEnhanceBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> 继续增强';
      })
      .catch(err => {
        showStatus('增强失败: ' + err.message, 'error');
        reEnhanceBtn.disabled = false;
        sendBtn.disabled = false;
        reEnhanceBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> 继续增强';
      });
    }

    function sendPrompt() {
      const content = promptText.value.trim();

      if (!content) {
        showStatus('请输入内容后再发送', 'error');
        return;
      }

      const sendBtn = document.getElementById('sendBtn');
      const reEnhanceBtn = document.getElementById('reEnhanceBtn');

      sendBtn.disabled = true;
      reEnhanceBtn.disabled = true;
      sendBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border-width: 2px; margin: 0;"></div> 发送中...';

      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId, content: content })
      })
      .then(r => r.json())
      .then(data => {
        showStatus('✅ 发送成功！窗口将在 2 秒后自动关闭...', 'success');
        setTimeout(() => window.close(), 2000);
      })
      .catch(err => {
        showStatus('发送失败: ' + err.message, 'error');
        sendBtn.disabled = false;
        reEnhanceBtn.disabled = false;
        sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> 发送';
      });
    }

    function useOriginal() {
      if (confirm('确定使用原始 prompt 继续对话吗？')) {
        fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId, content: '__USE_ORIGINAL__' })
        })
        .then(() => {
          showStatus('✅ 将使用原始 prompt 继续...', 'success');
          setTimeout(() => window.close(), 1000);
        })
        .catch(() => window.close());
      }
    }

    function endConversation() {
      if (confirm('确定要结束本次对话吗？')) {
        fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId, content: '__END_CONVERSATION__' })
        })
        .then(() => {
          showStatus('✅ 对话已结束', 'success');
          setTimeout(() => window.close(), 1000);
        })
        .catch(() => window.close());
      }
    }

    function showStatus(message, type) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + type;
    }
  </script>
</body>
</html>`;
