# Family Planner

Интерактивный календарь для совместного планирования жизни пары на 5 лет вперёд.

## Стек технологий

| Слой | Технология |
|------|-----------|
| Frontend + Backend | Next.js 15 (App Router, TypeScript) |
| Стилизация | Tailwind CSS 4 (mobile-first) |
| База данных | SQLite + Prisma ORM v6 |
| Авторизация | Auth.js v5 (Credentials provider) |
| Drag-and-drop | @hello-pangea/dnd |
| Даты | date-fns |
| Валидация | Zod v4 |
| Data fetching | SWR v2 |
| Уведомления | sonner |

## Функциональность

### Календарь (`/calendar`)
- 4 вида отображения: День, Неделя, Месяц, Год
- На мобильных по умолчанию открывается вид "День"
- Создание/редактирование событий по клику на дату
- Цветовая кодировка по категориям
- Отображение автора и участников событий

### Канбан-доска (`/board`)
- 3 колонки: К выполнению, В процессе, Готово
- Drag-and-drop перемещение задач между колонками
- Приоритеты задач (низкий/средний/высокий)
- Категории и назначение исполнителя
- Горизонтальный скролл колонок на мобильных

### 5-летний таймлайн (`/timeline`)
- Горизонтальная шкала с разметкой по годам и месяцам
- Вехи-цели с цветовой маркировкой
- Маркер "сегодня"
- Автоскролл к текущей дате при открытии
- Отметка выполненных вех

### Список событий (`/events`)
- Фильтрация по категории и диапазону дат
- Карточки событий с информацией о категории, месте, авторе
- Детальная страница события (`/events/[id]`)
- Редактирование и удаление

### Настройки (`/settings`)
- Управление категориями: создание, редактирование, удаление
- Выбор цвета для категорий

### Авторизация
- Вход по email/паролю
- 2 аккаунта (по одному на каждого партнёра)
- Отображение автора у событий, задач и вех

## Быстрый старт

### Требования
- Node.js 18+
- npm

### Установка

```bash
# Клонировать репозиторий
git clone <url> family-planner
cd family-planner

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
# Отредактировать .env: задать AUTH_SECRET

# Создать базу данных и заполнить начальными данными
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу http://localhost:3000

### Учётные записи по умолчанию

| Email | Пароль |
|-------|--------|
| partner1@family.app | password123 |
| partner2@family.app | password123 |

## Структура проекта

```
family-planner/
├── prisma/
│   ├── schema.prisma       # Схема БД (User, Category, Event, Task, Milestone)
│   └── seed.ts              # Начальные данные: 2 пользователя + 7 категорий
├── middleware.ts             # Защита роутов (Auth.js)
├── src/
│   ├── app/
│   │   ├── (auth)/login/    # Страница входа
│   │   ├── (app)/           # Защищённые страницы
│   │   │   ├── calendar/    # Календарь
│   │   │   ├── timeline/    # 5-летний таймлайн
│   │   │   ├── board/       # Канбан-доска
│   │   │   ├── events/      # Список событий + детали
│   │   │   └── settings/    # Настройки категорий
│   │   └── api/             # REST API
│   │       ├── auth/        # Auth.js endpoints
│   │       ├── events/      # CRUD событий
│   │       ├── tasks/       # CRUD задач
│   │       ├── milestones/  # CRUD вех
│   │       └── categories/  # CRUD категорий
│   ├── components/
│   │   ├── calendar/        # CalendarView, MonthView, DayView, WeekView, YearView
│   │   ├── board/           # KanbanBoard, TaskCard, KanbanColumn
│   │   ├── timeline/        # TimelineView, MilestoneCard
│   │   ├── events/          # EventList, EventCard, FilterBar
│   │   ├── layout/          # AppShell, Header, Sidebar, BottomNav
│   │   └── providers/       # SessionProvider, Providers
│   ├── hooks/               # useEvents, useTasks, useMilestones, useCategories
│   └── lib/
│       ├── auth.ts          # Конфигурация Auth.js
│       ├── prisma.ts        # Singleton Prisma Client
│       ├── utils.ts         # cn() utility
│       └── validations/     # Zod-схемы для API
```

## Схема базы данных

### User
Пользователь (партнёр). Поля: id, name, email, hashedPassword, avatarColor.

### Category
Категория событий и задач. Поля: id, name, color, icon.
Предустановленные: Путешествия, Финансы, Важные даты, Быт, Здоровье, Дом, Работа.

### Event
Событие в календаре. Поля: title, description, startDate, endDate, allDay, location, isRecurring, recurrenceRule.
Связи: category, createdBy, modifiedBy, assignees (many-to-many).

### Task
Задача на канбан-доске. Поля: title, description, status (TODO/IN_PROGRESS/DONE), priority (LOW/MEDIUM/HIGH), position, dueDate.
Связи: category, createdBy, assignee.

### Milestone
Веха на 5-летнем таймлайне. Поля: title, description, targetDate, isCompleted, color.
Связь: createdBy.

## API

### Аутентификация
Все API-эндпоинты требуют авторизации (Auth.js session). Неавторизованные запросы получают 401.

### Эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET/POST | /api/events | Список (с фильтрами) / Создание |
| GET/PUT/DELETE | /api/events/[id] | Чтение / Обновление / Удаление |
| GET/POST | /api/tasks | Список / Создание |
| GET/PUT/PATCH/DELETE | /api/tasks/[id] | Чтение / Обновление / Перемещение / Удаление |
| GET/POST | /api/milestones | Список / Создание |
| GET/PUT/DELETE | /api/milestones/[id] | Чтение / Обновление / Удаление |
| GET/POST | /api/categories | Список / Создание |
| PUT/DELETE | /api/categories/[id] | Обновление / Удаление |

### Фильтры событий
- `start` — начало диапазона (ISO 8601)
- `end` — конец диапазона (ISO 8601)
- `categoryId` — ID категории
- `createdById` — ID автора

### Фильтры задач
- `status` — TODO / IN_PROGRESS / DONE
- `categoryId` — ID категории
- `assigneeId` — ID исполнителя

## Деплой на VM

### Сборка

```bash
npm run build
```

Проект собирается в standalone-режиме (`.next/standalone/`), что позволяет запускать его без `node_modules`.

### Systemd-сервис

Создать `/etc/systemd/system/family-planner.service`:

```ini
[Unit]
Description=Family Planner
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/family-planner
ExecStart=/usr/bin/node /opt/family-planner/.next/standalone/server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/opt/family-planner/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable family-planner
sudo systemctl start family-planner
```

### Reverse proxy (Caddy)

```
family.yourdomain.com {
  reverse_proxy localhost:3000
}
```

Caddy автоматически выпустит SSL-сертификат через Let's Encrypt.

### Бэкап SQLite

```bash
# Добавить в crontab
0 3 * * * cp /opt/family-planner/prisma/production.db /var/backups/family-planner/backup-$(date +\%Y\%m\%d).db
```

### Обновление

```bash
cd /opt/family-planner
git pull
npm install
npx prisma generate
npx prisma db push
npm run build
sudo systemctl restart family-planner
```

## Переменные окружения

| Переменная | Описание | Пример |
|-----------|----------|--------|
| DATABASE_URL | Путь к SQLite файлу | file:./dev.db |
| AUTH_SECRET | Секрет для JWT токенов | случайная строка |
| AUTH_URL | URL приложения | http://localhost:3000 |

## Лицензия

Частный проект.
