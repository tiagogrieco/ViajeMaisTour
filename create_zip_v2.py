import zipfile
import os

def zip_project(output_filename, source_dir):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git', '.vercel', '.cache', 'public']]
            
            for file in files:
                if file.endswith('.zip') or file.endswith('.pyc') or file == 'create_zip.py' or file == 'create_zip_v2.py':
                    continue
                
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)
        
        # Manually add public folder contents (excluding zip files)
        public_path = os.path.join(source_dir, 'public')
        if os.path.exists(public_path):
            for root, dirs, files in os.walk(public_path):
                for file in files:
                    if file.endswith('.zip'):
                        continue
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, source_dir)
                    zipf.write(file_path, arcname)

if __name__ == '__main__':
    output_zip = 'public/ViajeMaisTour_CRM_v2.zip'
    # Ensure public directory exists
    if not os.path.exists('public'):
        os.makedirs('public')
    
    print(f"Creating {output_zip}...")
    zip_project(output_zip, '.')
    print("Zip created successfully.")