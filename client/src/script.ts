import bot from "../assets/bot.svg";
import user from "../assets/user.svg";

const form: any = document.querySelector("form");
const chatContainer: any = document.querySelector("#chat_container");

let loadInterval: number | undefined;

function loader(element: HTMLElement): void {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element: HTMLElement, text: string): void {
  let index: number = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId(): string {
  const timestamp: number = Date.now();
  const randomNumber: number = Math.random();

  const hexadecimal: string = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimal}`;
}

function chatStripe(
  isAi: boolean,
  value: any,
  uniqueId: string | null
): string {
  return `
    <div class="wrapper ${isAi && "ai"}"> 
      <div class="chat" > 
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? "bot" : "user"}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `;
}

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  const data = new FormData(form || undefined);

  //user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"), null);
  form.reset();

  //bot's chat stripe
  const uniqueId: string = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);
  form.reset();

  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv: any = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server -> bot's response

  const response = await fetch("https://flashcodeai.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: data.get("prompt") }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e: KeyboardEvent) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
