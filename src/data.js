export const TODAY='2026-10-27';
export const regions=['Центральный','Среда разработки'];
export const landscapes=['Dev','UAT','PreProd','Prod','ЦДМЗ','иЦДМЗ'];
export const statuses=['Доступен','Перебои','Недоступен','Плановые работы','Завершено'];
export const clusters=['Prod-DH-SPb','Prod-OKD-SPb','Prod-OCP-SPb','Prod-DH-Ekb','Prod-OCP-CMZ-SPb','PreProd-DH-SPb','PreProd-OCP-SPb','PreProd-OCP-CMZ-SPb','PreProd-DH-Ekb','UAT-DH-SPb','UAT-OKD-SPb','UAT-DH-Ekb'];
const names=['Портал N1 Hub','Релиз-борд','Реестр СПО','Контейнеризация','Управление API','Управляемый сервис для Kafka','Управление исходным кодом','Управление артефактами и зависимостями','Управление автоматизированной сборкой и развёртыванием','Управление релизным циклом','Сервис наблюдаемости','Тестирование (ТестОпс)','SSO','Продуктовая аналитика','Управление задачами и проектной документацией','Управляемый сервис для ClickHouse','Управляемый сервис для Greenplum'];
export const services=names.map((name,i)=>({id:i,name,mode:[3,4,5,12].includes(i)?'clusters':i>=15?'env':'simple'}));
export const events=[
{id:'КАИ-2031',service:3,title:'Не создаются новые пространства',region:regions[0],env:'Prod',cluster:'Prod-DH-Ekb',status:'Недоступен',type:'Инцидент',start:'2026-10-27T09:12',end:null,impact:'Новые пространства не создаются. Уже запущенные приложения продолжают работать.',action:'Отложите создание новых пространств до восстановления сервиса.',recovery:'27 октября, ориентировочно 13:00 МСК',update:'27 октября, 11:00 МСК',team:'Команда контейнеризации'},
{id:'ПР-108',service:3,title:'Обновление кластера контейнеризации',region:regions[0],env:'UAT',cluster:'UAT-OKD-SPb',status:'Плановые работы',type:'Плановая работа',start:'2026-10-28T23:00',end:'2026-10-29T00:30',impact:'Поды будут перезапускаться последовательно. Возможны краткие перерывы у приложений с одной репликой.',action:'До начала работ проверьте, что у приложения не менее двух реплик.',team:'Команда контейнеризации'},
...[
[7,'Был недоступен репозиторий артефактов','2026-10-21T12:10','2026-10-21T12:57',0,'Prod','Инцидент'],
[12,'Ошибки входа для пользователей с большим числом ролей','2026-10-16T09:00','2026-10-16T09:35',0,'Prod','Инцидент'],
[3,'Плановое обновление компонентов кластера','2026-10-11T22:00','2026-10-12T01:00',1,'UAT','Плановая работа'],
[8,'Сборки ожидали проверки SAST','2026-10-03T10:00','2026-10-03T16:00',2,'Dev','Инцидент'],
[0,'Портал был недоступен при обновлении','2026-09-24T21:00','2026-09-24T22:10',0,'Prod','Плановая работа'],
[5,'Задержки доставки сообщений','2026-09-16T12:00','2026-09-17T12:00',1,'Prod','Инцидент'],
[15,'Восстановлено создание баз данных','2026-09-08T11:00','2026-09-08T14:15',2,'Dev','Инцидент'],
[3,'Недоступен кластер тестирования','2026-08-27T09:00','2026-08-29T18:00',0,'UAT','Инцидент'],
[16,'Обновление сервиса Greenplum','2026-08-15T22:00','2026-08-16T02:00',2,'Dev','Плановая работа'],
[1,'Ошибка открытия карточек релизов','2026-08-06T12:00','2026-08-06T13:20',0,'Prod','Инцидент']
].map(([service,title,start,end,r,env,type],i)=>({id:`${type==='Инцидент'?'КАИ':'ПР'}-${2000-i*9}`,service,title,start,end,calendarState:service===8||service===5?'Перебои':undefined,region:regions[r===2?1:0],env,type,status:'Завершено',cluster:r===2?'Среда разработки':`${env}-DH-${r===1?'Ekb':'SPb'}`,impact:'Работа сервиса восстановлена. Ограничения сняты.',action:'Дополнительные действия со стороны пользователей не требуются.',team:'Команда платформы N1'}))];
export function unitsFor(service){if(service.mode==='clusters')return clusters.filter(c=>service.id!==3||c!=='PreProd-DH-Ekb').map(c=>({label:c,env:c.split('-')[0],region:regions[0]}));if(service.mode==='env')return landscapes.slice(0,4).map(env=>({label:env,env,region:env==='Dev'?regions[1]:regions[0]}));if(service.id===8)return [{label:'Jenkins',env:'Dev',region:regions[1]},{label:'PT-AI',env:'Dev',region:regions[1]},{label:'SAST',env:'Dev',region:regions[1]}];return [{label:'Сервис доступен',env:'Prod',region:service.id<3?'':regions[0]}]}
export function eventFor(s,u,items=events){return items.find(e=>e.status!=='Завершено'&&(e.targets?.length?e.targets.some(t=>t.service===s.id&&(t.cluster?t.cluster===u.label:t.env===u.env&&(!t.region||t.region===u.region))):e.service===s.id&&([0,1,2].includes(s.id)?u.env==='Prod':e.cluster?e.cluster===u.label:e.env===u.env&&e.region===u.region)))}
export const telemetry=[{service:8,unit:'Jenkins',status:'Перебои'}];
export function stateFor(s,u,items=events){return telemetry.find(t=>t.service===s.id&&t.unit===u.label)?.status||eventFor(s,u,items)?.status||'Доступен'}
export const matches=(selected,value)=>!selected?.length||selected.includes(value);
