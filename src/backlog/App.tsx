import React, { useEffect, useMemo, useState } from 'react';

import { IconAdd } from '@consta/icons/IconAdd';
import { IconArrowDown } from '@consta/icons/IconArrowDown';
import { IconArrowLeft } from '@consta/icons/IconArrowLeft';
import { IconClose } from '@consta/icons/IconClose';
import { IconSearchStroked } from '@consta/icons/IconSearchStroked';
import { IconThumbUp } from '@consta/icons/IconThumbUp';
import { Avatar } from '@consta/uikit/Avatar';
import { Badge } from '@consta/uikit/Badge';
import { Button } from '@consta/uikit/Button';
import { Combobox } from '@consta/uikit/Combobox';
import { Modal } from '@consta/uikit/Modal';
import { SnackBar, type SnackBarItemDefault } from '@consta/uikit/SnackBar';
import { Tag } from '@consta/uikit/Tag';
import { Text } from '@consta/uikit/Text';
import { TextField } from '@consta/uikit/TextField';
import { Theme, presetGpnDefault } from '@consta/uikit/Theme';

import { appPath } from '../paths';

type TabId = 'user' | 'progress' | 'planned' | 'ready' | 'archive' | 'mine';
type IdeaStatus = 'moderation' | 'rejected' | 'idea' | 'progress' | 'planned' | 'ready';

const categories = [
  'Контейнеризация',
  'Виртуализация',
  'SSO',
  'Каталог данных',
  'Качество данных',
  'Лаборатория данных',
  'Хранилище данных',
  'Сервис искусственного интеллекта',
  'Управление исходным кодом',
  'Управление артефактами и зависимостями',
  'Управление автоматизированной сборкой и развертыванием',
  'Управление релизным циклом',
  'Тестирование',
  'Сервис наблюдаемости',
  'Управление секретами',
  'Сервис тестирования безопасности приложений',
  'DevOps Toolkit',
  'Управление API',
  'Управляемый сервис NiFi',
  'Управляемый сервис для Airflow',
  'Управляемый сервис для DataAPI',
  'Управляемый сервис для Kafka',
  'Arenadata Streaming (Kafka)',
  'PostgreSQL как сервис',
  'Управляемый сервис для PostgreSQL',
  'Управляемый сервис для ClickHouse',
  'Управляемый сервис для Greenplum',
  'Управляемый сервис для Hadoop',
  'Управление задачами и проектной документацией',
  'Продуктовая аналитика',
  'Дизайн-система Consta',
  'N1 Hub',
  'Без категории',
] as const;

type Category = (typeof categories)[number];

type CategoryOption = {
  id: Category;
  label: Category;
};

type StatusOption = {
  id: IdeaStatus;
  label: string;
};

const categoryOptions: CategoryOption[] = categories.map((category) => ({
  id: category,
  label: category,
}));

const featureStatusOptions: StatusOption[] = [
  { id: 'moderation', label: 'На модерации' },
  { id: 'rejected', label: 'Отклонено' },
  { id: 'idea', label: 'Идея пользователя' },
  { id: 'planned', label: 'Запланировано' },
  { id: 'progress', label: 'В работе' },
  { id: 'ready', label: 'Уже доступно' },
];

const defaultFeatureStatus = featureStatusOptions[3];

const currentUser = { name: 'Максим Дмитриев', isAdmin: true };

type Idea = {
  id: number;
  title: string;
  description: string;
  categories: Category[];
  status: IdeaStatus;
  author: string;
  votes: number;
  quarter?: string;
  isMine?: boolean;
  voted?: boolean;
  archived?: boolean;
  rejectionComment?: string;
};

const statusMeta: Record<
  IdeaStatus,
  { label: string; badgeStatus: 'system' | 'normal' | 'warning' | 'success' | 'alert' }
> = {
  moderation: { label: 'На модерации', badgeStatus: 'system' },
  rejected: { label: 'Отклонено', badgeStatus: 'alert' },
  idea: { label: 'Идея пользователя', badgeStatus: 'system' },
  progress: { label: 'В работе', badgeStatus: 'normal' },
  planned: { label: 'Запланировано', badgeStatus: 'warning' },
  ready: { label: 'Уже доступно', badgeStatus: 'success' },
};

const statusSortOrder: Record<IdeaStatus, number> = {
  moderation: 0,
  rejected: 1,
  idea: 2,
  planned: 3,
  progress: 4,
  ready: 5,
};

const canViewIdea = (idea: Idea) => {
  if (idea.archived) return currentUser.isAdmin;
  if (idea.status === 'moderation' || idea.status === 'rejected') {
    return currentUser.isAdmin || idea.author === currentUser.name;
  }
  return true;
};

const featuredIdeas: Idea[] = [
  {
    id: 1,
    title: 'Единая вычислительная среда для запуска контейнерных приложений в КСПД',
    description:
      'Единая вычислительная среда, предоставляющая мощности для запуска и работы контейнерных приложений в промышленной среде в КСПД.',
    categories: ['Контейнеризация', 'DevOps Toolkit'],
    status: 'idea',
    author: 'Максим Дмитриев',
    votes: 0,
    isMine: true,
  },
  {
    id: 2,
    title: 'Граф зависимостей наборов данных и витрин',
    description:
      'Добавить визуальный граф связей между источниками, трансформациями и витринами, чтобы быстрее оценивать влияние изменений.',
    categories: ['Каталог данных', 'Качество данных'],
    status: 'idea',
    author: 'Максим Дмитриев',
    votes: 0,
    isMine: true,
  },
  {
    id: 3,
    title: 'Автоматическое масштабирование сред разработки по расписанию',
    description:
      'Нужны правила автоматического увеличения и уменьшения ресурсов окружений в зависимости от рабочего графика команды.',
    categories: ['Виртуализация'],
    status: 'progress',
    author: 'Анна Петрова',
    votes: 56,
    quarter: 'Q4 2026',
  },
  {
    id: 4,
    title: 'Единый журнал аудита изменений конфигурации',
    description:
      'Собирать изменения настроек сервисов в одном журнале с фильтрами по пользователю, проекту и типу события.',
    categories: ['SSO', 'N1 Hub'],
    status: 'progress',
    author: 'Денис Волков',
    votes: 41,
    quarter: 'Q1 2027',
  },
  {
    id: 5,
    title: 'Предпросмотр Terraform-плана перед применением',
    description:
      'Показывать понятное сравнение инфраструктуры до и после изменения прямо в интерфейсе релизного процесса.',
    categories: ['Управление исходным кодом', 'DevOps Toolkit'],
    status: 'progress',
    author: 'Илья Соколов',
    votes: 37,
    quarter: 'Q4 2026',
  },
  {
    id: 6,
    title: 'Уведомления о деградации SLA в Telegram',
    description:
      'Добавить настраиваемые уведомления о приближении к порогам SLA и об инцидентах для командных каналов.',
    categories: ['Сервис наблюдаемости'],
    status: 'progress',
    author: 'Мария Орлова',
    votes: 29,
    quarter: 'Q1 2027',
  },
  {
    id: 7,
    title: 'Шаблоны пайплайнов для типовых микросервисов',
    description:
      'Каталог готовых CI/CD-пайплайнов для Java, Go и Python с проверками безопасности и стандартными этапами доставки.',
    categories: ['Управление автоматизированной сборкой и развертыванием'],
    status: 'planned',
    author: 'Олег Мартынов',
    votes: 84,
    quarter: 'Q2 2027',
  },
  {
    id: 8,
    title: 'Сравнение стоимости конфигураций окружения',
    description:
      'Показывать прогноз стоимости ресурсов до создания окружения и предлагать более экономичные конфигурации.',
    categories: ['Продуктовая аналитика'],
    status: 'planned',
    author: 'Екатерина Лебедева',
    votes: 63,
    quarter: 'Q1 2027',
  },
  {
    id: 9,
    title: 'Каталог владельцев корпоративных API',
    description:
      'Отображать владельца, канал поддержки и историю изменений для каждого API в каталоге платформы.',
    categories: ['Управление API'],
    status: 'planned',
    author: 'Алексей Смирнов',
    votes: 48,
    quarter: 'Q2 2027',
  },
  {
    id: 10,
    title: 'Быстрое клонирование настроек проекта',
    description:
      'Создавать новый проект на основе существующего вместе с ролями, переменными, квотами и подключёнными сервисами.',
    categories: ['N1 Hub'],
    status: 'ready',
    author: 'Светлана Ким',
    votes: 112,
    quarter: 'Q3 2026',
  },
  {
    id: 11,
    title: 'История потребления ресурсов за 12 месяцев',
    description:
      'Добавить графики потребления CPU, памяти и хранилища с выгрузкой данных для планирования бюджетов.',
    categories: ['Хранилище данных', 'Сервис наблюдаемости'],
    status: 'ready',
    author: 'Роман Беляев',
    votes: 76,
    quarter: 'Q3 2026',
  },
  {
    id: 12,
    title: 'Массовое управление участниками проектов',
    description:
      'Импортировать список участников, менять роли сразу для нескольких пользователей и копировать состав команды.',
    categories: ['Управление задачами и проектной документацией', 'N1 Hub'],
    status: 'ready',
    author: 'Наталья Фролова',
    votes: 51,
    quarter: 'Q2 2026',
  },
  {
    id: 13,
    title: 'Поиск секретов в истории репозитория',
    description:
      'Проверять всю историю Git на случайно добавленные токены и ключи и давать рекомендации по их отзыву.',
    categories: ['Управление секретами', 'Сервис тестирования безопасности приложений'],
    status: 'idea',
    author: 'Павел Егоров',
    votes: 0,
  },
];

const generatedStatuses: Array<Exclude<IdeaStatus, 'moderation'>> = [
  'idea',
  'progress',
  'planned',
  'ready',
];
const generatedAuthors = [
  'Александра Морозова',
  'Никита Кузнецов',
  'Вероника Павлова',
  'Тимур Абрамов',
  'Алина Воробьёва',
];
const generatedQuarters = ['Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027', 'Q3 2027'];

function createBacklogIdeas(existingIdeas: Idea[]): Idea[] {
  const categoryCounts = Object.fromEntries(
    categories.map((category) => [category, 0]),
  ) as Record<Category, number>;
  for (const idea of existingIdeas) {
    for (const category of idea.categories) categoryCounts[category] += 1;
  }

  const pendingCategories: Category[] = [];
  for (const category of categories) {
    for (let index = categoryCounts[category]; index < 3; index += 1) {
      pendingCategories.push(category);
    }
  }

  const uncategorized = pendingCategories.filter((category) => category === 'Без категории');
  const categorized = pendingCategories.filter((category) => category !== 'Без категории');
  const generated: Idea[] = [];

  const addIdea = (ideaCategories: Category[]) => {
    const index = generated.length;
    const status = generatedStatuses[index % generatedStatuses.length];
    const primary = ideaCategories[0];
    const secondary = ideaCategories[1];
    generated.push({
      id: 1000 + index,
      title: secondary
        ? `${primary}: интеграция с сервисом «${secondary}»`
        : `Улучшение пользовательского сценария: ${primary}`,
      description: secondary
        ? `Добавить единый сценарий работы для категорий «${primary}» и «${secondary}» с понятными статусами, историей изменений и уведомлениями.`
        : `Упростить типовые операции и сделать работу с категорией «${primary}» понятнее для команд разного уровня подготовки.`,
      categories: ideaCategories,
      status,
      author: generatedAuthors[index % generatedAuthors.length],
      votes: status === 'idea' ? 7 + ((index * 11) % 89) : 18 + ((index * 17) % 121),
      quarter: status === 'idea' ? undefined : generatedQuarters[index % generatedQuarters.length],
    });
  };

  while (categorized.length) {
    const first = categorized.shift();
    if (!first) break;
    const secondIndex = categorized.findIndex((category) => category !== first);
    const second = secondIndex >= 0 ? categorized.splice(secondIndex, 1)[0] : undefined;
    addIdea(second ? [first, second] : [first]);
  }
  for (const category of uncategorized) addIdea([category]);

  return generated;
}

const initialIdeas: Idea[] = [...featuredIdeas, ...createBacklogIdeas(featuredIdeas)];

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'user', label: 'Идеи пользователей' },
  { id: 'progress', label: 'В работе' },
  { id: 'planned', label: 'Запланировано' },
  { id: 'ready', label: 'Уже доступно' },
  { id: 'archive', label: 'Архив' },
  { id: 'mine', label: 'Мои идеи' },
];

function Header() {
  return (
    <header className="topbar">
      <div className="topbar__main">
        <a href={appPath('')} aria-label="Перейти на главную страницу макетов">
          <img className="topbar__logo" src={appPath('assets/logo-hub.svg')} alt="N1 Hub" />
        </a>
        <nav className="topbar__nav" aria-label="Основная навигация">
          <button className="nav-link nav-link--services" type="button">
            Все сервисы
            <IconArrowDown size="xs" view="primary" />
          </button>
          <button className="nav-link" type="button">Тарифы</button>
          <button className="nav-link" type="button">Дата-платформа</button>
          <button className="nav-link nav-link--active" type="button">Бэклог N1</button>
          <button className="nav-link" type="button">База знаний</button>
        </nav>
      </div>
      <div className="topbar__actions">
        <Button size="s" label="Мои проекты" className="projects-button" />
        <button className="user-control" type="button" aria-label="Открыть профиль Максима Дмитриева">
          <Avatar name="Максим Дмитриев" size="s" className="user-control__avatar" />
          <span>Максим Дмитриев</span>
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="page-title">
      <div className="hero__title-row">
        <Button
          view="ghost"
          size="s"
          onlyIcon
          iconLeft={IconArrowLeft}
          aria-label="Назад"
          className="back-button"
          onClick={() => { window.location.href = appPath(''); }}
        />
        <Text as="h1" id="page-title" size="l" lineHeight="m" weight="regular">
          Бэклог N1
        </Text>
      </div>
      <Text as="p" className="hero__copy" size="s" lineHeight="m">
        Здесь вы можете повлиять на развитие сервисов платформы. Голосуйте за нужные вашей команде фичи
        <br className="hero__line-break" /> или предложите свою идею, если не нашли её в списке. Мы приоритизируем бэклог на основе ваших голосов.
      </Text>
    </section>
  );
}

type SidebarProps = {
  isAdmin: boolean;
  activeTab: TabId | null;
  activeCategory: Category | null;
  counts: Record<TabId, number>;
  totalIdeas: number;
  categoryCounts: Record<Category, number>;
  onTabChange: (tab: TabId) => void;
  onCategoryChange: (category: Category | null) => void;
};

function Sidebar({
  isAdmin,
  activeTab,
  activeCategory,
  counts,
  totalIdeas,
  categoryCounts,
  onTabChange,
  onCategoryChange,
}: SidebarProps) {
  const orderedCategories = useMemo(
    () =>
      [...categories].sort(
        (first, second) => Number(categoryCounts[first] === 0) - Number(categoryCounts[second] === 0),
      ),
    [categoryCounts],
  );

  return (
    <aside className="sidebar" aria-label="Фильтры идей">
      <nav className="sidebar__nav">
        {tabs.filter((tab) => tab.id !== 'archive' || isAdmin).map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              className={`side-tab${active ? ' side-tab--active' : ''}`}
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={active ? 'page' : undefined}
            >
              <span className="side-tab__label">{tab.label}</span>
              <Badge label={String(counts[tab.id])} size="s" view="tinted" status="system" />
            </button>
          );
        })}
      </nav>
      <div className="category-filter">
        <Text className="category-filter__title" size="s" lineHeight="m" weight="semibold">
          Категории
        </Text>
        <div className="category-filter__list" role="group" aria-label="Фильтрация по категориям">
          <button
            className={`category-option${activeTab === null && activeCategory === null ? ' category-option--active' : ''}`}
            type="button"
            onClick={() => onCategoryChange(null)}
            aria-pressed={activeTab === null && activeCategory === null}
          >
            <span>Все категории</span>
            <Badge label={String(totalIdeas)} size="xs" view="tinted" status="system" />
          </button>
          {orderedCategories.map((category) => {
            const count = categoryCounts[category];
            const active = activeTab === null && activeCategory === category;
            return (
              <button
                className={`category-option${active ? ' category-option--active' : ''}`}
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                aria-pressed={active}
                disabled={count === 0}
              >
                <span>{category}</span>
                <Badge
                  label={String(count)}
                  size="xs"
                  view="tinted"
                  status={count === 0 ? 'disabled' : 'system'}
                />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

type IdeaCardProps = {
  idea: Idea;
  selected: boolean;
  showStatus: boolean;
  onOpen: (id: number) => void;
  onVote: (id: number) => void;
};

function IdeaCard({ idea, selected, showStatus, onOpen, onVote }: IdeaCardProps) {
  const meta = statusMeta[idea.status];
  const canVote = !idea.archived && !['moderation', 'rejected', 'ready'].includes(idea.status);

  const openFromKeyboard = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.currentTarget !== event.target || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onOpen(idea.id);
  };

  return (
    <article
      className={`idea-card${selected ? ' idea-card--selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Открыть идею: ${idea.title}`}
      onClick={() => onOpen(idea.id)}
      onKeyDown={openFromKeyboard}
    >
      <Text className="idea-card__title" size="s" lineHeight="m">
        {idea.title}
      </Text>
      <div className="idea-card__meta">
        <div className="idea-card__labels">
          {showStatus && idea.status !== 'idea' ? (
            <Badge label={meta.label} size="m" view="stroked" status={meta.badgeStatus} />
          ) : null}
          {idea.categories.slice(0, 2).map((category) => (
            <Tag key={category} label={category} mode="info" size="s" />
          ))}
          {idea.quarter ? (
            <Badge label={idea.quarter} size="m" view="tinted" status="normal" />
          ) : null}
        </div>
        {canVote ? (
          <div className={`vote${idea.voted ? ' vote--active' : ''}`}>
            <Text as="span" size="m" lineHeight="m" weight="semibold" view={idea.voted ? 'link' : 'secondary'}>
              {idea.votes}
            </Text>
            <Button
              size="xs"
              view={idea.voted ? 'primary' : 'secondary'}
              onlyIcon
              iconLeft={IconThumbUp}
              onClick={(event) => {
                event.stopPropagation();
                onVote(idea.id);
              }}
              aria-label={idea.voted ? 'Убрать голос' : 'Проголосовать за идею'}
              className="vote__button"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

type IdeaDetailsProps = {
  idea: Idea;
  onClose: () => void;
  onReject: (id: number, comment: string) => void;
  onPublish: (id: number) => void;
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
  onEdit: (id: number) => void;
};

function IdeaDetails({ idea, onClose, onReject, onPublish, onArchive, onRestore, onEdit }: IdeaDetailsProps) {
  const meta = statusMeta[idea.status];
  const [rejectionMode, setRejectionMode] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');
  const [rejectionError, setRejectionError] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <aside className="details-panel" aria-labelledby="details-panel-title">
      <header className="details-panel__header">
        <Text as="h2" id="details-panel-title" size="m" lineHeight="m" weight="semibold">
          Идея
        </Text>
        <Button
          size="s"
          view="clear"
          onlyIcon
          iconLeft={IconClose}
          aria-label="Закрыть информацию об идее"
          onClick={onClose}
        />
      </header>
      <div className="details-panel__body">
        <section className="detail-field">
          <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Название</Text>
          <Text size="m" lineHeight="m">{idea.title}</Text>
        </section>
        <section className="detail-field">
          <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Категория</Text>
          <div className="detail-field__tags">
            {idea.categories.map((category) => (
              <Tag key={category} label={category} mode="info" size="m" />
            ))}
          </div>
        </section>
        <section className="detail-field">
          <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Описание</Text>
          <Text size="m" lineHeight="m">{idea.description}</Text>
        </section>
        {idea.status !== 'idea' || idea.archived ? (
          <section className="detail-field">
            <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Статус записи</Text>
            <div>
              <Badge label={meta.label} size="m" view="stroked" status={meta.badgeStatus} />
            </div>
          </section>
        ) : null}
        {idea.archived ? (
          <section className="detail-field">
            <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Архив</Text>
            <Text size="m" lineHeight="m">Запись архивирована с сохранением текущего статуса.</Text>
          </section>
        ) : null}
        {idea.status === 'rejected' && idea.rejectionComment ? (
          <section className="detail-field detail-field--rejection">
            <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Комментарий администратора</Text>
            <Text size="m" lineHeight="m">{idea.rejectionComment}</Text>
          </section>
        ) : null}
        {idea.quarter ? (
          <section className="detail-field">
            <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Квартал реализации</Text>
            <Text size="m" lineHeight="m">{idea.quarter}</Text>
          </section>
        ) : null}
        <section className="detail-field">
          <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Автор</Text>
          <div className="detail-author">
            <Avatar name={idea.author} size="s" />
            <Text size="m" lineHeight="m">{idea.author}</Text>
          </div>
        </section>
        <section className="detail-field">
          <Text className="detail-field__label" size="m" lineHeight="m" view="secondary">Количество голосов</Text>
          <Text size="m" lineHeight="m" weight="semibold">{idea.votes}</Text>
        </section>
      </div>
      {currentUser.isAdmin ? (
        <footer className="details-panel__footer details-panel__footer--stacked">
          {idea.status === 'moderation' && !rejectionMode ? (
            <div className="details-panel__footer-row">
              <Button size="m" view="ghost" label="Отклонить" onClick={() => setRejectionMode(true)} />
              <Button size="m" label="Опубликовать" onClick={() => onPublish(idea.id)} />
            </div>
          ) : null}
          {idea.status === 'moderation' && rejectionMode ? (
            <div className="details-panel__rejection-form">
              <TextField
                type="textarea"
                rows={3}
                label="Комментарий к отклонению"
                value={rejectionComment}
                onChange={(value) => {
                  setRejectionComment(value ?? '');
                  setRejectionError(false);
                }}
                status={rejectionError ? 'alert' : undefined}
                caption={rejectionError ? 'Комментарий обязателен' : undefined}
              />
              <div className="details-panel__footer-row">
                <Button size="m" view="ghost" label="Отмена" onClick={() => setRejectionMode(false)} />
                <Button
                  size="m"
                  label="Подтвердить отклонение"
                  onClick={() => {
                    const comment = rejectionComment.trim();
                    if (!comment) {
                      setRejectionError(true);
                      return;
                    }
                    onReject(idea.id, comment);
                  }}
                />
              </div>
            </div>
          ) : null}
          <div className="details-panel__footer-row">
            <Button
              size="m"
              view="ghost"
              label={idea.archived ? 'Вернуть из архива' : 'Архивировать'}
              onClick={() => (idea.archived ? onRestore(idea.id) : onArchive(idea.id))}
            />
            <Button size="m" label="Редактировать" onClick={() => onEdit(idea.id)} />
          </div>
        </footer>
      ) : null}
    </aside>
  );
}

type IdeaModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: Pick<Idea, 'title' | 'description' | 'categories'>) => void;
};

function IdeaModal({ open, onClose, onSubmit }: IdeaModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>([]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setSelectedCategories([]);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription || selectedCategories.length === 0) return;
    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription,
      categories: selectedCategories.map((category) => category.id),
    });
    reset();
  };

  const canSubmit = Boolean(title.trim() && description.trim() && selectedCategories.length);

  return (
    <Modal
      isOpen={open}
      onClickOutside={close}
      onEsc={close}
      hasOverlay
      style={{ zIndex: 100 }}
      className="idea-modal"
      aria-labelledby="idea-modal-title"
    >
      <div className="idea-modal__content">
        <div>
          <Text as="h2" id="idea-modal-title" size="xl" lineHeight="m" weight="semibold">
            Предложить идею
          </Text>
          <Text as="p" size="s" lineHeight="m" view="secondary" className="idea-modal__hint">
            Коротко опишите, что стоит добавить или улучшить в сервисах N1.
          </Text>
        </div>
        <TextField
          label="Название идеи"
          placeholder="Кратко сформулируйте идею"
          value={title}
          onChange={(value) => setTitle(value ?? '')}
          autoFocus
        />
        <Combobox
          label="Категории"
          items={categoryOptions}
          value={selectedCategories}
          onChange={(value) => setSelectedCategories(value ?? [])}
          placeholder="Выберите одну или несколько категорий"
          multiple
          selectAll
          size="m"
          dropdownClassName="backlog-combobox-dropdown"
        />
        <TextField
          type="textarea"
          rows={4}
          label="Описание идеи"
          placeholder="Опишите проблему и ожидаемый результат"
          value={description}
          onChange={(value) => setDescription(value ?? '')}
        />
        <div className="idea-modal__actions">
          <Button label="Отмена" view="ghost" onClick={close} />
          <Button label="Отправить" onClick={submit} disabled={!canSubmit} />
        </div>
      </div>
    </Modal>
  );
}

type AdminFeatureDraft = Pick<Idea, 'title' | 'description' | 'categories' | 'quarter'> & {
  status: IdeaStatus;
};

type AdminFeaturePanelProps = {
  initialIdea?: Idea;
  onClose: () => void;
  onSubmit: (draft: AdminFeatureDraft) => void;
};

function AdminFeaturePanel({ initialIdea, onClose, onSubmit }: AdminFeaturePanelProps) {
  const initialStatus = initialIdea
    ? featureStatusOptions.find((option) => option.id === initialIdea.status) ?? defaultFeatureStatus
    : defaultFeatureStatus;
  const isEditing = Boolean(initialIdea);
  const [title, setTitle] = useState(initialIdea?.title ?? '');
  const [status, setStatus] = useState<StatusOption | null>(initialStatus);
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>(() =>
    initialIdea
      ? categoryOptions.filter((option) => initialIdea.categories.includes(option.id))
      : [],
  );
  const [quarter, setQuarter] = useState(initialIdea?.quarter ?? '');
  const [description, setDescription] = useState(initialIdea?.description ?? '');
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const reset = () => {
    setTitle('');
    setStatus(defaultFeatureStatus);
    setSelectedCategories([]);
    setQuarter('');
    setDescription('');
    setShowErrors(false);
  };

  const canSubmit = Boolean(
    title.trim() &&
      status &&
      selectedCategories.length &&
      description.trim(),
  );

  const submit = (addAnother: boolean) => {
    if (!canSubmit || !status) {
      setShowErrors(true);
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      categories: selectedCategories.map((category) => category.id),
      status: status.id,
      quarter: quarter.trim() || undefined,
    });
    if (addAnother) {
      reset();
    } else {
      onClose();
    }
  };

  return (
    <aside className="details-panel feature-editor" aria-labelledby="feature-editor-title">
      <header className="details-panel__header">
        <Text as="h2" id="feature-editor-title" size="m" lineHeight="m" weight="semibold">
          {isEditing ? 'Редактирование фичи' : 'Добавление фичи'}
        </Text>
        <Button
          size="s"
          view="clear"
          onlyIcon
          iconLeft={IconClose}
          aria-label={isEditing ? 'Закрыть форму редактирования' : 'Закрыть форму добавления фичи'}
          onClick={onClose}
        />
      </header>
      <div className="details-panel__body feature-editor__body">
        <TextField
          type="textarea"
          rows={2}
          label="Название"
          placeholder="Название фичи"
          value={title}
          onChange={(value) => setTitle(value ?? '')}
          status={showErrors && !title.trim() ? 'alert' : undefined}
          caption={showErrors && !title.trim() ? 'Заполните название' : undefined}
          autoFocus
        />
        <Combobox
          label="Статус"
          items={featureStatusOptions}
          value={status}
          onChange={setStatus}
          placeholder="Выберите статус"
          status={showErrors && !status ? 'alert' : undefined}
          caption={showErrors && !status ? 'Выберите статус' : undefined}
          size="m"
          dropdownClassName="backlog-combobox-dropdown"
        />
        <Combobox
          label="Категория"
          items={categoryOptions}
          value={selectedCategories}
          onChange={(value) => setSelectedCategories(value ?? [])}
          placeholder="Выберите категории"
          status={showErrors && selectedCategories.length === 0 ? 'alert' : undefined}
          caption={showErrors && selectedCategories.length === 0 ? 'Выберите хотя бы одну категорию' : undefined}
          multiple
          selectAll
          size="m"
          dropdownClassName="backlog-combobox-dropdown"
        />
        <TextField
          label="Квартал"
          placeholder="Q3 2027"
          value={quarter}
          onChange={(value) => setQuarter(value ?? '')}
        />
        <TextField
          className="feature-editor__description"
          type="textarea"
          rows={6}
          label="Описание"
          placeholder="Опишите фичу"
          value={description}
          onChange={(value) => setDescription(value ?? '')}
          status={showErrors && !description.trim() ? 'alert' : undefined}
          caption={showErrors && !description.trim() ? 'Заполните описание' : undefined}
        />
      </div>
      <footer className={`details-panel__footer feature-editor__footer${isEditing ? ' feature-editor__footer--editing' : ''}`}>
        {isEditing ? (
          <Button size="m" label="Сохранить" onClick={() => submit(false)} />
        ) : (
          <>
            <Button
              size="m"
              view="ghost"
              label="Добавить ещё"
              iconLeft={IconAdd}
              onClick={() => submit(true)}
            />
            <Button size="m" label="Добавить" onClick={() => submit(false)} />
          </>
        )}
      </footer>
    </aside>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabId | null>('user');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState('');
  const [ideas, setIdeas] = useState(initialIdeas);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState<number | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<SnackBarItemDefault[]>([]);

  const { counts, categoryCounts, visibleTotal } = useMemo(() => {
    const nextCounts: Record<TabId, number> = {
      user: 0,
      progress: 0,
      planned: 0,
      ready: 0,
      archive: 0,
      mine: 0,
    };
    const nextCategoryCounts = Object.fromEntries(
      categories.map((category) => [category, 0]),
    ) as Record<Category, number>;
    for (const idea of ideas) {
      if (!canViewIdea(idea)) continue;
      if (idea.archived) {
        nextCounts.archive += 1;
        continue;
      }
      if (idea.status === 'idea') {
        nextCounts.user += 1;
      } else if (idea.status !== 'moderation' && idea.status !== 'rejected') {
        nextCounts[idea.status] += 1;
      }
      if (idea.author === currentUser.name) nextCounts.mine += 1;
      for (const category of idea.categories) nextCategoryCounts[category] += 1;
    }
    return {
      counts: nextCounts,
      categoryCounts: nextCategoryCounts,
      visibleTotal: ideas.filter((idea) => canViewIdea(idea) && !idea.archived).length,
    };
  }, [ideas]);

  const activeFilterLabel =
    activeTab === null
      ? activeCategory ?? 'Все категории'
      : tabs.find((tab) => tab.id === activeTab)?.label ?? 'Идеи пользователей';
  const selectedIdea = selectedIdeaId === null ? undefined : ideas.find((idea) => idea.id === selectedIdeaId);
  const editingIdea = editingIdeaId === null ? undefined : ideas.find((idea) => idea.id === editingIdeaId);

  const visibleIdeas = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru');
    return ideas
      .filter((idea) => {
        if (!canViewIdea(idea)) return false;
        const matchesFilter =
          activeTab === 'archive'
            ? Boolean(idea.archived)
            : activeTab === null
            ? !idea.archived && (activeCategory === null || idea.categories.includes(activeCategory))
            : activeTab === 'user'
              ? !idea.archived && idea.status === 'idea'
              : activeTab === 'mine'
                ? !idea.archived && idea.author === currentUser.name
                : !idea.archived && idea.status === activeTab;
        if (!matchesFilter) return false;
        if (!normalizedQuery) return true;
        const searchableText = [
          idea.title,
          idea.description,
          idea.author,
          ...idea.categories,
          statusMeta[idea.status].label,
          idea.quarter ?? '',
        ]
          .join(' ')
          .toLocaleLowerCase('ru');
        return searchableText.includes(normalizedQuery);
      })
      .sort((first, second) => statusSortOrder[first.status] - statusSortOrder[second.status]);
  }, [activeCategory, activeTab, ideas, query]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setActiveCategory(null);
    setSelectedIdeaId(null);
  };

  const handleCategoryChange = (category: Category | null) => {
    setActiveTab(null);
    setActiveCategory(category);
    setSelectedIdeaId(null);
  };

  const handleVote = (id: number) => {
    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === id
          ? { ...idea, voted: !idea.voted, votes: idea.votes + (idea.voted ? -1 : 1) }
          : idea,
      ),
    );
  };

  const handleOpenIdea = (id: number) => {
    setAdminPanelOpen(false);
    setEditingIdeaId(null);
    setSelectedIdeaId(id);
  };

  const handleNewIdea = (draft: Pick<Idea, 'title' | 'description' | 'categories'>) => {
    const newIdea: Idea = {
      id: Date.now(),
      ...draft,
      status: 'moderation',
      author: currentUser.name,
      votes: 0,
      isMine: true,
    };
    setIdeas((currentIdeas) => [newIdea, ...currentIdeas]);
    setModalOpen(false);
    setEditingIdeaId(null);
    setActiveTab('mine');
    setActiveCategory(null);
    setSelectedIdeaId(newIdea.id);
  };

  const handleAddFeature = (draft: AdminFeatureDraft) => {
    const notificationKey = Date.now();
    const newFeature: Idea = {
      id: notificationKey,
      ...draft,
      author: currentUser.name,
      votes: 0,
    };
    setIdeas((currentIdeas) => [newFeature, ...currentIdeas]);
    setNotifications((currentNotifications) => [
      ...currentNotifications,
      {
        key: notificationKey,
        message: `Фича «${draft.title}» успешно добавлена`,
        status: 'success',
        autoClose: 3500,
        showProgress: 'line',
      },
    ]);
  };

  const removeNotification = (notification: SnackBarItemDefault) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((item) => item.key !== notification.key),
    );
  };

  const handlePublish = (id: number) => {
    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === id ? { ...idea, status: 'idea', rejectionComment: undefined } : idea,
      ),
    );
  };

  const handleArchive = (id: number) => {
    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) => (idea.id === id ? { ...idea, archived: true } : idea)),
    );
    setSelectedIdeaId(null);
  };

  const handleRestore = (id: number) => {
    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) => (idea.id === id ? { ...idea, archived: false } : idea)),
    );
    setSelectedIdeaId(null);
  };

  const handleEdit = (id: number) => {
    setSelectedIdeaId(null);
    setEditingIdeaId(id);
    setAdminPanelOpen(true);
  };

  const handleUpdateFeature = (id: number, draft: AdminFeatureDraft) => {
    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              ...draft,
              rejectionComment: draft.status === 'rejected' ? idea.rejectionComment : undefined,
            }
          : idea,
      ),
    );
    const notificationKey = Date.now();
    setNotifications((currentNotifications) => [
      ...currentNotifications,
      {
        key: notificationKey,
        message: `Фича «${draft.title}» успешно обновлена`,
        status: 'success',
        autoClose: 3500,
        showProgress: 'line',
      },
    ]);
  };

  const handleReject = (id: number, comment: string) => {
    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === id ? { ...idea, status: 'rejected', rejectionComment: comment } : idea,
      ),
    );
  };

  return (
    <Theme preset={presetGpnDefault} className="app-theme">
      <Header />
      <Hero />
      <div className="workspace">
        <Sidebar
          isAdmin={currentUser.isAdmin}
          activeTab={activeTab}
          activeCategory={activeCategory}
          counts={counts}
          totalIdeas={visibleTotal}
          categoryCounts={categoryCounts}
          onTabChange={handleTabChange}
          onCategoryChange={handleCategoryChange}
        />
        <main className="content">
          <div className="content__heading">
            <Text as="h2" size="m" lineHeight="m" weight="semibold">
              {activeFilterLabel}
            </Text>
            <div className="content__actions">
              {currentUser.isAdmin ? (
                <Button
                  size="s"
                  view="secondary"
                  label="Добавить"
                  iconLeft={IconAdd}
                  iconSize="xs"
                  aria-label="Добавить фичу как администратор"
                  onClick={() => {
                    setSelectedIdeaId(null);
                    setEditingIdeaId(null);
                    setAdminPanelOpen(true);
                  }}
                />
              ) : null}
              <Button
                size="s"
                label="Предложить идею"
                iconLeft={IconAdd}
                iconSize="xs"
                onClick={() => {
                  setAdminPanelOpen(false);
                  setEditingIdeaId(null);
                  setModalOpen(true);
                }}
                className="suggest-button"
              />
            </div>
          </div>
          <TextField
            className="search-field"
            size="s"
            leftSide={IconSearchStroked}
            placeholder="Найти по названию, категории, автору или статусу"
            ariaLabel="Поиск по идеям"
            value={query}
            onChange={(value) => setQuery(value ?? '')}
            withClearButton
          />
          <section className="idea-list" aria-label={activeFilterLabel} aria-live="polite">
            {visibleIdeas.length ? (
              visibleIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  selected={idea.id === selectedIdeaId}
                  showStatus={activeTab === null || activeTab === 'mine' || activeTab === 'archive'}
                  onOpen={handleOpenIdea}
                  onVote={handleVote}
                />
              ))
            ) : (
              <div className="empty-state">
                <Text size="m" lineHeight="m" weight="semibold">Идей не найдено</Text>
                <Text size="s" lineHeight="m" view="secondary">Попробуйте изменить запрос или выбрать другой раздел.</Text>
              </div>
            )}
          </section>
        </main>
      </div>
      {selectedIdea ? (
        <IdeaDetails
          idea={selectedIdea}
          onClose={() => setSelectedIdeaId(null)}
          onReject={handleReject}
          onPublish={handlePublish}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onEdit={handleEdit}
        />
      ) : null}
      {adminPanelOpen ? (
        <AdminFeaturePanel
          key={editingIdea?.id ?? 'create'}
          initialIdea={editingIdea}
          onClose={() => {
            setAdminPanelOpen(false);
            setEditingIdeaId(null);
          }}
          onSubmit={editingIdea ? (draft) => handleUpdateFeature(editingIdea.id, draft) : handleAddFeature}
        />
      ) : null}
      {notifications.length ? (
        <SnackBar
          className="admin-snackbar"
          items={notifications}
          onItemClose={removeNotification}
          onItemAutoClose={removeNotification}
        />
      ) : null}
      <IdeaModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleNewIdea} />
    </Theme>
  );
}
