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

checkBox.forEach((box, idx) => {
  answer[idx].addEventListener("click", () => {
    if (!checkBox[idx].classList.contains("checked")) {
      box.style.backgroundColor = "white";
      box.style.border = "3px solid black";
      checkBox[idx].classList.add("checked");
    } else {
      box.style.backgroundColor = "black";
      box.style.border = "none";
      checkBox[idx].classList.remove("checked");
    }
  });
});
