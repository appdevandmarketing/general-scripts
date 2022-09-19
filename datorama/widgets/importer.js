function importScript(src) {
  return new Promise(function (resolve, reject) {
    if (src[0] === "js") {
      const script = document.createElement("script");
      script.src = src[1];
      script.addEventListener("load", function () {
        resolve(true);
      });
      document.head.appendChild(script);
    } else if (src[0] === "html") {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            document.getElementById("app").innerHTML = xhr.responseText;
            resolve(true);
          } else {
            reject(false);
          }
        }
      };
      xhr.open("GET", src[1], true);
      xhr.setRequestHeader("Content-type", "text/html");
      xhr.send();
    } else if (src[0] === "css") {
      const script = document.createElement("link");
      script.href = src[1];
      script.rel = "stylesheet";
      script.type = "text/css";

      script.addEventListener("load", function () {
        resolve(true);
      });
      document.head.appendChild(script);
    } else {
      reject(false);
    }
  });
}

function importScripts(urls) {
  return urls.map(importScript).reduce(function (p, c) {
    return p.then(function () {
      return c.then(function (result) {
        return true;
      });
    });
  }, Promise.resolve([]));
}
