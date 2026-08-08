import jsPDF from 'jspdf';
import { ItineraryData, CurrencyConfig } from '../types';

export function generateItineraryPDF(itinerary: ItineraryData, currency?: CurrencyConfig) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currencySymbol = currency?.symbol || '$';
  const rate = currency?.rateToUSD || 1;
  const fmtMoney = (usd: number) => `${currencySymbol}${Math.round(usd * rate).toLocaleString()}`;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageHeader = () => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 140);
    doc.text(`${itinerary.destination} Itinerary • AI Travel Planner`, margin, 8);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 10, pageWidth - margin, 10);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 4;
      addPageHeader();
    }
  };

  // --- Title Banner ---
  doc.setFillColor(16, 185, 129); // Emerald
  doc.rect(margin, y, contentWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(itinerary.destination.toUpperCase(), margin + 6, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(itinerary.destinationTagline || `${itinerary.numberOfDays}-Day Curated Trip Plan`, margin + 6, y + 19);

  y += 32;

  // --- Metadata Bar ---
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  const metaText = `Duration: ${itinerary.numberOfDays} Days   |   Travelers: ${itinerary.travelers}   |   Budget: ${itinerary.budgetTier}   |   Dates: ${itinerary.startDate || 'N/A'}`;
  doc.text(metaText, margin + 4, y + 8);

  y += 18;

  // --- Overview ---
  if (itinerary.overview) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('TRIP OVERVIEW', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    const splitOverview = doc.splitTextToSize(itinerary.overview, contentWidth);
    checkPageBreak(splitOverview.length * 4.5);
    doc.text(splitOverview, margin, y);
    y += splitOverview.length * 4.5 + 8;
  }

  // --- Daily Itinerary ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  checkPageBreak(12);
  doc.text('DAILY SCHEDULE', margin, y);
  y += 7;

  if (itinerary.days && itinerary.days.length > 0) {
    itinerary.days.forEach((day) => {
      checkPageBreak(20);

      // Day Heading Box
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 95, 70);
      doc.text(`Day ${day.dayNumber}: ${day.title}`, margin + 4, y + 6);

      y += 13;

      if (day.summary) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        const splitSummary = doc.splitTextToSize(day.summary, contentWidth - 8);
        checkPageBreak(splitSummary.length * 4);
        doc.text(splitSummary, margin + 4, y);
        y += splitSummary.length * 4 + 4;
      }

      // Activities
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((act) => {
          checkPageBreak(22);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(16, 185, 129);
          const slotLabel = (act.timeSlot || 'Activity').toUpperCase();
          doc.text(`[${slotLabel}] ${act.title}`, margin + 4, y);

          if (act.duration || act.estimatedCostUSD) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120, 120, 120);
            const meta = `${act.duration ? act.duration : ''} ${act.estimatedCostUSD ? ' • ' + fmtMoney(act.estimatedCostUSD) : ''}`;
            doc.text(meta, pageWidth - margin - doc.getTextWidth(meta), y);
          }

          y += 4;

          if (act.locationName) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 110, 120);
            doc.text(`📍 Location: ${act.locationName}`, margin + 6, y);
            y += 4;
          }

          if (act.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(60, 60, 60);
            const splitDesc = doc.splitTextToSize(act.description, contentWidth - 10);
            checkPageBreak(splitDesc.length * 3.8);
            doc.text(splitDesc, margin + 6, y);
            y += splitDesc.length * 3.8 + 2;
          }

          if (act.insiderTip) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(5, 150, 105);
            const splitTip = doc.splitTextToSize(`💡 Insider Tip: ${act.insiderTip}`, contentWidth - 10);
            checkPageBreak(splitTip.length * 3.5);
            doc.text(splitTip, margin + 6, y);
            y += splitTip.length * 3.5 + 2;
          }

          y += 3;
        });
      }

      y += 4;
    });
  }

  // --- Accommodations ---
  if (itinerary.hotels && itinerary.hotels.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('RECOMMENDED HOTELS', margin, y);
    y += 7;

    itinerary.hotels.forEach((hotel) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${hotel.name} (${hotel.priceCategory || 'Hotel'})`, margin + 4, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      const priceText = `${fmtMoney(hotel.pricePerNightUSD)}/night`;
      doc.text(priceText, pageWidth - margin - doc.getTextWidth(priceText), y);
      y += 4.5;

      if (hotel.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(70, 70, 70);
        const splitH = doc.splitTextToSize(hotel.description, contentWidth - 8);
        checkPageBreak(splitH.length * 3.8);
        doc.text(splitH, margin + 4, y);
        y += splitH.length * 3.8 + 3;
      }
    });
    y += 4;
  }

  // --- Food Suggestions ---
  if (itinerary.foodSuggestions && itinerary.foodSuggestions.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('FOOD & DINING', margin, y);
    y += 7;

    itinerary.foodSuggestions.forEach((food) => {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${food.name} (${food.cuisine}) - ${food.priceRange}`, margin + 4, y);
      y += 4.5;

      if (food.mustTryDish) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(5, 150, 105);
        doc.text(`Must Try: ${food.mustTryDish}`, margin + 4, y);
        y += 4;
      }

      if (food.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(70, 70, 70);
        const splitF = doc.splitTextToSize(food.description, contentWidth - 8);
        checkPageBreak(splitF.length * 3.8);
        doc.text(splitF, margin + 4, y);
        y += splitF.length * 3.8 + 3;
      }
    });
    y += 4;
  }

  // --- Budget Summary ---
  if (itinerary.budgetBreakdown) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('ESTIMATED BUDGET BREAKDOWN', margin, y);
    y += 7;

    const b = itinerary.budgetBreakdown;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 22, 1, 1, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);

    doc.text(`Accommodations: ${fmtMoney(b.accommodationUSD)}`, margin + 6, y + 6);
    doc.text(`Food & Dining: ${fmtMoney(b.foodAndDiningUSD)}`, margin + (contentWidth / 2), y + 6);

    doc.text(`Activities & Tours: ${fmtMoney(b.activitiesAndAttractionsUSD)}`, margin + 6, y + 12);
    doc.text(`Local Transport: ${fmtMoney(b.localTransportUSD)}`, margin + (contentWidth / 2), y + 12);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Estimated: ${fmtMoney(b.totalEstimatedUSD)}`, margin + 6, y + 18);

    y += 28;
  }

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  // Save the PDF file
  const filename = `${itinerary.destination.replace(/[^a-zA-Z0-9]/g, '_')}_Itinerary.pdf`;
  doc.save(filename);
}
