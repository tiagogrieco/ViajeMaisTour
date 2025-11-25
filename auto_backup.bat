@echo off
cd /d "d:\Projetos Python\Sistema Viaje Mais Tour\ViajeMaisTour_CRM_v3"
git add .
git commit -m "Backup Automatico: %date% %time%"
git push origin main
