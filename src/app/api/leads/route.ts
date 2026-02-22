import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, company_size, role, primary_goal, phone_number: rawPhone, source } = body;

    // Validate and normalize phone (E.164)
    const phone_number =
      typeof rawPhone === 'string' && /^\+[0-9]{10,15}$/.test(rawPhone.trim())
        ? rawPhone.trim().slice(0, 20)
        : null;

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
      phone_number,
      source: source && typeof source === 'string' ? source.trim().slice(0, 64) : null,
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
