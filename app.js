(async function () {
  await window.__editorReady;

  const runBtn = document.getElementById("runBtn");
  const languageSelect = document.getElementById("languageSelect");
  const output = document.getElementById("output");
  const preview = document.getElementById("preview");
  const editorDiv = document.getElementById("editor");

  /* ================================
     PYODIDE
  ================================ */
  const pyodide = await loadPyodide({
    indexURL: "libs/pyodide/"
  });

  pyodide.setStdout({ batched: s => output.textContent += s });
  pyodide.setStderr({ batched: s => output.textContent += s });

  /* ================================
     DİL DEĞİŞİMİ + LAYOUT
  ================================ */
  languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;

    monaco.editor.setModelLanguage(editor.getModel(), lang);

    if (lang === "html" || lang === "css") {
      preview.classList.remove("hidden");
      editorDiv.style.width = "60%";
    } else {
      preview.classList.add("hidden");
      preview.srcdoc = "";
      editorDiv.style.width = "100%";
    }

    editor.layout(); // 🔴 Monaco'ya yeniden hesaplat
  });

  /* ================================
     RUN
  ================================ */
  runBtn.addEventListener("click", async () => {
    output.textContent = "";
    const code = editor.getValue();
    const lang = languageSelect.value;

    if (lang === "javascript") {
      try {
        const oldLog = console.log;
        console.log = (...a) => output.textContent += a.join(" ") + "\n";
        new Function(code)();
        console.log = oldLog;
      } catch (e) {
        output.textContent += "❌ JS Hatası:\n" + e.message;
      }
    }

    else if (lang === "typescript") {
      try {
        const jsCode = ts.transpile(code);
        const oldLog = console.log;
        console.log = (...a) => output.textContent += a.join(" ") + "\n";
        new Function(jsCode)();
        console.log = oldLog;
      } catch (e) {
        output.textContent += "❌ TypeScript Hatası:\n" + e.message;
      }
    }

    else if (lang === "python") {
      try {
        pyodide.runPython(code);
      } catch (e) {
        output.textContent += "❌ Python Hatası:\n" + e;
      }
    }

    else if (lang === "html") {
      preview.srcdoc = code;
    }

    else if (lang === "css") {
      preview.srcdoc = `
        <html>
          <head><style>${code}</style></head>
          <body>
            <h2>CSS Önizleme</h2>
            <p>Bu alan CSS denemeleri içindir.</p>
            <button>Buton</button>
          </body>
        </html>
      `;
    }
  });

})();
