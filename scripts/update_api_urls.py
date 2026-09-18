import os
import re

js_dir = os.path.join(r"e:\Coding\my projects\UMS", "frontend", "js")
auth_file = os.path.join(js_dir, "auth.js")

for root, _, files in os.walk(js_dir):
    for f in files:
        if f.endswith('.js'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # If it's auth.js, prepend the window.API_BASE definition
            if f == 'auth.js' and 'window.API_BASE' not in content:
                header = "window.API_BASE = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : '';\n\n"
                content = header + content
            
            # In admin.js, replace const API_BASE = '/api' with const API_BASE = window.API_BASE + '/api'
            if f == 'admin.js':
                content = content.replace("const API_BASE = '/api';", "const API_BASE = window.API_BASE + '/api';")
            
            # Replace fetch('/api/... with fetch(window.API_BASE + '/api/...
            # Be careful with template literals too, e.g. fetch(`/api/...
            content = re.sub(r"fetch\(['\"]/api/([^'\"]+)['\"]\)", r"fetch(window.API_BASE + '/api/\1')", content)
            
            # For template literals like fetch(`/api/admin...
            content = re.sub(r"fetch\(`/api/([^`]+)`\)", r"fetch(window.API_BASE + `/api/\1`)", content)
            
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Updated {f}")

