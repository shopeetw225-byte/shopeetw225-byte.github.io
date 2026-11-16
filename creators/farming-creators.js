(()=>{
'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&['space.bilibili.com','www.bilibili.com'].includes(u.hostname)?u.href:'#'}catch{return '#'}};
let rows=[],audit=[],page=1;const pageSize=25;
const card=c=>`<article class="card" data-uid="${esc(c.uid)}"><div class="card-head"><h2><a href="${esc(safeUrl(c.profile_url))}" target="_blank" rel="noopener noreferrer">${esc(c.name)} ↗</a><span class="uid">UID ${esc(c.uid)}</span></h2><div class="badges"><span class="badge">${esc(c.tier)}</span>${c.user_selected?'<span class="badge selected">用户指定</span>':''}<span class="badge">${esc(c.category)}</span></div></div><p class="fit">${esc(c.fit_reason)}</p>${c.firsthand_basis?`<p class="basis"><strong>实玩依据：</strong>${esc(c.firsthand_basis)}</p>`:''}<ul class="works">${c.videos.map(v=>`<li><a href="${esc(safeUrl(v.url))}" target="_blank" rel="noopener noreferrer">${esc(v.title)} ↗</a><time class="date" datetime="${esc(v.date)}">${esc(v.date)}</time></li>`).join('')}</ul><p class="status">${esc(c.outreach?.label||'本地未见发送记录；联系前再核对私信')}</p>${c.limitations?`<p class="limitations">${esc(c.limitations)}</p>`:''}</article>`;
function render(){
const term=$('#q').value.trim().toLocaleLowerCase(),category=$('#category').value,tier=$('#tier').value,status=$('#status').value;
const visible=rows.filter(c=>(!category||c.category===category)&&(!tier||c.tier===tier)&&(!status||(status==='recorded')===Boolean(c.outreach?.has_record))&&(!term||[c.name,c.uid,c.fit_reason,c.firsthand_basis,...c.videos.map(v=>v.title)].join(' ').toLocaleLowerCase().includes(term)));
const pages=Math.max(1,Math.ceil(visible.length/pageSize));page=Math.min(page,pages);
$('#result-count').textContent=`显示 ${visible.length} / ${rows.length} 位已核实博主${visible.length?` · 第 ${page} / ${pages} 页`:''}`;
$('#cards').innerHTML=visible.length?visible.slice((page-1)*pageSize,page*pageSize).map(card).join(''):'<p class="empty">没有匹配的账号，换个关键词或筛选条件试试。</p>';
$('#pages').innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button type="button" data-page="${i+1}" ${page===i+1?'aria-current="page"':''}>${i+1}</button>`).join(''):'';
$('#pages').querySelectorAll('button').forEach(b=>b.onclick=()=>{page=Number(b.dataset.page);render();$('#result-count').scrollIntoView({block:'start'})});
}
function renderAudit(){const q=$('#audit-q').value.trim().toLocaleLowerCase();$('#audit-entries').innerHTML=audit.filter(c=>!q||[c.name,c.uid].join(' ').toLocaleLowerCase().includes(q)).map(c=>`<div class="audit-row"><a href="${esc(safeUrl(c.profile_url))}" target="_blank" rel="noopener noreferrer">${esc(c.name)} ↗</a><span class="badge">${esc(c.status_label)}</span><p>${esc(c.reason)}</p></div>`).join('')}
$('#filters').addEventListener('submit',e=>e.preventDefault());$('#filters').addEventListener('input',()=>{page=1;render()});$('#audit-q').addEventListener('input',renderAudit);
fetch('idle-farming-creators-20261116.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('fetch');return r.json()}).then(data=>{
if(data.review_status==='rechecking'){$('h1').textContent='搬砖博主 · 重新核查中';$('#total').textContent='—';$('#recent').textContent='—';$('#selected').textContent='7';$('#filters').style.display='none';$('#result-count').textContent='旧名单正在合并重筛，暂不按上一版100位推荐。';$('.notice').textContent='优先核查本人刷货、掉落、出售等搬砖内容。开发者、发行方和泛游戏资讯账号移出；人数不足100会如实说明。';return;}
rows=data.creators;audit=data.previous_audit||[];$('#total').textContent=rows.length;$('#recent').textContent=rows.filter(c=>c.recent_evidence).length;$('#selected').textContent=data.user_selected_total||rows.filter(c=>c.user_selected).length;$('#checked').textContent=`资料核对：${data.research_date}`;
$('.notice').textContent=`本轮核实 ${rows.length} 位，距离目标100位还差 ${Math.max(0,100-rows.length)} 位；不使用泛游戏账号凑数。按主营搬砖、实玩搬砖和旧作储备排序。较早作品不代表目前仍在更新或接推广。`;
if(data.user_pending?.length){$('#user-pending').hidden=false;$('#user-pending summary').textContent=`用户指定 · 待补实玩依据（${data.user_pending.length}位）`;$('#pending-cards').innerHTML=data.user_pending.map(card).join('')}
if(audit.length){$('#previous-audit').hidden=false;$('#audit-title').textContent=`旧名单整理结果（${audit.length}个账号，已去重）`;renderAudit()}
[...new Set(rows.map(c=>c.category))].forEach(category=>{const option=document.createElement('option');option.value=category;option.textContent=category;$('#category').append(option)});render();
}).catch(()=>{$('#result-count').textContent='名单暂时无法读取，请刷新重试。'});
})();
