<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

  let products = [];
  let loading = true;
  let channel = null;

  // Yangi mahsulot qo'shish uchun o'zgaruvchilar
  let newName = '';
  let newPrice = '';
  let newIcon = '🎁';
  let newStock = '';
  let successMessage = '';
  let errorMessage = '';
  let isSubmitting = false;

  onMount(async () => {
    await fetchProducts();
    setupRealtimeSubscription();
  });

  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  });

  // Mahsulotlarni bazadan tortib kelish
  async function fetchProducts() {
    try {
      loading = true;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      products = data || [];
    } catch (err) {
      console.error('Mahsulotlarni yuklashda xatolik:', err);
      errorMessage = 'Mahsulotlarni yuklashda xatolik yuz berdi.';
    } finally {
      loading = false;
    }
  }

  // Realtime tinglovchi
  function setupRealtimeSubscription() {
    channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          await fetchProducts();
        }
      )
      .subscribe();
  }

  // Yangi mahsulotni Supabase bazasiga qo'shish
  async function handleAddProduct(event) {
    event.preventDefault();
    if (!newName || !newPrice || !newStock) return;

    try {
      isSubmitting = true;
      errorMessage = '';

      const { error } = await supabase.from('products').insert([
        {
          name: newName,          // 'title' o'rniga 'name' qilindi (bazadagi ustun nomiga moslab)
          price: Number(newPrice),
          icon: newIcon,
          stock: Number(newStock)
        }
      ]);

      if (error) throw error;

      successMessage = `"${newName}" muvaffaqiyatli qo'shildi!`;
      newName = '';
      newPrice = '';
      newStock = '';
      newIcon = '🎁';

      setTimeout(() => {
        successMessage = '';
      }, 3000);

      await fetchProducts();
    } catch (err) {
      console.error('Mahsulot qo\'shishda xatolik:', err);
      errorMessage = `Xatolik: ${err.message}`;
    } finally {
      isSubmitting = false;
    }
  }

  // Mahsulotni o'chirish
  async function handleDeleteProduct(id) {
    if (!confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
    } catch (err) {
      console.error('O\'chirishda xatolik:', err);
      alert(`Xatolik yuz berdi: ${err.message}`);
    }
  }
</script>

<div class="products-container">
  <div class="header-section">
    <div>
      <h2>Mahsulotlar Boshqaruvi</h2>
      <p class="subtitle">Do'kon uchun yangi sovg'alar qo'shing va mavjudlarini boshqaring</p>
    </div>
  </div>

  {#if successMessage}
    <div class="alert success">{successMessage}</div>
  {/if}

  {#if errorMessage}
    <div class="alert error">{errorMessage}</div>
  {/if}

  <!-- Yangi mahsulot qo'shish formasi -->
  <div class="form-card">
    <h3>Yangi mahsulot qo'shish</h3>
    <form on:submit={handleAddProduct}>
      <div class="form-grid">
        <div class="input-group">
          <label for="name">Mahsulot nomi</label>
          <input type="text" id="name" placeholder="Masalan: Termos" bind:value={newName} required />
        </div>

        <div class="input-group">
          <label for="price">Narxi (Coin)</label>
          <input type="number" id="price" placeholder="50" bind:value={newPrice} required min="1" />
        </div>

        <div class="input-group">
          <label for="stock">Miqdori (Soni)</label>
          <input type="number" id="stock" placeholder="10" bind:value={newStock} required min="0" />
        </div>

        <div class="input-group">
          <label for="icon">Emoji (Belgi)</label>
          <input type="text" id="icon" placeholder="🎁" bind:value={newIcon} maxlength="4" />
        </div>
      </div>

      <button type="submit" class="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Qo\'shilmoqda...' : 'Mahsulot qo\'shish'}
      </button>
    </form>
  </div>

  <!-- Mahsulotlar jadvali -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Belgi</th>
          <th>Nomi</th>
          <th>Narxi</th>
          <th>Qoldiq (Soni)</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#if loading}
          <tr>
            <td colspan="5" class="no-data">Mahsulotlar yuklanmoqda...</td>
          </tr>
        {:else if products.length === 0}
          <tr>
            <td colspan="5" class="no-data">Hozircha mahsulotlar mavjud emas.</td>
          </tr>
        {:else}
          {#each products as product (product.id)}
            <tr>
              <td class="icon-col">{product.icon || '🎁'}</td>
              <td class="product-name">{product.name}</td>
              <td><span class="coin-pill">🪙 {product.price} coin</span></td>
              <td>{product.stock} dona</td>
              <td>
                <button class="delete-btn" on:click={() => handleDeleteProduct(product.id)}>
                  O'chirish
                </button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style>
  .products-container {
    font-family: sans-serif;
    color: #f8fafc;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-section {
    margin-bottom: 25px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 4px;
    color: #f8fafc;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 14px;
  }

  .form-card {
    background: #1e293b;
    border: 1px solid #334155;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
  }

  .form-card h3 {
    font-size: 16px;
    margin-bottom: 15px;
    color: #f43f5e;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .input-group label {
    font-size: 12px;
    color: #94a3b8;
  }

  .input-group input {
    padding: 10px;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 6px;
    color: white;
    font-size: 14px;
  }

  .input-group input:focus {
    outline: none;
    border-color: #f43f5e;
  }

  .submit-btn {
    background: #f43f5e;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    background: #e11d48;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .table-container {
    background: #1e293b;
    border-radius: 10px;
    border: 1px solid #334155;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  }

  th, td {
    padding: 15px 20px;
    border-bottom: 1px solid #334155;
  }

  th {
    background: #0f172a;
    color: #94a3b8;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .icon-col {
    font-size: 20px;
  }

  .product-name {
    font-weight: 500;
    color: #f8fafc;
  }

  .coin-pill {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
  }

  .delete-btn {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }

  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .no-data {
    text-align: center;
    color: #94a3b8;
    padding: 30px;
  }

  .alert {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .alert.success {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .alert.error {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
</style>