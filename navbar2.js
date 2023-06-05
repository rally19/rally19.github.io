var containerNavbar = document.querySelector('.container-navbar');
var prevScrollPos = window.pageYOffset;

window.addEventListener('scroll', function() {
  var currentScrollPos = window.pageYOffset;

  if (currentScrollPos === 0) {
    containerNavbar.style.transition = 'top 0.4s';
    containerNavbar.style.top = '0';
  } else if (currentScrollPos > prevScrollPos) {
    containerNavbar.style.transition = 'top 0.4s';
    containerNavbar.style.top = '-10vh';
  } else {
    containerNavbar.style.transition = 'top 0.4s';
    containerNavbar.style.top = '0';
  }
  
  prevScrollPos = currentScrollPos;
});