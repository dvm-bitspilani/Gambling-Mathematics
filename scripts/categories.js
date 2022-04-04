let category = Array.from(document.getElementsByClassName("category"));
let checkBox = Array.from(document.getElementsByClassName("check"));
let check = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

checkBox.forEach((box) => {
  let index = parseInt(box.id);

  category[index - 1].addEventListener("click", () => {
    check[index - 1]++;

    if (check[index - 1] % 2 == 1) {
      category[index - 1].style.fontWeight = "600";
      box.style.backgroundColor = "white";
      box.style.border = "3px solid black";
    } else {
      category[index - 1].style.fontWeight = "400";
      box.style.backgroundColor = "black";
      box.style.border = "none";
    }
  });
});