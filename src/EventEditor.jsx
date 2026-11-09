import React,{useState,useRef} from 'react';
import {Button} from '@consta/uikit/Button';
import {ChoiceGroup} from '@consta/uikit/ChoiceGroup';
import {TextField} from '@consta/uikit/TextField';
import {Checkbox} from '@consta/uikit/Checkbox';
import {DatePicker} from '@consta/uikit/DatePicker';
import {IconClose} from '@consta/icons/IconClose';
import EventScopeFields,{EditorSelect} from './EventScopeFields';
import {services} from './data';
import {eventServiceIds,scopeValues,selectedTargets,availableUnits,isGlobal,moscowNow,wallTime,recipientRoles} from './eventModel';

const options=values=>values.map(label=>({id:label,label}));
const statusOptions=options(['Недоступен','Завершено']);
const severityOptions=options(['Низкая','Средняя','Высокая','Критическая']);
const recoveryOptions=options(['30 минут','1 час','2 часа','4 часа','8 часов','24 часа']);


export default function EventEditor({onClose,onSave,event:existing}){
  const bodyRef=useRef(null);
  const [type,setType]=useState(existing?.type==='Плановая работа'?'Плановые работы':'Инцидент');
  const [scope,setScope]=useState(()=>existing?{services:eventServiceIds(existing),regions:scopeValues(existing,'region'),envs:scopeValues(existing,'env'),clusters:scopeValues(existing,'cluster')}:{services:[],regions:[],envs:[],clusters:[]});
  const [title,setTitle]=useState(existing?.title||''),[status,setStatus]=useState(existing?{id:existing.status,label:existing.status}:null),[severity,setSeverity]=useState(existing?{id:existing.severity||'Высокая',label:existing.severity||'Высокая'}:null);
  const [recovery,setRecovery]=useState(existing?.type==='Инцидент'?{id:existing.recoveryDuration||'4 часа',label:existing.recoveryDuration||'4 часа'}:null),[start,setStart]=useState(()=>existing?new Date(existing.start):moscowNow()),[end,setEnd]=useState(()=>existing?.end?new Date(existing.end):null);
  const [description,setDescription]=useState(existing?.impact||''),[cause,setCause]=useState(existing?.cause||''),[mail,setMail]=useState(existing?.mailRequested||false);
  const [roles,setRoles]=useState(()=>options(existing?.recipientRoles?.length?existing.recipientRoles:['Руководитель проекта','Архитектор проекта','Руководитель разработки']));
  const [errors,setErrors]=useState({});
  const incident=type==='Инцидент';
  const completed=incident&&status?.id==='Завершено';
  const targets=selectedTargets(scope),units=availableUnits(scope.services);
  function submit(event){
    event.preventDefault();
    const next={};
    if(!scope.services.length)next.services='Выберите сервисы';
    if(units.some(unit=>unit.region)&&!scope.regions.length)next.regions='Выберите регионы';
    if(scope.services.some(id=>!isGlobal(services[id]))&&!scope.envs.length)next.envs='Выберите ландшафты';
    if(units.some(unit=>unit.cluster)&&!scope.clusters.length)next.clusters='Выберите кластеры или компоненты';
    if(scope.services.length&&scope.services.some(id=>!targets.some(target=>target.service===id)))next.services='Для каждого сервиса выберите подходящий ландшафт и, при наличии, кластер';
    if(mail&&!roles.length)next.roles='Выберите роли получателей';
    if(!title.trim())next.title='Введите название события';
    if(incident&&!status)next.status='Выберите статус';
    if(incident&&!severity)next.severity='Выберите критичность';
    if(incident&&!completed&&!recovery)next.recovery='Укажите срок восстановления';
    if(!start)next.start='Укажите начало периода';
    if((!incident||completed)&&!end)next.end='Укажите окончание периода';
    if(start&&end&&end<=start)next.end='Окончание должно быть позже начала';
    if(!description.trim())next.description=incident?'Опишите проблему':'Опишите работы';
    setErrors(next);
    if(Object.keys(next).length){bodyRef.current?.scrollTo({top:0,behavior:'smooth'});return;}
    onSave({...existing,id:existing?.id||`${incident?'КАИ':'ПР'}-${Date.now()}`,service:scope.services[0],services:scope.services,
      targets,region:[...new Set(targets.map(target=>target.region).filter(Boolean))].join(', '),
      env:[...new Set(targets.map(target=>target.env))].join(', '),cluster:[...new Set(targets.map(target=>target.cluster).filter(Boolean))].join(', '),
      title:title.trim(),status:incident?status.id:existing?.status==='Завершено'?'Завершено':'Плановые работы',
      type:incident?'Инцидент':'Плановая работа',severity:incident?severity.id:undefined,
      recoveryDuration:incident&&!completed?recovery.id:undefined,start:wallTime(start),end:end?wallTime(end):null,
      impact:description.trim(),cause:incident?cause.trim():undefined,mailRequested:mail,recipientRoles:roles.map(role=>role.id),mailStatus:mail?'draft':undefined});
  }
  return <form className="event-editor" onSubmit={submit} noValidate>
    <header className="event-sidebar-heading"><h2 id="event-editor-title">{existing?'Редактировать событие':'Новая запись'}</h2><Button type="button" size="s" view="clear" onlyIcon iconLeft={IconClose} label="Закрыть" onClick={onClose}/></header>
    <div className="event-editor-body" ref={bodyRef}>
      <ChoiceGroup className="event-kind" size="s" view="secondary" value={type} onChange={next=>{setType(next);setErrors({})}} items={['Инцидент','Плановые работы']} getItemLabel={x=>x} getItemKey={x=>x}/>
      {Object.keys(errors).length>0&&<p className="event-editor-error" role="alert">Проверьте заполнение полей.</p>}
      <EventScopeFields value={scope} onChange={setScope} errors={errors}/>
      <TextField size="s" label="Название события" name="eventTitle" value={title} onChange={value=>setTitle(value||'')} placeholder="Кратко опишите, что произошло" required status={errors.title?'alert':undefined} caption={errors.title}/>
      {incident&&<>
        <EditorSelect label="Статус" items={statusOptions} value={status} onChange={setStatus} required error={errors.status}/>
        <EditorSelect label="Критичность" items={severityOptions} value={severity} onChange={setSeverity} required error={errors.severity}/>
        {!completed&&<EditorSelect label="Плановый срок восстановления" items={recoveryOptions} value={recovery} onChange={setRecovery} onCreate={label=>setRecovery({id:label,label})} caption="Длительность с момента начала инцидента, например 4 часа" required error={errors.recovery}/>}
      </>}
      <fieldset className="event-period"><legend>{incident?'Период недоступности (МСК)':'Период работ (МСК)'}</legend><div className="event-period-fields">
        <DatePicker type="date-time" size="s" label="Начало" ariaLabel="Начало периода" value={start} onChange={setStart} format="dd.MM.yyyy HH:mm" required status={errors.start?'alert':undefined} caption={errors.start} dropdownClassName="event-editor-dropdown"/>
        <DatePicker type="date-time" size="s" label="Окончание" ariaLabel="Окончание периода" value={end} onChange={setEnd} format="dd.MM.yyyy HH:mm" required={!incident||completed} status={errors.end?'alert':undefined} caption={errors.end} dropdownClassName="event-editor-dropdown"/>
      </div>{incident&&!completed&&<p className="event-field-note">Оставьте окончание пустым, если инцидент продолжается.</p>}</fieldset>
      <TextField type="textarea" rows={3} size="s" label={incident?'Описание проблемы':'Описание работ'} value={description} onChange={value=>setDescription(value||'')} placeholder="Введите текст" required status={errors.description?'alert':undefined} caption={errors.description}/>
      {incident&&<TextField type="textarea" rows={3} size="s" label="Причина инцидента" value={cause} onChange={value=>setCause(value||'')} placeholder="Введите текст" caption="Можно заполнить позже, если причина уточняется"/>}
      <Checkbox size="s" label={incident?'Отправить рассылку об инциденте':'Отправить рассылку о плановых работах'} checked={mail} onChange={event=>setMail(event.target.checked)}/>
      {mail&&<EditorSelect label="Роли получателей" items={options(recipientRoles)} multiple value={roles} onChange={next=>setRoles(next||[])} required error={errors.roles}/>}
    </div>
    <footer className="event-editor-footer"><Button type="button" size="s" view="ghost" label="Отменить" onClick={onClose}/><Button type="submit" size="s" label="Сохранить"/></footer>
  </form>;
}
