import {services,regions,unitsFor} from '../data';
export {services};
export const preferenceKey='n1-notification-preferences-v1';
export const adminKey='n1-notification-audience-demo-v1';
export const guestKey='n1-notification-consultation-demo-v1';
export const roleOptions=[{id:'member',label:'Участник проекта'},{id:'guest',label:'Без проекта'},{id:'admin',label:'Команда Hub'}];
// Regional subscriptions follow the status catalogue, including global portals.
export const serviceGroups=[{id:'global',label:'Общие сервисы',region:''},...regions.map((region,index)=>({id:index===0?'central':'development',label:region,region}))].map(group=>({...group,services:services.filter(service=>unitsFor(service).some(unit=>unit.region===group.region)).map(service=>({...service,id:`${group.id}:${service.id}`,serviceId:service.id,groupId:group.id,groupLabel:group.label,label:service.name}))}));
export const serviceSubscriptions=serviceGroups.flatMap(group=>group.services);
export const mailingGroups=[{id:'marketing',label:'Маркетинговые рассылки'},...serviceGroups.map(({id,label})=>({id,label}))];
export const mailingLists=[{id:'marketing',label:'Новости N1 Hub',groupId:'marketing',groupLabel:'Маркетинговые рассылки'},...serviceSubscriptions];
export const defaultMailingId='development:8';
export const mailingLabel=list=>`${list.label} · ${list.groupLabel}`;
export function normalizePreferences(value){
 const defaults={version:2,marketing:false,technical:true,services:serviceSubscriptions.filter(s=>[3,6,8].includes(s.serviceId)).map(s=>s.id)};
 if(!value||![1,2].includes(value.version)||typeof value.marketing!=='boolean'||typeof value.technical!=='boolean'||!Array.isArray(value.services))return defaults;
 const selected=value.version===1?serviceSubscriptions.filter(s=>value.services.includes(s.serviceId)).map(s=>s.id):value.services.filter(id=>serviceSubscriptions.some(s=>s.id===id));
 return {version:2,marketing:value.marketing,technical:value.technical,services:[...new Set(selected)]};
}
export function normalizeAdmin(saved){
 if(!saved||![1,2].includes(saved.version)||!saved.manual||!saved.excluded)return {version:2,manual:{[defaultMailingId]:{'platform-team@example.test':'Технический адрес','elena.volkova@example.test':'Пользователь N1'}},excluded:{[defaultMailingId]:{'maria.orlova@example.test':'Получает сводку от команды проекта'}}};
 if(saved.version===2)return saved;
 const next={version:2,manual:{},excluded:{}};
 for(const type of ['manual','excluded'])for(const list of mailingLists){const oldId=list.id==='marketing'?'marketing':String(list.serviceId);if(saved[type][oldId])next[type][list.id]={...saved[type][oldId]};}
 return next;
}
export const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
export const validPreferences=p=>!p.technical||p.services.length>0;
export const parseEmails=text=>[...new Set(text.toLowerCase().split(/[\s,;]+/).map(v=>v.trim()).filter(Boolean))];
export const validEmail=email=>/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email);
export function groupAddresses(emails,size){
 if(!Number.isSafeInteger(size)||size<1)throw new RangeError('Введите целое число больше нуля.');
 const unique=[...new Set(emails)],groups=[];
 for(let i=0;i<unique.length;i+=size)groups.push(unique.slice(i,i+size));
 return groups;
}
const samples=[
 {email:'maxim.dmitriev@example.test',name:'Максим Дмитриев',kind:'Пользователь N1',base:true,personal:'self'},
 {email:'anna.smirnova@example.test',name:'Анна Смирнова',kind:'Пользователь N1',base:true,personal:'technical'},
 {email:'ivan.petrov@example.test',name:'Иван Петров',kind:'Пользователь N1',base:true,personal:'on'},
 {email:'elena.volkova@example.test',name:'Елена Волкова',kind:'Пользователь N1',base:false},
 {email:'platform-team@example.test',name:'Команда платформы',kind:'Технический адрес',base:false},
 {email:'maria.orlova@example.test',name:'Мария Орлова',kind:'Пользователь N1',base:true},
 {email:'pavel.sokolov@example.test',name:'Павел Соколов',kind:'Пользователь N1',base:true,personal:'off'}
];
// Project membership is distinct from an explicit personal subscription.
const directories=new Map();
function directoryFor(list){
 if(!directories.has(list)){
  const index=mailingLists.findIndex(item=>item.id===list);
  if(index===-1)return [];
  const count=list===defaultMailingId?1200:list==='marketing'?382:Math.min(68+index*13,215);
  directories.set(list,[...samples,...Array.from({length:count},(_,i)=>{const number=String(i+1).padStart(4,'0');return {email:`member${number}@example.test`,name:`Пользователь N1 ${number}`,kind:'Пользователь N1',base:true};})]);
 }
 return directories.get(list);
}
export function recipients(list,preferences,admin){
 const manual=admin.manual?.[list]||{},excluded=admin.excluded?.[list]||{};
 const records=new Map(directoryFor(list).map(record=>[record.email,record]));
 for(const [email,kind] of Object.entries(manual))if(!records.has(email))records.set(email,{email,name:email,kind:kind==='Пользователь'?'Пользователь N1':kind,base:false});
 for(const email of Object.keys(excluded))if(!records.has(email))records.set(email,{email,name:email,kind:'Пользователь N1',base:false});
 return [...records.values()].map(record=>{
 const pref=record.personal==='self'?(list==='marketing'?preferences.marketing:preferences.technical&&preferences.services.includes(list)):record.personal==='on'?true:record.personal==='off'?false:record.personal==='technical'?list!=='marketing':null;
 const included=pref!==null?pref:!Object.hasOwn(excluded,record.email)&&(record.base||Object.hasOwn(manual,record.email));
 const omitted=pref===false||(pref===null&&Object.hasOwn(excluded,record.email));
 return {...record,included,omitted,protected:pref!==null,manual:Object.hasOwn(manual,record.email),reason:excluded[record.email]||'',source:pref!==null?(pref?'Личная подписка':'Личный отказ'):Object.hasOwn(excluded,record.email)?'Исключён командой Hub':Object.hasOwn(manual,record.email)?'Добавлен вручную':'Участник проекта'};
 }).filter(record=>record.included||record.omitted);
}
