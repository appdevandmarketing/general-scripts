function initDisclaimer() {
  const container = document.getElementById("creative-disclaimer-container");
  if (!container) {
    return setTimeout(initDisclaimer, 200);
  }

  const title = document.createElement("span");
  title.textContent = "About This Report:";
  container.appendChild(title);

  const ul = document.createElement("ul");
  ul.id = "creative-disclaimer";
  container.appendChild(ul);

  const data = [
    "Metrics shown always reflect all ad platforms combined.",
    "Meta post links are included for social ads when available to facilitate your community engagement efforts.",
    "Not all post links are available, and multiple links may appear if a creative ran in more than one variation, resulting in separate but identical Meta posts.",
  ];

  data.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  });
}

initDisclaimer();
