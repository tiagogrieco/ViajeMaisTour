@echo off
echo Historico de Backups (Pressione Q para sair):
echo.
git log --pretty=format:"%%h - %%ad - %%s" --date=format:"%%d/%%m/%%Y %%H:%%M" --graph
echo.
pause
