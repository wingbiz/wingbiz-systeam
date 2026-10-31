const express = require('express');
const pdf = require('html-pdf-node');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let documentCounters = {
    QUOTATION: 1001,
    INVOICE: 1001,
    RECEIPT: 1001
};

app.post('/api/generate-pdf', async (req, res) => {
    const { type, clientName, items, total, companyName } = req.body;
    
    const prefix = type === 'QUOTATION' ? 'QT' : type === 'INVOICE' ? 'INV' : 'REC';
    const docNumber = `${prefix}-${documentCounters[type]}`;
    documentCounters[type]++;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 20px;">
                <div>
                    <h2 style="margin: 0; color: #1e1b4b;">${companyName || 'Wing Empire'}</h2>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">Simu: +255 700 000 000 | Email: info@wingempire.co.tz</p>
                </div>
                <div style="text-align: right;">
                    <span style="background: #e0e7ff; color: #3730a3; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 12px;">${type}</span>
                    <p style="margin: 5px 0; font-weight: bold; color: #4f46e5;">Namba: ${docNumber}</p>
                    <p style="margin: 0; font-size: 12px; color: #888;">Tarehe: ${new Date().toISOString().split('T')[0]}</p>
                </div>
            </div>
            <p style="font-size: 14px;"><strong>Imetolewa Kwa:</strong> ${clientName || 'Mteja wa Kawaida'}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
                <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
                        <th style="padding: 10px; text-align: left;">Bidhaa / Huduma</th>
                        <th style="padding: 10px; text-align: center;">Idadi</th>
                        <th style="padding: 10px; text-align: right;">Bei (TSh)</th>
                        <th style="padding: 10px; text-align: right;">Jumla (TSh)</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(i => `
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px;">${i.name}</td>
                            <td style="padding: 10px; text-align: center;">${i.qty}</td>
                            <td style="padding: 10px; text-align: right;">${i.price.toLocaleString()}</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold;">${(i.price * i.qty).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 30px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 18px;">Jumla Kuu: TSh ${total.toLocaleString()}</h3>
            </div>
            <div style="margin-top: 50px; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 11px; color: #555;">
                <p style="margin: 0 0 5px 0; font-weight: bold;">Taarifa za Malipo / Benki:</p>
                <p style="margin: 0;">CRDB: 01502XXXXXX00 | NMB: 01J20XXXXXX00 | M-Pesa Lipa Namba: 554433</p>
            </div>
        </div>
    `;

    let file = { content: htmlContent };
    let options = { format: 'A4' };

    pdf.generatePdf(file, options).then(pdfBuffer => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${docNumber}.pdf`);
        res.send(pdfBuffer);
    }).catch(err => {
        res.status(500).send("Hitilafu katika kutengeneza PDF: " + err.message);
    });
});

app.post('/api/invite-company', (req, res) => {
    const { companyName, email } = req.body;
    res.json({ success: true, message: `Mwaliko umetumwa mafanikio kwenda ${email} kwa ajili ya ${companyName}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`WingBiz Server inafanya kazi kwenye bandari ${PORT}`));
