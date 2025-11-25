import zipfile
import os

def zip_directory(folder_path, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            # Exclude directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'public']]
            
            for file in files:
                # Exclude specific files
                if file == 'ViajeMaisTour_CRM.zip' or file == 'create_zip.py':
                    continue
                
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                zipf.write(file_path, arcname)
        
        # Manually add public folder contents (excluding the zip itself)
        public_path = os.path.join(folder_path, 'public')
        if os.path.exists(public_path):
            for root, dirs, files in os.walk(public_path):
                for file in files:
                    if file == 'ViajeMaisTour_CRM.zip':
                        continue
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, folder_path)
                    zipf.write(file_path, arcname)

if __name__ == "__main__":
    zip_directory('.', 'public/ViajeMaisTour_CRM.zip')
    print("Zip created successfully!")