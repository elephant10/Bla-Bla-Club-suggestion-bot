#!/bin/bash

# URL вашего Git-репозитория
REPO_URL="https://github.com/elephant10/Bla-Bla-Club-suggestion-bot.git"

# Коммит-сообщение
COMMIT_MESSAGE="Push files users.json, userIds.txt и ban.txt"

# Список файлов, которые нужно выгрузить
FILES_TO_UPLOAD=("users.json" "userIds.txt" "ban.txt")

# Добавляем указанные файлы в индекс Git
for file in "${FILES_TO_UPLOAD[@]}"; do
    git add "$file"
done

# Создаем коммит
git commit -m "$COMMIT_MESSAGE"

# Отправляем изменения на сервер
git push origin main

