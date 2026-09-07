<script>
  import { onMount } from 'svelte';

  // O'quvchilar ro'yxati (buni keyinchalik Supabase'dan chaqirib olasiz)
  let students = [
    { id: 1, name: 'Anvar Muminov', class: '9-A' },
    { id: 2, name: 'Malika Karimova', class: '9-A' },
    { id: 3, name: 'Jasurbek Olimov', class: '9-B' }
  ];

  // Forma ma'lumotlari
  let selectedStudentId = '';
  let coinAmount = 10;
  let reason = '';
  let successMessage = '';
  let errorMessage = '';

  // Tangalarni yuborish funksiyasi
  function handleGiveCoin(event) {
    event.preventDefault();
    successMessage = '';
    errorMessage = '';

    if (!selectedStudentId) {
      errorMessage = 'Iltimos, o‘quvchini tanlang!';
      return;
    }

    if (coinAmount <= 0) {
      errorMessage = 'Tanga miqdori 0 dan ko‘p bo‘lishi kerak!';
      return;
    }

    if (!reason.trim()) {
      errorMessage = 'Iltimos, sababini yozing!';
      return;
    }

    // Bu yerda Supabase'ga ma'lumot yozish kodini yozasiz
    // Masalan: await supabase.from('coins').insert([{ student_id: selectedStudentId, amount: coinAmount, reason }]);

    const student = students.find(s => s.id == selectedStudentId);
    successMessage = `Muvaffaqiyatli! ${student.name}ga ${coinAmount} ta coin berildi.`;

    // Formani tozalash
    selectedStudentId = '';
    coinAmount = 10;
    reason = '';

    // 3 sekunddan keyin xabarni o'chirish
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }
</script>

<div class="give-coin-container">
  <h2>O'quvchiga Coin Berish</h2>

  {#if successMessage}
    <div class="alert success">{successMessage}</div>
  {/if}

  {#if errorMessage}
    <div class="alert error">{errorMessage}</div>
  {/if}

  <form on:submit={handleGiveCoin}>
    <div class="form-group">
      <label for="student">O'quvchini tanlang:</label>
      <select id="student" bind:value={selectedStudentId}>
        <option value="" disabled selected>O'quvchini tanlang...</option>
        {#each students as student}
          <option value={student.id}>{student.name} ({student.class})</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="amount">Coin miqdori:</label>
      <input 
        id="amount" 
        type="number" 
        min="1" 
        bind:value={coinAmount} 
      />
    </div>

    <div class="form-group">
      <label for="reason">Sababi / Izoh:</label>
      <textarea 
        id="reason" 
        rows="3" 
        placeholder="Masalan: Faol dars qatnashgani uchun..." 
        bind:value={reason}
      ></textarea>
    </div>

    <button type="submit" class="submit-btn">Coin Jo'natish</button>
  </form>
</div>

<style>
  .give-coin-container {
    max-width: 500px;
    margin: 30px auto;
    background: #1e1e24;
    color: #fff;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    font-family: sans-serif;
  }

  h2 {
    margin-bottom: 20px;
    font-size: 22px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }

  .form-group {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 14px;
    color: #cbd5e1;
  }

  select, input, textarea {
    padding: 10px;
    background: #2a2a33;
    border: 1px solid #444;
    color: white;
    border-radius: 6px;
    font-size: 14px;
  }

  select:focus, input:focus, textarea:focus {
    outline: none;
    border-color: #6366f1;
  }

  .submit-btn {
    width: 100%;
    padding: 12px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }

  .submit-btn:hover {
    background: #4f46e5;
  }

  .alert {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
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