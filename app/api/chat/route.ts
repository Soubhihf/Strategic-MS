import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  projectContext?: string;
  financialContext?: string;
}

interface ChatResponse {
  reply: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    const apiKey = process.env.APIKEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, history = [], projectContext = '', financialContext = '' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Build the system prompt with Steve Jobs, Elon Musk, and Claude AI philosophies
    const systemPrompt = `أنت مدرب تنفيذي ذكي يجمع بين حكمة ستيف جوبز (البساطة والتركيز)، وإيلون ماسك (المبادئ الأولى والسرعة)، وقدرات كلود الذكية.

تعليماتك الأساسية:
- رد باللغة العربية فقط
- كن مباشراً وعملياً - لا وقت للثرثرة
- ركز على الإجراءات الفورية والملموسة
- ابدأ بالمشكلة الأساسية وليس الأعراض
- قدم رؤى مختصرة وقابلة للتنفيذ
- انسَ التفاصيل غير الضرورية، اقتل الإبداع الزائد

${projectContext ? `سياق المشروع:\n${projectContext}\n` : ''}
${financialContext ? `السياق المالي:\n${financialContext}\n` : ''}

أسلوبك: استشاري حاد، ذكي، لا يقبل الأعذار، مركز على النتائج.`;

    // Convert history to Anthropic format and add current message
    const messages = [
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20241022',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages
    });

    // Extract text from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No text content in response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: textContent.text
    });
  } catch (error) {
    console.error('Chat API error:', error);

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
