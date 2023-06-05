var prevScrollpos = window.pageYOffset;

window.addEventListener("scroll", function() {
    var currentScrollPos = window.pageYOffset;
    var navbar = document.getElementById("navbar");
    
    if (prevScrollpos > currentScrollPos) {
        navbar.style.top = "0";
    } else {
        navbar.style.top = "-10vh";
    }
    
    prevScrollpos = currentScrollPos;
});

window.addEventListener("DOMContentLoaded", function() {
    var navbar = document.getElementById("navbar");
    if (window.scrollY === 0) {
        navbar.style.top = "0";
    }
});