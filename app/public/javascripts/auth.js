// Gestion des formulaires d'authentification

// Fonction pour basculer vers l'onglet Login
function switchToLogin() {
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginPanel = document.getElementById('panel-login');
  const registerPanel = document.getElementById('panel-register');
  
  if (loginTab && registerTab && loginPanel && registerPanel) {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginPanel.style.display = 'block';
    registerPanel.style.display = 'none';
    loginTab.setAttribute('aria-selected', 'true');
    registerTab.setAttribute('aria-selected', 'false');
  }
}

// Gestion du formulaire de connexion
const loginForm = document.querySelector('#panel-login form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Redirection vers la page d'accueil
        window.location.href = data.redirectTo || '/';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login');
    }
  });
}

// Gestion du formulaire d'inscription
const registerForm = document.querySelector('#panel-register form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const surname = document.getElementById('reg-surname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    
    if (!name || !surname || !email || !password || !passwordConfirm) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password !== passwordConfirm) {
      alert('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, surname, email, password, passwordConfirm }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Account created successfully! Please log in.');
        switchToLogin();
        // Remplir automatiquement l'email dans le formulaire de connexion
        document.getElementById('login-email').value = email;
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during registration');
    }
  });
}
