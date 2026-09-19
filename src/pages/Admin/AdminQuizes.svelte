<script>
  import { supabase } from '../../lib/SupabaseClient';
  import "./AdminQuizes.css";

  let title = '';
  let description = '';
  let coins = 15;
  let date = new Date().toISOString().split('T')[0];

  // Savollar massivi (type qo'shildi)
  let questions = [
    {
      type: 'multiple',          // 'multiple' yoki 'text'
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: ''
    }
  ];

  let loading = false;

  function addQuestionField(type = 'multiple') {
    questions = [
      ...questions,
      {
        type,
        question_text: '',
        options: type === 'multiple' ? ['', '', '', ''] : [],
        correct_answer: ''
      }
    ];
  }

  function removeQuestionField(index) {
    questions = questions.filter((_, i) => i !== index);
  }

  function changeQuestionType(index, newType) {
    questions[index].type = newType;
    if (newType === 'multiple') {
      questions[index].options = ['', '', '', ''];
      questions[index].correct_answer = '';
    } else {
      questions[index].options = [];
      questions[index].correct_answer = '';
    }
    questions = [...questions]; // reactivity uchun
  }

  async function handleSaveQuiz() {
    if (!title.trim()) {
      alert("Iltimos, quiz nomini kiriting!");
      return;
    }

    // Validatsiya
    for (let q of questions) {
      if (!q.question_text.trim()) {
        alert("Barcha savollar to‘ldirilishi shart!");
        return;
      }
      if (q.type === 'multiple' && !q.correct_answer) {
        alert("Variantli savollarda to‘g‘ri javobni belgilang!");
        return;
      }
      if (q.type === 'text' && !q.correct_answer.trim()) {
        alert("Yozma savollarda to‘g‘ri javobni yozing!");
        return;
      }
    }

    loading = true;
    try {
      // 1. Asosiy quizni saqlash
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert([{ title, description, coins, status: 'active', date }])
        .select()
        .single();

      if (quizError) throw quizError;
      const quizId = quizData.id;

      // 2. Savollarni saqlash
      for (let q of questions) {
        const { error: qError } = await supabase
          .from('quiz_questions')
          .insert([{
            quiz_id: quizId,
            question_text: q.question_text,
            question_type: q.type,                    // yangi maydon
            options: q.type === 'multiple' ? q.options : null,
            correct_answer: q.correct_answer
          }]);

        if (qError) throw qError;
      }

      alert("Quiz va uning savollari muvaffaqiyatli saqlandi! 🎉");

      // Formani tozalash
      title = '';
      description = '';
      coins = 15;
      date = new Date().toISOString().split('T')[0];
      questions = [
        {
          type: 'multiple',
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: ''
        }
      ];
    } catch (err) {
      console.error("Saqlashda xatolik:", err.message);
      alert("Xatolik yuz berdi: " + err.message);
    } finally {
      loading = false;
    }
  }
</script>

<div class="admin-quiz-creator">
  <div class="page-header">
    <h2>Yangi Quiz Qo‘shish</h2>
    <p class="subtitle">Variantli va yozma savollar bilan quiz yarating</p>
  </div>

  <!-- Asosiy ma'lumotlar -->
  <div class="card">
    <div class="form-group">
      <label>Quiz nomi</label>
      <input type="text" bind:value={title} placeholder="Masalan: JavaScript asoslari" />
    </div>

    <div class="form-group">
      <label>Tavsif (qisqacha)</label>
      <textarea bind:value={description} placeholder="Quiz haqida qisqacha ma'lumot..." rows="3"></textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Coin mukofoti</label>
        <input type="number" bind:value={coins} min="1" />
      </div>
      <div class="form-group">
        <label>Sana</label>
        <input type="date" bind:value={date} />
      </div>
    </div>
  </div>

  <!-- Savollar -->
  <div class="section-title">
    <h3>Savollar ro‘yxati</h3>
    <div class="add-buttons">
      <button class="btn-add" on:click={() => addQuestionField('multiple')}>
        + Variantli savol
      </button>
      <button class="btn-add outline" on:click={() => addQuestionField('text')}>
        + Yozma savol
      </button>
    </div>
  </div>

  {#each questions as q, qIndex}
    <div class="question-block" class:text-type={q.type === 'text'}>
      <div class="q-header">
        <div class="q-left">
          <span class="q-number">{qIndex + 1}-savol</span>
          <select
            class="type-select"
            value={q.type}
            on:change={(e) => changeQuestionType(qIndex, e.target.value)}
          >
            <option value="multiple">Variantli</option>
            <option value="text">Yozma javob</option>
          </select>
        </div>

        {#if questions.length > 1}
          <button class="del-q-btn" on:click={() => removeQuestionField(qIndex)}>
            O‘chirish
          </button>
        {/if}
      </div>

      <div class="form-group">
        <label>Savol matni</label>
        <input
          type="text"
          bind:value={q.question_text}
          placeholder="Savolni yozing..."
          class="q-input"
        />
      </div>

      <!-- VARIANTLI SAVOL -->
      {#if q.type === 'multiple'}
        <div class="options-container">
          <label>Variantlar va to‘g‘ri javob</label>
          {#each q.options as _, oIndex}
            <div class="option-row">
              <span class="option-letter">{String.fromCharCode(65 + oIndex)}</span>
              <input
                type="text"
                bind:value={q.options[oIndex]}
                placeholder="{oIndex + 1}-variant"
              />
              <label class="correct-radio">
                <input
                  type="radio"
                  name="correct-{qIndex}"
                  value={q.options[oIndex]}
                  bind:group={q.correct_answer}
                />
                To‘g‘ri
              </label>
            </div>
          {/each}
        </div>

      <!-- YOZMA SAVOL -->
      {:else}
        <div class="form-group">
          <label>To‘g‘ri javob (yozma)</label>
          <input
            type="text"
            bind:value={q.correct_answer}
            placeholder="To‘g‘ri javobni yozing..."
            class="q-input"
          />
          <p class="hint">O‘quvchi shu javobni yozishi kerak bo‘ladi</p>
        </div>
      {/if}
    </div>
  {/each}

  <!-- Saqlash tugmasi -->
  <div class="save-section">
    <button class="save-btn" disabled={loading} on:click={handleSaveQuiz}>
      {loading ? 'Saqlanmoqda...' : 'Quizni bazaga saqlash'}
    </button>
  </div>
</div>