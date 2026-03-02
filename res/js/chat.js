/* ============================================
   Rally AI — Console Chat Integration
   Terminal-style chat with sessionStorage memory
   ============================================ */

(function () {
    'use strict';

    const AI_ENDPOINT = 'https://rally19ai.rally19.workers.dev/chat';
    const STORAGE_KEY = 'rally_ai_messages';
    const MAX_MESSAGES = 40;

    // --- sessionStorage helpers ---
    function loadMessages() {
        try {
            return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveMessages(messages) {
        const trimmed = messages.slice(-MAX_MESSAGES);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }

    function clearChat() {
        sessionStorage.removeItem(STORAGE_KEY);
    }

    // --- HTML escaping ---
    function escapeHtml(text) {
        const el = document.createElement('span');
        el.textContent = text;
        return el.innerHTML;
    }

    // --- Init each console instance on the page ---
    document.querySelectorAll('.ai-console').forEach(initConsole);

    function initConsole(consoleEl) {
        const body = consoleEl.querySelector('.ai-console-body');
        const form = consoleEl.querySelector('.ai-console-form');
        const input = consoleEl.querySelector('.ai-console-input');
        const clearBtn = consoleEl.querySelector('.ai-console-clear');

        if (!body || !form || !input) return;

        // Render a console line
        function renderLine(role, content, opts) {
            opts = opts || {};
            const line = document.createElement('div');
            line.className = 'ai-console-line ai-console-line--' + role;

            const prompt = document.createElement('span');
            prompt.className = 'ai-console-prompt';

            if (role === 'user') {
                prompt.innerHTML = '<span class="ai-prompt-user">visitor</span><span class="ai-prompt-at">@</span><span class="ai-prompt-host">rally19</span><span class="ai-prompt-sep">:~$</span> ';
            } else if (role === 'assistant') {
                prompt.innerHTML = '<span class="ai-prompt-ai">[rally-ai]</span><span class="ai-prompt-sep">:</span> ';
            } else if (role === 'system') {
                prompt.innerHTML = '<span class="ai-prompt-sys">&gt;</span> ';
            }

            const content_el = document.createElement('span');
            content_el.className = 'ai-console-content';

            if (role === 'assistant' && typeof marked !== 'undefined') {
                content_el.innerHTML = marked.parse(content);
            } else {
                content_el.innerHTML = escapeHtml(content);
            }

            line.appendChild(prompt);
            line.appendChild(content_el);
            body.appendChild(line);
            scrollToBottom();

            // Typewriter effect for AI responses (only on new messages, not restored)
            if (role === 'assistant' && opts.animate) {
                typewriterEffect(content_el, content);
            }

            return line;
        }

        // Typewriter: reveals text character by character
        function typewriterEffect(el, rawContent) {
            const finalHTML = (typeof marked !== 'undefined') ? marked.parse(rawContent) : escapeHtml(rawContent);
            el.innerHTML = '';
            el.style.visibility = 'visible';

            // We'll reveal the final HTML by wrapping in a temporary container and
            // using a simple slice approach on the text content
            const temp = document.createElement('div');
            temp.innerHTML = finalHTML;
            const fullText = temp.textContent || temp.innerText || '';

            let i = 0;
            const speed = 12; // ms per character

            function tick() {
                if (i < fullText.length) {
                    // Show progressively more of the text
                    i += 2; // 2 chars at a time for speed
                    if (i > fullText.length) i = fullText.length;
                    // Show partial text, then swap to full HTML at the end
                    el.textContent = fullText.substring(0, i);
                    scrollToBottom();
                    requestAnimationFrame(() => setTimeout(tick, speed));
                } else {
                    // Done — swap in full Markdown HTML
                    el.innerHTML = finalHTML;
                    scrollToBottom();
                }
            }
            tick();
        }

        function scrollToBottom() {
            body.scrollTop = body.scrollHeight;
        }

        // Show typing indicator
        function showTyping() {
            const line = document.createElement('div');
            line.className = 'ai-console-line ai-console-line--typing';
            line.innerHTML = '<span class="ai-console-prompt"><span class="ai-prompt-ai">[rally-ai]</span><span class="ai-prompt-sep">:</span> </span><span class="ai-console-typing-dots"><span>.</span><span>.</span><span>.</span></span>';
            line.id = 'ai-typing-indicator';
            body.appendChild(line);
            scrollToBottom();
            return line;
        }

        function removeTyping() {
            const el = body.querySelector('#ai-typing-indicator');
            if (el) el.remove();
        }

        // Restore chat from sessionStorage
        function restoreChat() {
            const messages = loadMessages();
            if (messages.length === 0) {
                renderLine('system', 'Welcome. Ask me anything about Leonel.');
            } else {
                messages.forEach(function (msg) {
                    renderLine(msg.role, msg.content);
                });
            }
        }

        // Send message to API
        async function sendMessage(userText) {
            const messages = loadMessages();
            messages.push({ role: 'user', content: userText });

            try {
                const response = await fetch(AI_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messages }),
                });

                const data = await response.json();

                if (!data.ok) {
                    messages.pop();
                    saveMessages(messages);
                    throw new Error(data.error || 'Something went wrong.');
                }

                messages.push({ role: 'assistant', content: data.reply });
                saveMessages(messages);
                return data.reply;
            } catch (err) {
                // If it was a network error, also pop the user message
                if (messages[messages.length - 1] && messages[messages.length - 1].role === 'user') {
                    messages.pop();
                    saveMessages(messages);
                }
                throw err;
            }
        }

        // Handle form submit
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            // Gate behind Turnstile — reuse the contact form's verification
            if (typeof isTurnstileVerified !== 'undefined' && !isTurnstileVerified) {
                renderLine('system', 'Please complete the captcha above before chatting.');
                return;
            }

            input.value = '';
            input.disabled = true;

            // Remove welcome message if it exists
            const welcomeLine = body.querySelector('.ai-console-line--system');
            if (welcomeLine && loadMessages().length === 0) {
                welcomeLine.remove();
            }

            renderLine('user', text);
            const typingEl = showTyping();

            try {
                const reply = await sendMessage(text);
                removeTyping();
                renderLine('assistant', reply, { animate: true });
            } catch (err) {
                removeTyping();
                renderLine('system', 'Error: ' + (err.message || 'Something went wrong. Please try again.'));
            } finally {
                input.disabled = false;
                input.focus();
            }
        });

        // Clear chat button
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                clearChat();
                body.innerHTML = '';
                renderLine('system', 'Session cleared. Ask me anything about Leonel.');
            });
        }

        // Allow Enter to submit, Shift+Enter for newline (though we use input not textarea)
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        });

        // Initialize
        restoreChat();
        input.focus();
    }
})();
