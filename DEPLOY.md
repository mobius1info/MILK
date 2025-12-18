# Инструкция по деплою на Vercel

## Шаг 1: Создайте GitHub репозиторий

```bash
# Инициализируйте git (если еще не сделано)
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и подключите его
git remote add origin https://github.com/ваш-username/название-репозитория.git
git branch -M main
git push -u origin main
```

## Шаг 2: Подключите проект к Vercel

1. Зайдите на https://vercel.com
2. Нажмите **"Add New Project"**
3. Выберите ваш GitHub репозиторий
4. Vercel автоматически определит, что это Vite проект

## Шаг 3: Настройте переменные окружения

В настройках проекта Vercel добавьте:

```
VITE_SUPABASE_URL=https://uzbyrciresvwcumrzdnn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6YnlyY2lyZXN2d2N1bXJ6ZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTY5MjcsImV4cCI6MjA4MDkzMjkyN30.r1tMK1UCIeFq3f3uuYSufLedHjQPY-AhM8BcnSVhHbw
```

## Шаг 4: Подключите домен mgsouk.com

1. В настройках проекта Vercel перейдите в **"Domains"**
2. Добавьте домен: **mgsouk.com**
3. Vercel покажет DNS записи, которые нужно добавить у вашего регистратора домена:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Добавьте эти записи в панели управления вашего регистратора домена
5. Подождите 5-15 минут для распространения DNS

## Готово!

После этого:
- Каждый `git push` будет автоматически деплоиться
- Сайт будет доступен по адресу https://mgsouk.com
- SSL сертификат настроится автоматически

## Важные команды для работы

```bash
# Проверить сборку локально
npm run build

# Локальный просмотр production сборки
npm run preview

# Запушить изменения (автоматический деплой)
git add .
git commit -m "описание изменений"
git push
```

## Структура проекта

- **Фронтенд**: Vercel (автодеплой с GitHub)
- **База данных**: Supabase (uzbyrciresvwcumrzdnn.supabase.co)
- **Домен**: mgsouk.com
- **SSL**: Автоматически от Vercel
