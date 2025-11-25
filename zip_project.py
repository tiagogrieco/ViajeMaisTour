import os
import zipfile

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        # Exclude node_modules, .git, dist, and the zip file itself
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
        
        for file in files:
            if file == 'ViajeMaisTour_CRM.zip' or file == 'zip_project.py':
                continue
            
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, path)
            ziph.write(file_path, arcname)

if __name__ == '__main__':
    with zipfile.ZipFile('public/ViajeMaisTour_CRM.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipdir('.', zipf)
    print("Zip file created successfully at public/ViajeMaisTour_CRM.zip")