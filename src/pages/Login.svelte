<script>
  import { supabase } from '../lib/supabaseClient';
  import { authActions } from '../stores/auth.js';

  let email = '';
  let password = '';
  let loading = false;
  let errorMessage = '';

  async function handleLogin(event) {
    event.preventDefault();
    loading = true;
    errorMessage = '';

    try {
      // Supabase orqali kirish
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Agar muvaffaqiyatli kirsa, rolni aniqlaymiz
      const session = data.session;
      const role = session.user.user_metadata?.role || 'student';
      
      authActions.setSession(session, role);

    } catch (error) {
      errorMessage = error.message || 'Kirishda xatolik yuz berdi!';
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <h2>Tizimga Kirish</h2>
    <p class="subtitle">Iltimos, akkauntingizga kiring</p>

    {#if errorMessage}
      <div class="error-alert">{errorMessage}</div>
    {/if}

    <form on:submit={handleLogin}>
      <div class="input-group">
        <label for="email">Email manzil</label>
        <input 
          id="email" 
          type="email" 
          placeholder="ism@example.com" 
          bind:value={email} 
          required 
        />
      </div>

      <div class="input-group">
        <label for="password">Parol</label>
        <input 
          id="password" 
          type="password" 
          placeholder="********" 
          bind:value={password} 
          required 
        />
      </div>

      <button type="submit" class="login-btn" disabled={loading}>
        {loading ? 'Tekshirilmoqda...' : 'Kirish'}
      </button>
    </form>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #0f172a;
    font-family: sans-serif;
  }

  .login-card {
    background: #1e293b;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 400px;
    color: #f8fafc;
  }

  h2 {
    margin-bottom: 5px;
    font-size: 24px;
    text-align: center;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 14px;
    text-align: center;
    margin-bottom: 25px;
  }

  .input-group {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 13px;
    color: #cbd5e1;
  }

  input {
    padding: 12px;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 6px;
    color: white;
    font-size: 14px;
  }

  input:focus {
    outline: none;
    border-color: #6366f1;
  }

  .login-btn {
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

  .login-btn:hover {
    background: #4f46e5;
  }

  .login-btn:disabled {
    background: #475569;
    cursor: not-allowed;
  }

  .error-alert {
    background: #ef4444;
    color: white;
    padding: 10px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 20px;
    text-align: center;
  }
</style>