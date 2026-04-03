import { supabase } from '@/lib/supabase';
import { WashLog } from '@/types/database';

export const washLogService = {
  async getUserWashLogs(userId: string, limit = 50): Promise<WashLog[]> {
    const { data, error } = await supabase
      .from('wash_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getEmployeeWashLogs(employeeId: string, limit = 50): Promise<WashLog[]> {
    const { data, error } = await supabase
      .from('wash_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  subscribeToWashLogs(userId: string, callback: (logs: WashLog[]) => void) {
    const channel = supabase
      .channel('wash-log-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wash_logs',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const logs = await this.getUserWashLogs(userId);
          callback(logs);
        }
      )
      .subscribe();

    return channel;
  },
};
