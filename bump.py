import re
import os

files = [
    r"c:/MY FOLDER/PROXO-LOMBA/DEVELOP-MOBILEAPP-PROXOCORIS/frontend-mobileapp/app/(tabs)/index.tsx",
    r"c:/MY FOLDER/PROXO-LOMBA/DEVELOP-MOBILEAPP-PROXOCORIS/frontend-mobileapp/app/(tabs)/lapor.tsx",
    r"c:/MY FOLDER/PROXO-LOMBA/DEVELOP-MOBILEAPP-PROXOCORIS/frontend-mobileapp/app/(tabs)/pantau.tsx",
    r"c:/MY FOLDER/PROXO-LOMBA/DEVELOP-MOBILEAPP-PROXOCORIS/frontend-mobileapp/app/(tabs)/profil.tsx",
    r"c:/MY FOLDER/PROXO-LOMBA/DEVELOP-MOBILEAPP-PROXOCORIS/frontend-mobileapp/app/(tabs)/aichat.tsx",
    r"c:/MY FOLDER/PROXO-LOMBA/DEVELOP-MOBILEAPP-PROXOCORIS/frontend-mobileapp/app/action-detail.tsx",
    r"c:/MY FOLDER/PROXO-LOMBA/DEVELOP-MOBILEAPP-PROXOCORIS/frontend-mobileapp/app/report-detail.tsx",
    r"c:/MY FOLDER/PROXO-LOMBA/DEVELOP-MOBILEAPP-PROXOCORIS/frontend-mobileapp/app/notifikasi.tsx"
]

def bump_font_size(match):
    size = int(match.group(1))
    if 8 <= size <= 16:
        new_size = size + (1 if size == 8 or size == 9 else 2)
        return f"fontSize: {new_size}"
    return match.group(0)

def bump_text_class(match):
    size = int(match.group(1))
    if 8 <= size <= 16:
        new_size = size + (1 if size == 8 or size == 9 else 2)
        return f"text-[{new_size}px]"
    return match.group(0)

def bump_icon_size(match):
    prefix = match.group(1) # 'size=' or 'size={'
    size = int(match.group(2))
    suffix = match.group(3) # '}' or ''
    if 8 <= size <= 28:
        new_size = size + 2
        return f"size={{{new_size}}}"
    return match.group(0)

def process_file(file_path):
    print("Processing", file_path)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # bump inline fontSize
    content = re.sub(r'fontSize:\s*(\d+)', bump_font_size, content)
    
    # bump tailwind text-[Xpx]
    content = re.sub(r'text-\[(\d+)px\]', bump_text_class, content)
    
    # bump text-xs -> text-[14px], text-sm -> text-[16px]
    content = content.replace('text-xs', 'text-[14px]')
    content = content.replace('text-sm', 'text-[16px]')
    
    # bump icon size={X}
    content = re.sub(r'(size=\{?)(\d+)(\}?)', bump_icon_size, content)

    # Padding improvements for touchables / buttons (px, py classes)
    content = content.replace('px-2 py-0.5', 'px-3 py-1')
    content = content.replace('px-2.5 py-1', 'px-3 py-1.5')
    content = content.replace('paddingHorizontal: 10, paddingVertical: 5', 'paddingHorizontal: 12, paddingVertical: 6')
    content = content.replace('paddingHorizontal: 10, paddingVertical: 6', 'paddingHorizontal: 14, paddingVertical: 8')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    try:
        process_file(f)
    except Exception as e:
        print("Failed on", f, e)

print("Done")
