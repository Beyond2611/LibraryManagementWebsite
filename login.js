const form = document.getElementById('form');
const account = document.getElementById('account');
const password = document.getElementById('password');
const rmCheck = document.getElementById("rememberMe");

if (localStorage.checkbox && localStorage.checkbox !== "") {
    rmCheck.setAttribute("checked", "checked");
    account.value = localStorage.account;
} else {
    rmCheck.removeAttribute("checked");
    account.value = "";
}

function IsRememberMe() {
    if (rmCheck.checked && account.value !== "") {
        localStorage.account = account.value;
        localStorage.checkbox = rmCheck.value;
    } else {
        localStorage.account = "";
        localStorage.checkbox = "";
    }
}

function PasswordVisualize(input) {
    var password = document.getElementById(input);
    var x = 'close_' + input;
    var close = document.getElementById(x);

    if (password.type === 'password') {
        close.className = "fa-regular fa-eye";
        password.type = "text";
    } else {
        close.className = "fa-regular fa-eye-slash";
        password.type = "password";
    }
}
form.addEventListener('submit', e => {
    e.preventDefault();
    checkInputs();
});

function checkInputs() {
    const accountValue = account.value.trim();
    const passwordValue = password.value.trim();

    if (accountValue === '') setErrorFor(account, 'Account cannot be blank');
    else setSuccessFor(account);

    if (passwordValue === '') setErrorFor(password, 'Password cannot be blank');
    else setSuccessFor(password);

}

function setErrorFor(input, message) {
    const inputLogin = input.parentElement.parentElement;
    const small = inputLogin.querySelector('small');
    inputLogin.className = 'input-login error';
    small.innerText = message;
}

function setSuccessFor(input) {
    const inputLogin = input.parentElement.parentElement;
    inputLogin.className = 'input-login success';
}