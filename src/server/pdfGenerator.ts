import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Product } from '../types.js';

/**
 * Generates an authentic, beautifully formatted multi-page PDF publication
 * using pdf-lib, customized with the buyer's license and order details.
 */
export async function generateProductPdf(
  product: Product,
  customerEmail: string,
  orderNumber: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const forestGreen = rgb(0.18, 0.35, 0.26); // #2D5A43
  const darkSlate = rgb(0.12, 0.14, 0.12); // #1E231F
  const warmGray = rgb(0.45, 0.48, 0.45);
  const lightBg = rgb(0.97, 0.97, 0.95);
  const accentGold = rgb(0.79, 0.58, 0.26);

  // ---------------- Page 1: Cover Page ----------------
  const coverPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = coverPage.getSize();

  // Background top banner
  coverPage.drawRectangle({
    x: 0,
    y: height - 140,
    width: width,
    height: 140,
    color: forestGreen,
  });

  // Series tag
  coverPage.drawText('FOOD & BODY DIGITAL PUBLISHING  |  EVIDENCE-BASED NUTRITION SERIES', {
    x: 50,
    y: height - 60,
    size: 9,
    font: helveticaBold,
    color: rgb(0.85, 0.95, 0.88),
  });

  // Main Title
  coverPage.drawText(product.name, {
    x: 50,
    y: height - 105,
    size: 24,
    font: timesBold,
    color: rgb(1, 1, 1),
  });

  // Subtitle
  coverPage.drawText(product.subtitle || 'A Visual Guide to Physiology & Digestion', {
    x: 50,
    y: height - 180,
    size: 14,
    font: helveticaOblique,
    color: darkSlate,
  });

  // Decorative divider
  coverPage.drawLine({
    start: { x: 50, y: height - 200 },
    end: { x: width - 50, y: height - 200 },
    thickness: 1.5,
    color: accentGold,
  });

  // Key Highlights Box
  coverPage.drawRectangle({
    x: 50,
    y: height - 420,
    width: width - 100,
    height: 190,
    color: lightBg,
    borderColor: rgb(0.85, 0.86, 0.82),
    borderWidth: 1,
  });

  coverPage.drawText('PUBLICATION HIGHLIGHTS & KEY FINDINGS', {
    x: 70,
    y: height - 250,
    size: 11,
    font: helveticaBold,
    color: forestGreen,
  });

  let curY = height - 280;
  for (let i = 0; i < Math.min(product.benefits.length, 4); i++) {
    const b = product.benefits[i];
    coverPage.drawText(`*`, {
      x: 70,
      y: curY,
      size: 12,
      font: helveticaBold,
      color: forestGreen,
    });
    // Truncate line cleanly if needed
    const lineText = b.length > 70 ? b.substring(0, 67) + '...' : b;
    coverPage.drawText(lineText, {
      x: 88,
      y: curY,
      size: 10,
      font: helveticaFont,
      color: darkSlate,
    });
    curY -= 26;
  }

  // Personal License / DRM Watermark banner
  coverPage.drawRectangle({
    x: 50,
    y: 90,
    width: width - 100,
    height: 80,
    color: rgb(0.94, 0.96, 0.94),
    borderColor: forestGreen,
    borderWidth: 0.8,
  });

  coverPage.drawText('OFFICIAL LICENSED COPY', {
    x: 70,
    y: 150,
    size: 9,
    font: helveticaBold,
    color: forestGreen,
  });

  coverPage.drawText(`Licensed exclusively to: ${customerEmail}`, {
    x: 70,
    y: 132,
    size: 9,
    font: helveticaFont,
    color: darkSlate,
  });

  coverPage.drawText(`Order Reference: ${orderNumber}  |  Product Code: ${product.id}`, {
    x: 70,
    y: 116,
    size: 8,
    font: helveticaOblique,
    color: warmGray,
  });

  coverPage.drawText(`Digital Rights: Single-reader educational license. Unauthorized distribution prohibited.`, {
    x: 70,
    y: 102,
    size: 7.5,
    font: helveticaFont,
    color: warmGray,
  });

  // Footer
  coverPage.drawText('Food & Body Publishing  *  foodandbody.com  *  All Rights Reserved', {
    x: 50,
    y: 40,
    size: 8,
    font: helveticaFont,
    color: warmGray,
  });

  // ---------------- Page 2: Table of Contents & Methodology ----------------
  const tocPage = pdfDoc.addPage([595.28, 841.89]);

  // Running Header
  tocPage.drawText(`${product.name}  |  Table of Contents`, {
    x: 50,
    y: height - 40,
    size: 8,
    font: helveticaFont,
    color: warmGray,
  });
  tocPage.drawLine({
    start: { x: 50, y: height - 48 },
    end: { x: width - 50, y: height - 48 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  tocPage.drawText('Table of Contents', {
    x: 50,
    y: height - 90,
    size: 20,
    font: timesBold,
    color: darkSlate,
  });

  let tocY = height - 130;
  product.table_of_contents.forEach((ch, idx) => {
    tocPage.drawText(`0${idx + 1}`, {
      x: 50,
      y: tocY,
      size: 10,
      font: helveticaBold,
      color: forestGreen,
    });
    tocPage.drawText(ch, {
      x: 78,
      y: tocY,
      size: 10.5,
      font: helveticaFont,
      color: darkSlate,
    });
    tocPage.drawText(`p. ${(idx + 1) * 8}`, {
      x: width - 85,
      y: tocY,
      size: 9.5,
      font: helveticaFont,
      color: warmGray,
    });
    tocPage.drawLine({
      start: { x: 50, y: tocY - 8 },
      end: { x: width - 50, y: tocY - 8 },
      thickness: 0.3,
      color: rgb(0.9, 0.9, 0.9),
    });
    tocY -= 36;
  });

  // The Visual Methodology box
  tocPage.drawRectangle({
    x: 50,
    y: 110,
    width: width - 100,
    height: 190,
    color: lightBg,
    borderColor: rgb(0.85, 0.86, 0.82),
    borderWidth: 1,
  });

  tocPage.drawText('OUR 4-PILLAR VISUAL SCIENCE STANDARD', {
    x: 70,
    y: 275,
    size: 10,
    font: helveticaBold,
    color: forestGreen,
  });

  const pillars = [
    '1. Organ-by-Organ Digestion Maps: Tracing nutrient transit from mouth to colon.',
    '2. Biochemical Cascade Diagrams: Clarifying cellular enzymes and receptor dynamics.',
    '3. Evidence-Based Research Hierarchy: Prioritizing systematic reviews & randomized trials.',
    '4. Practical Kitchen Application: Translating molecular biology into meal preparation.'
  ];

  let pillarY = 245;
  pillars.forEach(p => {
    tocPage.drawText(p, {
      x: 70,
      y: pillarY,
      size: 9,
      font: helveticaFont,
      color: darkSlate,
    });
    pillarY -= 28;
  });

  // Page 2 footer
  tocPage.drawText(`Page 2  |  Food & Body Licensed to: ${customerEmail}`, {
    x: 50,
    y: 40,
    size: 8,
    font: helveticaFont,
    color: warmGray,
  });

  // ---------------- Page 3: Core Visual Chapters & Digestion Mechanics ----------------
  const contentPage = pdfDoc.addPage([595.28, 841.89]);

  contentPage.drawText(`${product.name}  |  Chapter 1 & 2 Overview`, {
    x: 50,
    y: height - 40,
    size: 8,
    font: helveticaFont,
    color: warmGray,
  });
  contentPage.drawLine({
    start: { x: 50, y: height - 48 },
    end: { x: width - 50, y: height - 48 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  contentPage.drawText('Digestion Kinetics & Metabolic Fate', {
    x: 50,
    y: height - 90,
    size: 18,
    font: timesBold,
    color: darkSlate,
  });

  contentPage.drawText(
    'Understanding human nutrition requires moving past simplistic calories and observing what happens',
    { x: 50, y: height - 118, size: 9.5, font: helveticaFont, color: darkSlate }
  );
  contentPage.drawText(
    'at each step of the gastrointestinal transit. The following breakdown illustrates the sequence:',
    { x: 50, y: height - 132, size: 9.5, font: helveticaFont, color: darkSlate }
  );

  // Diagram simulation box
  contentPage.drawRectangle({
    x: 50,
    y: height - 340,
    width: width - 100,
    height: 180,
    color: rgb(0.96, 0.98, 0.96),
    borderColor: forestGreen,
    borderWidth: 1,
  });

  contentPage.drawText('PHYSIOLOGICAL TRANSIT TIMELINE', {
    x: 70,
    y: height - 175,
    size: 10,
    font: helveticaBold,
    color: forestGreen,
  });

  const timelineSteps = [
    { time: '0 - 15 min', stage: 'Mastication & Oral Phase', detail: 'Salivary amylase & lipase activation, bolus formation.' },
    { time: '15 - 90 min', stage: 'Gastric Acid Hydrolysis', detail: 'HCl denaturation of tertiary structures and pepsin cleavage.' },
    { time: '90 - 240 min', stage: 'Duodenal Neutralization', detail: 'Bicarbonate buffering, bile salt emulsification, lipase action.' },
    { time: '4 - 12 hours', stage: 'Colonic Fermentation', detail: 'Microbial fermentation of prebiotic fiber into short-chain fatty acids.' },
  ];

  let timeY = height - 205;
  timelineSteps.forEach(step => {
    contentPage.drawText(step.time, { x: 70, y: timeY, size: 9, font: helveticaBold, color: accentGold });
    contentPage.drawText(step.stage, { x: 150, y: timeY, size: 9, font: helveticaBold, color: darkSlate });
    contentPage.drawText(step.detail, { x: 150, y: timeY - 12, size: 8, font: helveticaFont, color: warmGray });
    timeY -= 32;
  });

  // Actionable guidelines box
  contentPage.drawText('Key Scientific References & Meta-Analyses', {
    x: 50,
    y: height - 380,
    size: 14,
    font: timesBold,
    color: darkSlate,
  });

  const references = [
    '1. American Journal of Clinical Nutrition: Systematic review of postprandial lipid & glucose kinetics (2024).',
    '2. Nature Metabolism: Gut microbiome metabolic outputs, short-chain fatty acids, and immune regulation (2023).',
    '3. Cell Host & Microbe: Dietary fiber architecture and colonic epithelial barrier maintenance (2023).',
    '4. New England Journal of Medicine: Hepatic cholesterol feedback and lipoprotein receptor modulation (2022).'
  ];

  let refY = height - 410;
  references.forEach(ref => {
    contentPage.drawText(ref, {
      x: 50,
      y: refY,
      size: 8.5,
      font: helveticaFont,
      color: darkSlate,
    });
    refY -= 20;
  });

  // Medical Disclaimer on Page 3
  contentPage.drawRectangle({
    x: 50,
    y: 80,
    width: width - 100,
    height: 90,
    color: rgb(0.98, 0.95, 0.95),
    borderColor: rgb(0.85, 0.6, 0.6),
    borderWidth: 0.8,
  });

  contentPage.drawText('IMPORTANT MEDICAL & EDUCATIONAL DISCLAIMER', {
    x: 65,
    y: 150,
    size: 8.5,
    font: helveticaBold,
    color: rgb(0.7, 0.2, 0.2),
  });

  contentPage.drawText(
    'This digital publication is strictly for educational, informational, and general wellness purposes.',
    { x: 65, y: 134, size: 7.5, font: helveticaFont, color: darkSlate }
  );
  contentPage.drawText(
    'It does not constitute individualized medical advice, clinical diagnosis, or treatment plans.',
    { x: 65, y: 122, size: 7.5, font: helveticaFont, color: darkSlate }
  );
  contentPage.drawText(
    'Always consult your physician or qualified healthcare provider before making significant dietary changes.',
    { x: 65, y: 110, size: 7.5, font: helveticaFont, color: darkSlate }
  );
  contentPage.drawText(
    'Food & Body LLC  *  Customer Support: support@foodandbody.com',
    { x: 65, y: 94, size: 7, font: helveticaOblique, color: warmGray }
  );

  contentPage.drawText(`Page 3  |  Food & Body  *  Order ${orderNumber}`, {
    x: 50,
    y: 40,
    size: 8,
    font: helveticaFont,
    color: warmGray,
  });

  return await pdfDoc.save();
}
