<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '../lib/SupabaseClient'; // Yo'lni o'zingizning papkangizga moslang
  import './Login.css';

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
      // 1. Supabase Auth orqali tizimga kirish
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Foydalanuvchi ma'lumotlari topilmadi.");

      // 2. profiles jadvalidan foydalanuvchining rolini tekshirib olish
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn("Profil topilmadi, standart holatda davom etiladi:", profileError.message);
      }

      // Muvaffaqiyatli kirildi. 
      // App.svelte yoki ota komponent onAuthStateChange yoki event orqali buni sezib avtomatik yo'naltiradi.
      // Agar kerak bo'lsa, rol haqida ma'lumotni event orqali uzatish ham mumkin:
      dispatch('loginSuccess', { user, profile: profileData });

    } catch (error) {
      console.error('Kirish xatosi:', error);
      // Xatolik xabarlarini tushunarliroq qilish
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Email yoki parol noto'g'ri kiritildi.";
      } else {
        errorMessage = error.message || "Tizimga kirishda xatolik yuz berdi.";
      }
    } finally {
      loading = false;
    }
  }

  function goToRegister() {
    dispatch('switchToRegister'); // Ro'yxatdan o'tish oynasiga o'tish uchun
  }
</script>

<div class="login-container">
  <div class="login-card">
    <h2>Tizimga Kirish 🚀</h2>
    <p class="subtitle">O'quv boshqaruv portaliga xush kelibsiz</p>

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
        {loading ? "Tekshirilmoqda..." : "Kirish"}
      </button>
    </form>

    <div class="register-link">
      <p>Hisobingiz yo'qmi? <button type="button" class="link-btn" on:click={goToRegister}>Ro'yxatdan o'tish</button></p>
    </div>
  </div>
</div>