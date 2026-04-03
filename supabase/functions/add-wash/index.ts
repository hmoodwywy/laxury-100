import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AddWashRequest {
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

    const { userId, employeeId, notes }: AddWashRequest = await req.json();

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

    // Check if user has active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      throw subError;
    }

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: 'User does not have an active subscription' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's active loyalty card
    const { data: loyaltyCard, error: cardError } = await supabase
      .from('loyalty_cards')
      .select('*, loyalty_plans(*)')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cardError) {
      throw cardError;
    }

    // If no active card exists, create one with the first active plan
    let currentCard = loyaltyCard;
    if (!currentCard) {
      const { data: activePlan } = await supabase
        .from('loyalty_plans')
        .select('*')
        .eq('active', true)
        .order('required_washes', { ascending: true })
        .limit(1)
        .single();

      if (!activePlan) {
        return new Response(
          JSON.stringify({ error: 'No active loyalty plans available' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: newCard, error: newCardError } = await supabase
        .from('loyalty_cards')
        .insert({
          user_id: userId,
          plan_id: activePlan.id,
          current_washes: 0,
          reward_available: false,
          completed: false,
        })
        .select('*, loyalty_plans(*)')
        .single();

      if (newCardError) {
        throw newCardError;
      }

      currentCard = newCard;
    }

    // Increment wash count
    const newWashCount = currentCard.current_washes + 1;
    const requiredWashes = currentCard.loyalty_plans.required_washes;
    const rewardAvailable = newWashCount >= requiredWashes;

    // Update loyalty card
    const { error: updateError } = await supabase
      .from('loyalty_cards')
      .update({
        current_washes: newWashCount,
        reward_available: rewardAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentCard.id);

    if (updateError) {
      throw updateError;
    }

    // Log the wash
    const { data: washLog, error: logError } = await supabase
      .from('wash_logs')
      .insert({
        user_id: userId,
        employee_id: employeeId,
        action: 'wash_added',
        card_id: currentCard.id,
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
        message: rewardAvailable
          ? 'Wash added! Reward is now available!'
          : 'Wash added successfully',
        washCount: newWashCount,
        requiredWashes,
        rewardAvailable,
        washLog,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error adding wash:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
