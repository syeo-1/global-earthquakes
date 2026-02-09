// functions for manipulating the sidebard menu

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

function toggleNav() {
    document.getElementById("mySidenav").classList.toggle("open");
}