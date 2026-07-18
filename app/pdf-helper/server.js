/**
 * pdf-helper/server.js
 *
 * Maliit na standalone HTTP server na tumatakbo LAMANG sa interactive
 * desktop session (via Task Scheduler "Run only when user is logged on").
 * Ito na lang ang tanging bahagi ng system na direktang gumagalaw kay
 * Excel COM automation — ang main Next.js app (naka-NSSM, Session 0) ay
 * tumatawag na lang dito via localhost HTTP.
 *
 * Run: node server.js  (dapat sa loob ng pdf-helper folder ang working dir)
 * Default port: 5055
 */

const http = require("http");
const { execFile } = require("child_process");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PDF_HELPER_PORT || 5055;

// __dirname = folder kung nasaan itong server.js file mismo
// (financial-app\pdf-helper\), kaya laging tama ito kahit saan pa
// i-install/i-clone ang project sa ibang PC.
const PS_SCRIPT_PATH = path.join(__dirname, "xlsxToPdf.ps1");

// Temp working folder para sa mga xlsx/pdf files habang nagko-convert.
// Nasa loob pa rin ng C:\ExcelPdfTemp muna (hindi natin ginagalaw habang
// nagte-test pa tayo) — pwede na lang natin ilipat sa hinaharap papuntang
// pdf-helper\temp kung gusto mo, kapag stable na ang buong setup.
const BASE_TEMP_DIR = "C:\\ExcelPdfTemp";

function ensureBaseTempDir() {
  if (!fsSync.existsSync(BASE_TEMP_DIR)) {
    fsSync.mkdirSync(BASE_TEMP_DIR, { recursive: true });
  }
}

function runPowerShell(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        PS_SCRIPT_PATH,
        "-InputPath",
        inputPath,
        "-OutputPath",
        outputPath,
      ],
      {
        timeout: 90000,
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      },
      (err, stdout, stderr) => {
        console.log("===== STDOUT =====");
        console.log(stdout);

        console.log("===== STDERR =====");
        console.log(stderr);

        if (err) {
          console.log(err);
          return reject(
            new Error(
              JSON.stringify({
                message: err.message,
                stdout,
                stderr,
              }),
            ),
          );
        }

        resolve();
      },
    );
  });
}
const server = http.createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/convert") {
    res.writeHead(404);
    return res.end("Not found");
  }

  ensureBaseTempDir();

  const id = crypto.randomUUID();
  const workDir = path.join(BASE_TEMP_DIR, `xlsx2pdf-${id}`);
  const inputPath = path.join(workDir, "input.xlsx");
  const outputPath = path.join(workDir, "input.pdf");

  try {
    await fs.mkdir(workDir, { recursive: true });

    // Kunin ang raw xlsx bytes mula sa request body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const xlsxBuffer = Buffer.concat(chunks);

    await fs.writeFile(inputPath, xlsxBuffer);
    await fs.access(inputPath);

    const stat = await fs.stat(inputPath);

    console.log("Input:", inputPath);
    console.log("Size :", stat.size);

    if (stat.size === 0) {
      throw new Error("Generated XLSX is empty.");
    }
    await runPowerShell(inputPath, outputPath);
    const pdfBuffer = await fs.readFile(outputPath);

    res.writeHead(200, { "Content-Type": "application/pdf" });
    res.end(pdfBuffer);
  } catch (err) {
    console.error("[pdf-helper] conversion error:", err.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  } finally {
    // fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    console.log("DEBUG - workDir kept at:", workDir);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[pdf-helper] listening on http://127.0.0.1:${PORT}`);
  console.log(`[pdf-helper] using script: ${PS_SCRIPT_PATH}`);
});
