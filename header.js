
let lastScroll = 0;
const header = document.getElementById("header");

window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll) {
        header.classList.add("hidden-header");
    } else {
        header.classList.remove("hidden-header");
        if (currentScroll > heroImageHeight) {
            header.classList.add("scrolled-header");
            header.classList.remove("hero-header");
        } else {
            header.classList.remove("scrolled-header");
            header.classList.add("hero-header");
        }
    }
    lastScroll = currentScroll;
});
