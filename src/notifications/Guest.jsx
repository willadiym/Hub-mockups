import React,{useState} from 'react';
import {Button} from '@consta/uikit/Button';
import {Card} from '@consta/uikit/Card';
import {Modal} from '@consta/uikit/Modal';
import {Text} from '@consta/uikit/Text';
import {IconMail} from '@consta/icons/IconMail';
import {IconCheck} from '@consta/icons/IconCheck';
import {IconArrowRight} from '@consta/icons/IconArrowRight';
import {guestKey,readJSON} from './model';

export default function Guest(){
 const [requested,setRequested]=useState(()=>readJSON(guestKey,false));
 const [error,setError]=useState(false);
 const [guide,setGuide]=useState(false);
 function request(){try{localStorage.setItem(guestKey,'true');setRequested(true);setError(false);}catch{setError(true);}}
 return <>
  <Card as="section" border shadow={false} className="mailing-guest">
   <div className="mailing-guest-symbol">{requested?<IconCheck size="m"/>:<IconMail size="m"/>}</div>
   <Text as="h2" size="xl" weight="semibold">{requested?'Спасибо за интерес!':'Давайте знакомиться!'}</Text>
   <Text as="p" size="s" view="secondary">Вы пока не состоите в проекте. Настройки подписок появятся после присоединения к команде.</Text>
   <Text as="p" size="s" view="secondary">Поможем разобраться в возможностях платформы, зарегистрировать новый проект<br className="mailing-guest-break"/> или присоединиться к существующему.</Text>
   <Button size="s" label={requested?'Запрос сохранён':'Мне интересно'} iconLeft={requested?IconCheck:undefined} disabled={Boolean(requested)} onClick={request}/>
   <Text as="p" size="xs" view="secondary" role={requested?'status':undefined} className="mailing-guest-caption">{requested?'Повторная отправка недоступна':'Ответим на вашу почту в течение 24 часов'}</Text>
   {error&&<Text size="s" view="alert" role="alert">Не удалось сохранить запрос. Попробуйте ещё раз.</Text>}
   <div className="mailing-next-steps">
    <div><Text as="h3" size="s" weight="semibold">Создать свой проект</Text><Text as="p" size="xs" view="secondary">Зарегистрируйте проект, чтобы начать<br/> использовать сервисы платформы</Text><a href="https://n1-prototype-lime.vercel.app/projects.html" className="mailing-guest-link">Зарегистрировать проект <IconArrowRight size="xs"/></a></div>
    <div><Text as="h3" size="s" weight="semibold">Присоединиться к команде</Text><Text as="p" size="xs" view="secondary">Узнайте, как получить роль<br/> в уже существующем проекте</Text><Button size="xs" view="clear" label="Открыть инструкцию" iconRight={IconArrowRight} onClick={()=>setGuide(true)}/></div>
   </div>
  </Card>
  {guide&&<Modal isOpen hasOverlay onEsc={()=>setGuide(false)} onClickOutside={()=>setGuide(false)} className="mailing-modal" style={{zIndex:1200}} role="dialog" aria-modal="true" aria-labelledby="mailing-guide-title"><div className="mailing-modal-head"><Text as="h2" size="xl" weight="medium" id="mailing-guide-title">Как присоединиться к команде</Text></div><div className="mailing-modal-body"><Text size="s">Обратитесь к руководителю или администратору проекта, чтобы получить роль в команде. После присоединения к проекту здесь появятся настройки уведомлений.</Text></div><div className="mailing-modal-foot"><Button size="s" label="Понятно" onClick={()=>setGuide(false)}/></div></Modal>}
 </>;
}
