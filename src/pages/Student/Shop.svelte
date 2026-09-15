<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import './Shop.css';

  let myCoins = 0;
  let currentUser = null;
  let shopItems = [];
  let loading = true;
  let actionLoading = false;
  let successMessage = '';
  let errorMessage = '';
  let channel = null;

  onMount(async () => {
    await fetchStudentData();
    await fetchShopItems();
    setupRealtimeSubscription();
  });

  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  });

  // O'quvchining balansini hisoblash
  async function fetchStudentData() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        errorMessage = "Foydalanuvchi tizimga kirmagan!";
        return;
      }
      currentUser = user;

      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('student_id', currentUser.id);

      if (error) throw error;

      if (data) {
        myCoins = data.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
      }
    } catch (err) {
      console.error('Balansni yuklashda xatolik:', err);
      errorMessage = 'Balansni yuklab bo\'lmadi.';
    }
  }

  // Mahsulotlarni olish
  async function fetchShopItems() {
    loading = true;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      shopItems = data || [];
    } catch (err) {
      console.error('Mahsulotlarni olishda xatolik:', err);
      errorMessage = 'Mahsulotlarni yuklab bo\'lmadi.';
    } finally {
      loading = false;
    }
  }

  // Realtime: Mahsulotlar o'zgarsa avtomatik yangilash
  function setupRealtimeSubscription() {
    channel = supabase
      .channel('public:shop_products_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          await fetchShopItems();
        }
      )
      .subscribe();
  }

  // Xarid qilish va Buyurtmalarga yozish
  async function handleBuyItem(item) {
    successMessage = '';
    errorMessage = '';

    if (!currentUser) {
      errorMessage = "Foydalanuvchi aniqlanmadi!";
      return;
    }

    if (myCoins < item.price) {
      errorMessage = `Afsuski, "${item.title || item.name}" uchun coinlaringiz yetarli emas!`;
      return;
    }

    if (item.stock <= 0) {
      errorMessage = `Kechirasiz, "${item.title || item.name}" tugagan!`;
      return;
    }

    actionLoading = true;

    try {
      // 1. Tranzaksiyaga yozish (coin ayirish)
      const { error: txError } = await supabase.from('transactions').insert([
        {
          student_id: currentUser.id,
          amount: -item.price,
          reason: `Xarid: ${item.title || item.name}`,
          type: 'shop_purchase'
        }
      ]);
      if (txError) throw txError;

      // 2. Mahsulot qoldig'ini (stock) kamaytirish
      const newStock = item.stock - 1;
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id);
      if (updateError) throw updateError;

      // 3. ORDERS (Buyurtmalar) jadvaliga yozish (Admin ko'rishi uchun)
      const { error: orderError } = await supabase.from('orders').insert([
        {
          student_id: currentUser.id, // Qaysi o'quvchi xarid qilgani
          product_id: item.id,       // Qaysi mahsulot
          total_price: item.price,   // Narxi
          status: 'pending'          // Kutilmoqda holati
        }
      ]);
      if (orderError) throw orderError;

      // Natijani yangilash
      myCoins -= item.price;
      item.stock = newStock;
      successMessage = `Tabriklaymiz! "${item.title || item.name}" muvaffaqiyatli sotib olindi va adminga yuborildi.`;
      
      await fetchShopItems();
    } catch (err) {
      console.error('Xarid qilishda xatolik:', err);
      errorMessage = 'Xarid qilishda xatolik yuz berdi: ' + err.message;
    } finally {
      actionLoading = false;
    }
  }
</script>

<div class="shop-container">
  <div class="header-section">
    <div>
      <h2>Coin Do'koni</h2>
      <p class="subtitle">To'plagan coinlaringizga sovg'alar xarid qiling</p>
    </div>
    <div class="balance-card">
      <span>Mening balansim:</span>
      <strong>🪙 {myCoins} coin</strong>
    </div>
  </div>

  {#if successMessage}<div class="alert success">{successMessage}</div>{/if}
  {#if errorMessage}<div class="alert error">{errorMessage}</div>{/if}

  {#if loading}
    <div class="loading-state">Mahsulotlar yuklanmoqda...</div>
  {:else if shopItems.length === 0}
    <div class="loading-state">Hozircha do'konda mahsulotlar mavjud emas.</div>
  {:else}
    <div class="items-grid">
      {#each shopItems as item (item.id)}
        <div class="item-card">
          <div class="item-icon">🎁</div>
          <h3>{item.title || item.name}</h3>
          <p class="stock-info">Qoldi: {item.stock} dona</p>
          <div class="card-footer">
            <span class="price-tag">🪙 {item.price} coin</span>
            <button 
              class="buy-btn" 
              on:click={() => handleBuyItem(item)}
              disabled={myCoins < item.price || actionLoading || item.stock <= 0}
            >
              {actionLoading ? 'Jarayonda...' : (item.stock > 0 ? 'Sotib olish' : 'Tugagan')}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>