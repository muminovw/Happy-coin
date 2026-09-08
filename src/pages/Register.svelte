<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '../lib/supabaseClient'; // Fayl yo'lini o'z loyihangizga qarab tekshiring

  const dispatch = createEventDispatcher();

  let fullName = '';
  let email = '';
  let password = '';
  let errorMessage = '';
  let successMessage = '';
  let loading = false;

  async function handleRegister(event) {
    event.preventDefault();
    loading = true;
    errorMessage = '';
    successMessage = '';

    try {
      // Supabase orqali ro'yxatdan o'tkazish va metadata'ga 'student' rolini yuborish
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'student' // Rol aniq student etib belgilanmoqda
          }
        }
      });

      if (error) throw error;

      successMessage = "Muvaffaqiyatli ro'yxatdan o'tdingiz! Tizimga kirish sahifasiga o'tkazilmoqda...";
      
      setTimeout(() => {
        dispatch('switchToLogin');
      }, 1500);

    } catch (error) {
      errorMessage = error.message || "Ro'yxatdan o'tishda xatolik yuz berdi.";
    } finally {
      loading = false;
    }
  }

  function goToLogin() {
    dispatch('switchToLogin');
  }
</script>

<div class="register-container">
  <div class="register-card">
    <h2>O'quvchi sifatida ro'yxatdan o'tish</h2>
    <p class="subtitle">Maktab tizimiga xush kelibsiz! Ma'lumotlaringizni kiriting.</p>

    {#if errorMessage}
      <div class="alert error">{errorMessage}</div>
    {/if}

    {#if successMessage}
      <div class="alert success">{successMessage}</div>
    {/if}

    <form on:submit={handleRegister}>
      <div class="form-group">
        <label for="fullName">F.I.O (To'liq ism)</label>
        <input 
          type="text" 
          id="fullName" 
          bind:value={fullName} 
          placeholder="Anvar Muminov" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="email">Elektron pochta (Email)</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          placeholder="example@mail.com" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="password">Parol</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          placeholder="********" 
          minlength="6"
          required 
        />
      </div>

      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
      </button>
    </form>

    <div class="login-link">
      <p>Hisobingiz bormi? <button type="button" class="link-btn" on:click={goToLogin}>Tizimga kirish.</button></p>
    </div>
  </div>
</div>

<style>
  .register-container {
    font-family: sans-serif;
    background-color: #0f172a;
    color: #f8fafc;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
  }

  .register-card {
    background: #1e293b;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #334155;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 22px;
    margin-bottom: 6px;
    color: #f8fafc;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 13px;
    margin-bottom: 25px;
  }

  .form-group {
    margin-bottom: 18px;
    text-align: left;
  }

  label {
    display: block;
    font-size: 13px;
    color: #cbd5e1;
    margin-bottom: 6px;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 12px;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #f8fafc;
    font-size: 14px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
  }

  input:focus {
    border-color: #3b82f6;
  }

  .submit-btn {
    width: 100%;
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 10px;
  }

  .submit-btn:hover {
    background-color: #2563eb;
  }

  .submit-btn:disabled {
    background-color: #64748b;
    cursor: not-allowed;
  }

  .alert {
    padding: 10px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 15px;
  }

  .error {
    background-color: #7f1d1d;
    color: #fecaca;
    border: 1px solid #991b1b;
  }

  .success {
    background-color: #065f46;
    color: #a7f3d0;
    border: 1px solid #047857;
  }

  .login-link {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #94a3b8;
  }

  .link-btn {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    padding: 0;
    text-decoration: underline;
  }

  .link-btn:hover {
    color: #60a5fa;
  }
</style>