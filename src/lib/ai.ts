import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const AIExtractedTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  departmentName: z.enum(['Reception', 'Housekeeping', 'Kitchen', 'Restaurant', 'Maintenance', 'Security', 'Procurement']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueInMinutes: z.number().optional(),
});

export const AIExtractionResultSchema = z.object({
  confidence: z.number(),
  reasoning: z.string(),
  tasks: z.array(AIExtractedTaskSchema),
});

export type AIExtractionResult = z.infer<typeof AIExtractionResultSchema>;
export type AIExtractedTask = z.infer<typeof AIExtractedTaskSchema>;

export async function extractTasksFromText(text: string, context?: { roomNumber?: string }): Promise<AIExtractionResult> {
  const room = context?.roomNumber || 'Unknown';
  console.log(`[AI Engine] Extracting tasks from: "${text}" (Room context: ${room})`);

  const provider = process.env.AI_PROVIDER || 'gemini';
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `
    You are an expert Hospitality Operations AI Agent. 
    Your task is to analyze raw guest messages or manager requests and extract actionable tasks.
    Each task must be assigned to one of the following departments:
    - Reception (welcome services, early check-in, late check-out, bookings, VIP protocols, transport coordination)
    - Housekeeping (cleaning, towels, bedding, toiletries, water bottle refills)
    - Kitchen (food preparation, inventory shortages)
    - Restaurant (table bookings, room-service food orders, guest feedback on F&B, menu inquiries)
    - Maintenance (broken equipment, AC issues, plumbing, lighting repairs)
    - Security (suspicious activity, key card issues, parking problems, perimeter inspections)
    - Procurement (low stock alerts, purchase requests)

    Ensure priorities are set correctly: LOW, MEDIUM, HIGH, or URGENT.
    Calculate dueInMinutes based on typical response times (e.g., towels = 15 mins, AC repair = 60 mins).
  `;

  // Fallback to mock keyword parsing if no API keys are configured
  if ((provider === 'gemini' && !geminiKey) || (provider === 'openai' && !openaiKey)) {
    console.warn(`[AI Engine] API key missing for provider "${provider}". Running local keyword parsing fallback.`);
    const textLower = text.toLowerCase();
    let departmentName: 'Reception' | 'Housekeeping' | 'Kitchen' | 'Restaurant' | 'Maintenance' | 'Security' | 'Procurement' = 'Reception';
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
    let title = 'Guest Request';
    const description = text;
    let dueInMinutes = 30;

    if (textLower.includes('towel') || textLower.includes('pillow') || textLower.includes('clean') || textLower.includes('sheet') || textLower.includes('soap') || textLower.includes('shampoo') || textLower.includes('linen')) {
      departmentName = 'Housekeeping';
      title = textLower.includes('towel') ? 'Deliver Fresh Towels' : textLower.includes('pillow') ? 'Deliver Pillows' : 'Room Cleaning Service';
      priority = 'HIGH';
      dueInMinutes = 15;
    } else if (textLower.includes('ac') || textLower.includes('broken') || textLower.includes('leak') || textLower.includes('light') || textLower.includes('warm') || textLower.includes('cold') || textLower.includes('chiller') || textLower.includes('drain') || textLower.includes('repair') || textLower.includes('clog')) {
      departmentName = 'Maintenance';
      title = textLower.includes('ac') || textLower.includes('chiller') ? 'Inspect HVAC AC Chiller unit' : textLower.includes('leak') ? 'Repair Water Pipe Leak' : 'General Maintenance Check';
      priority = 'URGENT';
      dueInMinutes = 45;
    } else if (textLower.includes('table') || textLower.includes('reservation') || textLower.includes('restaurant') || textLower.includes('dining') || textLower.includes('food') || textLower.includes('drink') || textLower.includes('water') || textLower.includes('coffee') || textLower.includes('dinner') || textLower.includes('breakfast') || textLower.includes('lunch') || textLower.includes('tea') || textLower.includes('menu')) {
      departmentName = 'Restaurant';
      title = (textLower.includes('table') || textLower.includes('reservation') || textLower.includes('restaurant')) 
        ? 'Book Table Reservation' 
        : textLower.includes('water') 
        ? 'Deliver Sparkling Water' 
        : 'Deliver Room Service Order';
      priority = 'MEDIUM';
      dueInMinutes = 20;
    } else if (textLower.includes('safety') || textLower.includes('patrol') || textLower.includes('gate') || textLower.includes('intruder') || textLower.includes('key') || textLower.includes('card') || textLower.includes('lost')) {
      departmentName = 'Security';
      title = textLower.includes('key') || textLower.includes('card') ? 'Program Replacement Keycard' : 'Investigate Security Patrol Report';
      priority = 'HIGH';
      dueInMinutes = 10;
    }

    return {
      confidence: 0.85,
      reasoning: 'API keys were absent in environment; routed successfully using local operations keyword heuristics.',
      tasks: [{
        title,
        description,
        departmentName,
        priority,
        dueInMinutes,
      }],
    };
  }

  try {
    let modelInstance;
    if (provider === 'openai') {
      modelInstance = openai(process.env.AI_MODEL || 'gpt-4o-mini');
    } else {
      modelInstance = google(process.env.AI_MODEL || 'gemini-2.5-flash');
    }

    const { object } = await generateObject({
      model: modelInstance,
      system: systemPrompt,
      prompt: `Extract operations tasks for:\nMessage: "${text}"\nRoom Context: "${room}"`,
      schema: AIExtractionResultSchema,
    });

    return object;
  } catch (error) {
    console.error('[AI Engine] Vercel AI SDK extraction failed:', error);
    throw error;
  }
}
