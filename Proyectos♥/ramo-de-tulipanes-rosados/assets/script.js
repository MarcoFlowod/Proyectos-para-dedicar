// Generar corazones cayendo dinámicamente
const snowContainer = document.getElementById("loveRain");
const hearts = ["❥","<3","♥","♡",];

function createHeart() {
    const heart = document.createElement("span");
    let heart_emoji = hearts[Math.floor(Math.random() * hearts.length)];
    let size = Math.random() * 15 + 15; // tamaño entre 20px y 50px
    let posX = Math.random() * window.innerWidth;
    let duration = Math.random() * 5 + 5; 
    let delay = Math.random() * 0.5;
    let swayDistance = Math.random() * 100 - 50; // movimiento horizontal aleatorio

    heart.textContent = heart_emoji;
    heart.style.left = posX + "px";
    heart.style.animationDuration = duration + "s";
    heart.style.animationDelay = delay + "s";
    heart.style.fontSize = size + "px";

    snowContainer.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, (duration + delay) * 1000);
}

setInterval(createHeart, 200);
