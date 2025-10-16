const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const panelLogin = document.getElementById('panel-login');
const panelRegister = document.getElementById('panel-register');

function setActive(loginActive){
  tabLogin.classList.toggle('active', loginActive);
  tabRegister.classList.toggle('active', !loginActive);
  tabLogin.setAttribute('aria-selected', loginActive);
  tabRegister.setAttribute('aria-selected', !loginActive);
  panelLogin.style.display = loginActive ? 'block' : 'none';
  panelRegister.style.display = loginActive ? 'none' : 'block';
}
tabLogin.addEventListener('click', ()=> setActive(true));
tabRegister.addEventListener('click', ()=> setActive(false));

tabLogin.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' ') setActive(true); });
tabRegister.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' ') setActive(false); });

function switchToLogin(){ setActive(true); }

document.querySelector('#panel-register form').addEventListener('submit', function(e){
  const pw = document.getElementById('reg-password').value;
  const pwc = document.getElementById('reg-password-confirm').value;
  if(pw !== pwc){
    e.preventDefault();
    alert('Passwords do not match');
    document.getElementById('reg-password-confirm').focus();
    return false;
  }
});