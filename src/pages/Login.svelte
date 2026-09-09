<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '../lib/supabaseClient'; // O'z papkangiz yo'liga qarab tekshiring
  import "./Login.css"
  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let errorMessage = '';
  let loading = false;

  async function handleLogin(event) {
    event.preventDefault();
    loading = true;
    errorMessage = '';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Muvaffaqiyatli kirilgach, App.svelte o'zi avtomatik Dashboard'ga o'tkazadi
    } catch (error) {
      errorMessage = error.message || "Email yoki parol xato kiritildi.";
    } finally {
      loading = false;
    }
  }

  function goToRegister() {
    dispatch('switchToRegister'); // App.svelte'dagi register oynasini ochish uchun
  }
</script>

<div class="login-container">
  <div class="login-card">
    <h2>Tizimga Kirish</h2>
    <p class="subtitle">Iltimos, akkauntingizga kiring</p>

    {#if errorMessage}
      <div class="alert error">{errorMessage}</div>
    {/if}

    <form on:submit={handleLogin}>
      <div class="form-group">
        <label for="email">Email manzil</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          placeholder="ism@example.com" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="parol">Parol</label>
        <input 
          type="password" 
          id="parol" 
          bind:value={password} 
          placeholder="********" 
          required 
        />
      </div>

      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? "Kirilmoqda..." : "Kirish"}
      </button>
    </form>

    <div class="register-link">
      <p>Hisobingiz yo'qmi? <button type="button" class="link-btn" on:click={goToRegister}>Ro'yxatdan o'tish</button></p>
    </div>
  </div>
</div>

