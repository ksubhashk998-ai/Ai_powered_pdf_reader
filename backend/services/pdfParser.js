import pdfParse from 'pdf-parse';

export async function parsePdfBuffer(buffer, fileName = 'document.pdf') {
  try {
    const pages = [];
    let pageCounter = 0;

    function render_page(pageData) {
      pageCounter++;
      const currentNum = pageCounter;

      return pageData.getTextContent({ normalizeWhitespace: false }).then(textContent => {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str + ' ';
          } else {
            text += '\n' + item.str + ' ';
          }
          lastY = item.transform[5];
        }

        const cleanPageText = text.trim();
        pages.push({
          pageNum: currentNum,
          text: cleanPageText
        });

        return cleanPageText;
      });
    }

    const data = await pdfParse(buffer, { pagerender: render_page });
    
    // Sort page list by pageNum ascending to guarantee exact 1-to-1 order
    pages.sort((a, b) => a.pageNum - b.pageNum);

    const fullText = pages.map(p => `--- PAGE ${p.pageNum} ---\n${p.text}`).join('\n\n') || data.text || '';
    const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
    const title = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

    return {
      title,
      fileName,
      pages: pages.length > 0 ? pages : [{ pageNum: 1, text: fullText }],
      fullText,
      wordCount,
      charCount: fullText.length,
      numPages: data.numpages || pages.length
    };
  } catch (error) {
    console.error("Error parsing PDF buffer:", error);
    const textFallback = buffer.toString('utf-8');
    return {
      title: fileName.replace(/\.[^/.]+$/, ""),
      fileName,
      pages: [{ pageNum: 1, text: textFallback }],
      fullText: textFallback,
      wordCount: textFallback.split(/\s+/).filter(Boolean).length,
      charCount: textFallback.length,
      numPages: 1
    };
  }
}
