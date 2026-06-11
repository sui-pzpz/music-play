# Music Play - 开发环境启动脚本
# 用于启动 MySQL、Redis 和后端服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Music Play - 开发环境启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查并启动 MySQL
Write-Host "[1/3] 检查 MySQL 服务..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL84" -ErrorAction SilentlyContinue
if ($mysqlService) {
    if ($mysqlService.Status -ne "Running") {
        Write-Host "  -> 启动 MySQL 服务..." -ForegroundColor Gray
        Start-Service MySQL84
        Start-Sleep -Seconds 3
    }
    Write-Host "  [OK] MySQL 已运行" -ForegroundColor Green
} else {
    Write-Host "  [WARN] 未找到 MySQL84 服务，请先安装 MySQL" -ForegroundColor Red
    Write-Host "         执行: cd 'C:\Program Files\MySQL\MySQL Server 8.4\bin' && .\mysqld.exe --install MySQL84" -ForegroundColor Gray
}

# 2. 检查并启动 Redis
Write-Host "[2/3] 检查 Redis 服务..." -ForegroundColor Yellow
try {
    $pong = redis-cli ping 2>&1
    if ($pong -eq "PONG") {
        Write-Host "  [OK] Redis 已运行" -ForegroundColor Green
    } else {
        redis-server --service-start
        Start-Sleep -Seconds 2
        Write-Host "  [OK] Redis 已启动" -ForegroundColor Green
    }
} catch {
    Write-Host "  [WARN] Redis 未安装或启动失败" -ForegroundColor Red
}

# 3. 启动后端服务
Write-Host "[3/3] 编译并启动后端服务..." -ForegroundColor Yellow
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
$env:Path += ";C:\tools\apache-maven-3.9.16\bin"
Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray

cd backend
Write-Host "  -> 正在编译项目..." -ForegroundColor Gray
& "C:\tools\apache-maven-3.9.16\bin\mvn.cmd" compile -q
if ($LASTEXITCODE -eq 0) {
    Write-Host "  -> 编译成功，启动 Spring Boot..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd'; `$env:JAVA_HOME='C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot'; & 'C:\tools\apache-maven-3.9.16\bin\mvn.cmd' spring-boot:run"
    Write-Host "  [OK] 后端服务启动中，请等待几秒后访问 http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] 编译失败，请检查错误信息" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  开发环境启动完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后端 API:     http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "数据库:       localhost:3306 (music_platform)" -ForegroundColor White
Write-Host "Redis:        localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "管理员账号:   admin / admin123" -ForegroundColor White
