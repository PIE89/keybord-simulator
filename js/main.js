const text = `Погода бывает разной:
от яркого солнечного дня, когда небосвод раскрашен в златистые тона, до серых туч, нависших над городом как тяжёлые, 
обремененные обещанием дождя покровы. Каждый сезон приносит свои особенности, словно мастер, с любовью и тщанием работающий над искусным полотном. Летние дни окутывают теплом, дарят 
солнечные ласки и зовут на прогулки в парки, где деревья шепчут тайны ветра.
Осень же проявляет всю свою палитру, наполняя воздух душистым ароматом упавших
листьев и создавая щедрые краски закатов. Зима обнимает мир снежным покрывалом, 
когда каждый шорох под ногами становится музыкой, а морозное дыхание превращает каждый 
вдох в такую желанную свежесть. В этом хороводе сменяющихся сезонов находится особое очарование, 
завораживающее и вдохновляющее. Весна возвращает жизнь, пробуждает природу и дарит надежду на 
новые начинания. Погода — это не просто явление, это отражение наши эмоций, философия времени, 
которая позволяет нам чувствовать себя частью чего-то большего, чем мы сами.`;

const inputElement = document.querySelector("#input");
const textElement = document.querySelector("#textExample");
let letterId = 1;
let startMoment = null;
let started = false;

let letterCounter = 0;
let letterCounterError = 0;

let liness = getLine(text);

init();

// функция обхода предложения (разделение предложения на числое кратное 70ти)
function getLine(text) {
  const lines = [];
  let line = [];
  let idCounter = 0;

  for (const originalLetter of text) {
    idCounter += 1;
    let letter = originalLetter;

    if (letter === " ") {
      letter = "°";
    }

    if (letter === "\n") {
      letter = "¶\n";
    }

    line.push({
      id: idCounter,
      label: letter,
      origin: originalLetter,
      success: true,
    });

    if (line.length >= 70 || letter === "¶\n") {
      lines.push(line);
      line = [];
    }
  }

  if (line.lenght > 0) {
    lines.push(line);
  }

  return lines;
}

// функция получения номера необходимой строки
function getCurrentLineNumber() {
  for (let i = 0; i < liness.length; i++) {
    for (const letter of liness[i]) {
      if (letter.id === letterId) {
        return i;
      }
    }
  }
}

// функция добавления текста в параграф и добавления необходимых стилей
function lineToHtml(line) {
  const divElement = document.createElement("div");
  divElement.classList.add("line");

  for (let letter of line) {
    const spanElement = document.createElement("span");
    spanElement.textContent += letter.label;
    divElement.append(spanElement);

    if (letter.id < letterId) {
      spanElement.classList.add("done");
    } else if (!letter.success) {
      spanElement.classList.add("hint");
    }
  }

  return divElement;
}

//функция обновления 3-х отображаемых и актуальных строк #textElement
function update() {
  textElement.innerHTML = "";
  const currentLineNumber = getCurrentLineNumber();

  for (let i = 0; i < liness.length; i++) {
    const html = lineToHtml(liness[i]);
    textElement.append(html);

    if (currentLineNumber > i || i > currentLineNumber + 2) {
      html.classList.add("hidden");
    }
  }
}

// функция возврата необходимой буквы в тексте
function getCurrentLetter() {
  for (let line of liness) {
    for (let letter of line) {
      if (letter.id === letterId) {
        return letter;
      }
    }
  }
}

// функция при старте работы приложения
function init() {
  update();

  inputElement.focus();

  // прослушка клавиш и добавления класса hint
  inputElement.addEventListener("keydown", function (e) {
    const element = document.querySelector(
      '[data-key="' + e.key.toLowerCase() + '"]'
    );

    let currentLetter = getCurrentLetter();
    let currentLineNumber = getCurrentLineNumber();
    const isKey = e.key === currentLetter.origin;
    const isEnter = e.key === "Enter" && currentLetter.origin === "\n";

    if (e.key !== "Shift") {
      letterCounter++;
    }

    if (!started) {
      started = true;
      startMoment = Date.now();
    }

    if (e.metaKey && e.key === "r") {
      // специфика работы с mac комбинация cmd + r
      return;
    }

    if (element) {
      element.classList.add("hint");
    }

    //работа с SHIFT (left or right)
    if (e.key.toLowerCase() === "shift") {
      document
        .querySelector('[data-key="' + e.code + '"]')
        .classList.add("hint");
    }

    if (isKey || isEnter) {
      letterId++;
      update();
    } else {
      e.preventDefault();

      // считаем ошибки
      if (e.key !== "Shift") {
        letterCounterError++;
      }

      // подсвечиваем все буквы, в которой ошиблись
      for (let line of liness) {
        for (let letter of line) {
          if (letter.origin === currentLetter.origin) {
            letter.success = false;
          }
        }
      }

      update();
    }

    if (currentLineNumber !== getCurrentLineNumber()) {
      inputElement.value = "";
      e.preventDefault();

      started = false;
      let time = Date.now() - startMoment;

      document.querySelector("#wordsSpeed").textContent = Math.round(
        (60000 * letterCounter) / time
      );

      document.querySelector("#errorProcent").textContent =
        Math.round((letterCounterError / letterCounter) * 100) + "%";

      letterCounter = 0;
      letterCounterError = 0;
    }
  });

  // прослушка клавиш и удаление класса hint
  inputElement.addEventListener("keyup", function (e) {
    const element = document.querySelector(
      '[data-key="' + e.key.toLowerCase() + '"]'
    );

    if (element) {
      element.classList.remove("hint");
    }

    //работа с SHIFT (left or right)
    if (e.key.toLowerCase() === "shift") {
      document
        .querySelector('[data-key="' + e.code + '"]')
        .classList.remove("hint");
    }
  });
}

document.addEventListener("click", () => {
  inputElement.focus();
});
