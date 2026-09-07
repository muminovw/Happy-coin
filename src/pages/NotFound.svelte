<script>
  import { push } from 'svelte-spa-router';
</script>

<div class="not-found">
  <h1>404</h1>
  <p>Sahifa topilmadi</p>
  <button on:click={() => push('/')}>Bosh sahifaga qaytish</button>
</div>

<style>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 12px;
  }
  h1 { font-size: 48px; color: #4f46e5; margin: 0; }
  button {
    padding: 10px 20px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
</style>