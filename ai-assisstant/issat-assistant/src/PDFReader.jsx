import React, { useState } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker - using CDN for browser compatibility
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

// Certificate validation logic
async function validateCertificate(pdfText, fileName) {
  const text = pdfText.toLowerCase();
  const issues = [];
  const positives = [];

  // Check for required certificate elements
  const requiredElements = [
    { key: "institution", patterns: ["issat", "institut", "kairouan", "établissement", "établissement supérieur"] },
    { key: "certificate_type", patterns: ["certificat", "attestation", "diplôme", "relevé"] },
    { key: "student_info", patterns: ["étudiant", "student", "nom", "prénom", "matricule", "cne"] },
    { key: "date", patterns: ["date", "délivré", "délivré le", "le"] },
    { key: "signature", patterns: ["signature", "signé", "directeur", "responsable"] },
  ];

  // Check for presence of required elements
  requiredElements.forEach((element) => {
    const found = element.patterns.some((pattern) => text.includes(pattern));
    if (found) {
      positives.push(`✓ ${element.key} found`);
    } else {
      issues.push(`⚠ Missing: ${element.key}`);
    }
  });

  // Check for suspicious patterns (potential fraud indicators)
  const fraudIndicators = [
    { pattern: /date.*\d{4}.*date/i, issue: "Duplicate date fields (suspicious)" },
    { pattern: /signature.*signature/i, issue: "Multiple signature mentions (suspicious)" },
    { pattern: /copie|copy|scan|scanné/i, issue: "Contains 'copy' or 'scan' text (may be a copy)" },
    { pattern: /modifié|modified|edité/i, issue: "Contains modification indicators" },
  ];

  fraudIndicators.forEach((indicator) => {
    if (indicator.pattern.test(pdfText)) {
      issues.push(`🔴 ${indicator.issue}`);
    }
  });

  // Check for formatting inconsistencies
  const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g;
  const dates = pdfText.match(datePattern);
  if (dates && dates.length > 0) {
    // Check if dates are consistent
    const uniqueDates = new Set(dates);
    if (uniqueDates.size > 3) {
      issues.push("⚠ Multiple inconsistent dates found");
    } else {
      positives.push(`✓ Found ${dates.length} date(s)`);
    }
  } else {
    issues.push("⚠ No clear date format found");
  }

  // Check for official seals/stamps
  const sealPatterns = ["sceau", "seal", "cachet", "stamp", "tampon"];
  const hasSeal = sealPatterns.some((pattern) => text.includes(pattern));
  if (hasSeal) {
    positives.push("✓ Seal/stamp mentioned");
  } else {
    issues.push("⚠ No seal/stamp mentioned (may be missing)");
  }

  // Check text quality (too short might be incomplete)
  if (pdfText.length < 200) {
    issues.push("⚠ Certificate text seems too short (may be incomplete)");
  }

  // Check for student ID patterns
  const idPatterns = [/\b\d{6,10}\b/, /\b[a-z]{2,3}\d{4,6}\b/i];
  const hasId = idPatterns.some((pattern) => pattern.test(pdfText));
  if (hasId) {
    positives.push("✓ Student ID pattern found");
  }

  // Determine overall status
  const fraudScore = issues.filter((i) => i.includes("🔴")).length;
  const warningCount = issues.filter((i) => i.includes("⚠")).length;
  const positiveCount = positives.length;

  let status = "legitimate";
  let statusColor = "#59ffb3";
  let statusIcon = CheckCircle;
  let confidence = "high";

  if (fraudScore >= 2) {
    status = "fraudulent";
    statusColor = "#ff5c5c";
    statusIcon = XCircle;
    confidence = "high";
  } else if (fraudScore >= 1 || warningCount >= 4) {
    status = "suspicious";
    statusColor = "#ffb84d";
    statusIcon = AlertCircle;
    confidence = "medium";
  } else if (warningCount >= 2) {
    status = "needs_review";
    statusColor = "#ffb84d";
    statusIcon = AlertCircle;
    confidence = "medium";
  } else if (positiveCount < 3) {
    status = "incomplete";
    statusColor = "#ffb84d";
    statusIcon = AlertCircle;
    confidence = "low";
  }

  return {
    status,
    statusColor,
    statusIcon,
    confidence,
    issues,
    positives,
    textLength: pdfText.length,
    fileName,
  };
}

export default function PDFReader({ onCertificateValidated }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  async function handleFileSelect(event) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
    setExtractedText("");
    setLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      let fullText = "";

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      setExtractedText(fullText);

      // Validate certificate
      const validation = await validateCertificate(fullText, selectedFile.name);
      setResult(validation);

      // Notify parent component
      if (onCertificateValidated) {
        onCertificateValidated(validation);
      }
    } catch (err) {
      setError(`Error reading PDF: ${err.message}`);
      console.error("PDF reading error:", err);
    } finally {
      setLoading(false);
    }
  }

  const StatusIcon = result?.statusIcon || FileText;

  return (
    <div style={{ marginTop: 16, padding: 16, borderRadius: 16, border: "1px solid #1d5b45", background: "#07140f" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <FileText size={20} color="#59ffb3" />
        <h3 style={{ margin: 0, fontSize: 16, color: "#c7ffe0" }}>Certificate Validator</h3>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid #1d5b45",
            background: "#050b08",
            color: "#c7ffe0",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          <Upload size={16} />
          {file ? file.name : "Upload PDF Certificate"}
          <input type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: "none" }} />
        </label>
      </div>

      {loading && (
        <div style={{ padding: 12, textAlign: "center", color: "#c7ffe0" }}>
          <div style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</div>
          <span style={{ marginLeft: 8 }}>Reading PDF...</span>
        </div>
      )}

      {error && (
        <div style={{ padding: 12, borderRadius: 12, background: "#140707", border: "1px solid #5b1d1d", color: "#ffb3b3" }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: `2px solid ${result.statusColor}`,
              background: "#050b08",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <StatusIcon size={24} color={result.statusColor} />
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: result.statusColor }}>
                  Status: {result.status.toUpperCase().replace("_", " ")}
                </div>
                <div style={{ fontSize: 12, color: "#c7ffe0", opacity: 0.8 }}>
                  Confidence: {result.confidence}
                </div>
              </div>
            </div>

            {result.positives.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: "#59ffb3", marginBottom: 8 }}>✓ Positive Indicators:</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: "#c7ffe0", fontSize: 13 }}>
                  {result.positives.map((pos, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {pos}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.issues.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: result.statusColor, marginBottom: 8 }}>⚠ Issues Found:</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: "#c7ffe0", fontSize: 13 }}>
                  {result.issues.map((issue, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: 12, fontSize: 12, color: "#c7ffe0", opacity: 0.7 }}>
              File: {result.fileName} | Text length: {result.textLength} characters
            </div>
          </div>

          {extractedText && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", color: "#59ffb3", fontSize: 13, marginBottom: 8 }}>View Extracted Text</summary>
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "#050b08",
                  border: "1px solid #1d5b45",
                  maxHeight: 200,
                  overflowY: "auto",
                  fontSize: 12,
                  color: "#c7ffe0",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                }}
              >
                {extractedText.substring(0, 1000)}
                {extractedText.length > 1000 && "..."}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

