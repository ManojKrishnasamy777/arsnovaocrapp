import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfViewerProps {
    pdfPath: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfPath }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState<number>(1.0);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const zoomIn = () => setScale((prev) => prev + 0.2);
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.2));

    const handlePrint = () => {
        window.electronAPI.printPdf(pdfPath);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {/* Toolbar */}
            <div style={{ marginBottom: '10px' }}>
                <button onClick={handlePrint}>🖨 Print PDF</button>
                <button onClick={zoomOut} style={{ marginLeft: 10 }}>
                    <FaSearchMinus /> Zoom Out
                </button>
                <button onClick={zoomIn} style={{ marginLeft: 5 }}>
                    <FaSearchPlus /> Zoom In
                </button>
            </div>

            {/* PDF Container */}
            <div
                style={{
                    border: '1px solid #ccc',
                    width: '80%',
                    margin: '0 auto',
                    maxHeight: '80vh',
                    overflow: 'auto',
                }}
            >
                <Document file={`file://${pdfPath}`} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(new Array(numPages), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} />
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PdfViewer;
