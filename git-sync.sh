#!/bin/bash

# URL вашего Git-репозитория
REPO_URL="https://github.com/elephant10/Bla-Bla-Club-suggestion-bot.git"

# Коммит-сообщение
COMMIT_MESSAGE="Выгрузка файлов users.json, userIds.txt и ban.txt"

# Добавляем изменения в индекс Git
git add .

# Создаем коммит
git commit -m "$COMMIT_MESSAGE"

# Отправляем изменения на сервер (предполагается, что у вас настроена аутентификация)
git push origin main  # Замените "main" на вашу актуальную ветку

