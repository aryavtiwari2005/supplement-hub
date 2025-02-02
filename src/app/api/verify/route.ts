import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Token is required' }, { status: 400 });
  }

  try {
    // Verify the token
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    // Mark email as verified
    const { error } = await supabase
      .from('users')
      .update({ email_verified: true, verification_token: null })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Email verified successfully!' });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
