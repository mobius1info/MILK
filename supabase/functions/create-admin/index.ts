import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const { data: existingProfiles, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('role', 'admin');

    if (checkError) {
      console.error('Error checking existing admins:', checkError);
    }

    const { data: authUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      throw new Error(signUpError.message || 'Failed to create user');
    }

    if (!authUser.user) {
      throw new Error('User creation failed');
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        email: email,
        role: 'admin',
        balance: 0,
        username: email.split('@')[0]
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error('Failed to create profile');
    }

    await supabaseAdmin.auth.admin.updateUserById(authUser.user.id, {
      app_metadata: { role: 'admin' }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin created successfully',
        userId: authUser.user.id
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
