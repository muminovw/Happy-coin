<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';
  import './Products.css'

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

