const form = document.getElementById('form');
const account = document.getElementById('account');
const password = document.getElementById('password');
const rmCheck = document.getElementById("rememberMe");

if (localStorage.checkbox && localStorage.checkbox !== "") {
    rmCheck.setAttribute("checked", "checked");
    account.value = localStorage.account;
} else {
    rmCheck.removeAttribute("checked");
    // account.value = "";
}

function IsRememberMe() {
    if (rmCheck.checked && account.value !== "") {
        localStorage.account = account.value;
        localStorage.checkbox = rmCheck.value;
    } else {
        // localStorage.account = "";
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
var close = document.getElementsByClassName("closebtn");
for (var i = 0; i < close.length; i++) {
    close[i].onclick = function() {
        var div = this.parentElement;
        div.style.opacity = "0";
        setTimeout(function() { div.style.display = "none"; }, 600);
    }
}

function hide() {
    document.getElementById("alert").style.display = "none";
}
setTimeout("hide()", 5000);