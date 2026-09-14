<script>
  import { createEventDispatcher } from "svelte";
  import "./AdminLayout.css";

  export let currentActivePage = "Dashboard";

  const dispatch = createEventDispatcher();

  let collapsed = false;

  const menuItems = [
    {
      name: "Dashboard",
      label: "Dashboard",
      icon: "dashboard"
    },
    {
      name: "Orders",
      label: "Buyurtmalar",
      icon: "orders"
    },
    {
      name: "Products",
      label: "Tovarlar",
      icon: "products"
    },
    {
      name: "Reports",
      label: "Hisobotlar",
      icon: "reports"
    },
    {
      name: "Users",
      label: "Foydalanuvchilar",
      icon: "users"
    }
  ];

  function navigate(page) {
    dispatch("navigate", { page });
  }

  function logout() {
    dispatch("logout");
  }

  function toggleSidebar() {
    collapsed = !collapsed;
  }
</script>

<div class:collapsed class="admin-layout">

  <!-- ================= SIDEBAR ================= -->
  <aside class="sidebar">

    <div class="sidebar-inner">

      <!-- BRAND -->
      <div class="sidebar-brand">

        <div class="brand-logo">
          <div class="coin coin-back"></div>
          <div class="coin coin-middle"></div>
          <div class="coin coin-front">$</div>
        </div>

        <div class="brand-text">
          <h1>Coin<span>Edu</span></h1>
          <p>ACADEMY SYSTEM</p>
        </div>

      </div>

      <!-- ADMIN STATUS -->
      <div class="admin-status">
        <span class="status-dot"></span>
        <span>ADMIN PANEL</span>
      </div>


      <!-- NAVIGATION -->
      <nav class="navigation">

        <div class="nav-title">
          <span>ASOSIY</span>
        </div>

        {#each menuItems as item}
          <button
            type="button"
            class:active={currentActivePage === item.name}
            class="nav-item"
            on:click={() => navigate(item.name)}
            aria-label={item.label}
            title={collapsed ? item.label : ""}
          >

            <span class="nav-icon">

              {#if item.icon === "dashboard"}
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>

              {:else if item.icon === "orders"}
                <svg viewBox="0 0 24 24">
                  <path d="M6 3h12v18H6z"></path>
                  <path d="M9 3v4h6V3"></path>
                  <path d="M9 12h6"></path>
                  <path d="M9 16h4"></path>
                </svg>

              {:else if item.icon === "products"}
                <svg viewBox="0 0 24 24">
                  <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"></path>
                  <path d="M4 7.5 12 12l8-4.5"></path>
                  <path d="M12 12v9"></path>
                </svg>

              {:else if item.icon === "reports"}
                <svg viewBox="0 0 24 24">
                  <path d="M4 19V5"></path>
                  <path d="M4 19h17"></path>
                  <path d="m7 15 4-4 3 2 5-6"></path>
                  <path d="M16 7h3v3"></path>
                </svg>

              {:else if item.icon === "users"}
                <svg viewBox="0 0 24 24">
                  <circle cx="9" cy="8" r="3"></circle>
                  <path d="M3 20c0-3.2 2.5-5 6-5s6 1.8 6 5"></path>
                  <circle cx="17" cy="9" r="2.3"></circle>
                  <path d="M16 15c2.8.2 4.5 1.8 4.5 4"></path>
                </svg>
              {/if}

            </span>

            <span class="nav-label">
              {item.label}
            </span>

            {#if currentActivePage === item.name}
              <span class="active-indicator"></span>
            {/if}

          </button>
        {/each}

      </nav>


      <!-- SIDEBAR FOOTER -->
      <div class="sidebar-footer">

        <div class="footer-line"></div>

        <button
          type="button"
          class="logout-button"
          on:click={logout}
          title={collapsed ? "Chiqish" : ""}
        >

          <span class="logout-icon">
            <svg viewBox="0 0 24 24">
              <path d="M10 17l5-5-5-5"></path>
              <path d="M15 12H3"></path>
              <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"></path>
            </svg>
          </span>

          <span class="logout-label">
            Chiqish
          </span>

        </button>

      </div>

    </div>


    <!-- COLLAPSE BUTTON -->
    <button
      type="button"
      class="sidebar-toggle"
      class:rotated={collapsed}
      on:click={toggleSidebar}
      aria-label={collapsed ? "Sidebarni ochish" : "Sidebarni yopish"}
      title={collapsed ? "Sidebarni ochish" : "Sidebarni yopish"}
    >

      <svg viewBox="0 0 24 24">
        <path d="m15 18-6-6 6-6"></path>
      </svg>

    </button>

  </aside>


  <!-- ================= MAIN ================= -->
  <main class="main-section">

    <div class="page">
      <div class="page-inner">
        <slot />
      </div>
    </div>

  </main>

</div>