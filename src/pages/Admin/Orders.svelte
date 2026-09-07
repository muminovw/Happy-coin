<script>
  import { onMount } from 'svelte';

  // Buyurtmalar ro'yxati (buni Supabase bazasidan chaqirib olasiz)
  let orders = [
    { id: 101, student: 'Anvar Muminov', item: 'Maktab daftari (100 varaq)', price: 30, status: 'Kutilmoqda', date: '2026-06-06 14:30' },
    { id: 2, student: 'Malika Karimova', item: 'Stilniy ruchka', price: 20, status: 'Tasdiqlangan', date: '2026-06-05 11:20' },
    { id: 3, student: 'Jasurbek Olimov', item: 'Termos (Maxsus logotipli)', price: 150, status: 'Bekor qilingan', date: '2026-06-04 09:15' }
  ];

  let successMessage = '';

  function updateOrderStatus(orderId, newStatus) {
    // Bu yerda Supabase'dagi buyurtma holatini yangilash kodini yozasiz
    orders = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });

    successMessage = `Buyurtma holati "${newStatus}" ga o'zgartirildi!`;
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }
</script>

<div class="orders-container">
  <div class="header-section">
    <div>
      <h2>Buyurtmalar (Orders)</h2>
      <p class="subtitle">O'quvchilar tomonidan berilgan sovg'a buyurtmalarini boshqaring</p>
    </div>
  </div>

  {#if successMessage}
    <div class="alert success">{successMessage}</div>
  {/if}

  <!-- Buyurtmalar jadvali -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>O'quvchi</th>
          <th>Mahsulot</th>
          <th>Narxi</th>
          <th>Sana</th>
          <th>Holati</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#each orders as order}
          <tr>
            <td class="id-col">#{order.id}</td>
            <td class="student-name">{order.student}</td>
            <td>{order.item}</td>
            <td><span class="coin-pill">🪙 {order.price} coin</span></td>
            <td class="date-col">{order.date}</td>
            <td>
              <span class="status-badge {order.status === 'Kutilmoqda' ? 'pending' : order.status === 'Tasdiqlangan' ? 'approved' : 'rejected'}">
                {order.status}
              </span>
            </td>
            <td>
              {#if order.status === 'Kutilmoqda'}
                <div class="actions">
                  <button class="approve-btn" on:click={() => updateOrderStatus(order.id, 'Tasdiqlangan')}>
                    Tasdiqlash
                  </button>
                  <button class="reject-btn" on:click={() => updateOrderStatus(order.id, 'Bekor qilingan')}>
                    Rad etish
                  </button>
                </div>
              {:else}
                <span class="no-action">Bajarilgan</span>
              {/if}
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="7" class="no-data">Buyurtmalar topilmadi</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .orders-container {
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

  .id-col {
    color: #94a3b8;
    font-weight: bold;
  }

  .student-name {
    font-weight: 500;
  }

  .date-col {
    color: #94a3b8;
    font-size: 12px;
  }

  .coin-pill {
    background: #1e3a8a;
    color: #93c5fd;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
  }

  .status-badge {
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
  }

  .status-badge.pending {
    background: #78350f;
    color: #fef3c7;
  }

  .status-badge.approved {
    background: #065f46;
    color: #d1fae5;
  }

  .status-badge.rejected {
    background: #7f1d1d;
    color: #fecaca;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .approve-btn {
    background: #10b981;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
  }

  .approve-btn:hover {
    background: #059669;
  }

  .reject-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
  }

  .reject-btn:hover {
    background: #dc2626;
  }

  .no-action {
    color: #64748b;
    font-size: 13px;
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