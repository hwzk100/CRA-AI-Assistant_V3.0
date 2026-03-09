@echo off
echo ========================================
echo CRA AI Assistant 诊断工具
echo ========================================
echo.

cd /d "%~dp0AI for CRA V3.0"

echo [1/6] 检查文件结构...
echo.
if exist "dist\renderer\index.html" (
    echo ✓ dist\renderer\index.html 存在
) else (
    echo ✗ dist\renderer\index.html 不存在
)

if exist "dist\renderer\index.js" (
    echo ✓ dist\renderer\index.js 存在
) else (
    echo ✗ dist\renderer\index.js 不存在
)

if exist "dist\main\preload.js" (
    echo ✓ dist\main\preload.js 存在
) else (
    echo ✗ dist\main\preload.js 不存在
)

if exist "dist\main\index.js" (
    echo ✓ dist\main\index.js 存在
) else (
    echo ✗ dist\main\index.js 不存在
)

echo.
echo [2/6] 检查 node_modules...
if exist "node_modules" (
    echo ✓ node_modules 存在
) else (
    echo ✗ node_modules 不存在，需要运行 npm install
)

echo.
echo [3/6] 检查构建状态...
if exist "dist\renderer\index.js" (
    for %%A in ("dist\renderer\index.js") do echo   index.js 大小: %%~zA 字节
)

echo.
echo [4/6] 可用的测试页面...
if exist "test-renderer.html" (
    echo ✓ test-renderer.html - 完整功能测试
)
if exist "minimal-test.html" (
    echo ✓ minimal-test.html - 最小化测试
)
if exist "debug.html" (
    echo ✓ debug.html - 调试页面
)

echo.
echo [5/6] 启动选项...
echo.
echo 选择操作:
echo   1 - 开发模式 (npm run dev)
echo   2 - 生产模式 (npm start)
echo   3 - 重新构建 (npm run build)
echo   4 - 清理并重新安装
echo   5 - 打开测试页面
echo   0 - 退出
echo.

set /p choice="请输入选项 (0-5): "

if "%choice%"=="1" (
    echo.
    echo 启动开发模式...
    npm run dev
) else if "%choice%"=="2" (
    echo.
    echo 启动生产模式...
    npm start
) else if "%choice%"=="3" (
    echo.
    echo 重新构建...
    npm run build
    echo.
    echo 构建完成！按任意键返回菜单...
    pause >nul
    call "%~f0"
) else if "%choice%"=="4" (
    echo.
    echo 清理并重新安装...
    echo 这将删除 dist 和 node_modules 文件夹
    set /p confirm="确认? (y/n): "
    if /i "%confirm%"=="y" (
        echo 删除 dist 文件夹...
        rmdir /s /q dist
        echo 删除 node_modules 文件夹...
        rmdir /s /q node_modules
        echo.
        echo 重新安装依赖...
        npm install
        echo.
        echo 重新构建...
        npm run build
        echo.
        echo 完成！
    )
) else if "%choice%"=="5" (
    echo.
    echo 在浏览器中打开测试页面...
    start test-renderer.html
) else (
    echo.
    echo 退出
    exit
)

pause
