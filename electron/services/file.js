const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const { pdfToPng } = require('pdf-to-png-converter');

class FileService {
  constructor(database) {
    this.db = database;

    this.uploadDir = path.join('D:', 'OcrApp', 'uploads');
    this.outputDir = path.join('D:', 'OcrApp', 'Outputs');

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

      const now = new Date();

      const fileRecord = await this.db.run(
        `INSERT INTO files (user_id, original_name, file_path, processing_status, upload_time)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, fileName, uploadPath, 'processing', now.toISOString()]
      );

      const fileId = fileRecord.id;

      // Start async processing
      const resData = await this.processFileAsync(fileId, uploadPath, uniqueFileName);
      if(!resData.success){
        const now = new Date();
      await this.db.run(
        `UPDATE files SET processing_status = 'error', processed_at = ? WHERE id = ?`,
        [now.toISOString(), fileId]
      );
      return {
 success: false,
        error: resData.error || 'File processing failed'

      };
    } else {
      return {
       additionalData: resData,
        success: true,
        fileId,
        message: 'File uploaded successfully, processing started'
      };
    }
    } catch (err) {
      console.error('Error in processFile:', err);
      return { success: false, error: err.message };
    }
  }

  // Async processing of file
  async processFileAsync(fileId, filePath, fileName) {
    try {
      const pdfBytes = fs.readFileSync(filePath);

      // 1️⃣ Render first page to PNG
      const pngPages = await pdfToPng(filePath, { pagesToProcess: [1], viewportScale: 2.0 });
      const fullPageBuffer = pngPages[0].content;

      // 2️⃣ Save debug full page PNG
      const debugFullPagePath = path.join(this.outputDir, `page_${fileId}.png`);
      fs.writeFileSync(debugFullPagePath, fullPageBuffer);

      // 3️⃣ Crop card region
      const meta = await sharp(fullPageBuffer).metadata();
      const pageWidth = meta.width;
      const scaleFactor = pageWidth / 2500;

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

      // 4️⃣ Crop photo region
      const photoBuffer = await sharp(cardCroppedBuffer)
        .extract({
          left: 392,
          top: 225,
          width: 103,
          height: 93
        })
        .resize(270, 204, { fit: 'cover' })
        .png()
        .toBuffer();

      // 5️⃣ Extract text from PDF
      const parsed = await pdfParse(pdfBytes.buffer);
      const text = parsed.text;
      const filevalid = "(PMJAY-CMCHIS ஒருங்கிைணந்த திட்டம்)"
 if(!text.includes(filevalid)){
return { success: false, error: 'Upload Valid File.' };
 }
      const removePatterns = ["தமிழ்நாடு அரசு", "உறுப்பினர்", "அைடயாள", "அட்ைட"];
      function cleanLine(line) {
        let cleaned = line.trim();
        for (const p of removePatterns) {
          if (cleaned.includes(p)) return "";
        }
        return cleaned;
      }

      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

      let idNumber = "", name = "", address1 = "", address2 = "";
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\d{16,22}$/.test(line)) {
          idNumber = line;
          if (i + 1 < lines.length) name = cleanLine(lines[i + 1]);
          if (i + 2 < lines.length) address1 = cleanLine(lines[i + 2]);
          if (i + 3 < lines.length) address2 = cleanLine(lines[i + 3]);
          break;
        }
      }

      // 6️⃣ Create final PNG with overlay
      const widthOut = 325, heightOut = 204;
      const svgText = `
        <svg width="${widthOut}" height="${heightOut}">
          <style>
            .number { fill:black; font-size:11px; font-weight:bold; }
            .label { fill:black; font-size:11px; font-weight:bold; }
            .address { fill:black; font-size:11px; font-weight:bold; }
          </style>
          <text x="8" y="150" class="number">${idNumber}</text>
          <text x="8" y="160" class="label">${name}</text>
          <text x="8" y="175" class="address">${address1}</text>
          <text x="8" y="195" class="address">${address2}</text>
        </svg>
      `;
      // const svgBorder = `
      //   <svg width="${widthOut}" height="${heightOut}">
      //     <rect x="0" y="0" width="${widthOut}" height="${heightOut}" fill="none" stroke="black" stroke-width="3"/>
      //   </svg>
      // `;

      const finalImage = await sharp({
        create: { width: widthOut, height: heightOut, channels: 3, background: { r: 255, g: 255, b: 255 } }
      }).composite([
        { input: photoBuffer, top: 135, left: widthOut - 73 },
        { input: Buffer.from(svgText), top: 0, left: 0 },
        // { input: Buffer.from(svgBorder), top: 0, left: 0 },
      ]).png().toBuffer();

      const photoBufferImg = photoBuffer.toString('base64');

      console.log(`File ${fileId} processed successfully.`);

      return { success: true, fileId, fileName, idNumber, name, address1, address2, finalImage, photoBufferImg, photoBuffer, widthOut, heightOut };
    } catch (err) {
      console.error(`Error processing file ${fileId}:`, err);
      const now = new Date();
      await this.db.run(
        `UPDATE files SET processing_status = 'error', processed_at = ? WHERE id = ?`,
        [now.toISOString(), fileId]
      );
      return { success: false, error: err.message };
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

 async updateProcessed(fileId, fileName, idNumber, name, finalImageBuffer, address1, address2) {
    try {
      // Same resolution as processFileAsync
      const widthOut = 1300, heightOut = 816;
      const svgText = `
        <svg width="${widthOut}" height="${heightOut}">
          <style>
            .number { fill:black; font-size:44px; font-weight:bold; font-family: Arial, sans-serif; }
            .label { fill:black; font-size:44px; font-weight:bold; font-family: Arial, sans-serif; }
            .address { fill:black; font-size:44px; font-weight:bold; font-family: Arial, sans-serif; }
          </style>
          <text x="32" y="600" class="number">${idNumber}</text>
          <text x="32" y="650" class="label">${name}</text>
          <text x="32" y="700" class="address">${address1}</text>
          <text x="32" y="750" class="address">${address2}</text>
        </svg>
      `;

      // ✅ Dynamic placement of photo
      const finalImage = await sharp({
        create: { width: widthOut, height: heightOut, channels: 3, background: { r: 255, g: 255, b: 255 } }
      }).composite([
        { input: finalImageBuffer, top: heightOut - 260, left: widthOut - 285 },
        { input: Buffer.from(svgText), top: 0, left: 0 }
      ])
        .png({ quality: 100, compressionLevel: 0 })
        .toBuffer();

      const baseName = path.parse(fileName).name;

      const pngOutputPath = path.join(this.outputDir, `processed_${baseName}.png`);
      fs.writeFileSync(pngOutputPath, finalImage);

      const pdfOutputPath = path.join(this.outputDir, `processed_${baseName}.pdf`);
      const outPdf = await PDFDocument.create();
      outPdf.registerFontkit(fontkit);
      const pageOut = outPdf.addPage([widthOut, heightOut]);
      const embeddedPng = await outPdf.embedPng(finalImage);
      pageOut.drawImage(embeddedPng, { x: 0, y: 0, width: widthOut, height: heightOut });
      fs.writeFileSync(pdfOutputPath, await outPdf.save());

      const now = new Date();

      await this.db.run(
        `UPDATE files
         SET file_id = ?, 
             file_name = ?, 
             address1 = ?, 
             address2 = ?, 
             extracted_text = ?, 
             output_path = ?, 
             processing_status = 'completed',
             processed_at = ?
         WHERE id = ?`,
        [idNumber, name, address1, address2, name, pdfOutputPath, now.toISOString(), fileId]
      );

      return { success: true, pngOutputPath, pdfOutputPath };
    } catch (err) {
      console.error('Error in updateProcessed:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = FileService;
