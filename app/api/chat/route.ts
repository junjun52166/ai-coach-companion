// app/api/chat/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the expected structure of the request body
interface RequestBody {
  message: string;
  history: { text: string; sender: 'user' | 'ai' }[];
  userId: string;
  aiSettings?: {
    name?: string;
    role?: string;
    background?: string;
    reminder?: string;
    language?: 'en' | 'zh';
    aiNickname?: string;
    userNickname?: string;
  };
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();

    // Get conversation history from Supabase
    const { data: history, error: historyError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
      .limit(10); // Get last 10 messages for context

    if (historyError) {
      console.error('Error fetching history:', historyError);
    }

    // Format history for OpenAI
    const formattedHistory = history?.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || [];

    // Add system message for context
    const systemMessage = {
      role: 'system',
      content: 'You are an AI coach and companion. You have access to the conversation history and should maintain context and continuity in your responses. Be helpful, supportive, and engaging while maintaining a professional tone.'
    };

    // Prepare messages array with history
    const messages = [
      systemMessage,
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    // Save both user message and AI response to Supabase
    const { error: saveError } = await supabase
      .from('messages')
      .insert([
        {
          user_id: session.user.id,
          content: message,
          role: 'user'
        },
        {
          user_id: session.user.id,
          content: aiResponse,
          role: 'assistant'
        }
      ]);

    if (saveError) {
      console.error('Error saving messages:', saveError);
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to fetch message history
// export async function GET(request: Request) {
//   try {
//      const { searchParams } = new URL(request.url);
//      const userId = searchParams.get('userId');

//      if (!userId) {
//         return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
//      }

//      const { data, error } = await supabase
//          .from('messages')
//          .select('id, content, sender, created_at')
//          .eq('user_id', userId)
//          .order('created_at', { ascending: true }); // Order by timestamp

//      if (error) throw error;

//      // Format data to match the client's Message interface
//      const formattedMessages = data.map(msg => ({
//          id: msg.id, // Include id if needed on client
//          text: msg.content,
//          sender: msg.sender as 'user' | 'ai',
//          created_at: msg.created_at // Include created_at if needed on client
//      }));

//      return NextResponse.json({ history: formattedMessages });

//   } catch (error: any) {
//      console.error('Error fetching history:', error);
//      return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 });
//   }
// }