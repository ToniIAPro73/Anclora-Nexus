import os

path = r"c:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus\backend\api\routes\intelligence.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Import: Add Depends
if "from fastapi import APIRouter, HTTPException, Query" in content:
    content = content.replace(
        "from fastapi import APIRouter, HTTPException, Query",
        "from fastapi import APIRouter, HTTPException, Query, Depends"
    )
elif "from fastapi import APIRouter, HTTPException" in content:
     content = content.replace(
        "from fastapi import APIRouter, HTTPException",
        "from fastapi import APIRouter, HTTPException, Depends"
    )

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated intelligence.py successfully.")
