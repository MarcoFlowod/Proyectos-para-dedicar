const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const modal = document.getElementById("modal");
const androidModal = document.getElementById("androidModal");
const androidText = document.getElementById("androidText");
const music = document.getElementById("music");
const backArrow = document.getElementById("backArrow");
const topMessage = document.getElementById("topMessage");
const noMessage = document.getElementById("noMessage");

const mensajesNo = [
  "Dale, sí por favor 😢",
  "Te haré la persona más feliz ❤️",
  "No digas que no 😭",
  "Por favor, piénsalo bien 💌",
  "Te necesito en mi vida 🫶"
];

let noClickCount = 0;

noBtn.addEventListener("click", () => {
  const rect = noBtn.getBoundingClientRect();
  const mensaje = mensajesNo[Math.floor(Math.random() * mensajesNo.length)];

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = mensaje;
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top - 10}px`;

  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 2500);

  noClickCount++;
  if(noClickCount === 5) mostrarAndroidModal();
    
});

function mostrarAndroidModal(){
  androidModal.style.display = "flex";
  const mensajesAndroid = [
    "Eliminando fotos...",
    "Eliminando videos...",
    "Eliminando mensajes...",
    "Eliminando contactos...",
    "Eliminando apps...",
    "Eliminando archivos..."
  ];
  let index = 0;
  const interval = setInterval(()=>{
    androidText.textContent = mensajesAndroid[index % mensajesAndroid.length];
    index++;
  }, 1000);

  setTimeout(()=>{
    clearInterval(interval);
    androidModal.style.display = "none";

    // Ocultar botón "No"
    noBtn.style.display = "none";

    // Mostrar el mensaje "¿Y el no?" en negro
    noMessage.style.display = "block";

    // Mensaje superior de broma
    topMessage.textContent = "Es broma 😅💖";
    topMessage.style.display = "block";
      
  }, 
  8000);
    
}

function playMusicOnce(){
  music.play().catch(()=>{});
  document.removeEventListener("click", playMusicOnce);
  document.removeEventListener("touchstart", playMusicOnce);
}
document.addEventListener("click", playMusicOnce);
document.addEventListener("touchstart", playMusicOnce);

yesBtn.addEventListener("click", ()=>{
  modal.style.display = "flex";
  document.querySelector('.rosa-final').src = "https://i.pinimg.com/originals/af/e0/00/afe00028751cb2455e55000156560fe9.gif";
  document.getElementById('respuesta').textContent = "Sabía que aceptarías 🥺🫶";
});

backArrow.addEventListener("click", (e)=>{
  e.preventDefault();
  modal.style.display = "none";
});