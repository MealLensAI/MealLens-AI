#!/usr/bin/env python3
"""
Cleanup Debug Logs Script
Removes all debug print statements and console.log statements from the codebase
"""

import os
import re
import glob

def cleanup_file(file_path, file_type):
    """Clean up debug statements from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        if file_type == 'python':
            # Remove print statements (but keep logging statements)
            content = re.sub(r'print\s*\([^)]*\)', '', content)
            content = re.sub(r'print\s*\([^)]*\)\s*#.*', '', content)
            
        elif file_type == 'typescript' or file_type == 'javascript':
            # Remove console.log statements
            content = re.sub(r'console\.log\s*\([^)]*\);?\s*', '', content)
            content = re.sub(r'console\.warn\s*\([^)]*\);?\s*', '', content)
            content = re.sub(r'console\.error\s*\([^)]*\);?\s*', '', content)
            content = re.sub(r'console\.debug\s*\([^)]*\);?\s*', '', content)
            
            # Remove debug comments
            content = re.sub(r'//\s*DEBUG.*\n', '', content)
            content = re.sub(r'/\*\s*DEBUG.*?\*/\s*', '', content, flags=re.DOTALL)
        
        # Remove empty lines that might be left
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main cleanup function"""
    print("🧹 Starting debug logs cleanup...")
    
    # Python files
    python_files = glob.glob('backend/**/*.py', recursive=True)
    python_files.extend(glob.glob('**/*.py', recursive=True))
    
    # TypeScript/JavaScript files
    ts_files = glob.glob('frontend/src/**/*.ts', recursive=True)
    ts_files.extend(glob.glob('frontend/src/**/*.tsx', recursive=True))
    ts_files.extend(glob.glob('frontend/src/**/*.js', recursive=True))
    ts_files.extend(glob.glob('frontend/src/**/*.jsx', recursive=True))
    
    cleaned_files = 0
    
    # Clean Python files
    for file_path in python_files:
        if os.path.exists(file_path):
            if cleanup_file(file_path, 'python'):
                print(f"✅ Cleaned: {file_path}")
                cleaned_files += 1
    
    # Clean TypeScript/JavaScript files
    for file_path in ts_files:
        if os.path.exists(file_path):
            if cleanup_file(file_path, 'typescript'):
                print(f"✅ Cleaned: {file_path}")
                cleaned_files += 1
    
    print(f"\n🎉 Cleanup complete! Cleaned {cleaned_files} files.")
    print("📝 Note: Logging statements (logger.info, logger.error) were preserved for production debugging.")

if __name__ == "__main__":
    main() 