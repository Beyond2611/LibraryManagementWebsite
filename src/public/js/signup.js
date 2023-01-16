const form = document.getElementById('form');
const account = document.getElementById('account');
const email = document.getElementById('email');
const password = document.getElementById('password');
const rpassword = document.getElementById('rpassword');

function PasswordVisualize(input) {
    var password = document.getElementById(input);
    var x = 'close_' + input;
    var close = document.getElementById(x);

    if (password.type === 'password') {
        close.className = "fa-regular fa-eye";
        password.type = "text";

    } else {
        password.type = "password";
        close.className = "fa-regular fa-eye-slash";
    }
}
// form.addEventListener('submit', e => {
//     e.preventDefault();
//     checkInputs();
// });

// function checkInputs() {
//     const accountValue = account.value.trim();
//     const emailValue = email.value.trim();
//     const passwordValue = password.value.trim();
//     const rpasswordValue = rpassword.value.trim();

//     if (accountValue === '') setErrorFor(account, 'Account cannot be blank');
//     else setSuccessFor(account);

//     if (emailValue === '') setErrorFor(email, 'Email cannot be blank');
//     else if (!isEmail(emailValue)) setErrorFor(email, 'Not a valid email');
//     else setSuccessFor(email);

//     if (passwordValue === '') setErrorFor(password, 'Password cannot be blank');
//     else setSuccessFor(password);

//     if (rpasswordValue === '') setErrorFor(rpassword, 'Re-enter password cannot be blank');
//     else if (passwordValue !== rpasswordValue) setErrorFor(rpassword, 'Password does not match');
//     else setSuccessFor(rpassword);

// }

// function setErrorFor(input, message) {
//     const inputLogin = input.parentElement.parentElement;
//     const small = inputLogin.querySelector('small');
//     inputLogin.className = 'input-login error';
//     small.innerText = message;
// }

// function setSuccessFor(input) {
//     const inputLogin = input.parentElement.parentElement;
//     inputLogin.className = 'input-login success';
// }

// function isEmail(email) {
//     return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
// }