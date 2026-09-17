<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  let questions = [];
  let loading = true;
  let questionText = '';
  let optionA = '';
  let optionB = '';
  let optionC = '';
  let correctAnswer = '';
  let message = '';
  let isError = false;

  // Bazadan barcha savolarni tortib kelish
  async function fetchAdminQuestions() {
    try {
      loading = true;
      const { data, error } = await supabase
        .from('daily_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      questions = data || [];
    } catch (err) {
      console.error("Xatolik:", err.message);
    } finally {
      loading = false;
    }
  }

  // Yangi savol qo'shish
  async function handleAddQuestion(e) {
    e.preventDefault();
    message = '';
    isError = false;

    if (!questionText || !optionA || !optionB || !correctAnswer) {
      message = "Iltimos, asosiy maydonlarni (savol, variant A, B va to'g'ri javob) to'ldiring!";
      isError = true;
      return;
    }

    const options = [optionA, optionB, optionC].filter(Boolean);

    const { error } = await supabase.from('daily_questions').insert([
      {
        question: questionText,
        options: options,
        correct_answer: correctAnswer,
        coin_reward: 1 // Har bir savol uchun 1 coin
      }
    ]);

    if (error) {
      message = "Xatolik yuz berdi: " + error.message;
      isError = true;
    } else {
      message = "Savol muvaffaqiyatli qo'shildi! 🚀";
      questionText = '';
      optionA = '';
      optionB = '';
      optionC = '';
      correctAnswer = '';
      fetchAdminQuestions();
    }
  }

  // Savolni o'chirish
  async function deleteQuestion(id) {
    if (!confirm("Haqiqatan ham bu savolni o'chirmoqchimisiz?")) return;

    const { error } = await supabase
      .from('daily_questions')
      .delete()
      .eq('id', id);

    if (error) {
      alert("O'chirishda xatolik: " + error.message);
    } else {
      fetchAdminQuestions();
    }
  }

  onMount(() => {
    fetchAdminQuestions();
  });
</script>

<div class="admin-quiz-container">
  <div class="header">
    <h2>🛠️ Kunlik Savollarni Boshqarish (Admin Panel)</h2>
    <p>Bu yerdan yangi kunlik viktorina savollarini qo'shishingiz yoki keraksizlarini o'chirishingiz mumkin.</p>
  </div>

  <!-- Savol qo'shish formasi -->
  <form class="quiz-form" on:submit={handleAddQuestion}>
    <h3>Yangi Savol Qo'shish</h3>
    
    {#if message}
      <div class={isError ? "alert error" : "alert success"}>{message}</div>
    {/if}

    <div class="form-group">
      <label>Savol matni:</label>
      <textarea bind:value={questionText} placeholder="Masalan: JavaScript da o'zgaruvchi qanday e'lon qilinadi?" rows="3" required></textarea>
    </div>

    <div class="options-grid">
      <div class="form-group">
        <label>Variant A:</label>
        <input type="text" bind:value={optionA} placeholder="Masalan: let" required />
      </div>
      <div class="form-group">
        <label>Variant B:</label>
        <input type="text" bind:value={optionB} placeholder="Masalan: variable" required />
      </div>
      <div class="form-group">
        <label>Variant C (Ixtiyoriy):</label>
        <input type="text" bind:value={optionC} placeholder="Masalan: var" />
      </div>
    </div>

    <div class="form-group">
      <label>To'g'ri javob (Yuqoridagi variantlardan birini aynan matnidek yozing):</label>
      <input type="text" bind:value={correctAnswer} placeholder="Masalan: let" required />
    </div>

    <button type="submit" class="btn-submit">Savolni Bazaga Qo'shish (🪙 1 Coin)</button>
  </form>

  <!-- Mavjud savollar ro'yxati -->
  <div class="questions-list-section">
    <h3>Mavjud Savollar Ro'yxati</h3>
    
    {#if loading}
      <p class="loading">Yuklanmoqda...</p>
    {:else if questions.length === 0}
      <p class="empty">Hozircha bazada savollar mavjud emas.</p>
    {:else}
      <div class="questions-grid">
        {#each questions as q (q.id)}
          <div class="question-card">
            <div class="card-info">
              <h4>{q.question}</h4>
              <div class="options-tags">
                {#each (q.options || []) as opt}
                  <span class="opt-tag {opt === q.correct_answer ? 'correct' : ''}">
                    {opt} {opt === q.correct_answer ? '✓' : ''}
                  </span>
                {/each}
              </div>
            </div>
            <button class="btn-delete" on:click={() => deleteQuestion(q.id)}>🗑️ O'chirish</button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .admin-quiz-container {
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    font-family: inherit;
    color: #14201c;
    overflow-y: auto;
  }

  .header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #14243d;
  }

  .header p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #72827a;
  }

  .quiz-form, .questions-list-section {
    background: #ffffff;
    border: 1px solid #e8ece9;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(21, 45, 36, 0.03);
  }

  .quiz-form h3, .questions-list-section h3 {
    margin-top: 0;
    font-size: 16px;
    font-weight: 750;
    color: #14243d;
    margin-bottom: 16px;
  }

  .form-group {
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 12px;
    font-weight: 700;
    color: #55635c;
  }

  .form-group textarea, .form-group input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #e8ece9;
    font-size: 13px;
    outline: none;
    background: #fafcfb;
  }

  .form-group textarea:focus, .form-group input:focus {
    border-color: #16ad7d;
    background: #fff;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .btn-submit {
    width: 100%;
    padding: 12px;
    background: #16ad7d;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 750;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 6px;
  }

  .btn-submit:hover {
    background: #0b825c;
  }

  .alert {
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 14px;
  }

  .alert.success { background: #edfaf5; color: #0b825c; }
  .alert.error { background: #fdf2f2; color: #e74c3c; }

  .questions-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .question-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8faf9;
    border: 1px solid #e8ece9;
    border-radius: 12px;
    gap: 16px;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .card-info h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 750;
    color: #14243d;
  }

  .options-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wp;
    flex-wrap: wrap;
  }

  .opt-tag {
    padding: 3px 8px;
    background: #eef2f0;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #55635c;
  }

  .opt-tag.correct {
    background: #edfaf5;
    color: #0b825c;
    font-weight: 750;
    border: 1px solid #c1f2de;
  }

  .btn-delete {
    padding: 8px 12px;
    background: #fdf2f2;
    color: #e74c3c;
    border: 1px solid #f9dede;
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .btn-delete:hover {
    background: #fce8e8;
  }

  .loading, .empty {
    color: #72827a;
    font-size: 13px;
    text-align: center;
    padding: 20px;
  }
</style>