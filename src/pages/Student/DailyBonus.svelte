<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

  export let studentId = null;

  const dispatch = createEventDispatcher();
  let claimedToday = false;
  let loading = true;
  let claiming = false;
  let message = '';

  onMount(async () => {
    if (!studentId) {
      // Agar studentId prop orqali kelmasa, o'zi aniqlaydi
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        studentId = user.id;
      }
    }

    if (studentId) {
      await checkTodayBonus();
    }
    loading = false;
  });

  // Bugun bonus olinganligini bazadan tekshirish
  async function checkTodayBonus() {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const { data, error } = await supabase
        .from('transactions')
        .select('id, created_at')
        .eq('student_id', studentId)
        .eq('type', 'daily_bonus')
        .gte('created_at', `${today} 00:00:00`)
        .lte('created_at', `${today} 23:59:59`);

      if (error) throw error;
      
      if (data && data.length > 0) {
        claimedToday = true;
      }
    } catch (err) {
      console.error('Bonus holatini tekshirishda xatolik:', err.message);
    }
  }

  // Bonusni olish tugmasi bosilganda
  async function claimBonus() {
    if (!studentId || claimedToday || claiming) return;

    claiming = true;
    message = '';
    const bonusAmount = 10; // Beriladigan coin miqdori

    try {
      const { error } = await supabase.from('transactions').insert([
        {
          student_id: studentId,
          amount: bonusAmount,
          reason: 'Kunlik kirish bonusi 🎁',
          type: 'daily_bonus'
        }
      ]);

      if (error) throw error;

      claimedToday = true;
      message = `Tabriklaymiz! +${bonusAmount} coin qo'shildi! 🎉`;
      
      // Dashboard yoki boshqa ota komponentga balansni yangilash uchun signal beramiz
      dispatch('bonusClaimed', { amount: bonusAmount });

    } catch (err) {
      console.error('Bonusni olishda xatolik:', err);
      message = 'Bonusni olishda xatolik yuz berdi. Qaytadan urinib ko‘ring.';
    } finally {
      claiming = false;
    }
  }
</script>

<div class="daily-bonus-card">
  <div class="bonus-content">
    <div class="bonus-icon-wrapper">
      <span class="bonus-emoji">🎁</span>
    </div>
    <div class="bonus-text">
      <h3>Kunlik kirish bonusi</h3>
      <p>{claimedToday ? "Bugungi bonusni olgansiz. Ertaga yana kiring!" : "Har kuni platformaga kiring va 10 ta bepul coin oling!"}</p>
    </div>
  </div>

  <div class="bonus-action">
    {#if loading}
      <span class="loading-text">Tekshirilmoqda...</span>
    {:else}
      <button 
        class="claim-btn" 
        on:click={claimBonus} 
        disabled={claimedToday || claiming}
      >
        {claiming ? 'Olinmoqda...' : (claimedToday ? 'Olingan ✅' : 'Olish (+10 coin)')}
      </button>
    {/if}
  </div>
</div>

{#if message}
  <div class="bonus-alert" class:success={claimedToday} class:error={!claimedToday && message}>
    {message}
  </div>
{/if}

<style>
  .daily-bonus-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .bonus-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .bonus-icon-wrapper {
    width: 48px;
    height: 48px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .bonus-text h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 700;
    color: #f8fafc;
  }

  .bonus-text p {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
  }

  .claim-btn {
    background: #10b981;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
  }

  .claim-btn:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .claim-btn:disabled {
    background: #334155;
    color: #64748b;
    cursor: not-allowed;
    box-shadow: none;
  }

  .loading-text {
    font-size: 13px;
    color: #94a3b8;
  }

  .bonus-alert {
    margin-top: -16px;
    margin-bottom: 24px;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    animation: fadeIn 0.3s ease;
  }

  .bonus-alert.success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #34d399;
  }

  .bonus-alert.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .daily-bonus-card {
      flex-direction: column;
      align-items: flex-start;
    }
    .bonus-action {
      width: 100%;
    }
    .claim-btn {
      width: 100%;
    }
  }
</style>