import React,{useState} from 'react';
import {Button} from '@consta/uikit/Button';
import {Text} from '@consta/uikit/Text';
import {TextField} from '@consta/uikit/TextField';
import {Modal} from '@consta/uikit/Modal';
import {IconClose} from '@consta/icons/IconClose';
import {IconCopy} from '@consta/icons/IconCopy';
import {groupAddresses} from './model';

const fmt=number=>number.toLocaleString('ru');
export default function CopyMailingDialog({emails,label,onClose}){
 const [size,setSize]=useState('1000');
 const [batches,setBatches]=useState(null);
 const [groupSize,setGroupSize]=useState(1000);
 const [error,setError]=useState('');
 const [copied,setCopied]=useState(null);
 const [preview,setPreview]=useState(null);
 function generate(){
  try{const value=Number(size);setBatches(groupAddresses(emails,value));setGroupSize(value);setError('');setCopied(null);setPreview(null);}catch{setError('Введите целое число больше нуля.');}
 }
 async function copy(index){
  try{await navigator.clipboard.writeText(batches[index].join('; '));setCopied(index);setError('');}catch{setPreview(index);setError('Скопируйте адреса из поля ниже.');}
 }
 return <Modal isOpen hasOverlay onEsc={onClose} onClickOutside={onClose} className="mailing-modal" style={{zIndex:1200}} role="dialog" aria-modal="true" aria-labelledby="mailing-copy-title">
  <div className="mailing-modal-head"><Text as="h2" size="xl" weight="medium" id="mailing-copy-title">Копировать список</Text><Button size="s" view="clear" onlyIcon iconLeft={IconClose} label="Закрыть окно" onClick={onClose}/></div>
  <div className="mailing-modal-body">
   <Text size="s" weight="medium">{label}</Text>
   <Text size="s" view="secondary">Всего адресов: {fmt(emails.length)}. Будет скопирован весь список с учётом личных настроек и исключений, независимо от поиска и текущей страницы.</Text>
   {!batches?<><TextField size="s" type="number" min={1} step={1} label="Адресов в группе" aria-label="Адресов в группе" value={size} onChange={value=>{setSize(value||'');setError('');}} status={error?'alert':undefined} caption="Укажите, по сколько адресов объединять в одну группу."/><Button size="s" label="Сформировать группы" disabled={!emails.length} onClick={generate} className="mailing-generate"/></>:<>
    <div className="mailing-copy-summary"><Text size="s">Групп: {fmt(batches.length)} · До {fmt(groupSize)} адресов в каждой</Text><Button size="xs" view="clear" label="Изменить размер группы" onClick={()=>{setBatches(null);setPreview(null);setCopied(null);setError('');}}/></div>
    <div className="mailing-copy-batches">{batches.map((batch,index)=><div className="mailing-copy-batch" key={index}><div><Text size="s" weight="medium">Группа {index+1}</Text><Text size="xs" view="secondary">{fmt(batch.length)} адресов · {fmt(index*groupSize+1)}–{fmt(index*groupSize+batch.length)}</Text></div><div className="mailing-copy-actions"><Button size="xs" view="clear" label="Показать адреса" aria-label={`Показать адреса группы ${index+1}`} onClick={()=>setPreview(index)}/><Button size="s" view="secondary" iconLeft={IconCopy} label={copied===index?'Скопировано':'Копировать'} aria-label={`Копировать группу ${index+1}`} onClick={()=>copy(index)}/></div></div>)}</div>
    {copied!==null&&<Text size="s" view="success" role="status">Скопирована группа {copied+1}: {fmt(batches[copied].length)} адресов.</Text>}
    {preview!==null&&<TextField size="s" type="textarea" rows={5} label={`Адреса группы ${preview+1}`} value={batches[preview].join('; ')} readOnly onFocus={event=>event.target.select()}/>}
   </>}
   {error&&<Text size="s" view="alert" role="alert">{error}</Text>}
  </div>
  <div className="mailing-modal-foot"><Button size="s" view="ghost" label="Закрыть" onClick={onClose}/></div>
 </Modal>;
}
