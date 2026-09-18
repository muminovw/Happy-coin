<script>
  import { supabase } from '../../lib/SupabaseClient';

  let title = '';
  let description = '';
  let coins = 15;
  let date = new Date().toISOString().split('T')[0];

  // Savollar massivi
  let questions = [
    {
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: ''
    }
  ];

  let loading = false;

  function addQuestionField() {
    questions = [...questions, { question_text: '', options: ['', '', '', ''], correct_answer: '' }];
  }

  function removeQuestionField(index) {
    questions = questions.filter((_, i) => i !== index);
  }

  async function handleSaveQuiz() {
    if (!title.trim()) {
      alert("Iltimos, quiz nomini kiriting!");
      return;
    }

    loading = true;
    try {
      // 1. Quizzes jadvaliga asosiy quizni yozamiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert([{ title, description, coins, status: 'active', date }])
        .select()
        .single();

      if (quizError) throw quizError;
      const quizId = quizData.id;

      // 2. Har bir savolni quiz_questions jadvaliga quiz_id bilan bog'lab yozamiz
      for (let q of questions) {
        if (!q.question_text || !q.correct_answer) {
          alert("Barcha savollar va to'g'ri javoblar to'ldirilishi shart!");
          loading = false;
          return;
        }

        const { error: qError } = await supabase
          .from('quiz_questions')
          .insert([{
            quiz_id: quizId,
            question_text: q.question_text,
            options: q.options, // JSONB formatida saqlanadi
            correct_answer: q.correct_answer
          }]);

        if (qError) throw qError;
      }

      alert("Quiz va uning savollari muvaffaqiyatli saqlandi! 🎉");
      // Formani tozalash
      title = '';
      description = '';
      questions = [{ question_text: '', options: ['', '', '', ''], correct_answer: '' }];
    } catch (err) {
      console.error("Saqlashda xatolik:", err.message);
      alert("Xatolik yuz berdi: " + err.message);
    } finally {
      loading = false;
    }
  }
</script>

<div class="admin-quiz-creator">
  <h2>Admin: Yangi Quiz Qo'shish</h2>
  
  <div class="form-group">
    <label>Quiz nomi:</label>
    <input type="text" bind:value={title} placeholder="Masalan: JavaScript asoslari" />
  </div>

  <div class="form-group">
    <label>Tavsif (Qisqacha):</label>
    <textarea bind:value={description} placeholder="Quiz haqida qisqacha ma'lumot..."></textarea>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label>Coin mukofoti (🪙):</label>
      <input type="number" bind:value={coins} min="1" />
    </div>
    <div class="form-group">
      <label>Sana:</label>
      <input type="date" bind:value={date} />
    </div>
  </div>

  <hr class="divider" />

  <h3>Savollar ro'yxati</h3>
  {#each questions as q, qIndex}
    <div class="question-block">
      <div class="q-header">
        <span>{qIndex + 1}-savol</span>
        {#if questions.length > 1}
          <button class="del-q-btn" on:click={() => removeQuestionField(qIndex)}>O'chirish</button>
        {/if}
      </div>

      <input type="text" bind:value={q.question_text} placeholder="Savol matnini kiriting..." class="q-input" />

      <div class="options-container">
        <label>Variantlar va to'g'ri javob:</label>
        {#each q.options as _, oIndex}
          <div class="option-row">
            <input type="text" bind:value={q.options[oIndex]} placeholder="{oIndex + 1}-variant" />
            <label class="correct-radio">
              <input type="radio" name="correct-{qIndex}" value={q.options[oIndex]} bind:group={q.correct_answer} />
              To'g'ri
            </label>
          </div>
        {/each}
      </div>
    </div>
  {/each}

  <button class="add-q-btn" on:click={addQuestionField}>+ Yana savol qo'shish</button>
  <button class="save-btn" disabled={loading} on:click={handleSaveQuiz}>
    {loading ? 'Saqlanmoqda...' : 'Quizni bazaga saqlash'}
  </button>
</div>

<style>
  .admin-quiz-creator { max-width: 700px; margin: 0 auto; padding: 2rem; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; font-family: inherit; }
  .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  input, textarea { padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; }
  textarea { resize: vertical; min-height: 80px; }
  .divider { margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0; }
  .question-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; margin-bottom: 1rem; }
  .q-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 0.5rem; color: #334155; }
  .q-input { width: 100%; margin-bottom: 0.75rem; box-sizing: border-box; }
  .options-container { display: flex; flex-direction: column; gap: 0.5rem; }
  .option-row { display: flex; gap: 0.5rem; align-items: center; }
  .option-row input[type="text"] { flex: 1; }
  .correct-radio { display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; color: #16a34a; font-weight: 600; cursor: pointer; }
  .del-q-btn { background: #fee2e2; color: #dc2626; border: none; padding: 0.2rem 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
  .add-q-btn { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; margin-bottom: 1rem; }
  .save-btn { background: #2563eb; color: #fff; border: none; padding: 0.8rem; width: 100%; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; }
  .save-btn:hover { background: #1d4ed8; }
</style>