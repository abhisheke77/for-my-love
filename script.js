const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'START';
let score = 0;
const WIN_SCORE = 15;

let player;
let hearts = [];
let particles = [];
let animationId;

const loveMeter = document.getElementById('love-fill');

const startScreen = document.getElementById('start-screen');
const proposalScreen = document.getElementById('proposal-screen');
const celebrationScreen = document.getElementById('celebration-screen');

const startBtn = document.getElementById('start-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');

const ringBox = document.getElementById("ringBox");
const ring = document.getElementById("ring");
const proposalText = document.getElementById("proposal-text");
const proposalButtons = document.getElementById("proposal-buttons");

/* ---------------- RESIZE ---------------- */

function resize(){
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

if(player){
player.y = canvas.height - 100;
}
}

window.addEventListener("resize",resize);

/* ---------------- PLAYER ---------------- */

class Player{

constructor(){

this.w = 100;
this.h = 80;

this.x = canvas.width/2 - this.w/2;
this.y = canvas.height - 100;

}

draw(){

ctx.fillStyle = "#ff4d6d";

ctx.beginPath();
ctx.arc(this.x + this.w/2,this.y,this.w/2,0,Math.PI);
ctx.fill();

}

update(){

if(this.x < 0) this.x = 0;
if(this.x + this.w > canvas.width)
this.x = canvas.width - this.w;

}

}

/* ---------------- HEART ---------------- */

class Heart{

constructor(){

this.size = Math.random()*20+20;
this.x = Math.random()*(canvas.width-this.size);
this.y = -this.size;
this.speed = Math.random()*3+2;

}

draw(){

ctx.fillStyle="#ff4d6d";

ctx.beginPath();

ctx.moveTo(this.x,this.y+10);

ctx.bezierCurveTo(this.x,this.y,this.x-15,this.y,this.x-15,this.y+10);
ctx.bezierCurveTo(this.x-15,this.y+25,this.x,this.y+25,this.x,this.y+40);
ctx.bezierCurveTo(this.x,this.y+25,this.x+15,this.y+25,this.x+15,this.y+10);
ctx.bezierCurveTo(this.x+15,this.y,this.x,this.y,this.x,this.y+10);

ctx.fill();

}

update(){
this.y += this.speed;
}

}

/* ---------------- PARTICLES ---------------- */

class Particle{

constructor(x,y){

this.x=x;
this.y=y;

this.size=Math.random()*5+2;

this.speedX=(Math.random()-0.5)*4;
this.speedY=(Math.random()-0.5)*4;

this.life=100;

}

update(){

this.x+=this.speedX;
this.y+=this.speedY;
this.life-=2;

}

draw(){

ctx.fillStyle="white";

ctx.globalAlpha=this.life/100;

ctx.beginPath();
ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
ctx.fill();

ctx.globalAlpha=1;

}

}

/* ---------------- INPUT ---------------- */

function handleInput(e){

if(!player) return;

let clientX = e.type==="mousemove"
? e.clientX
: e.touches[0].clientX;

player.x = clientX - player.w/2;

}

/* prevent mobile scroll */

window.addEventListener("touchmove",(e)=>{
if(gameState==="PLAYING"){
e.preventDefault();
handleInput(e);
}
},{passive:false});

window.addEventListener("mousemove",handleInput);

/* ---------------- GAME ---------------- */

function spawnHeart(){

if(Math.random()<0.02){
hearts.push(new Heart());
}

}

function createParticles(x,y){

for(let i=0;i<5;i++){
particles.push(new Particle(x,y));
}

}

function updateScore(){

let percent = (score/WIN_SCORE)*100;
loveMeter.style.width = percent + "%";

}

function triggerProposal(){

gameState="PROPOSAL";

/* allow scrolling again */
document.body.style.overflow="auto";

setTimeout(()=>{

proposalScreen.classList.remove("hidden");
proposalScreen.classList.add("active");

},500);

}

function updateGame(){

ctx.clearRect(0,0,canvas.width,canvas.height);

if(gameState==="PLAYING"){

player.update();
player.draw();

spawnHeart();

hearts.forEach((heart,index)=>{

heart.update();
heart.draw();

if(

heart.y+heart.size>player.y &&
heart.x>player.x &&
heart.x<player.x+player.w

){

hearts.splice(index,1);

score++;

createParticles(heart.x,heart.y);

updateScore();

if(score>=WIN_SCORE){
triggerProposal();
}

}

if(heart.y>canvas.height){
hearts.splice(index,1);
}

});

particles.forEach((p,i)=>{

p.update();
p.draw();

if(p.life<=0) particles.splice(i,1);

});

}

animationId=requestAnimationFrame(updateGame);

}

/* ---------------- START GAME ---------------- */

function startGame(){

resize();

player=new Player();

hearts=[];
score=0;

updateScore();

gameState="PLAYING";

startScreen.classList.add("hidden");

/* disable scrolling during game */
document.body.style.overflow="hidden";

updateGame();

}

startBtn.addEventListener("click",startGame);

/* ---------------- RING BOX ---------------- */

if(ringBox){

ringBox.addEventListener("click",()=>{

ringBox.classList.add("open");

setTimeout(()=>{
ring.classList.remove("hidden");
createSparkles();
},400);

setTimeout(()=>{
proposalText.classList.remove("hidden");
proposalText.classList.add("show");
},900);

setTimeout(()=>{
proposalButtons.classList.remove("hidden");
},1200);

});

}

/* ---------------- SPARKLES ---------------- */

function createSparkles(){

const sparkles=document.getElementById("sparkles");

setInterval(()=>{

const star=document.createElement("div");

star.className="sparkle";
star.innerHTML="✨";

star.style.left=Math.random()*100+"%";
star.style.top=Math.random()*100+"%";

sparkles.appendChild(star);

setTimeout(()=>star.remove(),1200);

},300);

}

/* ---------------- YES BUTTON ---------------- */

yesBtn.addEventListener("click",()=>{

proposalScreen.classList.add("hidden");

celebrationScreen.classList.remove("hidden");
celebrationScreen.classList.add("active");

showPhotos();
startHearts();
confettiExplosion();
startPetals();

const music=document.getElementById("romantic-music");
if(music) music.play();

});

/* ---------------- NO BUTTON ---------------- */

noBtn.addEventListener("mouseover",moveNoButton);
noBtn.addEventListener("touchstart",moveNoButton);

function moveNoButton(){

const x=Math.random()*(window.innerWidth-noBtn.offsetWidth);
const y=Math.random()*(window.innerHeight-noBtn.offsetHeight);

noBtn.style.position="fixed";
noBtn.style.left=x+"px";
noBtn.style.top=y+"px";

}

/* ---------------- PHOTO ANIMATION ---------------- */

function showPhotos(){

const photos=document.querySelectorAll(".memory-photo");

photos.forEach((photo,index)=>{

setTimeout(()=>{
photo.classList.add("show");
},index*700);

});

}

/* ---------------- FLOATING HEARTS ---------------- */

function startHearts(){

setInterval(()=>{

const heart=document.createElement("div");

heart.className="floating-heart";
heart.innerHTML="❤️";

heart.style.left=Math.random()*window.innerWidth+"px";
heart.style.top=window.innerHeight+"px";

document.body.appendChild(heart);

setTimeout(()=>heart.remove(),4000);

},400);

}

/* ---------------- CONFETTI ---------------- */

function confettiExplosion(){

for(let i=0;i<120;i++){

const confetti=document.createElement("div");

confetti.style.position="fixed";
confetti.style.width="8px";
confetti.style.height="8px";

confetti.style.background=`hsl(${Math.random()*360},100%,60%)`;

confetti.style.left=Math.random()*window.innerWidth+"px";
confetti.style.top="-10px";

confetti.style.animation="confettiFall 3s linear forwards";

document.body.appendChild(confetti);

setTimeout(()=>confetti.remove(),3000);

}

}

/* ---------------- ROSE PETALS ---------------- */

function startPetals(){

setInterval(()=>{

const petal=document.createElement("div");

petal.className="petal";
petal.innerHTML="🌹";

petal.style.left=Math.random()*window.innerWidth+"px";

document.body.appendChild(petal);

setTimeout(()=>petal.remove(),6000);

},300);

}

/* ---------------- LOVE LETTER ---------------- */

const letterBtn=document.getElementById("letter-btn");
const letter=document.getElementById("love-letter");
const closeLetter=document.getElementById("close-letter");

letterBtn.addEventListener("click",()=>{
letter.classList.remove("hidden");
});

closeLetter.addEventListener("click",()=>{
letter.classList.add("hidden");
});

/* ---------------- INIT ---------------- */

resize();
updateScore();
