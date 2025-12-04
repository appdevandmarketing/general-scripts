function initDisclaimer() {
  const container = document.getElementById("location-footer-note-container");
  if (!container) {
    return setTimeout(initDisclaimer, 200);
  }

  const title = document.createElement("span");
  title.textContent = "Note:";
  title.classList.add("location-footer-note-title");
  container.appendChild(title);

  const ul = document.createElement("ul");
  ul.id = "location-footer-note";
  ul.classList.add("location-footer-note");
  container.appendChild(ul);

  const data = [
    '"ML" indicates “Multiple Locations.” When a campaign is not able to provide metrics broken out by individual locations, e.g. when a search campaign requires a broader region to gather enough volume or when a campaign type does not support location-level reporting, those results will appear under the "ML" code.',
  ];

  data.forEach((text) => {
    const li = document.createElement("li");
    li.classList.add("location-footer-note-item");
    li.textContent = text;
    ul.appendChild(li);
  });
}

initDisclaimer();
