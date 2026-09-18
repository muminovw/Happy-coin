<script>
  import { onMount } from "svelte";

  // ============ STATE ============
  let quizzes = [];
  let searchQuery = "";
  let statusFilter = "all";
  let showModal = false;
  let isEditing = false;
  let currentQuizId = null;

  // Form data
  let form = {
    title: "",
    description: "",
    date: "",
    coinReward: 10,
    status: "draft",
    questions: []
  };

  // ============ MOCK DATA (keyin API bilan almashtirasiz) ============
  onMount(() => {
    quizzes = [
      {
        id: 1,
        title: "Matematika - Asosiy arifmetika",
        description: "Kunlik 5 ta savol",
        date: "2026-09-18",
        coinReward: 15,
        status: "active",
        questionsCount: 5,
        participants: 124,
        createdAt: "2026-09-15"
      },
      {
        id: 2,
        title: "Ingliz tili - Vocabulary",
        description: "Yangi so‘zlar",
        date: "2026-09-19",
        coinReward: 20,
        status: "draft",
        questionsCount: 8,
        participants: 0,
        createdAt: "2026-09-16"
      },
      {
        id: 3,
        title: "Fizika - Nyuton qonunlari",
        description: "Asosiy tushunchalar",
        date: "2026-09-17",
        coinReward: 25,
        status: "completed",
        questionsCount: 6,
        participants: 89,
        createdAt: "2026-09-14"
      }
    ];
  });

  // ============ COMPUTED ============
  $: filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ============ FUNCTIONS ============
  function openCreateModal() {
    isEditing = false;
    currentQuizId = null;
    form = {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      coinReward: 10,
      status: "draft",
      questions: [
        {
          id: Date.now(),
          text: "",
          options: ["", "", "", ""],
          correctIndex: 0
        }
      ]
    };
    showModal = true;
  }

  function openEditModal(quiz) {
    isEditing = true;
    currentQuizId = quiz.id;
    // Real loyihada API dan to‘liq savollarni olish kerak
    form = {
      title: quiz.title,
      description: quiz.description,
      date: quiz.date,
      coinReward: quiz.coinReward,
      status: quiz.status,
      questions: [
        {
          id: 1,
          text: "Namuna savol 1",
          options: ["A variant", "B variant", "C variant", "D variant"],
          correctIndex: 0
        }
      ]
    };
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function addQuestion() {
    form.questions = [
      ...form.questions,
      {
        id: Date.now() + Math.random(),
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0
      }
    ];
  }

  function removeQuestion(index) {
    if (form.questions.length <= 1) return;
    form.questions = form.questions.filter((_, i) => i !== index);
  }

  function addOption(qIndex) {
    form.questions[qIndex].options = [...form.questions[qIndex].options, ""];
  }

  function removeOption(qIndex, oIndex) {
    if (form.questions[qIndex].options.length <= 2) return;
    form.questions[qIndex].options = form.questions[qIndex].options.filter(
      (_, i) => i !== oIndex
    );
    if (form.questions[qIndex].correctIndex >= form.questions[qIndex].options.length) {
      form.questions[qIndex].correctIndex = 0;
    }
  }

  function saveQuiz() {
    // Validatsiya
    if (!form.title.trim()) {
      alert("Quiz nomi majburiy!");
      return;
    }
    if (!form.date) {
      alert("Sana majburiy!");
      return;
    }
    if (form.coinReward < 1) {
      alert("Coin mukofoti kamida 1 bo‘lishi kerak!");
      return;
    }

    for (let q of form.questions) {
      if (!q.text.trim()) {
        alert("Barcha savollar to‘ldirilishi shart!");
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        alert("Barcha variantlar to‘ldirilishi shart!");
        return;
      }
    }

    if (isEditing) {
      // Update
      quizzes = quizzes.map((q) =>
        q.id === currentQuizId
          ? {
              ...q,
              title: form.title,
              description: form.description,
              date: form.date,
              coinReward: form.coinReward,
              status: form.status,
              questionsCount: form.questions.length
            }
          : q
      );
    } else {
      // Create
      const newQuiz = {
        id: Date.now(),
        title: form.title,
        description: form.description,
        date: form.date,
        coinReward: form.coinReward,
        status: form.status,
        questionsCount: form.questions.length,
        participants: 0,
        createdAt: new Date().toISOString().split("T")[0]
      };
      quizzes = [newQuiz, ...quizzes];
    }

    closeModal();
  }

  function deleteQuiz(id) {
    if (confirm("Bu quizni o‘chirishni xohlaysizmi?")) {
      quizzes = quizzes.filter((q) => q.id !== id);
    }
  }

  function changeStatus(id, newStatus) {
    quizzes = quizzes.map((q) =>
      q.id === id ? { ...q, status: newStatus } : q
    );
  }

  function getStatusBadge(status) {
    const map = {
      active: { text: "Faol", class: "badge-active" },
      draft: { text: "Qoralama", class: "badge-draft" },
      completed: { text: "Yakunlangan", class: "badge-completed" }
    };
    return map[status] || map.draft;
  }
</script>

<div class="quizzes-admin">
  <!-- HEADER -->
  <div class="page-header">
    <div class="header-left">
      <h1>Kunlik Quizlar</h1>
      <p>O‘quvchilar har kuni quiz yechib coin yutib olishadi</p>
    </div>
    <button class="btn-primary" on:click={openCreateModal}>
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      Yangi Quiz yaratish
    </button>
  </div>

  <!-- FILTERS -->
  <div class="filters">
    <div class="search-box">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M20 20l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <input
        type="text"
        placeholder="Quiz nomi bo‘yicha qidirish..."
        bind:value={searchQuery}
      />
    </div>

    <div class="status-filters">
      <button
        class:active={statusFilter === "all"}
        on:click={() => (statusFilter = "all")}
      >Barchasi</button>
      <button
        class:active={statusFilter === "active"}
        on:click={() => (statusFilter = "active")}
      >Faol</button>
      <button
        class:active={statusFilter === "draft"}
        on:click={() => (statusFilter = "draft")}
      >Qoralama</button>
      <button
        class:active={statusFilter === "completed"}
        on:click={() => (statusFilter = "completed")}
      >Yakunlangan</button>
    </div>
  </div>

  <!-- TABLE -->
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Quiz nomi</th>
          <th>Sana</th>
          <th>Coin</th>
          <th>Savollar</th>
          <th>Ishtirokchilar</th>
          <th>Holat</th>
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredQuizzes as quiz (quiz.id)}
          <tr>
            <td>
              <div class="quiz-title">
                <strong>{quiz.title}</strong>
                <span class="desc">{quiz.description}</span>
              </div>
            </td>
            <td>{quiz.date}</td>
            <td>
              <span class="coin-badge">
                <span class="coin-icon">$</span>
                {quiz.coinReward}
              </span>
            </td>
            <td>{quiz.questionsCount} ta</td>
            <td>{quiz.participants}</td>
            <td>
              <span class="badge {getStatusBadge(quiz.status).class}">
                {getStatusBadge(quiz.status).text}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="btn-icon" title="Tahrirlash" on:click={() => openEditModal(quiz)}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                </button>

                {#if quiz.status === "draft"}
                  <button class="btn-icon success" title="Faollashtirish" on:click={() => changeStatus(quiz.id, "active")}>
                    ▶
                  </button>
                {:else if quiz.status === "active"}
                  <button class="btn-icon warning" title="Yakunlash" on:click={() => changeStatus(quiz.id, "completed")}>
                    ■
                  </button>
                {/if}

                <button class="btn-icon danger" title="O‘chirish" on:click={() => deleteQuiz(quiz.id)}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="7" class="empty">
              Hech qanday quiz topilmadi
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<!-- ================= MODAL ================= -->
{#if showModal}
  <div class="modal-overlay" on:click|self={closeModal}>
    <div class="modal">
      <div class="modal-header">
        <h2>{isEditing ? "Quizni tahrirlash" : "Yangi Quiz yaratish"}</h2>
        <button class="close-btn" on:click={closeModal}>×</button>
      </div>

      <div class="modal-body">
        <!-- Asosiy ma'lumotlar -->
        <div class="form-grid">
          <div class="form-group full">
            <label>Quiz nomi *</label>
            <input type="text" bind:value={form.title} placeholder="Masalan: Matematika - Kunlik test" />
          </div>

          <div class="form-group full">
            <label>Tavsif</label>
            <textarea bind:value={form.description} rows="2" placeholder="Qisqacha izoh..."></textarea>
          </div>

          <div class="form-group">
            <label>Sana *</label>
            <input type="date" bind:value={form.date} />
          </div>

          <div class="form-group">
            <label>Coin mukofoti *</label>
            <input type="number" bind:value={form.coinReward} min="1" max="1000" />
          </div>

          <div class="form-group">
            <label>Holat</label>
            <select bind:value={form.status}>
              <option value="draft">Qoralama</option>
              <option value="active">Faol</option>
              <option value="completed">Yakunlangan</option>
            </select>
          </div>
        </div>

        <!-- Savollar -->
        <div class="questions-section">
          <div class="section-header">
            <h3>Savollar ({form.questions.length})</h3>
            <button class="btn-secondary" on:click={addQuestion}>+ Savol qo‘shish</button>
          </div>

          {#each form.questions as question, qIndex (question.id)}
            <div class="question-card">
              <div class="question-header">
                <span class="q-number">Savol {qIndex + 1}</span>
                <button class="btn-icon danger" on:click={() => removeQuestion(qIndex)} disabled={form.questions.length <= 1}>
                  O‘chirish
                </button>
              </div>

              <div class="form-group">
                <label>Savol matni *</label>
                <input type="text" bind:value={question.text} placeholder="Savolni yozing..." />
              </div>

              <div class="options-list">
                <label>Variantlar *</label>
                {#each question.options as option, oIndex}
                  <div class="option-row">
                    <input
                      type="radio"
                      name="correct-{question.id}"
                      checked={question.correctIndex === oIndex}
                      on:change={() => (question.correctIndex = oIndex)}
                    />
                    <input
                      type="text"
                      bind:value={question.options[oIndex]}
                      placeholder={`Variant ${oIndex + 1}`}
                    />
                    <button
                      class="btn-icon danger small"
                      on:click={() => removeOption(qIndex, oIndex)}
                      disabled={question.options.length <= 2}
                    >×</button>
                  </div>
                {/each}
                <button class="btn-text" on:click={() => addOption(qIndex)}>
                  + Variant qo‘shish
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={closeModal}>Bekor qilish</button>
        <button class="btn-primary" on:click={saveQuiz}>
          {isEditing ? "Saqlash" : "Yaratish"}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .quizzes-admin {
    padding: 0;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    color: #1e293b;
  }

  /* Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }
  .header-left h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }
  .header-left p {
    color: #64748b;
    margin: 0;
    font-size: 0.95rem;
  }

  /* Buttons */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    border: none;
    padding: 0.7rem 1.25rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #334155;
    border: none;
    padding: 0.6rem 1.1rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
  }
  .btn-secondary:hover {
    background: #e2e8f0;
  }

  .btn-text {
    background: none;
    border: none;
    color: #f59e0b;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.3rem 0;
  }

  .btn-icon {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
    transition: all 0.15s;
  }
  .btn-icon:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
  .btn-icon.danger:hover {
    background: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
  }
  .btn-icon.success:hover {
    background: #f0fdf4;
    color: #16a34a;
  }
  .btn-icon.warning:hover {
    background: #fffbeb;
    color: #d97706;
  }
  .btn-icon.small {
    width: 28px;
    height: 28px;
    font-size: 1.1rem;
  }

  /* Filters */
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  .search-box {
    flex: 1;
    min-width: 260px;
    position: relative;
  }
  .search-box svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
  .search-box input {
    width: 100%;
    padding: 0.7rem 1rem 0.7rem 2.6rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.95rem;
    outline: none;
    transition: border 0.2s;
  }
  .search-box input:focus {
    border-color: #f59e0b;
  }

  .status-filters {
    display: flex;
    gap: 0.4rem;
    background: #f1f5f9;
    padding: 0.3rem;
    border-radius: 10px;
  }
  .status-filters button {
    border: none;
    background: transparent;
    padding: 0.45rem 0.9rem;
    border-radius: 7px;
    font-size: 0.9rem;
    color: #64748b;
    cursor: pointer;
    font-weight: 500;
  }
  .status-filters button.active {
    background: white;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  /* Table */
  .table-wrapper {
    background: white;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    text-align: left;
    padding: 1rem 1.25rem;
    background: #f8fafc;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border-bottom: 1px solid #e2e8f0;
  }
  td {
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.95rem;
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr:hover td {
    background: #fafafa;
  }

  .quiz-title {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .quiz-title .desc {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .coin-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: #fffbeb;
    color: #b45309;
    padding: 0.3rem 0.7rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
  }
  .coin-icon {
    background: #f59e0b;
    color: white;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .badge {
    display: inline-block;
    padding: 0.3rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .badge-active {
    background: #dcfce7;
    color: #166534;
  }
  .badge-draft {
    background: #f1f5f9;
    color: #475569;
  }
  .badge-completed {
    background: #e0e7ff;
    color: #3730a3;
  }

  .actions {
    display: flex;
    gap: 0.4rem;
  }

  .empty {
    text-align: center;
    color: #94a3b8;
    padding: 3rem !important;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 720px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }
  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.6rem;
    color: #94a3b8;
    cursor: pointer;
    line-height: 1;
  }
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .form-group.full {
    grid-column: 1 / -1;
  }
  .form-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
  }
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.65rem 0.9rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    outline: none;
    transition: border 0.2s;
  }
  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    border-color: #f59e0b;
  }

  .questions-section {
    border-top: 1px solid #e2e8f0;
    padding-top: 1.5rem;
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .section-header h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .question-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .q-number {
    font-weight: 700;
    color: #f59e0b;
  }

  .options-list {
    margin-top: 1rem;
  }
  .options-list > label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    display: block;
    margin-bottom: 0.5rem;
  }
  .option-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }
  .option-row input[type="radio"] {
    accent-color: #f59e0b;
    width: 18px;
    height: 18px;
  }
  .option-row input[type="text"] {
    flex: 1;
    padding: 0.55rem 0.8rem;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    font-size: 0.9rem;
  }
</style>