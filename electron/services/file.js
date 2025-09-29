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
   let resData = await this.processFileAsync(fileId, uploadPath, uniqueFileName);
console.log('resData',resData);
      return { additionalData:resData,success: true, fileId, message: 'File uploaded successfully, processing started' };
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
    const scaleFactor = pageWidth / 2500;// reference width

    const cardCroppedBuffer = await sharp(fullPageBuffer)
      .extract({
        left: Math.floor(130 * scaleFactor),
        top: Math.floor(124 * scaleFactor),
        width: Math.floor(2088 * scaleFactor),
        height: Math.floor(683 * scaleFactor)
      })
      .png()
      .toBuffer();

      const croppedBuffer = await sharp(cardCroppedBuffer)
        .extract({ left: 0, top: 0, width: 504, height: 320 })
        .png()
        .toBuffer();

    // --- 4. Crop photo region ---
    const photoBuffer = await sharp(cardCroppedBuffer)
      .extract({
        left: 392,
        top: 225,
        width: 103,
        height: 93
      })
      .resize(70, 70)
      .png()
      .toBuffer();

    // --- 5. OCR for text extraction ---
     const { data } = await Tesseract.recognize(croppedBuffer, "tam+eng");

const lines = data.text
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

console.log("OCR Lines:", lines);

// Find ID number
const idNumberMatch = lines.find((line) => /\d{15,}/.test(line));
const idNumber = idNumberMatch ? idNumberMatch.match(/\d{15,}/)[0] : null;

// Extract name and addresses
let name = null;
let address1 = null;
let address2 = null;

if (idNumberMatch) {
  const idx = lines.indexOf(idNumberMatch);

  // Name: next line after ID
  if (idx >= 0 && idx + 1 < lines.length) {
    name = lines[idx + 1].replace(/[^a-zA-Z0-9\s]/g, "").trim();
  }

  // Address: next two lines after name
  if (idx + 2 < lines.length) {
    // remove special characters except letters, numbers, spaces, commas, dots
    address1 = lines[idx + 2].replace(/[^a-zA-Z0-9\s,\.]/g, "").trim();
  }
  if (idx + 3 < lines.length) {
    address2 = lines[idx + 3].replace(/[^a-zA-Z0-9\s,\.]/g, "").trim();
  }
}

console.log("fulldata", name || null, idNumber || null, address1 || null, address2 || null);


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
    // const pngOutputPath = path.join(this.outputDir, `processed_${path.parse(fileName).name}.png`);
    // fs.writeFileSync(pngOutputPath, finalImage);

    // // --- 7. Create processed PDF ---
    // const pdfOutputPath = path.join(this.outputDir, `processed_${path.parse(fileName).name}.pdf`);
    // const outPdf = await PDFDocument.create();
    // outPdf.registerFontkit(fontkit);
    // const pageOut = outPdf.addPage([widthOut, heightOut]);
    // const embeddedPng = await outPdf.embedPng(finalImage);
    // pageOut.drawImage(embeddedPng, { x: 0, y: 0, width: widthOut, height: heightOut });
    // fs.writeFileSync(pdfOutputPath, await outPdf.save());
// console.log('output data',idNumber,name,name,pdfOutputPath);
//     // --- 8. Update database ---
//      await this.db.run(`
//         UPDATE files 
//         SET file_id = ?, file_name = ?,extracted_text = ?, output_path = ?, processing_status = 'completed', processed_at = CURRENT_TIMESTAMP 
//         WHERE id = ?
//       `, [idNumber,name,name,pdfOutputPath, fileId]);
// const finalImageBase64 = finalImage.toString('base64');
const photoBufferImg = photoBuffer.toString('base64');

    console.log(`File ${fileId} processed successfully.`);
    return {
      success: true,
       fileId,
      fileName,
      idNumber,
      name,
      address1,
      address2,
      finalImage,
      photoBufferImg,
      photoBuffer,
      widthOut,
      heightOut
    };
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

  async updateProcessed(
    fileId,
    fileName,
    idNumber,
    name,
    finalImageBuffer,
    address1,
    address2,
  ) {
    try {
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
        { input: finalImageBuffer, top: 130, left: widthOut - 73 },
        { input: Buffer.from(svgText), top: 0, left: 0 },
        { input: Buffer.from(svgBorder), top: 0, left: 0 },
      ])
      .png()
      .toBuffer();
      const baseName = path.parse(fileName).name;
console.log('finalImageBuffer',finalImageBuffer,'heightOut',heightOut,'widthOut',widthOut);
      // 1️⃣ Save the final PNG
      const pngOutputPath = path.join(this.outputDir, `processed_${baseName}.png`);
      fs.writeFileSync(pngOutputPath, Buffer.from(finalImage));

      // 2️⃣ Create a PDF with the PNG embedded
      const pdfOutputPath = path.join(this.outputDir, `processed_${baseName}.pdf`);
      const outPdf = await PDFDocument.create();
      outPdf.registerFontkit(fontkit);
      const pageOut = outPdf.addPage([widthOut, 204]);
      const embeddedPng = await outPdf.embedPng(Buffer.from(finalImage));
      pageOut.drawImage(embeddedPng, { x: 0, y: 0, width: widthOut, height: 204 });
      fs.writeFileSync(pdfOutputPath, await outPdf.save());

      // 3️⃣ Update the SQLite database
      await this.db.run(
        `UPDATE files
         SET file_id = ?, 
             file_name = ?, 
             address1 = ?, 
             address2 = ?, 
             extracted_text = ?, 
             output_path = ?, 
             processing_status = 'completed',
             processed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [idNumber, name,address1,address2, name, pdfOutputPath, fileId]
      );

      return {
        success: true,
        pngOutputPath,
        pdfOutputPath
      };
    } catch (err) {
      console.error('Error in updateProcessed:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = FileService;
