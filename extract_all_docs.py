import os
import zipfile
import xml.etree.ElementTree as ET

docs_dir = r"c:\Users\soumy\OneDrive\Desktop\HTML\internship\project-15-grandstore\docs"
output_file = r"c:\Users\soumy\OneDrive\Desktop\HTML\internship\project-15-grandstore\all_docs_content.md"

ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

with open(output_file, 'w', encoding='utf-8') as out:
    for filename in os.listdir(docs_dir):
        if filename.endswith(".docx"):
            filepath = os.path.join(docs_dir, filename)
            out.write(f"\n\n{'='*50}\n")
            out.write(f"DOCUMENT: {filename}\n")
            out.write(f"{'='*50}\n\n")
            try:
                doc = zipfile.ZipFile(filepath)
                xml_content = doc.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                for paragraph in tree.findall('.//w:p', ns):
                    texts = [node.text for node in paragraph.findall('.//w:t', ns) if node.text]
                    if texts:
                        out.write(''.join(texts) + '\n')
            except Exception as e:
                out.write(f"Error reading file: {e}\n")
