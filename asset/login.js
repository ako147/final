    // ===== Tabs =====
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const panelLogin = document.getElementById('panelLogin');
    const panelRegister = document.getElementById('panelRegister');

    function showTab(tab) {
      const isLogin = tab === 'login';

      tabLogin.classList.toggle('is-active', isLogin);
      tabRegister.classList.toggle('is-active', !isLogin);
      tabLogin.setAttribute('aria-selected', String(isLogin));
      tabRegister.setAttribute('aria-selected', String(!isLogin));

      panelLogin.classList.toggle('is-hidden', !isLogin);
      panelRegister.classList.toggle('is-hidden', isLogin);

      // URL 同步（不重整）
      const url = new URL(window.location.href);
      url.searchParams.set('tab', isLogin ? 'login' : 'register');
      window.history.replaceState({}, '', url.toString());
    }

    tabLogin.addEventListener('click', () => showTab('login'));
    tabRegister.addEventListener('click', () => showTab('register'));

    // 讀 query 參數決定開哪一個 tab
    const qsTab = new URLSearchParams(location.search).get('tab');
    if (qsTab === 'register') showTab('register');

    // ===== Login logic (localStorage demo) =====
    document.getElementById('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        const currentUser = {
          username: user.username,
          email: user.email,
          loginAt: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('登入成功！歡迎回來，' + user.username + '！');

        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect");
        window.location.href = redirect ? decodeURIComponent(redirect) : "../index.html";


      } else {
        alert('帳號或密碼錯誤，請重試');
      }
    });

    // ===== Register logic (localStorage demo) =====
    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');

    const username = document.getElementById('regUsername');
    const email = document.getElementById('regEmail');
    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('regConfirmPassword');
    const terms = document.getElementById('terms');

    const groupUsername = document.getElementById('groupUsername');
    const groupEmail = document.getElementById('groupEmail');
    const groupPassword = document.getElementById('groupPassword');
    const groupConfirm = document.getElementById('groupConfirm');

    function setError(group, isError) {
      group.classList.toggle('error', !!isError);
    }

    function validateUsername() {
      const v = username.value.trim();
      const ok = v.length >= 2 && v.length <= 16;
      setError(groupUsername, !ok);
      return ok;
    }

    function validateEmail() {
      const v = email.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      setError(groupEmail, !ok);
      return ok;
    }

    function validatePassword() {
      const v = password.value;
      const ok = v.length >= 6;
      setError(groupPassword, !ok);
      return ok;
    }

    function validateConfirm() {
      const ok = confirmPassword.value === password.value && confirmPassword.value.length > 0;
      setError(groupConfirm, !ok);
      return ok;
    }

    function validateAll() {
      return (
        validateUsername() &&
        validateEmail() &&
        validatePassword() &&
        validateConfirm() &&
        terms.checked
      );
    }

    username.addEventListener('input', validateUsername);
    email.addEventListener('input', validateEmail);
    password.addEventListener('input', () => { validatePassword(); validateConfirm(); });
    confirmPassword.addEventListener('input', validateConfirm);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateAll()) {
        alert('請確認欄位填寫正確並勾選同意條款');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '註冊中...';

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const exists = users.some(u => u.email === email.value.trim());
      if (exists) {
        alert('此電子郵件已註冊，請直接登入');
        submitBtn.disabled = false;
        submitBtn.textContent = '註 冊';
        showTab('login');
        return;
      }

      const newUser = {
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      alert('註冊成功！請登入');
      submitBtn.disabled = false;
      submitBtn.textContent = '註 冊';
      showTab('login');

      // 幫你把登入帳號預填，爽一點
      document.getElementById('loginEmail').value = newUser.email;
      document.getElementById('loginPassword').value = '';
    });