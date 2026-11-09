import {services,unitsFor} from './data';
export const isGlobal=service=>[0,1,2].includes(service.id);
export const eventServiceIds=event=>event.services?.length?event.services:[event.service];
export const eventServiceNames=event=>eventServiceIds(event).map(id=>services[id]?.name).filter(Boolean).join(', ');
export const eventTargets=event=>event.targets?.length?event.targets:eventServiceIds(event).map(service=>({service,region:isGlobal(services[service])?'':event.region||'',env:isGlobal(services[service])?'Prod':event.env,cluster:isGlobal(services[service])?'':event.cluster||''}));
export const scopeValues=(event,key)=>[...new Set(eventTargets(event).map(target=>target[key]).filter(Boolean))];
export function availableUnits(serviceIds){return serviceIds.flatMap(id=>unitsFor(services[id]).map(unit=>({service:id,region:isGlobal(services[id])?'':unit.region,env:unit.env,cluster:services[id].mode==='clusters'||id===8?unit.label:''})));}
export function selectedTargets(scope){
  return availableUnits(scope.services).filter(target=>(!target.region||scope.regions.includes(target.region))&&
    (isGlobal(services[target.service])||scope.envs.includes(target.env))&&(!target.cluster||scope.clusters.includes(target.cluster)));
}
export const moscowNow=()=>new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Moscow'}));
export const wallTime=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
export const recipientRoles=['Руководитель проекта','Архитектор проекта','Разработчик проекта','Тестировщик проекта','Участник проекта','Релиз-инженер проекта','Инженер данных','Аналитик данных','Специалист ИБ','Sequrity QA инженер','Руководитель разработки'];
export const formatDate=value=>value?new Intl.DateTimeFormat('ru',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date(value+'Z')):'';
export function mailText(event){
  const incident=event.type==='Инцидент';
  const lines=[`${incident?'Инцидент':'Плановые работы'}: ${event.title}`,`Сервисы: ${eventServiceNames(event)}`,`Статус: ${event.status}`];
  const regions=scopeValues(event,'region'),envs=scopeValues(event,'env'),clusters=scopeValues(event,'cluster');
  if(regions.length)lines.push(`Регионы: ${regions.join(', ')}`);
  lines.push(`Ландшафты: ${envs.join(', ')}`);
  if(clusters.length)lines.push(`Кластеры / компоненты: ${clusters.join(', ')}`);
  if(incident)lines.push(`Критичность: ${event.severity}`);
  if(event.recoveryDuration)lines.push(`Плановый срок восстановления: ${event.recoveryDuration}`);
  lines.push(`${incident?'Период недоступности':'Период работ'} (МСК): ${formatDate(event.start)} — ${event.end?formatDate(event.end):'по настоящее время'}`,'',event.impact);
  if(incident)lines.push('',`Причина инцидента: ${event.cause||'Причина уточняется.'}`);
  return lines.join('\n');
}
