"use client";
import { useState } from "react";

const ATC_OPTIONS = [
  {
    value: "WC158",
    label: "WC158 (1%)",
    description:
      "Income payment made by top withholding agents - supplier of goods",
    rate: 0.01,
  },
  {
    value: "WC160",
    label: "WC160 (2%)",
    description:
      "Income payment made by top withholding agents - supplier of services",
    rate: 0.02,
  },
  {
    value: "WC120",
    label: "WC120 (2%)",
    description: "Income payments to certain contractors",
    rate: 0.02,
  },
  {
    value: "WC010",
    label: "WC010 (10%)",
    description: "Professional fees - gross income did not exceed 720k",
    rate: 0.1,
  },
  {
    value: "WC011",
    label: "WC011 (15%)",
    description: "Professional fees - gross income exceeds 720k",
    rate: 0.15,
  },
];

function getQuarter() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  if (m <= 3) return { label: "1st", from: `01/01/${y}`, to: `03/31/${y}` };
  if (m <= 6) return { label: "2nd", from: `04/01/${y}`, to: `06/30/${y}` };
  if (m <= 9) return { label: "3rd", from: `07/01/${y}`, to: `09/30/${y}` };
  return { label: "4th", from: `10/01/${y}`, to: `12/31/${y}` };
}

function fmt(n) {
  return Number(n)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function BIR2307Page() {
  const [quarter] = useState(() => getQuarter());
  const [payeeTin, setPayeeTin] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [payeeAddress, setPayeeAddress] = useState("");
  const [payeeZip, setPayeeZip] = useState("");
  const [foreignAddress, setForeignAddress] = useState("");
  const [atc, setAtc] = useState(ATC_OPTIONS[1]);
  const [m1, setM1] = useState("");
  const [m2, setM2] = useState("");
  const [m3, setM3] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total =
    (parseFloat(m1) || 0) + (parseFloat(m2) || 0) + (parseFloat(m3) || 0);
  const tax = total * atc.rate;

  const handleAtcChange = (e) => {
    const found = ATC_OPTIONS.find((o) => o.value === e.target.value);
    if (found) setAtc(found);
  };

  const handleDownload = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        quarter,
        supplier: {
          supplierTin: payeeTin,
          supplierName: payeeName,
          supplierAddress: payeeAddress,
          zipCode: payeeZip,
          foreignAddress,
        },
        atcCode: atc.value,
        atcDescription: atc.description,
        taxRate: atc.rate,
        month1: parseFloat(m1) || 0,
        month2: parseFloat(m2) || 0,
        month3: parseFloat(m3) || 0,
      };

      const res = await fetch("/api/bir2307", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to generate Excel file.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BIR2307_${payeeName || "export"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* ── HEADER ── */}
        <div style={styles.formHeader}>
          <div style={styles.bcsLabel}>
            BCS/
            <br />
            Item:
          </div>
          <div style={styles.govTitle}>
            Republic of the Philippines
            <br />
            Department of Finance
            <br />
            Bureau of Internal Revenue
          </div>
          <div style={styles.formCode}>2307 01/18ENCS</div>
        </div>

        <div style={styles.titleRow}>
          <div>
            <div style={styles.birFormNo}>BIR Form No.</div>
            <div style={styles.formNumber}>2307</div>
            <div style={styles.birFormNo}>January 2018 (ENCS)</div>
          </div>
          <div style={styles.certTitle}>
            Certificate of Creditable Tax
            <br />
            Withheld at Source
          </div>
          <div style={{ width: 80 }} />
        </div>

        <div style={styles.fillNote}>
          Fill in all applicable spaces. Mark all appropriate boxes with an
          &quot;X&quot;.
        </div>

        {/* ── PERIOD ── */}
        <table style={styles.table}>
          <tbody>
            <tr>
              <Td style={{ width: 20 }}>
                <span style={styles.sectionNum}>1</span>
              </Td>
              <Td colSpan={8}>
                <span style={styles.labelText}>
                  For the Period &nbsp; From&nbsp;
                </span>
                <strong>{quarter.from}</strong>
                <span style={styles.labelText}>
                  &nbsp;(MM/DD/YYYY)&nbsp;&nbsp; To&nbsp;
                </span>
                <strong>{quarter.to}</strong>
                <span style={styles.labelText}>&nbsp;(MM/DD/YYYY)</span>
              </Td>
            </tr>
          </tbody>
        </table>

        {/* ── PART I – PAYEE ── */}
        <SectionHeader>Part I &ndash; Payee Information</SectionHeader>
        <table style={styles.table}>
          <tbody>
            <LabelRow num="2" label="Taxpayer Identification Number (TIN)" />
            <InputRow>
              <input
                style={styles.input}
                value={payeeTin}
                onChange={(e) => setPayeeTin(e.target.value)}
                placeholder="000-000-000-00000"
              />
            </InputRow>

            <LabelRow
              num="3"
              label="Payee's Name (Last Name, First Name, Middle Name for Individual OR Registered Name for Non-Individual)"
            />
            <InputRow>
              <input
                style={styles.input}
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Payee name"
              />
            </InputRow>

            <tr>
              <Td>
                <span style={styles.sectionNum}>4</span>
              </Td>
              <Td colSpan={7}>
                <span style={styles.labelText}>Registered Address</span>
              </Td>
              <Td colSpan={2}>
                <span style={styles.labelText}>4A ZIP Code</span>
              </Td>
            </tr>
            <tr>
              <Td colSpan={8}>
                <input
                  style={styles.input}
                  value={payeeAddress}
                  onChange={(e) => setPayeeAddress(e.target.value)}
                  placeholder="Address"
                />
              </Td>
              <Td colSpan={2}>
                <input
                  style={styles.input}
                  value={payeeZip}
                  onChange={(e) => setPayeeZip(e.target.value)}
                  placeholder="ZIP"
                />
              </Td>
            </tr>

            <LabelRow num="5" label="Foreign Address, if applicable" />
            <InputRow>
              <input
                style={styles.input}
                value={foreignAddress}
                onChange={(e) => setForeignAddress(e.target.value)}
                placeholder=""
              />
            </InputRow>
          </tbody>
        </table>

        {/* ── PART II – PAYOR ── */}
        <SectionHeader>Part II &ndash; Payor Information</SectionHeader>
        <table style={styles.table}>
          <tbody>
            <LabelRow num="6" label="Taxpayer Identification Number (TIN)" />
            <tr>
              <Td colSpan={10} style={{ fontWeight: "bold", fontSize: 11 }}>
                000-484-418-00000
              </Td>
            </tr>

            <LabelRow
              num="7"
              label="Payor's Name (Last Name, First Name, Middle Name for Individual OR Registered Name for Non-Individual)"
            />
            <tr>
              <Td colSpan={10} style={{ fontWeight: "bold", fontSize: 11 }}>
                ORIENTAL CONSULTANTS GLOBAL CO. LTD. - PHILIPPINE BRANCH
              </Td>
            </tr>

            <tr>
              <Td>
                <span style={styles.sectionNum}>8</span>
              </Td>
              <Td colSpan={7}>
                <span style={styles.labelText}>Registered Address</span>
              </Td>
              <Td colSpan={2}>
                <span style={styles.labelText}>8A ZIP Code</span>
              </Td>
            </tr>
            <tr>
              <Td colSpan={8} style={{ fontSize: 10 }}>
                UNIT 38C RUFINO PACIFIC TOWER, 6784 AYALA AVE., BRGY. SAN
                LORENZO, 4TH DIST., MAKATI CITY
              </Td>
              <Td
                colSpan={2}
                style={{ textAlign: "center", fontWeight: "bold" }}
              >
                1223
              </Td>
            </tr>
          </tbody>
        </table>

        {/* ── PART III – EWT ── */}
        <SectionHeader>
          Part III &ndash; Details of Monthly Income Payments and Taxes Withheld
        </SectionHeader>
        <table style={styles.table}>
          <thead>
            <tr>
              <Th colSpan={4} rowSpan={2}>
                Income Payments Subject to Expanded Withholding Tax
              </Th>
              <Th rowSpan={2}>ATC</Th>
              <Th colSpan={4}>AMOUNT OF INCOME PAYMENTS</Th>
              <Th rowSpan={2}>Tax Withheld for the Quarter</Th>
            </tr>
            <tr>
              <Th>1st Month of the Quarter</Th>
              <Th>2nd Month of the Quarter</Th>
              <Th>3rd Month of the Quarter</Th>
              <Th>Total</Th>
            </tr>
          </thead>
          <tbody>
            {/* Data row */}
            <tr style={{ height: 48 }}>
              <Td colSpan={4} style={{ fontSize: 9, verticalAlign: "middle" }}>
                {atc.description}
              </Td>
              <Td style={{ verticalAlign: "middle", padding: 2 }}>
                <select
                  style={styles.select}
                  value={atc.value}
                  onChange={handleAtcChange}
                >
                  {ATC_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Td>
              <Td>
                <input
                  style={styles.amountInput}
                  type="number"
                  value={m1}
                  onChange={(e) => setM1(e.target.value)}
                  placeholder="0.00"
                />
              </Td>
              <Td>
                <input
                  style={styles.amountInput}
                  type="number"
                  value={m2}
                  onChange={(e) => setM2(e.target.value)}
                  placeholder="0.00"
                />
              </Td>
              <Td>
                <input
                  style={styles.amountInput}
                  type="number"
                  value={m3}
                  onChange={(e) => setM3(e.target.value)}
                  placeholder="0.00"
                />
              </Td>
              <Td style={{ textAlign: "right", fontWeight: "bold" }}>
                {fmt(total)}
              </Td>
              <Td style={{ textAlign: "right", fontWeight: "bold" }}>
                {fmt(tax)}
              </Td>
            </tr>
            {/* Empty rows (rows 48–58) */}
            {Array.from({ length: 11 }).map((_, i) => (
              <tr key={i} style={{ height: 18 }}>
                <Td colSpan={4} />
                <Td />
                <Td />
                <Td />
                <Td />
                <Td />
                <Td />
              </tr>
            ))}
            {/* Total row */}
            <tr style={{ background: "#f9f9f9" }}>
              <Td colSpan={4} style={{ fontWeight: "bold" }}>
                Total
              </Td>
              <Td />
              <Td style={{ textAlign: "right" }}>{fmt(parseFloat(m1) || 0)}</Td>
              <Td style={{ textAlign: "right" }}>{fmt(parseFloat(m2) || 0)}</Td>
              <Td style={{ textAlign: "right" }}>{fmt(parseFloat(m3) || 0)}</Td>
              <Td style={{ textAlign: "right", fontWeight: "bold" }}>
                {fmt(total)}
              </Td>
              <Td style={{ textAlign: "right", fontWeight: "bold" }}>
                {fmt(tax)}
              </Td>
            </tr>
          </tbody>
        </table>

        {/* ── MONEY PAYMENTS (Business Tax) ── */}
        <table style={styles.table}>
          <thead>
            <tr>
              <Th colSpan={4} rowSpan={2}>
                Money Payments Subject to Withholding of Business Tax
                (Government &amp; Private)
              </Th>
              <Th rowSpan={2}>ATC</Th>
              <Th colSpan={4}>AMOUNT OF MONEY PAYMENTS</Th>
              <Th rowSpan={2}>Tax Withheld for the Quarter</Th>
            </tr>
            <tr>
              <Th>1st Month of the Quarter</Th>
              <Th>2nd Month of the Quarter</Th>
              <Th>3rd Month of the Quarter</Th>
              <Th>Total</Th>
            </tr>
          </thead>
          <tbody>
            {/* Empty rows (rows 62–64) */}
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} style={{ height: 18 }}>
                <Td colSpan={4} />
                <Td />
                <Td />
                <Td />
                <Td />
                <Td />
                <Td />
              </tr>
            ))}
            {/* Total row */}
            <tr style={{ background: "#f9f9f9" }}>
              <Td colSpan={4} style={{ fontWeight: "bold" }}>
                Total
              </Td>
              <Td />
              <Td />
              <Td />
              <Td />
              <Td />
              <Td />
            </tr>
          </tbody>
        </table>

        {/* ── DECLARATION ── */}
        <table style={styles.table}>
          <tbody>
            <tr>
              <Td
                colSpan={10}
                style={{ fontSize: 8, padding: "6px 4px", lineHeight: 1.5 }}
              >
                &nbsp;&nbsp;&nbsp;We declare under the penalties of perjury that
                this certificate has been made in good faith, verified by us,
                and to the best of our knowledge and belief, is true and
                correct, pursuant to the provisions of the National Internal
                Revenue Code, as amended, and the regulations issued under
                authority thereof. Further, we give our consent to the
                processing of our information as contemplated under the *Data
                Privacy Act of 2012 (R.A. No. 10173) for legitimate and lawful
                purposes.
              </Td>
            </tr>
          </tbody>
        </table>

        {/* ── PAYOR SIGNATURE BLOCK ── */}
        <table style={styles.table}>
          <tbody>
            <tr>
              <Td
                colSpan={10}
                style={{
                  fontSize: 9,
                  height: 60,
                  verticalAlign: "bottom",
                  padding: "2px 4px",
                }}
              >
                ELSA G. OCRETO
                <br />
                <span style={{ fontSize: 8 }}>
                  ASSISTANT GENERAL MANAGER, FINANCE &amp; ACCOUNTING / TIN
                  119-839-069
                </span>
              </Td>
            </tr>
            <tr>
              <Td
                colSpan={10}
                style={{
                  fontSize: 8,
                  borderTop: "1px solid #000",
                  padding: "2px 4px",
                }}
              >
                Signature over Printed Name of Payor/Payor&rsquo;s Authorized
                Representative/Tax Agent
              </Td>
            </tr>
            <tr>
              <Td colSpan={10} style={{ fontSize: 8, padding: "1px 4px" }}>
                (Indicate Title/Designation and TIN)
              </Td>
            </tr>
            <tr>
              <Td colSpan={4} style={{ fontSize: 8 }}>
                Tax Agent Accreditation No./
              </Td>
              <Td colSpan={3} style={{ fontSize: 8, textAlign: "center" }}>
                Date of Issue
                <br />
                (MM/DD/YYYY)
              </Td>
              <Td colSpan={3} style={{ fontSize: 8, textAlign: "center" }}>
                Date of Expiry
                <br />
                (MM/DD/YYYY)
              </Td>
            </tr>
            <tr>
              <Td colSpan={10} style={{ fontSize: 8 }}>
                Attorney&rsquo;s Roll No. (if applicable)
              </Td>
            </tr>
          </tbody>
        </table>

        {/* ── CONFORME / PAYEE SIGNATURE BLOCK ── */}
        <table style={styles.table}>
          <tbody>
            <tr>
              <Td
                colSpan={10}
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  padding: "4px 4px 2px",
                }}
              >
                CONFORME:
              </Td>
            </tr>
            <tr>
              <Td colSpan={10} style={{ height: 60 }} />
            </tr>
            <tr>
              <Td
                colSpan={10}
                style={{
                  fontSize: 8,
                  borderTop: "1px solid #000",
                  padding: "2px 4px",
                }}
              >
                Signature over Printed Name of Payee/Payee&rsquo;s Authorized
                Representative/Tax Agent
              </Td>
            </tr>
            <tr>
              <Td colSpan={10} style={{ fontSize: 8, padding: "1px 4px" }}>
                (Indicate Title/Designation and TIN)
              </Td>
            </tr>
            <tr>
              <Td colSpan={4} style={{ fontSize: 8 }}>
                Tax Agent Accreditation No./
              </Td>
              <Td colSpan={3} style={{ fontSize: 8, textAlign: "center" }}>
                Date of Issue
                <br />
                (MM/DD/YYYY)
              </Td>
              <Td colSpan={3} style={{ fontSize: 8, textAlign: "center" }}>
                Date of Expiry
                <br />
                (MM/DD/YYYY)
              </Td>
            </tr>
            <tr>
              <Td colSpan={10} style={{ fontSize: 8 }}>
                Attorney&rsquo;s Roll No. (if applicable)
              </Td>
            </tr>
          </tbody>
        </table>

        {/* ── NOTE ── */}
        <div style={styles.noteBox}>
          *NOTE: The BIR Data Privacy is in the BIR website (www.bir.gov.ph)
        </div>

        {/* ── DOWNLOAD BUTTON ── */}
        {error && <div style={styles.error}>{error}</div>}
        <button
          style={{ ...styles.downloadBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? "Generating..." : "⬇ Download BIR 2307 (.xlsx)"}
        </button>
      </div>
    </div>
  );
}

// ── Helper Components ────────────────────────────────────────────────────────

function Td({ children, colSpan, rowSpan, style }) {
  return (
    <td
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={{
        border: "1px solid #888",
        padding: "2px 4px",
        verticalAlign: "top",
        fontSize: 10,
        ...style,
      }}
    >
      {children}
    </td>
  );
}

function Th({ children, colSpan, rowSpan }) {
  return (
    <th
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={{
        border: "1px solid #888",
        padding: "2px 4px",
        textAlign: "center",
        fontSize: 9,
        fontWeight: "bold",
        background: "#f0f0f0",
      }}
    >
      {children}
    </th>
  );
}

function SectionHeader({ children }) {
  return (
    <div
      style={{
        background: "#d3d3d3",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 10,
        border: "1px solid #888",
        borderTop: "none",
        padding: "3px 4px",
      }}
    >
      {children}
    </div>
  );
}

function LabelRow({ num, label }) {
  return (
    <tr>
      <Td>
        <span style={{ fontSize: 9, fontWeight: "bold" }}>{num}</span>
      </Td>
      <Td colSpan={9}>
        <span style={{ fontSize: 9, color: "#555" }}>{label}</span>
      </Td>
    </tr>
  );
}

function InputRow({ children }) {
  return (
    <tr>
      <Td colSpan={10} style={{ borderTop: "none" }}>
        {children}
      </Td>
    </tr>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    background: "#e8e8e8",
    display: "flex",
    justifyContent: "center",
    padding: "24px 12px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "#fff",
    padding: 16,
    maxWidth: 860,
    width: "100%",
    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
    border: "1px solid #000",
  },
  formHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #888",
    paddingBottom: 4,
    marginBottom: 4,
  },
  bcsLabel: { fontSize: 9, minWidth: 60 },
  govTitle: { fontSize: 10, fontWeight: "bold", textAlign: "center", flex: 1 },
  formCode: { fontSize: 8, textAlign: "right", minWidth: 80 },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "6px 0",
  },
  birFormNo: { fontSize: 8 },
  formNumber: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  certTitle: { fontSize: 16, fontWeight: "bold", textAlign: "center", flex: 1 },
  fillNote: {
    fontSize: 8,
    marginBottom: 4,
    borderBottom: "1px solid #ccc",
    paddingBottom: 4,
  },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: 0 },
  sectionNum: { fontSize: 9, fontWeight: "bold" },
  labelText: { fontSize: 9, color: "#555" },
  input: {
    width: "100%",
    border: "none",
    background: "transparent",
    fontSize: 10,
    outline: "none",
    fontFamily: "Arial",
  },
  amountInput: {
    width: "100%",
    border: "none",
    background: "transparent",
    textAlign: "right",
    fontSize: 10,
    outline: "none",
    fontFamily: "Arial",
  },
  select: {
    width: "100%",
    border: "1px solid #999",
    background: "#fff",
    fontSize: 9,
    padding: 1,
  },
  noteBox: {
    fontSize: 8,
    borderTop: "1px solid #888",
    padding: "4px 4px",
    marginTop: 0,
  },
  downloadBtn: {
    marginTop: 12,
    padding: "8px 20px",
    background: "#1F4E79",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 13,
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  error: { marginTop: 8, color: "red", fontSize: 12 },
};
