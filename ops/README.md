# Независимый запуск стенда

Стенд управляется пользовательским LaunchAgent macOS `local.n1hub.status-dev`.
Он не зависит от чата/терминала Codex, запускается при входе пользователя и перезапускается при сбое.
Адрес: http://127.0.0.1:5173/. Работает при включённом и бодрствующем Mac.

Установленная конфигурация: `/Users/nik/Library/LaunchAgents/local.n1hub.status-dev.plist`.
Копия конфигурации — рядом с этим файлом. Логи: `server.log`, `server-error.log`.
Не запускайте второй Vite на том же порту.

Проверка:
```sh
launchctl print gui/$(id -u)/local.n1hub.status-dev
```
Перезапуск:
```sh
launchctl kickstart -k gui/$(id -u)/local.n1hub.status-dev
```
Остановка и отключение до следующего bootstrap/входа:
```sh
launchctl bootout gui/$(id -u)/local.n1hub.status-dev
```

Используется Node из локального кеша Codex. При удалении/переносе этого runtime нужно обновить ProgramArguments в установленном plist. Закрытие приложения Codex само по себе runtime не удаляет.
