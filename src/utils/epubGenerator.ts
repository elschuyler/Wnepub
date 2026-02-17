import JSZip from 'jszip';

export const generateEpub = async (title: string, pages: string[]): Promise<Blob> => {
  const zip = new JSZip();

  // 1. mimetype file (MUST be the first file and uncompressed, though JSZip adds it normally)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file('META-INF/container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  // 3. OEBPS folder files
  let manifest = '';
  let spine = '';
  
  pages.forEach((page, i) => {
    const fileName = `page_${i}.xhtml`;
    // Clean text for basic XML compatibility
    const sanitizedText = page
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const content = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${title} - Page ${i + 1}</title>
    <style>
      body { padding: 1em; line-height: 1.6; font-family: sans-serif; }
      p { margin-bottom: 1em; text-indent: 1.2em; }
    </style>
  </head>
  <body>
    <p>${sanitizedText}</p>
  </body>
</html>`;
    
    zip.file(`OEBPS/Text/${fileName}`, content);
    manifest += `<item id="p${i}" href="Text/${fileName}" media-type="application/xhtml+xml"/>\n    `;
    spine += `<itemref idref="p${i}"/>\n    `;
  });

  // 4. content.opf
  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${title}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>PDF to EPUB Converter</dc:creator>
    <dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
  </metadata>
  <manifest>
    ${manifest}
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
    ${spine}
  </spine>
</package>`;

  zip.file('OEBPS/content.opf', opf);

  // 5. toc.ncx (Table of Contents - Required for EPUB 2)
  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:12345"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <navMap>
    <navPoint id="navpoint-1" playOrder="1">
      <navLabel><text>Start</text></navLabel>
      <content src="Text/page_0.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`;

  zip.file('OEBPS/toc.ncx', ncx);

  return await zip.generateAsync({ type: 'blob' });
};
