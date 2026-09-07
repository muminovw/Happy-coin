<script>
  import { onMount } from 'svelte';

  // Hozirgi o'quvchining balansi (buni Supabase'dan olasiz)
  let myCoins = 145;

  // Do'kondagi mahsulotlar ro'yxati
  let shopItems = [
    { id: 1, name: 'Maktab daftari (100 varaq)', price: 30, icon: '📓', stock: 15 },
    { id: 2, name: 'Stilniy ruchka', price: 20, icon: '✒️', stock: 25 },
    { id: 3, name: 'Matematika to‘plami', price: 80, icon: '📐', stock: 5 },
    { id: 4, name: 'Stikerlar to‘plami', price: 15, icon: '🎨', stock: 40 },
    { id: 5, name: 'Termos (Maxsus logotipli)', price: 150, icon: '🥤', stock: 3 },
    { id: 6, name: 'USB Fleshka (32GB)', price: 250, icon: '💾', stock: 2 }
  ];

  let successMessage = '';
  let errorMessage = '';

  function handleBuyItem(item) {
    successMessage = '';
    errorMessage = '';

    if (myCoins < item.price) {
      errorMessage = `Afsuski, "${item.name}" uchun coinlaringiz yetarli emas!`;
      return;
    }

    // Bu yerda Supabase'ga xaridni yozish va balansni ayirish kodini yozasiz
    myCoins -= item.price;
    successMessage = `Tabriklaymiz! "${item.name}" muvaffaqiyatli sotib olindi.`;

    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }
</script>

<div class="shop-container">
  <div class="header-section">
    <div>
      <h2>Coin Do'koni (Shop)</h2>
      <p class="subtitle">To'plagan coinlaringizga kerakli sovg'alar va buyumlarni xarid qiling</p>
    </div>

    <!-- Foydalanuvchining balansi ko'rsatkichi -->
    <div class="balance-card">
      <span>Mening balansom:</span>
      <strong>🪙 {myCoins} coin</strong>
    </div>
  </div>

  {#if successMessage}
    <div class="alert success">{successMessage}</div>
  {/if}

  {#if errorMessage}
    <div class="alert error">{errorMessage}</div>
  {/if}

  <!-- Mahsulotlar grid paneli -->
  <div class="items-grid">
    {#each shopItems as item}
      <div class="item-card">
        <div class="item-icon">{item.icon}</div>
        <h3>{item.name}</h3>
        <p class="stock-info">Qoldi: {item.stock} dona</p>
        
        <div class="card-footer">
          <span class="price-tag">🪙 {item.price} coin</span>
          <button 
            class="buy-btn" 
            on:click={() => handleBuyItem(item)}
            disabled={myCoins < item.price}
          >
            Sotib olish
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .shop-container {
    font-family: sans-serif;
    color: #f8fafc;
  }

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    flex-wrap: wrap;
    gap: 15px;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 14px;
  }

  .balance-card {
    background: #1e293b;
    border: 1px solid #334155;
    padding: 12px 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .balance-card span {
    font-size: 12px;
    color: #94a3b8;
  }

  .balance-card strong {
    font-size: 18px;
    color: #10b981;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }

  .item-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.2s;
  }

  .item-card:hover {
    transform: translateY(-3px);
    border-color: #475569;
  }

  .item-icon {
    font-size: 40px;
    background: #0f172a;
    width: 70px;
    height: 70px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
  }

  .item-card h3 {
    font-size: 16px;
    font-weight: 600;
    color: #f8fafc;
  }

  .stock-info {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 10px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 15px;
    border-top: 1px solid #334155;
  }

  .price-tag {
    font-weight: bold;
    color: #34d399;
    font-size: 14px;
  }

  .buy-btn {
    background: #10b981;
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }

  .buy-btn:hover:not(:disabled) {
    background: #059669;
  }

  .buy-btn:disabled {
    background: #334155;
    color: #64748b;
    cursor: not-allowed;
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

  .alert.error {
    background: #991b1b;
    color: #fee2e2;
  }
</style>