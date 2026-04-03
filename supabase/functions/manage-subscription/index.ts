import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ManageSubscriptionRequest {
  userId: string;
  action: 'activate' | 'deactivate' | 'cancel';
  endDate?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { userId, action, endDate }: ManageSubscriptionRequest =
      await req.json();

    // Validate input
    if (!userId || !action) {
      return new Response(
        JSON.stringify({ error: 'userId and action are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get existing subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let result;

    if (action === 'activate') {
      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: endDate || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubscription.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: endDate || null,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Update user subscription status
      await supabase
        .from('users')
        .update({ subscription_status: 'active' })
        .eq('id', userId);
    } else if (action === 'deactivate') {
      if (!existingSubscription) {
        return new Response(
          JSON.stringify({ error: 'No subscription found for this user' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) throw error;
      result = data;

      // Update user subscription status
      await supabase
        .from('users')
        .update({ subscription_status: 'inactive' })
        .eq('id', userId);
    } else if (action === 'cancel') {
      if (!existingSubscription) {
        return new Response(
          JSON.stringify({ error: 'No subscription found for this user' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) throw error;
      result = data;

      // Update user subscription status
      await supabase
        .from('users')
        .update({ subscription_status: 'inactive' })
        .eq('id', userId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Subscription ${action}d successfully`,
        subscription: result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error managing subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
