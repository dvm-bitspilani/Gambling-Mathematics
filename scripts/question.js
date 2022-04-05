let seconds = 600;
const padZero = (num) => {
  if (num < 10) {
    return `0${num}`;
  }
  return num;
};

setInterval(() => {
  seconds--;
  if (seconds < 0) {
    seconds = 0;
  }
  timer.innerText = `${Math.floor(seconds / 60)}:${padZero(
    Math.floor(seconds % 60)
  )}`;
}, 1000);

const answer = Array.from(document.getElementsByClassName("answer"));
const checkBox = Array.from(document.getElementsByClassName("check"));
const timer = document.getElementById("timer");
let activeIdx = -1;

checkBox.forEach((box, idx) => {
  answer[idx].addEventListener("click", () => {
    if (!checkBox[idx].classList.contains("checked")) {
      checkBox[idx].classList.add("checked");
      if (activeIdx !== -1) {
        checkBox[activeIdx].classList.remove("checked");
      }
      activeIdx = idx;
    } else {
      checkBox[idx].classList.remove("checked");
      activeIdx = -1;
    }
  });
});
