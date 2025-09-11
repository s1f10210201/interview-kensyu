const dialogue = [];
let currentLine = 0;
let voices = [];
let timeoutId = null;

window.speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
};

const youngInterviewScript = `
インタビュアー: ハラスメントを意識して、上司とのコミュニケーションをためらうことはありますか？
20代・男性: ありますね。仕事のアドバイスも、受け取る人によっては否定と感じるかもしれないし、プライベートな質問は避けます。人によって線引きが違うので、安全策を取ってしまいます。
インタビュアー: 逆に、上司の言動で「嫌だな」と感じた経験はありますか？
20代・男性: 上司が明らかに間違っているのに、それを認めなかった時です。あと、やりたかったタスクを相談なく他の人に割り振られた時は、がっかりしました。
インタビュアー: どうすれば、ハラスメントは改善されると思いますか？
20代・男性: 少し極端かもしれませんが、業務に必要ないコミュニケーションは無理にしなくてもいいのかなと。せめて同じ部署内では、価値観を共有できると働きやすいですね。
インタビュアー: 普段、どんな上司なら気軽に話しかけられますか？
20代・男性: 感情の起伏が少なくて、少し時間に余裕がありそうな人です。忙しそうだと、どうしても声をかけるのをためらってしまいます。
`;

const bossInterviewScript = `
インタビュアー: 部下や若手に接する時、コミュニケーションで気をつけていることはありますか？
40代・女性: 一方的に指示するのではなく、「この案、どう思う？」と意見を聞くようにしています。正直に接することが信頼関係の基本ですから。
インタビュアー: ハラスメントを恐れて、指導をためらった経験はありますか？
40代・女性: ありますね。本人の成長のために強く言いたい時でも、受け取り方は人それぞれなので…。ただ、ハラスメントを恐れて何も言わなければ、その人のためにならない。そのバランスが難しいです。
インタビュアー: どうすれば、そうした課題は改善されると思いますか？
40代・女性: まずは会社として「ここまではOK」という線引きを明確にすること。そして、1on1などを増やして、普段から上下間のコミュニケーションに慣れていくことが大事だと思います。
インタビュアー: ご自身が若手だった頃、上司にされてうれしかったことは何ですか？
40代・女性: 厳しくても、自分の成長に繋がる的確なアドバイスをもらえた時ですね。私のことをちゃんと見て、考えてくれているんだなと感じられました。
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
  document.querySelector("#avatar2 .profile").textContent = "40代・女性";
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
