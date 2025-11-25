@echo off
echo ========================================================
echo CONECTAR AO GITHUB
echo ========================================================
echo.
echo Para fazer backup na nuvem, voce precisa criar um repositorio
echo vazio no GitHub (https://github.com/new).
echo.
echo Apos criar, cole a URL do repositorio abaixo (ex: https://github.com/seu-usuario/seu-repo.git)
echo.
set /p REPO_URL="URL do Repositorio: "

if "%REPO_URL%"=="" (
    echo.
    echo [ERRO] Voce precisa digitar a URL.
    pause
    exit /b
)

echo.
echo Configurando repositorio remoto...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Enviando arquivos para o GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo [SUCESSO] Seu codigo foi enviado para o GitHub!
    echo Agora o 'backup.bat' e 'auto_backup.bat' tambem podem enviar para la se configurados.
) else (
    echo.
    echo [ERRO] Nao foi possivel enviar. Verifique se a URL esta correta e se voce tem permissao.
)

echo.
pause
