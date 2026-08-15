// pdf-generator.js - Comprehensive Financial & Habit Report Generator for WealthPulse
// Generates an executive-grade, multi-section vector PDF document with full user information.

async function generateFullFinancialReport(options = {}) {
  const btn = options.buttonElement || null;
  const originalBtnText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Generating PDF...';
  }

  try {
    // 1. Ensure jsPDF and AutoTable libraries are loaded
    await loadPdfDependencies();

    // 2. Fetch all user data in parallel
    const [userRes, summary, income, expenses, habits, goals, investments] = await Promise.all([
      api('/api/auth/me').catch(() => ({ user: Auth.user || {} })),
      api('/api/analytics/summary').catch(() => ({})),
      api('/api/income').catch(() => []),
      api('/api/expenses').catch(() => []),
      api('/api/habits').catch(() => []),
      api('/api/goals').catch(() => []),
      api('/api/investments').catch(() => []),
    ]);

    const user = (userRes && userRes.user) || Auth.user || {};
    const currency = user.currency || 'INR';

    // Helper for currency formatting in PDF
    const formatCur = (num) => {
      const val = Number(num || 0);
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);

      switch (currency) {
        case 'INR': return `INR ${formatted}`;
        case 'USD': return `$${formatted}`;
        case 'EUR': return `EUR ${formatted}`;
        case 'GBP': return `GBP ${formatted}`;
        case 'AED': return `AED ${formatted}`;
        case 'SGD': return `SGD ${formatted}`;
        case 'CAD': return `CAD ${formatted}`;
        case 'AUD': return `AUD ${formatted}`;
        default: return `${currency} ${formatted}`;
      }
    };

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;
    const contentWidth = pageWidth - margin * 2;

    // Color Palette
    const primaryColor = [16, 185, 129]; // Emerald
    const primaryDark = [5, 150, 105];
    const textDark = [15, 23, 42]; // Slate-900
    const textMuted = [100, 116, 139]; // Slate-500
    const borderLight = [226, 232, 240]; // Slate-200
    const cardBg = [248, 250, 252]; // Slate-50

    let currentY = margin;

    // ----------------------------------------------------
    // HEADER BANNER
    // ----------------------------------------------------
    // Top emerald brand accent bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 8, 'F');

    currentY += 12;

    // Brand title & subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...primaryDark);
    doc.text('WEALTHPULSE', margin, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text('HABIT & WEALTH INTELLIGENCE PLATFORM', margin + 155, currentY - 1);

    // Right-aligned report metadata
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const reportRef = `FIN-RPT-${Date.now().toString(36).toUpperCase()}`;

    doc.setFontSize(8.5);
    doc.setTextColor(...textMuted);
    doc.text(`Report Date: ${reportDate}`, pageWidth - margin, currentY - 6, { align: 'right' });
    doc.text(`Ref: ${reportRef}`, pageWidth - margin, currentY + 6, { align: 'right' });

    currentY += 16;
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.75);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 18;

    // Document Main Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...textDark);
    doc.text('Complete Financial & Habit Intelligence Audit', margin, currentY);

    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...textMuted);
    doc.text('Consolidated audit of user profile, cash flows, asset valuations, milestones, and habit streaks.', margin, currentY + 8);

    currentY += 22;

    // ----------------------------------------------------
    // SECTION: USER PROFILE & TARGETS CARD
    // ----------------------------------------------------
    doc.setFillColor(...cardBg);
    doc.setDrawColor(...borderLight);
    doc.roundedRect(margin, currentY, contentWidth, 76, 4, 4, 'FD');

    const col1X = margin + 14;
    const col2X = margin + contentWidth * 0.36;
    const col3X = margin + contentWidth * 0.70;

    let pY = currentY + 16;

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('ACCOUNT HOLDER', col1X, pY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...textDark);
    doc.text(user.name || 'Member', col1X, pY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textMuted);
    doc.text(user.email || 'No email', col1X, pY + 24);
    if (user.phone) {
      doc.text(`Tel: ${user.phone}`, col1X, pY + 36);
    }

    // Col 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('FINANCIAL TARGETS', col2X, pY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.text(`Monthly Income Target: ${formatCur(user.income_target || 0)}`, col2X, pY + 13);
    doc.text(`Monthly Savings Target: ${formatCur(user.savings_target || 0)}`, col2X, pY + 26);
    const targetSavingsRate = (user.income_target > 0 && user.savings_target > 0)
      ? `${Math.round((user.savings_target / user.income_target) * 100)}%`
      : 'N/A';
    doc.text(`Target Savings Rate: ${targetSavingsRate}`, col2X, pY + 39);

    // Col 3
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('PREFERENCES & ROLE', col3X, pY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.text(`Primary Currency: ${currency}`, col3X, pY + 13);
    doc.text(`Account Role: ${(user.role || 'user').toUpperCase()}`, col3X, pY + 26);
    const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active';
    doc.text(`Member Since: ${memberSince}`, col3X, pY + 39);

    currentY += 92;

    // ----------------------------------------------------
    // SECTION: EXECUTIVE FINANCIAL SNAPSHOT TILES
    // ----------------------------------------------------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...textDark);
    doc.text('Executive Financial Snapshot', margin, currentY);
    currentY += 12;

    const totalIncome = summary.total_income || income.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalExpenses = summary.total_expense || expenses.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const netCashSavings = summary.net_cash_savings || (totalIncome - totalExpenses);
    const totalInvestmentsVal = summary.investments_current_value || investments.reduce((s, r) => s + (Number(r.current_value) || 0), 0);
    const netWorth = summary.net_worth || (netCashSavings + totalInvestmentsVal);

    const kpiCards = [
      { label: 'TOTAL NET WORTH', value: formatCur(netWorth), note: 'Savings + Investments' },
      { label: 'TOTAL INFLOWS', value: formatCur(totalIncome), note: `${income.length} Income records` },
      { label: 'TOTAL OUTFLOWS', value: formatCur(totalExpenses), note: `${expenses.length} Expense records` },
      { label: 'PORTFOLIO VALUE', value: formatCur(totalInvestmentsVal), note: `${investments.length} Assets tracked` },
    ];

    const kpiWidth = (contentWidth - 3 * 10) / 4;
    kpiCards.forEach((kpi, idx) => {
      const kX = margin + idx * (kpiWidth + 10);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...borderLight);
      doc.roundedRect(kX, currentY, kpiWidth, 48, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      doc.text(kpi.label, kX + 8, currentY + 13);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...textDark);
      doc.text(kpi.value, kX + 8, currentY + 28);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textMuted);
      doc.text(kpi.note, kX + 8, currentY + 41);
    });

    currentY += 62;

    // ----------------------------------------------------
    // SECTION: CASH INFLOWS (INCOME TABLE)
    // ----------------------------------------------------
    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Date', 'Income Source / Category', 'Notes / Description', 'Amount']],
      body: income.length
        ? income.map(i => [
            i.date || '-',
            i.source || 'General Income',
            i.note || '-',
            formatCur(i.amount),
          ])
        : [['-', 'No income records logged yet', '-', formatCur(0)]],
      foot: [['', 'Total Recorded Inflow', '', formatCur(totalIncome)]],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      footStyles: {
        fillColor: cardBg,
        textColor: textDark,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textDark,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 140 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 90, halign: 'right', fontStyle: 'bold' },
      },
    });

    currentY = doc.lastAutoTable.finalY + 24;

    // ----------------------------------------------------
    // SECTION: CASH OUTFLOWS (EXPENSE TABLE & CATEGORY SUMMARY)
    // ----------------------------------------------------
    const categoryMap = {};
    expenses.forEach(e => {
      const cat = e.category || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + (Number(e.amount) || 0);
    });
    const categoryRows = Object.keys(categoryMap).map(cat => {
      const total = categoryMap[cat];
      const pct = totalExpenses > 0 ? `${((total / totalExpenses) * 100).toFixed(1)}%` : '0%';
      return [cat, pct, formatCur(total)];
    });

    if (currentY > pageHeight - 160) {
      doc.addPage();
      currentY = margin + 14;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.text('Expense Distribution by Category', margin, currentY);
    currentY += 10;

    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Category', 'Share of Total Outflow', 'Total Amount']],
      body: categoryRows.length ? categoryRows : [['No expenses recorded', '0%', formatCur(0)]],
      theme: 'striped',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8, textColor: textDark },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 140, halign: 'center' },
        2: { cellWidth: 110, halign: 'right', fontStyle: 'bold' },
      },
    });

    currentY = doc.lastAutoTable.finalY + 16;

    // Detailed Expense Entries
    if (currentY > pageHeight - 140) {
      doc.addPage();
      currentY = margin + 14;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.text('Detailed Expense Entries', margin, currentY);
    currentY += 10;

    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Date', 'Category', 'Note / Memo', 'Amount']],
      body: expenses.length
        ? expenses.map(e => [
            e.date || '-',
            e.category || 'General',
            e.note || '-',
            formatCur(e.amount),
          ])
        : [['-', 'No expenses logged', '-', formatCur(0)]],
      foot: [['', 'Total Recorded Outflow', '', formatCur(totalExpenses)]],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      footStyles: {
        fillColor: cardBg,
        textColor: textDark,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8, textColor: textDark },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 120 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 90, halign: 'right', fontStyle: 'bold' },
      },
    });

    currentY = doc.lastAutoTable.finalY + 24;

    // ----------------------------------------------------
    // SECTION: SAVINGS GOALS & MILESTONES
    // ----------------------------------------------------
    if (currentY > pageHeight - 160) {
      doc.addPage();
      currentY = margin + 14;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.text('Savings Goals & Milestones Progress', margin, currentY);
    currentY += 10;

    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Goal Milestone', 'Target Amount', 'Current Saved', 'Progress', 'Deadline', 'Status']],
      body: goals.length
        ? goals.map(g => {
            const target = Number(g.target_amount) || 1;
            const saved = Number(g.saved_amount) || 0;
            const pct = Math.min(Math.round((saved / target) * 100), 100);
            const status = pct >= 100 ? 'COMPLETED' : 'IN PROGRESS';
            return [
              g.title || 'Goal',
              formatCur(g.target_amount),
              formatCur(g.saved_amount),
              `${pct}%`,
              g.deadline || 'No date',
              status,
            ];
          })
        : [['No savings goals created', formatCur(0), formatCur(0), '0%', '-', 'PENDING']],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8, textColor: textDark },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 80, halign: 'right' },
        2: { cellWidth: 80, halign: 'right' },
        3: { cellWidth: 55, halign: 'center' },
        4: { cellWidth: 65, halign: 'center' },
        5: { cellWidth: 75, halign: 'center', fontStyle: 'bold' },
      },
    });

    currentY = doc.lastAutoTable.finalY + 24;

    // ----------------------------------------------------
    // SECTION: INVESTMENTS & ASSET PORTFOLIO
    // ----------------------------------------------------
    if (currentY > pageHeight - 160) {
      doc.addPage();
      currentY = margin + 14;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.text('Investments & Asset Portfolio', margin, currentY);
    currentY += 10;

    const totalInvestedAmt = investments.reduce((s, r) => s + (Number(r.amount_invested) || 0), 0);
    const totalGainLoss = totalInvestmentsVal - totalInvestedAmt;
    const totalRoiPct = totalInvestedAmt > 0 ? ((totalGainLoss / totalInvestedAmt) * 100).toFixed(1) : '0.0';

    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Asset Name', 'Asset Class', 'Invested Capital', 'Current Value', 'Gain / Loss', 'ROI %']],
      body: investments.length
        ? investments.map(inv => {
            const invested = Number(inv.amount_invested) || 0;
            const currentVal = Number(inv.current_value) || 0;
            const gain = currentVal - invested;
            const roi = invested > 0 ? ((gain / invested) * 100).toFixed(1) : '0.0';
            const gainStr = `${gain >= 0 ? '+' : ''}${formatCur(gain)}`;
            return [
              inv.asset_name || 'Asset',
              inv.asset_type || 'General',
              formatCur(invested),
              formatCur(currentVal),
              gainStr,
              `${roi}%`,
            ];
          })
        : [['No investment assets logged', '-', formatCur(0), formatCur(0), formatCur(0), '0.0%']],
      foot: [
        [
          'Portfolio Total',
          '',
          formatCur(totalInvestedAmt),
          formatCur(totalInvestmentsVal),
          `${totalGainLoss >= 0 ? '+' : ''}${formatCur(totalGainLoss)}`,
          `${totalRoiPct}%`,
        ],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      footStyles: {
        fillColor: cardBg,
        textColor: textDark,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8, textColor: textDark },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 80 },
        2: { cellWidth: 85, halign: 'right' },
        3: { cellWidth: 85, halign: 'right' },
        4: { cellWidth: 85, halign: 'right' },
        5: { cellWidth: 55, halign: 'center', fontStyle: 'bold' },
      },
    });

    currentY = doc.lastAutoTable.finalY + 24;

    // ----------------------------------------------------
    // SECTION: HABIT BUILDER & DISCIPLINE STREAKS
    // ----------------------------------------------------
    if (currentY > pageHeight - 160) {
      doc.addPage();
      currentY = margin + 14;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.text('Daily Financial Habits & Accountability Streaks', margin, currentY);
    currentY += 10;

    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Habit Name', 'Frequency', 'Financial Target', 'Discipline Streak', 'Today Status']],
      body: habits.length
        ? habits.map(h => [
            h.name || 'Habit',
            (h.frequency || 'daily').toUpperCase(),
            h.target_amount ? formatCur(h.target_amount) : 'Discipline Only',
            `${h.streak || 0} Days Continuous`,
            h.completed_today ? 'DONE (COMPLETED)' : 'PENDING',
          ])
        : [['No habits created', 'DAILY', '-', '0 Days', 'PENDING']],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8, textColor: textDark },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 85, halign: 'center' },
        2: { cellWidth: 95, halign: 'right' },
        3: { cellWidth: 110, halign: 'center' },
        4: { cellWidth: 100, halign: 'center', fontStyle: 'bold' },
      },
    });

    // ----------------------------------------------------
    // FOOTER ON ALL PAGES
    // ----------------------------------------------------
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Bottom line
      doc.setDrawColor(...borderLight);
      doc.setLineWidth(0.75);
      doc.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);

      // Footer texts
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textMuted);
      doc.text('WealthPulse · Habit & Wealth Intelligence Audit Report · Confidential', margin, pageHeight - 14);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 14, { align: 'right' });
    }

    // ----------------------------------------------------
    // SAVE PDF
    // ----------------------------------------------------
    const safeUser = (user.name || 'User').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `WealthPulse_Financial_Report_${safeUser}_${dateStr}.pdf`;

    doc.save(fileName);

    showToastNotification('✅ Complete PDF Report downloaded successfully!');
  } catch (err) {
    console.error('PDF Generation Error:', err);
    alert('Failed to generate PDF Report: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnText;
    }
  }
}

// Dynamically load jsPDF and jsPDF-AutoTable if not already present
function loadPdfDependencies() {
  return new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable) {
      return resolve();
    }

    // Load jsPDF first
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = () => {
      // Then load autoTable plugin
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
      script2.onload = () => resolve();
      script2.onerror = () => reject(new Error('Failed to load jspdf-autotable library'));
      document.head.appendChild(script2);
    };
    script1.onerror = () => reject(new Error('Failed to load jsPDF library'));
    document.head.appendChild(script1);
  });
}

// Quick JSON Data Exporter
async function exportUserDataJson(btn) {
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Exporting JSON...';
  }

  try {
    const data = await api('/api/auth/export-all');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = (Auth.user && Auth.user.name ? Auth.user.name : 'user').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `WealthPulse_Data_Export_${safeName}_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToastNotification('✅ Complete JSON dataset exported!');
  } catch (err) {
    alert('Failed to export data: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}

// Toast notification helper
function showToastNotification(msg) {
  let toast = document.getElementById('wealthpulse-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'wealthpulse-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = 'var(--bg-1, #1e293b)';
    toast.style.color = 'var(--text, #fff)';
    toast.style.border = '1px solid var(--border-strong, rgba(255,255,255,0.2))';
    toast.style.boxShadow = 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.5))';
    toast.style.borderRadius = '8px';
    toast.style.padding = '12px 20px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '99999';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3500);
}
