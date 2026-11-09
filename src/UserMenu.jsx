import {appPath} from './paths';
import React,{useRef,useState} from 'react';
import {User} from '@consta/uikit/User';
import {Button} from '@consta/uikit/Button';
import {ContextMenu} from '@consta/uikit/ContextMenu';
import {IconRing} from '@consta/icons/IconRing';
import {IconExit} from '@consta/icons/IconExit';
import './user-menu.css';

const items=[{key:'notifications',label:'Настройка уведомлений',leftIcon:IconRing},{key:'logout',label:'Выйти',leftIcon:IconExit}];
const sessionKey='n1-demo-signed-out';
export default function UserMenu(){
 const anchor=useRef(null);
 const [open,setOpen]=useState(false);
 const [signedOut,setSignedOut]=useState(()=>{try{return sessionStorage.getItem(sessionKey)==='true';}catch{return false;}});
 function close(){setOpen(false);anchor.current?.focus();}
 function choose(item){
  setOpen(false);
  if(item.key==='notifications'){location.href=appPath('notifications.html');return;}
  // This prototype has no identity provider; sign out of the demo session only.
  try{sessionStorage.setItem(sessionKey,'true');}catch{}
  setSignedOut(true);
  location.href=appPath();
 }
 function signIn(){try{sessionStorage.removeItem(sessionKey);}catch{}setSignedOut(false);}
 if(signedOut)return <Button size="s" view="ghost" label="Войти" onClick={signIn}/>;
 return <>
  <User as="button" type="button" ref={anchor} size="s" name="Максим Дмитриев" withArrow className="user-account-trigger" aria-label="Меню пользователя: Максим Дмитриев" aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(previous=>!previous)}/>
  <ContextMenu isOpen={open} size="s" anchorRef={anchor} direction="downStartRight" possibleDirections={['downStartRight','downStartLeft']} offset="xs" className="user-account-menu" items={items} onItemClick={choose} onEsc={close} onClickOutside={event=>{if(!anchor.current?.contains(event.target))setOpen(false);}}/>
 </>;
}
