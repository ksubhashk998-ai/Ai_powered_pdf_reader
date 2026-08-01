import jsPDF from 'jspdf';
import type { GeneratedQuestionPaper, QuestionItem } from '../types';

export function exportTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportQuestionPaperPdf(paper: GeneratedQuestionPaper) {
  const doc = new jsPDF();
  let yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(paper.institutionName.toUpperCase(), 105, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.text(`${paper.subjectName} (${paper.courseCode})`, 105, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Time Allowed: ${paper.duration} | Maximum Marks: ${paper.totalMarks}`, 105, yPos, { align: 'center' });
  
  yPos += 4;
  doc.line(15, yPos, 195, yPos);
  yPos += 8;

  paper.sections.forEach(section => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(section.sectionTitle.toUpperCase(), 15, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(`[${section.instructions}]`, 15, yPos);
    yPos += 8;

    section.questions.forEach(q => {
      if (yPos > 265) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Q${q.number}.`, 15, yPos);

      doc.setFont('helvetica', 'normal');
      const textLines = doc.splitTextToSize(q.questionText, 155);
      doc.text(textLines, 25, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text(`[${q.marks} Marks]`, 180, yPos);

      yPos += textLines.length * 5 + 4;
    });

    yPos += 4;
  });

  doc.addPage();
  yPos = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("SOLUTIONS & ANSWER KEY HINTS", 105, yPos, { align: 'center' });
  yPos += 10;

  paper.sections.forEach(sec => {
    sec.questions.forEach(q => {
      if (yPos > 265) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Q${q.number} Hint:`, 15, yPos);
      doc.setFont('helvetica', 'normal');
      const hintLines = doc.splitTextToSize(q.answerHint, 160);
      doc.text(hintLines, 30, yPos);
      yPos += hintLines.length * 5 + 4;
    });
  });

  doc.save(`${paper.subjectName.replace(/\s+/g, '_')}_Question_Paper.pdf`);
}

export function exportImportantQuestionsPdf(questions: QuestionItem[], title: string) {
  const doc = new jsPDF();
  let yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("IMPORTANT EXAM QUESTIONS & MODEL ANSWERS", 105, yPos, { align: 'center' });
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated from document: ${title}`, 105, yPos, { align: 'center' });
  yPos += 6;
  doc.line(15, yPos, 195, yPos);
  yPos += 8;

  questions.forEach((q, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Q${index + 1}. [${q.importance.toUpperCase()} - ${q.marks} MARKS]`, 15, yPos);
    yPos += 6;

    doc.setFontSize(10);
    const qLines = doc.splitTextToSize(q.questionText, 175);
    doc.text(qLines, 15, yPos);
    yPos += qLines.length * 5 + 4;

    doc.setFont('helvetica', 'bold');
    doc.text("Model Answer Summary:", 15, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    const aLines = doc.splitTextToSize(q.modelAnswer, 175);
    doc.text(aLines, 15, yPos);
    yPos += aLines.length * 5 + 8;
  });

  doc.save(`${title.replace(/\s+/g, '_')}_Important_Questions.pdf`);
}

export function formatQuestionPaperAsTxt(paper: GeneratedQuestionPaper): string {
  let txt = `========================================================================\n`;
  txt += `                  ${paper.institutionName.toUpperCase()}\n`;
  txt += `         ${paper.subjectName} (${paper.courseCode})\n`;
  txt += `Time Allowed: ${paper.duration}                      Max Marks: ${paper.totalMarks}\n`;
  txt += `========================================================================\n\n`;

  paper.sections.forEach(sec => {
    txt += `--- ${sec.sectionTitle.toUpperCase()} ---\n`;
    txt += `Note: ${sec.instructions}\n\n`;

    sec.questions.forEach(q => {
      txt += `Q${q.number}. ${q.questionText} [${q.marks} Marks]\n`;
      txt += `   Answer Hint: ${q.answerHint}\n\n`;
    });
    txt += `\n`;
  });

  return txt;
}
