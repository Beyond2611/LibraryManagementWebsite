let overlay_mode = 0;


function currentYPosition() {
    if (self.pageYOffset) return self.pageYOffset;
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
}

function elmYPosition(eID) {
    var elm = document.getElementById(eID);
    var y = elm.offsetTop;
    var node = elm;
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    }
    return y;
}

function smoothScroll(eID) {
    var startY = currentYPosition();
    var stopY = elmYPosition(eID);
    console.log(startY + ' ' + stopY);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
        scrollTo(0, stopY - 20);
        return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
        for (var i = startY; i < stopY; i += step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY += step;
            if (leapY > stopY) leapY = stopY;
            timer++;
        }
        return;
    }
    for (var i = startY; i > stopY; i -= step) {
        setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
        leapY -= step;
        if (leapY < stopY) leapY = stopY;
        timer++;
    }
    return false;
}

function Overlay(input) {
    var name = "overlay-" + input;
    var overlay = document.getElementsByClassName(name);
    var overlay_div = document.getElementsByClassName("overlay");
    var user_interface = document.getElementsByClassName("user-interface");
    if (overlay_mode) {
        overlay_div[0].style.display = "none";
        overlay[0].style.display = "none";
        user_interface[0].style.filter = "none";
    } else {
        overlay[0].style.display = "block";
        overlay_div[0].style.display = "block";
        user_interface[0].style.filter = "blur(10px)";
    }
    overlay_mode = 1 - overlay_mode;
}

function Delete(_id) {
    window.location.replace("/delete/" + _id);
}

function Borrow(_id) {
    window.location.replace("/borrow/" + _id);
}

function Return(_id) {
    window.location.replace("/return/" + _id);
}
var accordion_header = document.getElementsByClassName("accordion-item-header");
for (var i = 0; i < accordion_header.length; i++) {
    accordion_header[i].addEventListener("click", function() {
        this.classList.toggle("active-accordion");
        var accordion_body = this.nextElementSibling;
        accordion_body.classList.toggle("active-accordion");
    });
}

var notification_close = document.getElementsByClassName("notification-close");
for (var i = 0; i < notification_close.length; i++) {
    notification_close[i].onclick = function() {
        var success_notification = this.parentElement.parentElement;
        success_notification.style.opacity = "0";
        setTimeout(function() {
            success_notification.style.display = "none";
        }, 600);
    }
}
var bell = document.getElementsByClassName("bell");
for (var i = 0; i < bell.length; i++) {
    bell[i].addEventListener("click", function() {
        this.style.animation = "none";
        var notification_content = this.nextElementSibling
        notification_content.classList.toggle("active");
        this.classList.toggle("active");
    });
}
var basket = document.getElementsByClassName("basket-logo");
for (var i = 0; i < basket.length; i++) {
    basket[i].addEventListener("click", function() {
        var basket_content = this.nextElementSibling;
        basket_content.classList.toggle("active");
        this.classList.toggle("active");
    });
}