import { NextRequest, NextResponse } from 'next/server';

interface TelegramSendRequest {
  action: 'send' | 'test' | 'daily-tasks';
  message?: string;
  tasks?: Array<{ text: string; priority: number; done: boolean }>;
  token?: string;
  chatId?: string;
}

interface TelegramResponse {
  success: boolean;
  message: string;
}

async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.description || 'Failed to send message' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<TelegramResponse | { error: string }>> {
  try {
    const body: TelegramSendRequest = await request.json();
    const { action, message, tasks, token: requestToken, chatId: requestChatId } = body;

    // Get token and chatId from env or request body
    let token = process.env.TELEGRAM_BOT_TOKEN || requestToken;
    let chatId = process.env.TELEGRAM_CHAT_ID || requestChatId;

    // Validate we have token and chatId
    if (!token || !chatId) {
      return NextResponse.json(
        { error: 'Telegram bot token and chat ID are required' },
        { status: 400 }
      );
    }

    let messageText = '';

    if (action === 'send') {
      if (!message) {
        return NextResponse.json(
          { error: 'Message is required for send action' },
          { status: 400 }
        );
      }
      messageText = message;
    } else if (action === 'test') {
      messageText = '✅ <b>Executive OS - اختبار الاتصال</b>\n\nاتصال Telegram جاهز وسارٍ!';
    } else if (action === 'daily-tasks') {
      if (!tasks || !Array.isArray(tasks)) {
        return NextResponse.json(
          { error: 'Tasks array is required for daily-tasks action' },
          { status: 400 }
        );
      }

      // Format tasks for Telegram
      let tasksHtml = '📋 <b>مهام اليوم — Executive OS</b>\n\n';

      tasks.forEach((task) => {
        const status = task.done ? '✅' : '⏳';
        const priorityIcon = task.priority === 5 ? '🔴' : task.priority === 4 ? '🟠' : task.priority === 3 ? '🟡' : '🟢';
        tasksHtml += `${status} ${priorityIcon} ${task.text}\n`;
      });

      messageText = tasksHtml;
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: send, test, daily-tasks' },
        { status: 400 }
      );
    }

    const result = await sendTelegramMessage(token, chatId, messageText);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully to Telegram'
    });
  } catch (error) {
    console.error('Telegram API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
