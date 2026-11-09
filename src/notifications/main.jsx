import {appPath} from '../paths';
import React,{useState,useEffect,lazy,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {Theme,presetGpnDefault} from '@consta/uikit/Theme';
import {Button} from '@consta/uikit/Button';
import {Text} from '@consta/uikit/Text';
import {Select} from '@consta/uikit/Select';
import UserMenu from '../UserMenu';
import {IconBackward} from '@consta/icons/IconBackward';
import {IconArrowDown} from '@consta/icons/IconArrowDown';
import {preferenceKey,roleOptions,normalizePreferences,validPreferences,readJSON} from './model';
import PersonalMailings from './PersonalMailings';
import Guest from './Guest';
import '../style.css';
import './notifications.css';
const AdminMailings=lazy(()=>import('./AdminMailings'));
const home='https://n1-prototype-lime.vercel.app';
function Header(){return <header className="header"><a href={home+'/'} className="logo" aria-label="N1 Hub"><img src={appPath('logo.png')} alt="N1 Hub"/></a><nav aria-label="Основная навигация"><a href={home+'/catalog.html'}>Все сервисы <IconArrowDown size="xs"/></a><a href={home+'/pricing.html'}>Тарифы</a><span>Дата-платформа</span><a href={home+'/backlog.html'}>Бэклог N1</a><span>База знаний</span></nav><div className="header-user"><Button size="s" label="Мои проекты" onClick={()=>location.href=home+'/projects.html'}/><UserMenu/></div></header>;}
function App(){
 const [role,setRole]=useState(roleOptions[0]);
 const [preferences,setPreferences]=useState(()=>normalizePreferences(readJSON(preferenceKey,null)));
 const [saveError,setSaveError]=useState(false);
 useEffect(()=>{if(!validPreferences(preferences))return;try{localStorage.setItem(preferenceKey,JSON.stringify(preferences));setSaveError(false);}catch{setSaveError(true);}},[preferences]);
 return <Theme preset={presetGpnDefault} className="app-theme notifications-page"><Header/><main className="notifications-main"><div className="container"><div className="notifications-title-row">{role.id!=='guest'&&<Button size="s" view="ghost" onlyIcon iconLeft={IconBackward} label="Вернуться к доступности сервисов" onClick={()=>location.href=appPath()}/>}<h1>{role.id==='admin'?'Списки рассылок':'Настройка уведомлений'}</h1></div>
 {saveError&&role.id==='member'&&<Text as="p" size="s" view="alert" role="alert" className="mailing-error">Не удалось сохранить настройки. Попробуйте ещё раз.</Text>}
 {role.id==='member'?<PersonalMailings preferences={preferences} setPreferences={setPreferences}/>:role.id==='guest'?<Guest/>:<Suspense fallback={<Text size="s" view="secondary">Загружаем списки…</Text>}><AdminMailings preferences={preferences}/></Suspense>}
 </div></main><footer className="notifications-footer"><div>Если есть вопросы или хотите быть в курсе новостей —<br/><a href={home+'/support.html'}>напишите нам</a> или направьте <a href={home+'/support.html#new=1'}>обращение через ЕСО</a>.</div><div>Что нового на N1 Hub — <a href={home+'/changelog.html'}>Release Notes</a>.</div><div>© 2026 ПАО «Газпром нефть»</div></footer><div className="mailing-role-bar" role="region" aria-label="Переключение ролей макета"><Text size="xs" view="secondary">Роль</Text><Select size="s" aria-label="Роль пользователя" dropdownClassName="mailing-role-dropdown" items={roleOptions} value={role} onChange={value=>{if(value){setRole(value);window.scrollTo({top:0});}}} className="mailing-role-select"/><Text size="xs" view="secondary" className="mailing-demo-note">Демонстрационные данные · без отправки писем</Text></div></Theme>;
}
createRoot(document.getElementById('root')).render(<App/>);
