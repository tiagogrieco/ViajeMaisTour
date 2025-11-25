@echo off
echo ========================================================
echo CONFIGURANDO BACKUP AUTOMATICO (HORA EM HORA)
echo ========================================================
echo.
echo Este script ira criar uma tarefa no Windows para rodar o backup
echo automaticamente a cada 1 hora.
echo.
echo IMPORTANTE: Se der erro de "Acesso Negado", clique com o botao
echo direito neste arquivo e escolha "Executar como Administrador".
echo.
pause

schtasks /create /sc hourly /tn "ViajeMaisTour_Backup" /tr "\"d:\Projetos Python\Sistema Viaje Mais Tour\ViajeMaisTour_CRM_v3\auto_backup.bat\""

if %errorlevel% equ 0 (
    echo.
    echo [SUCESSO] Backup automatico configurado!
    echo Ele rodara a cada 1 hora enquanto o computador estiver ligado.
) else (
    echo.
    echo [ERRO] Nao foi possivel criar a tarefa.
    echo Verifique se voce executou como Administrador.
)

echo.
pause
