import React,{useState} from 'react';
import {Modal} from '@consta/uikit/Modal';
import {Button} from '@consta/uikit/Button';
import {IconClose} from '@consta/icons/IconClose';
import {mailText} from './eventModel';
export default function MailPreview({event,onBack,onClose,onSend}){
 const [requested,setRequested]=useState(false);
 return <Modal isOpen hasOverlay onEsc={onClose} onClickOutside={onClose} style={{zIndex:1200}} className="mail-preview" role="dialog" aria-modal="true" aria-labelledby="mail-preview-title">
 <header className="event-sidebar-heading"><h2 id="mail-preview-title">Предпросмотр рассылки</h2><Button size="s" view="clear" onlyIcon iconLeft={IconClose} label="Закрыть предпросмотр" onClick={onClose}/></header>
 <div className="mail-preview-body"><p className="event-field-note">Событие сохранено. Проверьте текст перед отправкой.</p><dl><dt>Получатели</dt><dd>{event.recipientRoles.join(', ')}</dd><dt>Тема</dt><dd>{event.type==='Инцидент'?'Инцидент':'Плановые работы'}: {event.title}</dd></dl><pre>{mailText(event)}</pre>
 <p className="event-field-note">Рассылка работает в режиме макета. Реальные письма не отправляются.</p>
 {requested&&<p role="status" className="mail-preview-status">Запрос на отправку сохранён. Для доставки писем необходимо подключить рассылку.</p>}</div>
 <div className="event-editor-footer"><Button size="s" view="ghost" label="Назад к редактированию" onClick={onBack}/><Button size="s" label={requested?'Готово':'Отправить рассылку'} onClick={()=>{if(requested){onClose();return;}onSend();setRequested(true)}}/></div>
 </Modal>;
}
