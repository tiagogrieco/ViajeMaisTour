@echo off
echo Realizando backup do sistema...
git add .
set /p msg="Digite uma mensagem para o backup (ou Enter para padrao): "
if "%msg%"=="" set msg=Backup Automatico %date% %time%
git commit -m "%msg%"
echo Backup realizado com sucesso!
pause
