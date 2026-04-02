import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface GenerateProjectRequest {
  description: string;
}

interface GeneratedProject {
  name: string;
  code: string;
  icon: string;
  color: string;
  stage: string;
  priority: number;
  progress: number;
  horizon: string;
  mission: string;
  blocker: string;
  nextAction: string;
  kpis: Array<{ name: string; target: number; unit: string }>;
  tasks: Array<{ text: string; priority: number; due: string }>;
}

export async function POST(request: NextRequest): Promise<NextResponse<GeneratedProject | { error: string }>> {
  try {
    const apiKey = process.env.APIKEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const body: GenerateProjectRequest = await request.json();
    const { description } = body;

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `أنت محلل استراتيجي متخصص في تحويل أفكار المشاريع إلى خطط عملية قابلة للتنفيذ.

عند إعطاؤك وصفاً لمشروع، قم بإنشاء هيكل كامل للمشروع باللغة العربية بصيغة JSON صارمة.

يجب أن يكون الناتج JSON صحيحاً تماماً ويحتوي على جميع الحقول التالية:
- name: اسم المشروع (بالعربية)
- code: رمز المشروع بصيغة P+رقم (مثل P7، P8)
- icon: emoji واحد يمثل المشروع
- color: كود لون HEX (مثل #FF5733)
- stage: المرحلة الحالية (Discovery/Planning/Execution/Review/Complete)
- priority: الأولوية من 1 إلى 5 (5 هي الأعلى)
- progress: نسبة التقدم من 0 إلى 100
- horizon: الأفق الزمني (قصير/متوسط/طويل الأمد)
- mission: وصف المهمة الأساسية (جملة واحدة)
- blocker: العائق الرئيسي الحالي (أو "لا توجد عوائق")
- nextAction: الخطوة التالية الفورية
- kpis: مصفوفة من مؤشرات الأداء الرئيسية (كحد أقصى 3)
  - يجب أن تحتوي على: name (string), target (number), unit (string)
- tasks: مصفوفة من المهام (كحد أقصى 5)
  - يجب أن تحتوي على: text (string), priority (1-5), due (تاريخ بصيغة YYYY-MM-DD)

لا تضف أي نص قبل أو بعد JSON.
لا تضف أي تعليقات أو شرح.
أرجع JSON صحيح فقط.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20241022',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `وصف المشروع:\n${description}\n\nأنشئ بنية مشروع كاملة بناءً على هذا الوصف.`
        }
      ]
    });

    // Extract text from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No text content in response' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsedProject: GeneratedProject;
    try {
      parsedProject = JSON.parse(textContent.text);
    } catch (parseError) {
      console.error('JSON parse error:', textContent.text);
      return NextResponse.json(
        { error: 'Failed to parse generated project structure' },
        { status: 500 }
      );
    }

    // Validate required fields
    const requiredFields = ['name', 'code', 'icon', 'color', 'stage', 'priority', 'progress', 'horizon', 'mission', 'blocker', 'nextAction', 'kpis', 'tasks'];
    for (const field of requiredFields) {
      if (!(field in parsedProject)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(parsedProject);
  } catch (error) {
    console.error('Generate project API error:', error);

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
