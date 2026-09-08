<script>
  import { onMount } from 'svelte';

  // Do'kondagi mahsulotlar ro'yxati (buni Supabase bazasidan olib kelasiz)
  let products = [
    { id: 1, name: 'Maktab daftari (100 varaq)', price: 30, icon: '📓', stock: 15 },
    { id: 2, name: 'Stilniy ruchka', price: 20, icon: '✒️', stock: 25 },
    { id: 3, name: 'Matematika to‘plami', price: 80, icon: '📐', stock: 5 },
    { id: 4, name: 'Stikerlar to‘plami', price: 15, icon: '🎨', stock: 40 }
  ];

  // Yangi mahsulot qo'shish uchun o'zgaruvchilar
  let newName = '';
  let newPrice = '';
  let newIcon = '🎁';
  let newStock = '';
  let successMessage = '';

  function handleAddProduct(event) {
    event.preventDefault();
    if (!newName || !newPrice || !newStock) return;

    const newItem = {
      id: Date.now(),
      name: newName,
      price: Number(newPrice),
      icon: newIcon,
      stock: Number(newStock)
    };

    // Bu yerda Supabase bazasiga yangi mahsulotni qo'shish kodini yozasiz
    products = [newItem, ...products];

    successMessage = `"${newName}" muvaffaqiyatli qo'shildi!`;
    newName = '';
    newPrice = '';
    newStock = '';

    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  function handleDeleteProduct(id) {
    // Supabase'dan o'chirish kodini yozasiz
    products = products.filter(p => p.id !== id);
  }
</script>

<div class="products-container">
  <div class="header-section">
    <div>
      <h2>Mahsulotlar Boshqaruvi (Products)</h2>
      <p class="subtitle">Do'kon uchun yangi sovg'alar qo'shing va mavjudlarini boshqaring</p>
    </div>
  </div>

  {#if successMessage}
    <div class="alert success">{successMessage}</div>
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
          <input type="number" id="price" placeholder="50" bind:value={newPrice} required />
        </div>

        <div class="input-group">
          <label for="stock">Miqdori (Soni)</label>
          <input type="number" id="stock" placeholder="10" bind:value={newStock} required />
        </div>

        <div class="input-group">
          <label for="icon">Emoji (Belgi)</label>
          <input type="text" id="icon" placeholder="🎁" bind:value={newIcon} maxlength="2" />
        </div>
      </div>

      <button type="submit" class="submit-btn">Mahsulot qo'shish.</button>
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
        {#each products as product}
          <tr>
            <td class="icon-col">{product.icon}</td>
            <td class="product-name">{product.name}</td>
            <td><span class="coin-pill">🪙 {product.price} coin</span></td>
            <td>{product.stock} dona</td>
            <td>
              <button class="delete-btn" on:click={() => handleDeleteProduct(product.id)}>
                O'chirish
              </button>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="5" class="no-data">Mahsulotlar topilmadi</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .products-container {
    font-family: sans-serif;
    color: #f8fafc;
  }

  .header-section {
    margin-bottom: 25px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 14px;
  }

  /* Forma dizayni */
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

  .submit-btn:hover {
    background: #e11d48;
  }

  /* Jadval dizayni */
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
  }

  .coin-pill {
    background: #7f1d1d;
    color: #fecaca;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
  }

  .delete-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
  }

  .delete-btn:hover {
    background: #dc2626;
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
    background: #065f46;
    color: #d1fae5;
  }
</style>