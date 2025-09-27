const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const { pdfToPng } = require('pdf-to-png-converter');
const Tesseract = require("tesseract.js");

class FileService {
  constructor(database) {
    this.db = database;

    this.uploadDir = path.join('D:', 'OcrApp', 'uploads');
this.outputDir = path.join('D:', 'OcrApp', 'Outputs'); 
    // Ensure directories exist
    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
    if (!fs.existsSync(this.outputDir)) fs.mkdirSync(this.outputDir, { recursive: true });
  }

  // Upload a file
  async processFile(filePath, fileName, userId) {
    try {
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${fileName}`;
      const uploadPath = path.join(this.uploadDir, uniqueFileName);
      fs.copyFileSync(filePath, uploadPath);

      const fileRecord = await this.db.run(
        `INSERT INTO files (user_id, original_name, file_path, processing_status, upload_time)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, fileName, uploadPath, 'processing']
      );

      const fileId = fileRecord.id;

      // Start async processing
      this.processFileAsync(fileId, uploadPath, uniqueFileName);

      return { success: true, fileId, message: 'File uploaded successfully, processing started' };
    } catch (err) {
      console.error('Error in processFile:', err);
      return { success: false, error: err.message };
    }
  }

  // Async processing of file
// Async processing of file

async processFileAsync(fileId, filePath, fileName) {
  try {
    const pdfBytes = fs.readFileSync(filePath);

    // --- 1. Render first page to PNG ---
    const pngPages = await pdfToPng(filePath, { pagesToProcess: [1], viewportScale: 2.0 });
    const fullPageBuffer = pngPages[0].content;

    // --- 2. Save debug full page PNG ---
    const debugFullPagePath = path.join(this.outputDir, `page_${fileId}.png`);
    fs.writeFileSync(debugFullPagePath, fullPageBuffer);

    // --- 3. Crop card region (scaled) ---
    const meta = await sharp(fullPageBuffer).metadata();
    const pageWidth = meta.width;
    const scaleFactor = pageWidth / 2500; // reference width

    const cardCroppedBuffer = await sharp(fullPageBuffer)
      .extract({
        left: Math.floor(130 * scaleFactor),
        top: Math.floor(124 * scaleFactor),
        width: Math.floor(2088 * scaleFactor),
        height: Math.floor(683 * scaleFactor)
      })
      .png()
      .toBuffer();

    // --- 4. Crop photo region ---
    const photoBuffer = await sharp(cardCroppedBuffer)
      .extract({
        left: Math.floor(773 * scaleFactor),
        top: Math.floor(444 * scaleFactor),
        width: Math.floor(209 * scaleFactor),
        height: Math.floor(185 * scaleFactor)
      })
      .resize(70, 70)
      .png()
      .toBuffer();

    // --- 5. OCR for text extraction ---
    const { data } = await Tesseract.recognize(cardCroppedBuffer, "tam+eng");
    const lines = data.text.split("\n").map(l => l.trim()).filter(Boolean);

    // Extract ID number
    const idMatch = lines.find(l => /\d{15,}/.test(l));
    const idNumber = idMatch ? idMatch.match(/\d{15,}/)[0] : "";

    // Extract name (next line after ID)
    let name = "";
    let address1 = "";
    let address2 = "";
    if (idMatch) {
      const idx = lines.indexOf(idMatch);
      name = lines[idx + 1]?.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "";

      // Extract address lines (after name, stop at phone numbers)
      const addrLines = [];
      for (let i = idx + 2; i < lines.length; i++) {
        if (/\d{8,}/.test(lines[i])) break; // stop at phone numbers
        const cleanLine = lines[i].replace(/[^a-zA-Z0-9\s,\.]/g, "").trim();
        if (cleanLine) addrLines.push(cleanLine);
      }
      address1 = addrLines[0] || "";
      address2 = addrLines[1] || "";
    }

    // --- 6. Create final PNG with overlay ---
    const widthOut = 325, heightOut = 204;
    const svgText = `
      <svg width="${widthOut}" height="${heightOut}">
        <style>
          .number { fill:black; font-size:12px; font-weight:bold; }
          .label { fill:black; font-size:14px; font-weight:bold; }
          .address { fill:black; font-size:10px; font-weight:bold; }
        </style>
        <text x="8" y="145" class="number">${idNumber}</text>
        <text x="8" y="163" class="label">${name}</text>
        <text x="8" y="179" class="address">${address1}</text>
        <text x="8" y="195" class="address">${address2}</text>
      </svg>
    `;
    const svgBorder = `
      <svg width="${widthOut}" height="${heightOut}">
        <rect x="0" y="0" width="${widthOut}" height="${heightOut}" fill="none" stroke="black" stroke-width="3"/>
      </svg>
    `;

    const finalImage = await sharp({
      create: { width: widthOut, height: heightOut, channels: 3, background: { r: 255, g: 255, b: 255 } }
    })
      .composite([
        { input: photoBuffer, top: 130, left: widthOut - 73 },
        { input: Buffer.from(svgText), top: 0, left: 0 },
        { input: Buffer.from(svgBorder), top: 0, left: 0 },
      ])
      .png()
      .toBuffer();

    const pngOutputPath = path.join(this.outputDir, `processed_${path.parse(fileName).name}.png`);
    fs.writeFileSync(pngOutputPath, finalImage);

    // --- 7. Create processed PDF ---
    const pdfOutputPath = path.join(this.outputDir, `processed_${path.parse(fileName).name}.pdf`);
    const outPdf = await PDFDocument.create();
    outPdf.registerFontkit(fontkit);
    const pageOut = outPdf.addPage([widthOut, heightOut]);
    const embeddedPng = await outPdf.embedPng(finalImage);
    pageOut.drawImage(embeddedPng, { x: 0, y: 0, width: widthOut, height: heightOut });
    fs.writeFileSync(pdfOutputPath, await outPdf.save());

    // --- 8. Update database ---
     await this.db.run(`
        UPDATE files 
        SET extracted_text = ?, output_path = ?, processing_status = 'completed', processed_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [name, pdfOutputPath, fileId]);


    console.log(`File ${fileId} processed successfully.`);
  } catch (err) {
    console.error(`Error processing file ${fileId}:`, err);
    await this.db.run(
      `UPDATE files SET processing_status = 'error', processed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [fileId]
    );
  }
}



  async getAllFiles() {
    try {
      const files = await this.db.query(`
        SELECT f.*, u.name as user_name, u.email as user_email
        FROM files f
        JOIN users u ON f.user_id = u.id
        ORDER BY f.upload_time DESC
      `);
      return { success: true, files };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getUserFiles(userId) {
    try {
      const files = await this.db.query(`
        SELECT * FROM files
        WHERE user_id = ?
        ORDER BY upload_time DESC
      `, [userId]);
      return { success: true, files };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = FileService;
