const dialogue = [];
let currentLine = 0;
let voices = [];
let timeoutId = null;

window.speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
};

const youngInterviewScript = `
インタビュアー: 上司や先輩に言われてうれしかった言葉はありますか？
20代・男性: 「大丈夫、失敗してもフォローするから」と言われたとき、安心して挑戦できました。
インタビュアー: この上司は話しやすかったなと思ったことはありますか？
20代・男性: いつも笑顔で、こちらの話を最後まできちんと聞いてくれた人は話しやすかったです。
インタビュアー: 上司にはどう接してほしいですか？
20代・男性: 命令口調ではなく、「一緒に考えよう」と巻き込む感じで話してもらえるとうれしいです。
`;

const bossInterviewScript = `
インタビュアー: 部下や若手に接する時、言い方で気をつけていることはありますか？
60代・女性: まずは「ありがとう」と伝えてから、改善点を伝えるようにしています。
インタビュアー: 若手からはどう誘われると嬉しいですか？
60代・女性: 「少しだけ教えてもらえますか？」と控えめに聞かれると、気軽に応じやすいです。
インタビュアー: 若手とのコミュニケーションで難しかった経験はありますか？
60代・女性: 軽い冗談のつもりが真面目に受け取られてしまい、信頼を取り戻すのに時間がかかりました。
`;

function loadYoungInterview() {
  stopSpeech();
  document.getElementById("script-input").value = youngInterviewScript.trim();
  document.querySelector("#avatar2 .profile").textContent = "20代・男性";
  startDialogue();
}

function loadBossInterview() {
  stopSpeech();
  document.getElementById("script-input").value = bossInterviewScript.trim();
  document.querySelector("#avatar2 .profile").textContent = "60代・女性";
  startDialogue();
}

function startDialogue() {
  if (timeoutId) clearTimeout(timeoutId);
  speechSynthesis.cancel();
  dialogue.length = 0;
  currentLine = 0;

  const script = document.getElementById("script-input").value;
  script.split("\n").forEach(line => {
    const [speaker, text] = line.split(":");
    if (speaker && text) {
      const trimmedSpeaker = speaker.trim();
      const bubbleId = trimmedSpeaker === "インタビュアー" ? "bubble1" : "bubble2";
      dialogue.push({ speaker: trimmedSpeaker, text: text.trim(), bubbleId });
    }
  });

  playNextLine();
}

function playNextLine() {
  if (currentLine >= dialogue.length) return;

  const { speaker, text, bubbleId } = dialogue[currentLine];

  document.getElementById("bubble1").style.display = "none";
  document.getElementById("bubble2").style.display = "none";

  const bubble = document.getElementById(bubbleId);
  bubble.textContent = text;
  bubble.style.display = "block";

  const avatar1Img = document.querySelector("#avatar1 img");
  const avatar2Img = document.querySelector("#avatar2 img");

  if (bubbleId === "bubble1") {
    avatar1Img.src = "avatar1_talking.gif";
    avatar2Img.src = "avatar2.png";
  } else {
    avatar1Img.src = "avatar1.png";
    avatar2Img.src = "avatar2_talking.gif";
  }

  highlightCurrentLine(currentLine);

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = 1.2;
  utter.pitch = 1.0;

  const preferredVoice = voices.find(v =>
    v.lang === "ja-JP" && v.name.includes("Google")
  );
  if (preferredVoice) utter.voice = preferredVoice;

  utter.onend = () => {
    avatar1Img.src = "avatar1.png";
    avatar2Img.src = "avatar2.png";
    currentLine++;
    timeoutId = setTimeout(playNextLine, 300);
  };

  speechSynthesis.speak(utter);
}

function highlightCurrentLine(lineIndex) {
  const textarea = document.getElementById("script-input");
  const lines = textarea.value.split("\n");

  let charCount = 0;
  for (let i = 0; i < lineIndex; i++) {
    charCount += lines[i].length + 1;
  }

  textarea.selectionStart = charCount;
  textarea.selectionEnd = charCount + lines[lineIndex].length;

  const lineHeight = 24;
  textarea.scrollTop = lineHeight * lineIndex;
}

function stopSpeech() {
  if (timeoutId) clearTimeout(timeoutId);
  speechSynthesis.cancel();
}