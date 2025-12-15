(async function () {
  await window.__editorReady;

  const runBtn = document.getElementById("runBtn");
  const languageSelect = document.getElementById("languageSelect");
  const output = document.getElementById("output");

  /* ================================
     PYODIDE YÜKLE
  ================================ */
  const pyodide = await loadPyodide({
    indexURL: "libs/pyodide/"
  });

  pyodide.setStdout({ batched: s => output.textContent += s });
  pyodide.setStderr({ batched: s => output.textContent += s });

  /* ================================
     DİL DEĞİŞİNCE EDITOR
  ================================ */
  languageSelect.addEventListener("change", () => {
    monaco.editor.setModelLanguage(
      editor.getModel(),
      languageSelect.value
    );
  });

  /* ================================
     RUN
  ================================ */
  runBtn.addEventListener("click", async () => {
    output.textContent = "";
    const code = editor.getValue();
    const lang = languageSelect.value;

    // --- JAVASCRIPT ---
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

    // --- PYTHON ---
    else if (lang === "python") {
      try {
        pyodide.runPython(code);
      } catch (e) {
        output.textContent += "❌ Python Hatası:\n" + e;
      }
    }
  });

})();
