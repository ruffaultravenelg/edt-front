import { displayWeek } from "./calendar.js";

const currentWeek = new Date();

const prev = document.getElementById('prev');
const next = document.getElementById('next');

prev.onclick = ()=>{
    currentWeek.setDate(currentWeek.getDate() - 7);
    displayWeek(currentWeek);
};

next.onclick = ()=>{
    currentWeek.setDate(currentWeek.getDate() + 7);
    displayWeek(currentWeek);
};