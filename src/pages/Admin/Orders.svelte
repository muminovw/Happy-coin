<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import './Orders.css';

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

  // Buyurtmalarni profiles va products jadvallari bilan xatolarsiz bog'lab tortib kelish
  async function fetchOrders() {
    try {
      loading = true;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_price,
          status,
          created_at,
          student_id,
          profiles (id, name, email),
          products (name, price)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      orders = data || [];
    } catch (err) {
      console.error('Buyurtmalarni yuklashda xatolik:', err.message);
    } finally {
      loading = false;
    }
  }

  // Realtime: O'quvchi xarid qilganda admin panelini avtomatik yangilash
  function setupRealtimeSubscription() {
    channel = supabase
      .channel('public:orders_professional_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          console.log('Realtime buyurtma o\'zgarishi:', payload);
          await fetchOrders();
        }
      )
      .subscribe();
  }

  // Buyurtma holatini yangilash (Tasdiqlash / Rad etish)
  async function updateOrderStatus(orderId, newStatus) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Interfeysni tezkor yangilash
      orders = orders.map(ord => 
        ord.id === orderId ? { ...ord, status: newStatus } : ord
      );

      alert(`Buyurtma muvaffaqiyatli ${newStatus === 'approved' ? 'tasdiqlandi' : 'rad etildi'}!`);
    } catch (err) {
      console.error('Holatni o\'zgartirishda xatolik:', err);
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
              <!-- O'quvchi ma'lumotlari -->
              <td>
                <div class="user-info">
                  <strong>{order.profiles?.name || 'Nomaʼlum o\'quvchi'}</strong>
                  <span>{order.profiles?.email || 'Email ko\'rsatilmagan'}</span>
                </div>
              </td>

              <!-- Mahsulot nomi -->
              <td>{order.products?.name || 'Mahsulot o\'chirilgan'}</td>

              <!-- Narxi -->
              <td>
                <span class="coin-badge">🪙 {order.total_price || order.products?.price || 0} coin</span>
              </td>

              <!-- Holati badge -->
              <td>
                <span class="status-badge {order.status}">
                  {order.status === 'pending' ? 'Kutilmoqda' : order.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                </span>
              </td>

              <!-- Sana -->
              <td class="date-col">{new Date(order.created_at).toLocaleString()}</td>

              <!-- Amallar -->
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