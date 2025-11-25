@echo off
echo ========================================================
echo CORRIGINDO CONEXAO COM GITHUB
echo ========================================================
echo.
echo O erro aconteceu porque o repositorio no GitHub nao estava vazio
echo (provavelmente voce criou com um README ou Licenca).
echo.
echo Vou tentar forcar o envio dos seus arquivos locais para la.
echo ISSO VAI SOBRESCREVER O QUE ESTIVER NO GITHUB.
echo.
pause

git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo [SUCESSO] Arquivos enviados com sucesso!
) else (
    echo.
    echo [ERRO] Ainda nao foi possivel enviar.
)
echo.
pause
