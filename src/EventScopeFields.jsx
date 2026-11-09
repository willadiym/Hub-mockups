import React from 'react';
import {Combobox} from '@consta/uikit/Combobox';
import {services} from './data';
import {availableUnits,isGlobal} from './eventModel';
const asOptions=values=>values.map(label=>({id:label,label}));
const unique=values=>[...new Set(values.filter(Boolean))];
const serviceOptions=services.map(service=>({id:service.id,label:service.name}));
export function EditorSelect({label,items,value,onChange,caption,disabled,required=false,error,onCreate,multiple=false}){
 return <Combobox size="s" label={label} ariaLabel={label} items={items} value={value} onChange={onChange} multiple={multiple}
 placeholder="Выберите или начните вводить" disabled={disabled} required={required} caption={error||caption} status={error?'alert':undefined}
 dropdownClassName="event-editor-dropdown" labelForEmptyItems="Нет подходящих вариантов" labelForNotFound="Варианты не найдены" onCreate={onCreate} labelForCreate="Использовать"/>;
}
export default function EventScopeFields({value,onChange,errors={}}){
 const units=availableUnits(value.services),globalOnly=value.services.length>0&&value.services.every(id=>isGlobal(services[id]));
 const regions=unique(units.map(unit=>unit.region));
 const envs=unique(units.filter(unit=>!unit.region||!value.regions.length||value.regions.includes(unit.region)).map(unit=>unit.env));
 const clusters=unique(units.filter(unit=>(!unit.region||value.regions.includes(unit.region))&&value.envs.includes(unit.env)).map(unit=>unit.cluster));
 const hasClusters=units.some(unit=>unit.cluster);
 const field=(label,key,values)=>{const items=asOptions(values);return <EditorSelect label={label} items={items} multiple value={items.filter(item=>value[key].includes(item.id))} onChange={next=>onChange({...value,[key]:(next||[]).map(item=>item.id),...(key!=='clusters'?{clusters:[]}:{}),...(key==='regions'?{envs:[]}:{} )})} required error={errors[key]}/>};
 return <>
 <EditorSelect label="Сервисы" items={serviceOptions} multiple value={serviceOptions.filter(item=>value.services.includes(item.id))} onChange={next=>onChange({services:(next||[]).map(item=>item.id),regions:[],envs:[],clusters:[]})} required error={errors.services}/>
 {regions.length>0&&field('Регионы','regions',regions)}
 {!globalOnly&&value.services.length>0&&field('Ландшафты','envs',envs)}
 {hasClusters&&field(value.services.every(id=>id===8)?'Компоненты':'Кластеры / компоненты','clusters',clusters)}
 </>;
}
