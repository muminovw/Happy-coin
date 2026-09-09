<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

  let orders = [];
  let loading = true;
  let channel = null;

  onMount(async () => {
    await fetchOrders();
    setupRealtimeSubscription();
  });

  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  });

  // Buyurtmalarni bazadan tortib kelish
  async function fetchOrders() {
    try {
      loading = true;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (full_name, email),
          products (title, price)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      orders = data || [];
    } catch (err) {
      console.error('Buyurtmalarni yuklashda xatolik:', err);
    } finally {
      loading = false;
    }
  }

  // Realtime tinglovchi: O'quvchi yangi buyurtma berganda sahifani avtomatik yangilaydi
  function setupRealtimeSubscription() {
    channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE barchasini kuzatish
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('Realtime o\'zgarish aniqlandi:', payload);
          // Har qanday o'zgarishda ma'lumotlarni qaytadan to'liq tortib kelamiz (bog'langan jadvallar uchun)
          await fetchOrders();
          
          if (payload.eventType === 'INSERT') {
            // Qo'shimcha bildirishnoma chiqarish mumkin
            console.log('Yangi buyurtma qabul qilindi!');
          }
        }
      )
      .subscribe();
  }

  // Buyurtma holatini o'zgartirish (tasdiqlash yoki rad etish)
  async function updateOrderStatus(orderId, newStatus) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      alert('Buyurtma holati yangilandi!');
      await fetchOrders();
    } catch (err) {
      console.error('Xatolik:', err);
      alert(`Xatolik yuz berdi: ${err.message}`);
    }
  }
</script>

<div class="admin-orders-container">
  <div class="header-section">
    <h1>Buyurtmalar Boshqaruvi</h1>
    <p>O'quvchilar tomonidan do'kondan qilingan xaridlarni real vaqt rejimida kuzating va boshqaring</p>
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>O'QUVCHI</th>
          <th>MAHSULOT</th>
          <th>NARX</th>
          <th>HOLATI</th>
          <th>SANA</th>
          <th>AMALLAR</th>
        </tr>
      </thead>
      <tbody>
        {#if loading}
          <tr>
            <td colspan="6" class="empty-row">Buyurtmalar yuklanmoqda...</td>
          </tr>
        {:else if orders.length === 0}
          <tr>
            <td colspan="6" class="empty-row">Hozircha buyurtmalar mavjud emas.</td>
          </tr>
        {:else}
          {#each orders as order (order.id)}
            <tr>
              <td>
                <div class="user-info">
                  <strong>{order.profiles?.full_name || 'Nomaʼlum'}</strong>
                  <span>{order.profiles?.email || ''}</span>
                </div>
              </td>
              <td>{order.products?.title || 'Mahsulot o\'chirilgan'}</td>
              <td>
                <span class="coin-badge">🪙 {order.total_price || order.products?.price || 0} coin</span>
              </td>
              <td>
                <span class="status-badge {order.status}">
                  {order.status === 'pending' ? 'Kutilmoqda' : order.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                </span>
              </td>
              <td class="date-col">{new Date(order.created_at).toLocaleDateString()}</td>
              <td>
                {#if order.status === 'pending'}
                  <div class="action-buttons">
                    <button class="btn-approve" on:click={() => updateOrderStatus(order.id, 'approved')}>
                      ✅ Tasdiqlash
                    </button>
                    <button class="btn-reject" on:click={() => updateOrderStatus(order.id, 'rejected')}>
                      ❌ Rad etish
                    </button>
                  </div>
                {:else}
                  <span class="completed-text">Bajarilgan</span>
                {/if}
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style>
  .admin-orders-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px;
  }

  .header-section {
    margin-bottom: 24px;
  }

  .header-section h1 {
    font-size: 26px;
    font-weight: 800;
    color: #f8fafc;
    margin: 0 0 6px 0;
  }

  .header-section p {
    color: #94a3b8;
    font-size: 14px;
    margin: 0;
  }

  .table-wrapper {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    padding: 14px 16px;
    border-bottom: 1px solid #334155;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: #e2e8f0;
    border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  }

  tr:last-child td {
    border-bottom: none;
  }

  .user-info {
    display: flex;
    flex-direction: column;
  }

  .user-info strong {
    color: #f8fafc;
    font-size: 14px;
  }

  .user-info span {
    color: #94a3b8;
    font-size: 12px;
  }

  .coin-badge {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
  }

  .status-badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  .status-badge.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .status-badge.approved {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-badge.rejected {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .date-col {
    color: #94a3b8;
    font-size: 13px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .btn-approve {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-approve:hover {
    background: rgba(16, 185, 129, 0.3);
  }

  .btn-reject {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-reject:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .completed-text {
    color: #94a3b8;
    font-size: 13px;
  }

  .empty-row {
    text-align: center;
    color: #94a3b8;
    padding: 30px;
  }
</style>