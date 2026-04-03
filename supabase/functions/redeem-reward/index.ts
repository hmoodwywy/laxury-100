import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RedeemRewardRequest {
  userId: string;
  employeeId: string;
  notes?: string;
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

    const { userId, employeeId, notes }: RedeemRewardRequest = await req.json();

    // Validate input
    if (!userId || !employeeId) {
      return new Response(
        JSON.stringify({ error: 'userId and employeeId are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's loyalty card with available reward
    const { data: loyaltyCard, error: cardError } = await supabase
      .from('loyalty_cards')
      .select('*, loyalty_plans(*)')
      .eq('user_id', userId)
      .eq('reward_available', true)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cardError) {
      throw cardError;
    }

    if (!loyaltyCard) {
      return new Response(
        JSON.stringify({ error: 'No reward available for redemption' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Mark current card as completed
    const { error: completeError } = await supabase
      .from('loyalty_cards')
      .update({
        completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', loyaltyCard.id);

    if (completeError) {
      throw completeError;
    }

    // Create new loyalty card with the same plan
    const { data: newCard, error: newCardError } = await supabase
      .from('loyalty_cards')
      .insert({
        user_id: userId,
        plan_id: loyaltyCard.plan_id,
        current_washes: 0,
        reward_available: false,
        completed: false,
      })
      .select('*, loyalty_plans(*)')
      .single();

    if (newCardError) {
      throw newCardError;
    }

    // Log the redemption
    const { data: washLog, error: logError } = await supabase
      .from('wash_logs')
      .insert({
        user_id: userId,
        employee_id: employeeId,
        action: 'reward_redeemed',
        card_id: loyaltyCard.id,
        notes,
      })
      .select()
      .single();

    if (logError) {
      throw logError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reward redeemed successfully! New card created.',
        completedCard: loyaltyCard,
        newCard,
        washLog,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
