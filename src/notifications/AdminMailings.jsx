import React,{useMemo,useState} from 'react';
import {Button} from '@consta/uikit/Button';
import {Text} from '@consta/uikit/Text';
import {Select} from '@consta/uikit/Select';
import {TextField} from '@consta/uikit/TextField';
import {Checkbox} from '@consta/uikit/Checkbox';
import {Tabs} from '@consta/uikit/Tabs';
import {Table} from '@consta/uikit/Table';
import {Pagination} from '@consta/uikit/Pagination';
import {Modal} from '@consta/uikit/Modal';
import {IconAdd} from '@consta/icons/IconAdd';
import {IconClose} from '@consta/icons/IconClose';
import {IconCopy} from '@consta/icons/IconCopy';
import {IconSearchStroked} from '@consta/icons/IconSearchStroked';
import {mailingLists,mailingGroups,mailingLabel,defaultMailingId,adminKey,normalizeAdmin,recipients,readJSON,parseEmails,validEmail} from './model';
import CopyMailingDialog from './CopyMailingDialog';
const PAGE_SIZE=8;
const fmt=number=>number.toLocaleString('ru');
const addressKinds=[{id:'person',label:'Пользователь N1'},{id:'technical',label:'Технический адрес'}];
export default function AdminMailings({preferences}){
 const [admin,setAdmin]=useState(()=>normalizeAdmin(readJSON(adminKey,null)));
 const [page,setPage]=useState(0),[copyOpen,setCopyOpen]=useState(false);
 const [list,setList]=useState(mailingLists.find(item=>item.id===defaultMailingId)),[tab,setTab]=useState('Получатели'),[query,setQuery]=useState('');
 const [dialog,setDialog]=useState(null),[addresses,setAddresses]=useState(''),[kind,setKind]=useState(addressKinds[0]),[targets,setTargets]=useState([]),[reason,setReason]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState('');
 const records=useMemo(()=>recipients(list.id,preferences,admin),[list.id,preferences,admin]);
 const included=records.filter(record=>record.included),excluded=records.filter(record=>record.omitted);
 const filtered=(tab==='Получатели'?included:excluded).filter(record=>(record.name+' '+record.email).toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')));
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),currentPage=Math.min(page,pages-1);
 const rows=filtered.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE).map(record=>({...record,id:record.email}));
 function persist(next,confirmation){try{localStorage.setItem(adminKey,JSON.stringify(next));setAdmin(next);setDialog(null);setError('');setMessage(confirmation);}catch{setError('Не удалось сохранить изменения в браузере.');}}
 function open(type,record){setDialog({type,record});setAddresses(record?.email||'');setTargets([list.id]);setKind(addressKinds[0]);setReason('');setError('');setMessage('');}
 function add(){const emails=parseEmails(addresses);if(!emails.length||emails.some(email=>!validEmail(email))){setError('Введите корректные почтовые адреса.');return;}if(!targets.length){setError('Выберите хотя бы одну рассылку.');return;}
 for(const target of targets){const targetRecords=new Map(recipients(target,preferences,admin).map(record=>[record.email,record]));for(const email of emails){const record=targetRecords.get(email);if(record?.protected&&record.omitted){setError(`${email}: пользователь отказался от выбранной рассылки.`);return;}if(Object.hasOwn(admin.excluded[target]||{},email)){setError(`${email}: сначала удалите исключение в выбранной рассылке.`);return;}}}
 const next=structuredClone(admin);for(const target of targets){next.manual[target]??={};for(const email of emails)next.manual[target][email]=kind.label;}persist(next,'Адреса добавлены в выбранные рассылки.');}
 function exclude(){const email=addresses.toLowerCase().trim();if(!validEmail(email)){setError('Введите корректный почтовый адрес.');return;}if(records.find(record=>record.email===email)?.protected){setError('Личные настройки пользователя имеют приоритет. Изменить их может только он сам.');return;}const next=structuredClone(admin);next.excluded[list.id]??={};next.excluded[list.id][email]=reason.trim();persist(next,'Исключение добавлено.');setTab('Исключения');setPage(0);}
 function restore(record){const next=structuredClone(admin);delete next.excluded[list.id]?.[record.email];persist(next,'Исключение удалено.');}
 const columns=[{title:'Получатель',accessor:'name',renderCell:record=><div className="mailing-recipient"><Text size="s">{record.name}</Text><Text size="xs" view="secondary">{record.email}</Text></div>},{title:'Тип адреса',accessor:'kind',renderCell:record=><Text size="s">{record.kind}</Text>},{title:'Источник',accessor:'source',renderCell:record=><div className="mailing-recipient"><Text size="s">{record.source}</Text>{record.reason&&<Text size="xs" view="secondary">{record.reason}</Text>}</div>},{title:'Действия',accessor:'id',renderCell:record=>record.protected?null:<div className="mailing-row-actions">{tab==='Исключения'?<Button size="xs" view="clear" label="Вернуть" onClick={()=>restore(record)}/>:<Button size="xs" view="clear" label="Исключить" onClick={()=>open('exclude',record)}/>}</div>}];
 const title=dialog?.type==='add'?'Добавить адреса':'Добавить исключение';
 return <section className="mailing-admin" aria-label="Управление списками рассылок"><div className="mailing-admin-top"><Select size="s" label="Рассылка" aria-label="Рассылка" items={mailingLists} groups={mailingGroups} dropdownClassName="mailing-admin-dropdown" value={list} onChange={value=>{if(value){setList(value);setQuery('');setMessage('');setPage(0);}}}/><Button size="s" iconLeft={IconAdd} label="Добавить адреса" onClick={()=>open('add')}/></div>
 <div className="mailing-policy"><Text size="s" view="secondary">Личные настройки пользователя имеют приоритет. Нельзя включить рассылку после его отказа или исключить пользователя, если он включил её самостоятельно.</Text></div>
 <Tabs size="m" value={tab} onChange={value=>{setTab(value);setMessage('');setPage(0);}} items={['Получатели','Исключения']} getItemKey={value=>value} getItemLabel={value=>`${value} · ${fmt(value==='Получатели'?included.length:excluded.length)}`}/>
 <div className="mailing-admin-toolbar"><TextField size="s" value={query} onChange={value=>{setQuery(value||'');setPage(0);}} placeholder="Найти по имени или адресу" aria-label="Найти получателя" leftSide={IconSearchStroked} withClearButton/><Button size="s" view="secondary" iconLeft={IconCopy} label="Копировать список" onClick={()=>setCopyOpen(true)}/><Button size="s" view="secondary" label="Добавить исключение" onClick={()=>open('exclude')}/></div>
 {message&&<Text as="p" size="s" view="success" role="status" className="mailing-admin-message">{message}</Text>}{error&&!dialog&&<Text as="p" size="s" view="alert" role="alert">{error}</Text>}
 {rows.length?<><div className="mailing-table-scroll"><Table size="s" verticalAlign="top" headerVerticalAlign="center" rows={rows} columns={columns} borderBetweenColumns={false} borderBetweenRows/></div><div className="mailing-pagination"><Text size="xs" view="secondary">{fmt(currentPage*PAGE_SIZE+1)}–{fmt(Math.min((currentPage+1)*PAGE_SIZE,filtered.length))} из {fmt(filtered.length)}</Text><Pagination size="s" type="input" value={currentPage+1} items={pages} onChange={value=>setPage(value-1)} arrows={[{label:'Предыдущая страница'},{label:'Следующая страница'}]} getTotalLabel={count=>`из ${fmt(count)}`}/></div></>:<div className="mailing-empty"><Text size="m">{query?'Получатели не найдены':'Список пуст'}</Text><Text size="s" view="secondary">{query?'Попробуйте изменить запрос.':'В этой рассылке пока нет таких адресов.'}</Text></div>}
 {dialog&&<Modal isOpen hasOverlay onEsc={()=>setDialog(null)} onClickOutside={()=>setDialog(null)} className="mailing-modal" style={{zIndex:1200}} role="dialog" aria-modal="true" aria-labelledby="mailing-dialog-title"><div className="mailing-modal-head"><Text as="h2" size="xl" weight="medium" id="mailing-dialog-title">{title}</Text><Button size="s" view="clear" onlyIcon iconLeft={IconClose} label="Закрыть окно" onClick={()=>setDialog(null)}/></div><div className="mailing-modal-body">
 {dialog.type==='add'?<><TextField size="s" type="textarea" rows={4} label="Почтовые адреса" value={addresses} onChange={value=>setAddresses(value||'')} placeholder="name@example.test" caption="Каждый адрес с новой строки, через запятую или точку с запятой"/><Select size="s" label="Тип новых адресов" items={addressKinds} dropdownClassName="mailing-admin-dropdown" value={kind} onChange={value=>value&&setKind(value)}/><Text size="s" view="secondary">Рассылки</Text><Checkbox size="s" label="Выбрать все рассылки" checked={targets.length===mailingLists.length} intermediate={targets.length>0&&targets.length<mailingLists.length} onChange={event=>setTargets(event.target.checked?mailingLists.map(item=>item.id):[])}/><div className="mailing-targets">{mailingLists.map(item=><Checkbox size="s" key={item.id} label={mailingLabel(item)} checked={targets.includes(item.id)} onChange={event=>setTargets(previous=>event.target.checked?[...previous,item.id]:previous.filter(id=>id!==item.id))}/>)}</div></>:<><Text size="s" view="secondary">Рассылка: {mailingLabel(list)}</Text><TextField size="s" label="Почтовый адрес" value={addresses} onChange={value=>setAddresses(value||'')} placeholder="name@example.test"/><TextField size="s" type="textarea" rows={3} label="Причина · необязательно" value={reason} onChange={value=>setReason(value||'')} placeholder="Укажите причину исключения"/></>}
 {error&&<Text size="s" view="alert" role="alert">{error}</Text>}</div><div className="mailing-modal-foot"><Button size="s" view="ghost" label="Отменить" onClick={()=>setDialog(null)}/><Button size="s" label={dialog.type==='add'?'Добавить':'Добавить исключение'} onClick={dialog.type==='add'?add:exclude}/></div></Modal>}
 {copyOpen&&<CopyMailingDialog emails={(tab==='Получатели'?included:excluded).map(record=>record.email)} label={`${mailingLabel(list)} · ${tab}`} onClose={()=>setCopyOpen(false)}/>}
 </section>;
}
