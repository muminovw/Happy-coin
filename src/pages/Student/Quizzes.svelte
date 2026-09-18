<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/SupabaseClient';

  export let studentId; // Tizimdagi o'quvchining ID raqami

  let quizzes = [];
  let completedQuizIds = new Set(); // Oldindan ishlangan quizlar ID si
  let loading = true;
  let selectedQuiz = null; 
  let questions = [];
  let userAnswers = {}; 
  let submitting = false;
  let scoreResult = null;

  onMount(async () => {
    await fetchQuizzesAndResults();
  });

  // Quizlarni va o'quvchining oldingi natijalarini birga tortib kelamiz
  async function fetchQuizzesAndResults() {
    loading = true;
    try {
      // 1. Barcha quizlarni olish
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .order('id', { ascending: false });

      if (quizError) throw quizError;
      quizzes = quizData || [];

      // 2. O'quvchi oldin qaysi quizlarni ishlaganini tekshirish uchun natijalarni olamiz
      const { data: resultData, error: resultError } = await supabase
        .from('student_quiz_results')
        .select('quiz_id')
        .eq('student_id', studentId);

      if (!resultError && resultData) {
        completedQuizIds = new Set(resultData.map(r => r.quiz_id));
      }
    } catch (err) {
      console.error('Maʼlumotlarni yuklashda xatolik:', err.message);
    } finally {
      loading = false;
    }
  }

  async function startQuiz(quiz) {
    if (completedQuizIds.has(quiz.id)) {
      alert("Siz bu quizni allaqachon ishlab bo'lgansiz!");
      return;
    }

    selectedQuiz = quiz;
    userAnswers = {};
    scoreResult = null;
    
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id);

      if (error) throw error;
      questions = data || [];
    } catch (err) {
      console.error('Savollarni yuklashda xatolik:', err.message);
      questions = [];
    }
  }

  async function submitQuiz() {
    submitting = true;
    let correctCount = 0;

    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    // Coinlarni hisoblash (To'g'ri javoblar ulushiga qarab yoki to'liq)
    const totalCoins = selectedQuiz.coins || 15;
    const coinPerQ = Math.round(totalCoins / (questions.length || 1));
    const earnedCoins = correctCount * coinPerQ;

    try {
      // 1. Natijani student_quiz_results jadvaliga yozish
      const { error: resError } = await supabase.from('student_quiz_results').insert([
        {
          student_id: studentId,
          quiz_id: selectedQuiz.id,
          score: correctCount,
          total: questions.length,
          coins_earned: earnedCoins
        }
      ]);
      if (resError) throw resError;

      // 2. O'quvchining coin balansiga yutgan coinlarini qo'shish (profiles yoki wallets jadvali)
      // Eslatma: Bazangizdagi coin saqlanadigan jadvalga qarab buni moslaysiz (masalan: profiles yoki wallets)
      if (earnedCoins > 0) {
        // Misol uchun 'profiles' jadvalidagi coinni yangilash:
        const { data: profile } = await supabase
          .from('profiles')
          .select('coins')
          .eq('id', studentId)
          .single();

        const currentCoins = profile ? (profile.coins || 0) : 0;

        await supabase
          .from('profiles')
          .update({ coins: currentCoins + earnedCoins })
          .eq('id', studentId);
      }

      completedQuizIds.add(selectedQuiz.id);
      completedQuizIds = completedQuizIds; // Svelte reaktivligi uchun

      scoreResult = { correctCount, total: questions.length, earnedCoins };
    } catch (err) {
      console.error('Natijani saqlashda xatolik:', err.message);
      scoreResult = { correctCount, total: questions.length, earnedCoins };
    } finally {
      submitting = false;
    }
  }

  function closeQuiz() {
    selectedQuiz = null;
    questions = [];
    scoreResult = null;
    userAnswers = {};
  }
</script>

<div class="student-container">
  {#if !selectedQuiz}
    <div class="header">
      <h2>Mavjud Kunlik Quizlar</h2>
      <p>Bilimingizni sinang va coinlar yutib oling!</p>
    </div>

    {#if loading}
      <div class="center-box"><p>Yuklanmoqda...</p></div>
    {:else if quizzes.length === 0}
      <div class="center-box"><p>Hozircha quizlar mavjud emas.</p></div>
    {:else}
      <div class="quiz-grid">
        {#each quizzes as quiz (quiz.id)}
          {@const isCompleted = completedQuizIds.has(quiz.id)}
          <div class="quiz-card" class:completed-card={isCompleted}>
            <div class="card-top">
              <h3>{quiz.title}</h3>
              <span class="coin-tag">🪙 {quiz.coins || 15} Coin</span>
            </div>
            <p class="desc">{quiz.description || "Tavsif mavjud emas"}</p>
            <div class="quiz-footer">
              <span class="date">📅 {quiz.date || "Doimiy"}</span>
              {#if isCompleted}
                <span class="completed-badge">Ishlangan ✅</span>
              {:else}
                <button class="start-btn" on:click={() => startQuiz(quiz)}>Ishlash</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}

  {:else if scoreResult}
    <div class="result-card">
      <div class="emoji">🎉</div>
      <h2>Tabriklaymiz, Quiz yakunlandi!</h2>
      <div class="score-box">
        <p>To'g'ri javoblar: <strong>{scoreResult.correctCount} / {scoreResult.total}</strong></p>
        <p class="coins-won">Balansingizga qo'shildi: +{scoreResult.earnedCoins} COINS 🪙</p>
      </div>
      <button class="back-btn" on:click={closeQuiz}>Orqaga qaytish</button>
    </div>

  {:else}
    <div class="quiz-play-area">
      <div class="play-header">
        <h2>{selectedQuiz.title}</h2>
        <button class="close-btn" on:click={closeQuiz}>✕ Chiqish</button>
      </div>
      <p class="play-desc">{selectedQuiz.description}</p>

      {#if questions.length === 0}
        <div class="center-box"><p>Bu quizga hali savollar kiritilmagan!</p></div>
      {:else}
        <div class="questions-list">
          {#each questions as q, index (q.id)}
            <div class="question-box">
              <p class="q-title"><strong>{index + 1}. {q.question_text}</strong></p>
              <div class="options-list">
                {#each q.options as option}
                  <label class="option-item" class:selected={userAnswers[q.id] === option}>
                    <input type="radio" name="q-{q.id}" value={option} bind:group={userAnswers[q.id]} />
                    <span>{option}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        <button class="submit-btn" disabled={submitting} on:click={submitQuiz}>
          {submitting ? 'Tekshirilmoqda...' : 'Javoblarni topshirish'}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .student-container { padding: 2rem; max-width: 850px; margin: 0 auto; font-family: inherit; color: #1e293b; }
  .header h2 { margin: 0 0 5px 0; font-size: 1.6rem; color: #0f172a; }
  .header p { color: #64748b; margin-bottom: 1.5rem; }
  
  .quiz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
  .quiz-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; transition: 0.2s; }
  .quiz-card.completed-card { background: #f8fafc; border-color: #cbd5e1; opacity: 0.85; }
  .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
  .quiz-card h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
  .desc { color: #64748b; font-size: 0.9rem; margin-bottom: 1rem; }
  .quiz-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 0.75rem; }
  .date { font-size: 0.8rem; color: #94a3b8; }
  
  .coin-tag { background: #fffbeb; color: #b45309; padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; }
  .start-btn { background: #10b981; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
  .start-btn:hover { background: #059669; }
  .completed-badge { background: #e2e8f0; color: #475569; padding: 0.3rem 0.7rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; }

  .quiz-play-area { background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
  .play-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem; margin-bottom: 0.5rem; }
  .play-header h2 { margin: 0; font-size: 1.3rem; }
  .play-desc { color: #64748b; font-size: 0.95rem; margin-bottom: 1.5rem; }
  .close-btn { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
  .close-btn:hover { background: #fee2e2; color: #dc2626; }
  
  .question-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem; margin-bottom: 1rem; }
  .q-title { margin-top: 0; margin-bottom: 0.75rem; color: #1e293b; }
  .options-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .option-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
  .option-item:hover { background: #f1f5f9; }
  .option-item.selected { background: #e0f2fe; border-color: #38bdf8; color: #0369a1; font-weight: 500; }
  
  .submit-btn, .back-btn { background: #2563eb; color: #fff; border: none; padding: 0.75rem; width: 100%; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 1rem; }
  .submit-btn:hover { background: #1d4ed8; }
  
  .result-card { background: #fff; text-align: center; padding: 2.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
  .emoji { font-size: 3rem; margin-bottom: 0.5rem; }
  .score-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px; margin: 1rem 0; display: inline-block; min-width: 250px; }
  .coins-won { font-size: 1.1rem; color: #d97706; font-weight: bold; margin-top: 0.5rem !important; }
  .back-btn { background: #475569; }
  .back-btn:hover { background: #334155; }
  
  .center-box { text-align: center; padding: 3rem; color: #94a3b8; }
</style>