const $=s=>document.querySelector(s);
const categories=['全部作品','宣传视频','封面与视觉','Steam 公告','文案','方案与记录','宣传相关事项','海外宣发平台','推广合作'];
const icons=['▦','▷','▧','◷','✎','☷','☑','◎','↗'];
const groups={'宣传视频':['平台视频','Steam 视频','转场视频'],'封面与视觉':['公告封面','视频封面','Steam 商店封面','详情页图片','宣传图'],'文案':['Steam 文案','平台文案']};
function classifyCover(item){if(item.category!=='封面与视觉'||item.group!=='封面')return;const source=item.source||'',title=item.title||'';item.group=source.includes('/公告的/')||title.includes('公告封面')?'公告封面':source.includes('视频制作/封面/发平台的/')?'视频封面':'Steam 商店封面'}
let creatorCount=null;
let data,category='宣传视频',group='平台视频',view='episodes',query='',order='desc';
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const date=s=>s.replaceAll('-','.');
function setCategory(c){category=c;group='';view='grid';render();$(c==='推广合作'?'#creator-workspace':c==='工作记录'?'#work-log':'#collection').scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',c==='工作记录'?location.pathname:c==='推广合作'?'#creators':c==='宣传相关事项'?'#promotion-notes':c==='海外宣发平台'?'#overseas-platforms':location.pathname)}
function setGroup(g){group=g;view='grid';render();$('#collection').scrollIntoView({behavior:'smooth',block:'start'})}
function setView(v){view=v;if(v==='episodes'){category='宣传视频';group='平台视频'}render()}
function card(o){
 const b=el('button','card'+(['方案与记录','宣传相关事项','海外宣发平台'].includes(o.category)?' record':'')+(o.category==='Steam 公告'?' news-card':''));b.type='button';b.setAttribute('aria-label','查看'+o.title);
 if(o.category!=='Steam 公告'){
  const visual=el('div','card-image');
  if(o.cover){const im=el('img');im.src=o.cover;im.alt=o.title;im.loading='lazy';visual.append(im)}
  else{const d=el('div','doc-cover');d.append(el('span','doc-type',o.category==='文案'?'WORDS & STORIES':'NOTES & RESEARCH'),el('strong','',o.title),el('span','doc-lines'));visual.append(d)}
  if(o.category==='宣传视频'){visual.append(el('span','play','▶'));if(o.duration)visual.append(el('span','duration',Math.floor(o.duration/60)+':'+String(Math.floor(o.duration%60)).padStart(2,'0')))}
  b.append(visual);
 }
 const text=el('div','card-text'),kicker=el('div','card-kicker');kicker.append(el('span','category-tag',o.category==='Steam 公告'?'公告 '+String(o.announcementNumber).padStart(2,'0'):o.group||o.category),el('time','',date(o.date)));
 text.append(kicker,el('h3','',o.title),el('p','',o.summary));
 if(o.highlights){const list=el('ul','card-highlights');for(const h of o.highlights)list.append(el('li','',h));text.append(list)}
 const foot=el('div','card-bottom');foot.append(el('span','',o.category==='宣传视频'?o.files.length+' 个视频版本':o.status),el('span','',o.dateBasis+' ↗'));text.append(foot);b.append(text);b.onclick=()=>open(o);return b;
}
function episodeCard(o){const b=card(o);b.classList.add('episode-card');b.querySelector('.category-tag').textContent=o.episodeLabel||'EPISODE '+String(o.episode).padStart(2,'0');b.querySelector('.card-bottom').replaceChildren(el('span','',o.links.length?o.links.map(l=>l.platform).join(' / '):'平台链接待补充'),el('span','',o.links.length+' 个公开链接'+' ↗'));return b}
function render(){
 for(const [id,nav] of [['#navigation',true],['#tabs',false]]){
  const buttons=[];
  categories.forEach((c,i)=>{
   const b=el('button',c===category?'active':'');b.type='button';b.setAttribute('aria-pressed',String(c===category));if(nav)b.append(el('span','nav-icon',icons[i]));b.append(el('span','',c));
   if(nav)b.append(el('span','nav-number',String(c==='推广合作'?(creatorCount??'…'):c==='全部作品'?data.items.length:data.items.filter(x=>x.category===c).length).padStart(2,'0')));b.onclick=()=>setCategory(c);buttons.push(b);
   if(nav&&c===category&&groups[c])for(const g of groups[c]){const sub=el('button','subnav'+(group===g?' active':''),g);sub.setAttribute('aria-pressed',String(group===g));sub.onclick=()=>setGroup(g);buttons.push(sub)}
  });if(nav){const b=el('button',category==='工作记录'?'active':'');b.type='button';b.setAttribute('aria-pressed',String(category==='工作记录'));b.append(el('span','nav-icon','◷'),el('span','','工作记录'));b.onclick=()=>setCategory('工作记录');buttons.unshift(b)}$(id).replaceChildren(...buttons);
 }
 const back=$('#collection-back');back.hidden=category==='全部作品'&&!group;back.textContent=group?'← 返回'+category:'← 返回全部作品';
 const isCreators=category==='推广合作',isWorkLog=category==='工作记录';$('#creator-workspace').hidden=!isCreators;$('#work-log').hidden=!isWorkLog;$('#collection').hidden=isCreators||isWorkLog;for(const selector of ['.intro','.hero','#stats'])$(selector).hidden=isCreators||isWorkLog||category==='海外宣发平台';if(isWorkLog){$('#crumb').textContent='工作记录';window.renderWorkLog(data);return}if(isCreators){$('#crumb').textContent='推广合作';return;}
 for(const v of ['grid','timeline','episodes']){$('#'+v+'-view').classList.toggle('active',view===v);$('#'+v+'-view').setAttribute('aria-pressed',String(view===v))}
 const subgroups=groups[category]||[];$('#group-tabs').hidden=!subgroups.length;$('#group-tabs').replaceChildren(...['全部',...subgroups].map(g=>{const value=g==='全部'?'':g,b=el('button',value===group?'active':'',g);b.setAttribute('aria-pressed',String(value===group));b.onclick=()=>setGroup(value);return b}));
 const results=data.items.filter(o=>(category==='全部作品'||o.category===category)&&(!group||o.group===group)&&[o.title,o.summary,o.body,o.group,o.status,...(o.highlights||[]),...(o.links||[]).map(l=>l.platform),...o.files.map(f=>f.name)].join(' ').toLowerCase().includes(query.toLowerCase()));
 results.sort((a,b)=>view==='episodes'?((a.episode??Infinity)-(b.episode??Infinity)||b.date.localeCompare(a.date)):order==='title'?a.title.localeCompare(b.title,'zh'):order==='asc'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
 const title=view==='episodes'?'按期数看视频':group||category;
 $('#collection-title').replaceChildren(document.createTextNode(title+' '),el('span','',String(results.length).padStart(2,'0')));$('#crumb').textContent=title;$('#sort').hidden=view==='episodes';
 $('#collection-note').textContent=category==='海外宣发平台'?'已选 2 个免费方案 · 当前支出 0 元 · 点击卡片查看官方入口与申请进度。':category==='宣传相关事项'?'宣传执行约定、Key 类型与渠道注意事项，集中记录在这里。':category==='Steam 公告'?data.items.filter(o=>o.category==='Steam 公告').length+' 篇已发布公告 · 按北京时间记录 · 附内容要点、多语原文和 Steam 链接':category==='宣传视频'?'平台发布、Steam 预告与转场作品分别收录。点开每期可查看平台链接和制作素材。':category==='封面与视觉'?'按用途查看公告封面、视频封面、Steam 商店封面，以及详情页图片和宣传图。':'按分类查看作品，或搜索标题与内容。';
 const container=$('#results');container.replaceChildren();
 if(view==='grid'&&subgroups.length&&!group){
  container.className='grouped-results';
  for(const g of subgroups){const list=results.filter(o=>o.group===g);if(!list.length)continue;const section=el('section','work-group'),heading=el('h3','group-title',g+' ');heading.append(el('span','',String(list.length).padStart(2,'0')));const grid=el('div','grid');grid.append(...list.map(card));section.append(heading,grid);container.append(section)}
 }else{
  container.className=view==='episodes'?'grid episodes':view;let month='';
  let independentHeading=false;for(const o of results){if(view==='episodes'&&!o.episode&&!independentHeading){container.append(el('h3','month-label','独立视频与短片'));independentHeading=true}if(view==='timeline'&&month!==o.date.slice(0,7)){month=o.date.slice(0,7);container.append(el('h3','month-label',month.replace('-',' / ')))}container.append(view==='episodes'&&o.episode?episodeCard(o):card(o))}
 }
 $('#empty').hidden=results.length>0;
}
let detailStack=[],currentDetail=null;
function open(o,fromRelated=false){
 if(fromRelated&&currentDetail)detailStack.push(currentDetail);else if(!fromRelated)detailStack=[];currentDetail=o;
 const isNews=o.category==='Steam 公告',isNotes=['宣传相关事项','海外宣发平台'].includes(o.category);const links=o.links||[];
 $('#upload-section').hidden=true;$('#upload-links').replaceChildren();
 const isAnnouncementCovers=o.id==='steam-announcement-covers-20261026',isStoreDetails=o.id==='steam-store-gif-20261027-localized-titles';
 $('#platform-section').hidden=!isNews&&!isNotes&&!isAnnouncementCovers&&!isStoreDetails&&o.category!=='宣传视频';$('#platform-title').textContent=isNews?'公告原文':isAnnouncementCovers?'对应 Steam 公告':isStoreDetails?'Steam 商店详情页':o.category==='海外宣发平台'?'平台入口与免费方案':isNotes?'参考来源':o.group==='Steam 视频'?'Steam 观看入口':'视频直达链接';
 $('#platform-note').textContent=o.category==='海外宣发平台'?'官方入口 · 免费方案与申请状态以记录日期为准。':isNotes?'申请前核对官方规则与渠道要求。':isNews?'已核对公开版本 · 下方可切换已发布语言':isAnnouncementCovers?'下方直达对应的 '+links.length+' 条已发布公告。':isStoreDetails?'打开对应语言的 Steam 商店详情页。':o.group==='Steam 视频'?'打开 Steam 商店查看预告片，或播放下方的归档版本。':links.length?'点击平台名称直接打开视频 · 日期为平台发布日期':'暂未查到本期的公开平台链接，可先观看下方归档成片。';
 $('#platform-links').replaceChildren(...links.map(l=>{const a=el('a','platform-link');a.href=l.url;a.target='_blank';a.rel='noopener noreferrer';a.append(el('strong','',l.platform+' ↗'),el('span','',l.date?date(l.date)+' · '+(l.status||'已公开'):l.status||'日期待核对'));return a}));
 $('#highlights-section h3').textContent=o.category==='海外宣发平台'?'费用与进度':'这期说了什么';$('#text-section summary').textContent=o.category==='海外宣发平台'?'查看方案与申请记录':'阅读原始文案';$('#highlights-section').hidden=!o.highlights;$('#detail-highlights').replaceChildren(...(o.highlights||[]).map(h=>el('li','',h)));
 const related=o.episode?data.items.filter(x=>x.episode===o.episode&&x.id!==o.id):[];$('#related-section').hidden=!related.length;$('#related-items').replaceChildren(...related.map(x=>{const b=el('button','related-item',x.category+' · '+x.title+' ↗');b.onclick=()=>open(x,true);return b}));
 $('#detail-category').textContent=(o.group||o.category)+' / WORK ARCHIVE';$('#detail-title').textContent=o.title;$('#detail-meta').textContent=(o.publishedAt?o.publishedAt+' 北京时间':date(o.date))+' · '+o.dateBasis+' · '+o.status;$('#detail-summary').textContent=o.summary;$('#detail-note').textContent=o.detailNote||'';$('#detail-source').textContent=o.source;$('#detail-text').textContent=o.body;$('#text-section').hidden=!o.body;$('#text-section').open=!!o.body;
 const languages=$('#language-picker');languages.replaceChildren();languages.hidden=!o.translations;
 if(o.translations){for(const [code,name] of [['schinese','简体中文'],['tchinese','繁體中文'],['english','English'],['german','Deutsch'],['french','Français'],['japanese','日本語'],['korean','한국어'],['spanish','Español'],['brazilian','Português (Brasil)'],['russian','Русский']]){if(!o.translations[code])continue;const b=el('button',code==='schinese'?'active':'',name);b.onclick=()=>{const t=o.translations[code];$('#detail-text').textContent=t.title+'\n\n'+t.body;for(const x of languages.children)x.classList.toggle('active',x===b)};languages.append(b)}}
 const picker=$('#file-picker');picker.replaceChildren();$('#detail-media').replaceChildren();
 function show(f){const media=$('#detail-media');media.replaceChildren();let element;
  if(f.type==='video'){element=el('video');element.controls=true;element.preload='metadata';element.playsInline=true;if(o.cover)element.poster=o.cover}
  else if(f.type==='image'){element=el('img');element.alt=f.name}
  if(element){element.src=f.url;media.append(element)}for(const b of picker.children)b.classList.toggle('active',b.dataset.url===f.url);
 }
 for(const f of o.files){if(['video','image'].includes(f.type)){const b=el('button','',f.name.replace(/\.(mp4|png|jpg|jpeg)$/,''));b.dataset.url=f.url;b.onclick=()=>show(f);picker.append(b)}else{const a=el('a','', '↓ '+f.name);a.href=f.url;a.download=f.name;picker.append(a)}}
 if(o.files[0])show(o.files[0]);if(!$('#detail').open)$('#detail').showModal();$('#detail').scrollTop=0;
}
$('#collection-back').onclick=()=>{if(group){group='';view='grid';render()}else setCategory('全部作品')};$('#detail-back').onclick=()=>{if(detailStack.length){const previous=detailStack.pop();open(previous,true);detailStack.pop();return}if(new URLSearchParams(location.search).has('work')){if(document.referrer&&new URL(document.referrer).origin===location.origin&&new URL(document.referrer).pathname.startsWith('/timeline')){location.assign('/timeline/');return}const url=new URL(location.href);url.searchParams.delete('work');history.replaceState(null,'',url.pathname+url.search+url.hash)}$('#detail').close()};$('#close').onclick=()=>$('#detail').close();$('#detail').addEventListener('close',()=>$('#detail-media').replaceChildren());
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
$('#search').oninput=e=>{query=e.target.value;render()};$('#sort').onchange=e=>{order=e.target.value;render()};for(const v of ['grid','timeline','episodes'])$('#'+v+'-view').onclick=()=>setView(v);
$('#reset').onclick=()=>{query='';$('#search').value='';render()};
fetch('catalog.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('数据读取失败');return r.json()}).then(d=>{
 d.items.forEach(classifyCover);data=d;if(location.hash==='#work-log'){category='工作记录';group='';view='grid';}if(location.hash==='#overseas-platforms'){category='海外宣发平台';group='';view='grid';}if(location.hash==='#promotion-notes'){category='宣传相关事项';group='';view='grid';}if(['#creators','#xiaoheihe','#demo-trials'].includes(location.hash)||new URLSearchParams(location.search).has('creator')){category='推广合作';group='';view='grid';}$('#hero-image').src=d.hero;
 $('#stats').replaceChildren(...['宣传视频','封面与视觉','Steam 公告','文案'].map((c,i)=>{const s=el('div','stat'),label=el('span','',c);label.append(el('small','',['VIDEO PROJECTS','VISUAL COLLECTIONS','STEAM NEWS','COPY & SCRIPTS'][i]));s.append(el('b','',String(d.items.filter(o=>o.category===c).length).padStart(2,'0')),label);s.role='button';s.tabIndex=0;s.onclick=()=>setCategory(c);s.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setCategory(c)}};return s}));render();const workId=new URLSearchParams(location.search).get('work');if(workId){const item=d.items.find(x=>x.id===workId);if(item)open(item)}window.dispatchEvent(new Event('creator-workspace-ready'));
}).catch(()=>{$('#results').textContent='作品档案暂时未能加载，请刷新页面重试。'});

fetch('creators/creators.json',{cache:'no-store'}).then(r=>r.json()).then(rows=>{creatorCount=rows.length;if(data)render()}).catch(()=>{});

window.addEventListener('work-log-open',e=>{const item=data&&data.items.find(x=>x.id===e.detail);if(item)open(item)});
