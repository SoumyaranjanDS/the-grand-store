import zipfile
import xml.etree.ElementTree as ET
import sys
import io

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            text = []
            for paragraph in tree.findall('.//w:p', namespaces):
                para_text = []
                for run in paragraph.findall('.//w:r', namespaces):
                    for text_node in run.findall('.//w:t', namespaces):
                        if text_node.text:
                            para_text.append(text_node.text)
                if para_text:
                    text.append(''.join(para_text))
            return '\n'.join(text)
    except Exception as e:
        return f"Error reading {docx_path}: {str(e)}"

with io.open("c:\\office\\store-new\\grand-store\\.tmp\\docs_output.txt", "w", encoding="utf-8") as f:
    for file_path in sys.argv[1:]:
        f.write(f"--- CONTENT OF {file_path} ---\n")
        f.write(extract_text_from_docx(file_path))
        f.write("\n\n")
