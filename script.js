const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('togglePassword');
const errorBox = document.getElementById('formError');

// Tampilkan / sembunyikan password
toggleBtn.addEventListener('click', () => {
  const show = passwordInput.type === 'password';
  passwordInput.type = show ? 'text' : 'password';
  toggleBtn.classList.toggle('is-visible', show);
  toggleBtn.setAttribute('aria-pressed', String(show));
  toggleBtn.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
});

function setInvalid(input, invalid) {
  input.closest('.input-wrap').classList.toggle('invalid', invalid);
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  setInvalid(usernameInput, false);
  setInvalid(passwordInput, false);
}

// Hapus tanda error saat pengguna mulai mengetik lagi
[usernameInput, passwordInput].forEach((input) => {
  input.addEventListener('input', clearError);
});

// Validasi saat tombol Masuk ditekan
form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    setInvalid(usernameInput, !username);
    setInvalid(passwordInput, !password);
    showError('Username dan password wajib diisi.');
    (!username ? usernameInput : passwordInput).focus();
    return;
  } else {
    window.location.href = "dashboard.html";
  }

  // TODO: sambungkan ke backend/API login di sini, contoh:
  // fetch('/api/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ username, password })
  // });
  console.log('Login dikirim untuk:', username);
});
