import React,{useState} from 'react';
import {Button} from '@consta/uikit/Button';
import {Card} from '@consta/uikit/Card';
import {Switch} from '@consta/uikit/Switch';
import {Checkbox} from '@consta/uikit/Checkbox';
import {TextField} from '@consta/uikit/TextField';
import {Text} from '@consta/uikit/Text';
import {IconArrowDown} from '@consta/icons/IconArrowDown';
import {IconRing} from '@consta/icons/IconRing';
import {IconMail} from '@consta/icons/IconMail';
import {IconSearchStroked} from '@consta/icons/IconSearchStroked';
import {serviceGroups,validPreferences} from './model';

export default function PersonalMailings({preferences,setPreferences}){
 const [query,setQuery]=useState('');
 const [collapsed,setCollapsed]=useState([]);
 const search=query.trim().toLocaleLowerCase('ru');
 const found=serviceGroups.map(group=>({...group,visible:group.services.filter(service=>(group.label+' '+service.name).toLocaleLowerCase('ru').includes(search))})).filter(group=>group.visible.length);
 const visibleIds=found.flatMap(group=>group.visible.map(service=>service.id));
 const selectedCount=visibleIds.filter(id=>preferences.services.includes(id)).length;
 const invalid=!validPreferences(preferences);
 function toggleServices(ids,checked){
  setPreferences(previous=>({...previous,services:checked?[...new Set([...previous.services,...ids])]:previous.services.filter(id=>!ids.includes(id))}));
 }
 return <div className="mailing-panels">
  <Card as="section" border shadow={false} className="mailing-panel" aria-labelledby="marketing-title">
   <div className="mailing-panel-head">
    <div><div className="mailing-panel-title"><IconMail size="s"/><Text as="h2" size="l" weight="medium" id="marketing-title">Маркетинговые рассылки</Text></div><Text as="p" size="s" view="secondary" className="mailing-description" id="marketing-description">Новости N1 Hub, анонсы мероприятий и полезные материалы о платформе.</Text></div>
    <Switch size="m" checked={preferences.marketing} aria-label="Маркетинговые рассылки" aria-describedby="marketing-description" onChange={event=>setPreferences(previous=>({...previous,marketing:event.target.checked}))}/>
   </div>
  </Card>
  <Card as="section" border shadow={false} className="mailing-panel" aria-labelledby="technical-title">
   <div className="mailing-panel-head">
    <div><div className="mailing-panel-title"><IconRing size="s"/><Text as="h2" size="l" weight="medium" id="technical-title">Технические рассылки</Text></div><Text as="p" size="s" view="secondary" className="mailing-description" id="technical-description">Плановые работы, инциденты и восстановление работы выбранных сервисов.</Text></div>
    <Switch size="m" checked={preferences.technical} aria-label="Технические рассылки" aria-describedby={invalid?'technical-description mailing-selection-error':'technical-description'} onChange={event=>setPreferences(previous=>({...previous,technical:event.target.checked}))}/>
   </div>
   {preferences.technical?<div className="mailing-technical-body">
    <div className="mailing-tools">
     <TextField size="s" value={query} onChange={value=>{setQuery(value||'');if(value?.trim())setCollapsed([]);}} placeholder="Найти сервис или регион" aria-label="Найти сервис или регион" leftSide={IconSearchStroked} withClearButton/>
     <div className="mailing-selection"><Text size="xs" view="secondary">Выбрано: {preferences.services.length}{search?` · Найдено: ${visibleIds.length}`:''}</Text><div className="mailing-selection-actions"><Button size="xs" view="clear" label={search?'Выбрать найденные':'Выбрать все'} disabled={!visibleIds.length||selectedCount===visibleIds.length} onClick={()=>toggleServices(visibleIds,true)}/><Button size="xs" view="clear" label={search?'Снять выбор найденных':'Снять выбор'} disabled={!selectedCount} onClick={()=>toggleServices(visibleIds,false)}/></div></div>
    </div>
    {invalid&&<Text as="p" size="s" view="alert" role="alert" id="mailing-selection-error" className="mailing-error">Выберите хотя бы один сервис или выключите технические рассылки.</Text>}
    {found.length?found.map(group=>{
     const ids=group.visible.map(service=>service.id);
     const count=ids.filter(id=>preferences.services.includes(id)).length;
     const expanded=!collapsed.includes(group.id);
     return <section className="mailing-service-list" key={group.id} aria-label={group.label}>
      <div className="mailing-service-heading">
       <Checkbox size="s" aria-label={`Все сервисы: ${group.label}`} checked={count===ids.length} intermediate={count>0&&count<ids.length} onChange={event=>toggleServices(ids,event.target.checked)}/>
       <button className="mailing-group-heading" aria-expanded={expanded} aria-controls={`mailing-group-${group.id}`} onClick={()=>setCollapsed(previous=>previous.includes(group.id)?previous.filter(id=>id!==group.id):[...previous,group.id])}><Text size="s" weight="medium">{group.label}</Text><Text size="xs" view="secondary" className="mailing-group-count">{count} / {ids.length}</Text><IconArrowDown size="xs" className={expanded?'':'mailing-group-closed'}/></button>
      </div>
      <div id={`mailing-group-${group.id}`} hidden={!expanded}>{group.visible.map(service=><div className="mailing-service-item" key={service.id}><Checkbox size="s" align="top" label={service.name} aria-label={`${service.name} · ${group.label}`} checked={preferences.services.includes(service.id)} onChange={event=>toggleServices([service.id],event.target.checked)}/></div>)}</div>
     </section>;
    }):<div className="mailing-empty"><Text size="m" weight="medium">Сервисы не найдены</Text><Text size="s" view="secondary">Попробуйте изменить запрос.</Text><Button size="s" view="ghost" label="Очистить поиск" onClick={()=>setQuery('')}/></div>}
   </div>:<div className="mailing-off"><IconRing size="s"/><Text size="s" view="secondary">Технические рассылки выключены. Выбранные сервисы сохранятся.</Text></div>}
  </Card>
 </div>;
}
