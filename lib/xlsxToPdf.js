/**
 * lib/xlsxToPdf.js
 *
 * Converts an .xlsx Buffer to a .pdf Buffer using LibreOffice headless.
 * Windows target: soffice.exe usually lives at
 *   C:\Program Files\LibreOffice\program\soffice.exe
 * Set SOFFICE_PATH in .env.local to that path (quotes not needed in .env).
 *
 * Bakit unique UserInstallation profile per-call:
 * LibreOffice locks a shared profile dir by default. Kapag dalawang
 * conversion ang sabay tumakbo (dalawang users nag-export nang same time),
 * mag-e-error o mag-hahang ang pangalawa ("soffice already running").
 * Solusyon: bagong temp profile dir bawat call.
 *
 * Bakit pathToFileURL: sa Windows, "C:\Users\foo" ay HINDI valid file:// URI
 * kung basta i-concat lang natin ng "file://". Kailangan i-convert nang tama
 * (forward slashes, %20 encoding, tamang bilang ng slashes) — ginagawa na
 * ito ni Node mismo sa pathToFileURL(), kaya safe ito sa Windows/Linux/Mac.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";
import { pathToFileURL } from "url";

const execFileAsync = promisify(execFile);

const SOFFICE_BIN =
  process.env.SOFFICE_PATH ||
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

const CONVERT_TIMEOUT_MS = 60_000; // 60s safety timeout per conversion

/**
 * @param {Buffer} xlsxBuffer - filled workbook buffer (galing sa exceljs)
 * @param {object} [opts]
 * @param {string} [opts.baseName] - filename hint lang, walang epekto sa laman
 * @returns {Promise<Buffer>} pdf buffer
 */
export async function convertXlsxBufferToPdf(xlsxBuffer, opts = {}) {
  const id = crypto.randomUUID();
  const workDir = path.join(os.tmpdir(), `xlsx2pdf-${id}`);
  const profileDir = path.join(os.tmpdir(), `lo-profile-${id}`);

  const inputName = `${opts.baseName || "input"}.xlsx`;
  const inputPath = path.join(workDir, inputName);

  await fs.mkdir(workDir, { recursive: true });

  try {
    await fs.writeFile(inputPath, xlsxBuffer);

    const profileUrl = pathToFileURL(profileDir).href; // Windows-safe

    const args = [
      "--headless",
      "--norestore",
      `-env:UserInstallation=${profileUrl}`,
      "--convert-to",
      "pdf",
      "--outdir",
      workDir,
      inputPath,
    ];

    await execFileAsync(SOFFICE_BIN, args, { timeout: CONVERT_TIMEOUT_MS });

    const outputPath = path.join(
      workDir,
      inputName.replace(/\.xlsx$/i, ".pdf"),
    );

    return await fs.readFile(outputPath);
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(
        `LibreOffice (soffice.exe) not found at "${SOFFICE_BIN}". ` +
          `check  install path, assign SOFFICE_PATH in .env.local.`,
      );
    }
    throw err;
  } finally {
    // Laging linisin ang temp dirs, success man o fail
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    await fs.rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}
