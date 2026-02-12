import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, company_size, role, primary_goal, phone_number } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = await createClient();

    // Insert into leads table
    const { data, error } = await supabase.from('leads').insert({
      email,
      full_name: full_name || null,
      company_size: company_size || null,
      role: role || null,
      primary_goal: primary_goal || null,
      phone_number: phone_number || null,
    }).select();

    if (error) {
      throw error;
    }

    // TODO: Trigger email notification (optional)
    // await sendLeadNotification(data[0]);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to process lead capture' },
      { status: 500 }
    );
  }
}
