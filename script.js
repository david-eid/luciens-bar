const nav=document.querySelector('.nav'),toggle=document.querySelector('.menu-toggle'),links=document.querySelector('#nav-links');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',document.body.classList.contains('menu-page')||scrollY>40),{passive:true});
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',!open);links.classList.toggle('open')});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
const reveal=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
document.querySelectorAll('[data-card-href]').forEach(card=>{card.addEventListener('click',e=>{if(!e.target.closest('a'))location.href=card.dataset.cardHref});card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a')){e.preventDefault();location.href=card.dataset.cardHref}})});

let data,currentMenu='food',currentCategory='';const categoryNav=document.querySelector('#category-nav'),menuContent=document.querySelector('#menu-content');
if(categoryNav&&menuContent){
  const params=new URLSearchParams(location.search),requestedType=params.get('type'),requestedCategory=params.get('category'),requestedTarget=params.get('target'),requestedSection=params.get('section');currentMenu=requestedType==='drinks'?'drinks':'food';
  const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const jumpSectionLabel='Jump to section';
  function focusRequestedDestination(){requestAnimationFrame(()=>requestAnimationFrame(()=>{const item=[...menuContent.querySelectorAll('[data-menu-target]')].find(el=>el.dataset.menuTarget===requestedTarget),section=requestedSection&&document.getElementById(requestedSection),target=item||section;if(!target)return;target.scrollIntoView({behavior:'smooth',block:'center'});if(item){item.classList.add('menu-target-highlight');setTimeout(()=>item.classList.remove('menu-target-highlight'),2400)}}))}
  function syncUrl(){const url=new URL(location.href);url.searchParams.set('type',currentMenu);url.searchParams.set('category',slug(currentCategory));history.replaceState(null,'',url)}
  function renderCategories(){const categories=Object.keys(data[currentMenu]);const match=categories.find(c=>slug(c)===requestedCategory);if(!categories.includes(currentCategory))currentCategory=match||categories[0];categoryNav.innerHTML=categories.map(c=>`<button class="${c===currentCategory?'active':''}" data-category="${c}">${c}</button>`).join('');renderItems();categoryNav.querySelector('.active')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});syncUrl()}
  function renderItems(){const items=data[currentMenu][currentCategory];menuContent.classList.add('changing');setTimeout(()=>{menuContent.innerHTML=`<h3>${currentCategory}</h3><div class="menu-grid">${items.map(i=>`<article class="menu-item"><div class="item-line"><h4>${i.name}${i.v?'<span class="veg">V</span>':''}</h4><span class="price">${i.price||''}</span></div>${i.description?`<p>${i.description}</p>`:''}</article>`).join('')}</div>`;menuContent.classList.remove('changing')},180)}
  categoryNav.addEventListener('click',e=>{if(!e.target.dataset.category)return;currentCategory=e.target.dataset.category;renderCategories()});
  function renderDrinksMenu(json){
    const drinksOrder=['Cocktails','Cocktail Trees','Wine & Fizz','Beers & Ale','Mocktails','Non-Alcoholic Drinks'];
    const categories=[...(json.categories||[])].sort((a,b)=>drinksOrder.indexOf(a.name)-drinksOrder.indexOf(b.name));
    const navLinks=categories.map((cat,index)=>`<a href="#${slug(cat.name)}" class="${index===0?'active':''}">${cat.name}</a>`).join('');
    const renderItem = (item, columns = []) => {
      const tags = Array.isArray(item.tags) ? item.tags.map(tag => `<span class="drinks-tag">${tag}</span>`).join('') : '';
      const priceTable = Array.isArray(item.prices) && columns.length ? `
        <div class="drink-price-table" role="table" aria-label="${item.name} prices" style="--columns:${columns.length};">
          <div class="drink-price-row drink-price-head" role="row">
            ${columns.map(col => `<div role="columnheader">${col}</div>`).join('')}
          </div>
          <div class="drink-price-row" role="row">
            ${item.prices.map(priceCell => `<div role="cell">${priceCell}</div>`).join('')}
          </div>
        </div>` : '';
      const price = item.price ? `<span class="drink-price">${item.price}</span>` : '';
      const description = item.description ? `<p class="drink-description">${item.description}</p>` : '';
      return `
        <article class="drink-item" data-menu-target="${slug(item.name)}">
          <div class="drink-item-top">
            <div class="drink-item-title-wrap">
              <div class="drink-item-heading">
                <h4>${item.name}</h4>
                ${tags ? `<div class="drink-tags">${tags}</div>` : ''}
              </div>
              ${description}
            </div>
            <div class="drink-item-price-wrap">${priceTable || price}</div>
          </div>
        </article>
      `;
    };
    const sections=categories.map(cat=>{
      const columns = Array.isArray(cat.priceColumns) ? cat.priceColumns : [];
      const subcategoryMarkup = Array.isArray(cat.subcategories) ? cat.subcategories.map(sub => {
        const subColumns = Array.isArray(sub.priceColumns) ? sub.priceColumns : columns;
        const itemMarkup = (sub.items||[]).map(item => renderItem(item, subColumns)).join('');
        return `
          <div class="drink-subcategory">
            <h3>${sub.name}</h3>
            <div class="drink-item-list">${itemMarkup}</div>
          </div>
        `;
      }).join('') : `
        <div class="drink-item-list">${(cat.items||[]).map(item => renderItem(item, columns)).join('')}</div>`;
      return `
        <section class="drinks-section" id="${slug(cat.name)}">
          <div class="drinks-section-header">
            <h2>${cat.name}</h2>
          </div>
          ${cat.note ? `<div class="drinks-note">${cat.note}</div>` : ''}
          ${subcategoryMarkup}
        </section>
      `;
    }).join('');
    menuContent.innerHTML = `
      <div class="drinks-layout">
        <aside class="drinks-sidebar">
          <nav class="drinks-side-nav" aria-label="Drinks categories">${navLinks}</nav>
          <label class="drinks-mobile-label" for="drinks-mobile-nav">${jumpSectionLabel}</label>
          <select id="drinks-mobile-nav" class="drinks-mobile-nav" aria-label="Select drinks section">
            ${categories.map((cat, index) => `<option value="#${slug(cat.name)}" ${index===0 ? 'selected' : ''}>${cat.name}</option>`).join('')}
          </select>
        </aside>
        <div class="drinks-main">${sections}</div>
      </div>
    `;
    focusRequestedDestination();
    const sectionLinks = menuContent.querySelectorAll('.drinks-side-nav a');
    const select = menuContent.querySelector('#drinks-mobile-nav');
    if (select) {
      select.addEventListener('change', e => {
        const target = document.querySelector(e.target.value);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      sectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
      if (select) select.value = `#${id}`;
    }, { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.4, 0.6] });
    menuContent.querySelectorAll('.drinks-section').forEach(section => observer.observe(section));
    sectionLinks.forEach(link => link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }
  function renderFoodMenu(json){
    const categories = json.categories || [];
    const navLinks = categories.map((cat, index) => `<a href="#${slug(cat.name)}" class="${index === 0 ? 'active' : ''}">${cat.name}</a>`).join('');
    const renderFoodItem = item => {
      const vegBadge = item.name.includes('(V)') ? '<span class="food-veg-badge">V</span>' : '';
      const itemName = item.name.replace(/\s*\(V\)\s*$/, '');
      const priceOptions = Array.isArray(item.prices) ? `
        <div class="food-price-pairs">
          ${item.prices.map(price => `<span class="food-price-pair"><em>${price.label}</em><strong>${price.value}</strong></span>`).join('')}
        </div>` : '';
      const singlePrice = item.price ? `<span class="food-price">${item.price}</span>` : '';
      const description = item.description ? `<p class="food-description">${item.description}</p>` : '';
      return `
        <article class="food-item" data-menu-target="${slug(itemName)}">
          <div class="food-item-top">
            <div class="food-item-copy">
              <div class="food-item-head">
                <h4>${itemName}</h4>
                ${vegBadge}
              </div>
              ${description}
            </div>
            <div class="food-item-price-wrap">${priceOptions || singlePrice}</div>
          </div>
        </article>
      `;
    };
    const sections = categories.map(cat => `
      <section class="food-section" id="${slug(cat.name)}">
        <div class="food-section-header">
          <h2>${cat.name}</h2>
        </div>
        ${cat.note ? `<div class="food-note">${cat.note}</div>` : ''}
        <div class="food-item-list">${(cat.items || []).map(renderFoodItem).join('')}</div>
      </section>
    `).join('');
    menuContent.innerHTML = `
      <div class="drinks-layout">
        <aside class="drinks-sidebar">
          <nav class="drinks-side-nav" aria-label="Food categories">${navLinks}</nav>
          <label class="drinks-mobile-label" for="food-mobile-nav">${jumpSectionLabel}</label>
          <select id="food-mobile-nav" class="drinks-mobile-nav" aria-label="Select food section">
            ${categories.map((cat, index) => `<option value="#${slug(cat.name)}" ${index===0 ? 'selected' : ''}>${cat.name}</option>`).join('')}
          </select>
        </aside>
        <div class="drinks-main">${sections}</div>
      </div>
    `;
    focusRequestedDestination();
    const sectionLinks = menuContent.querySelectorAll('.drinks-side-nav a');
    const select = menuContent.querySelector('#food-mobile-nav');
    if (select) {
      select.addEventListener('change', e => {
        const target = document.querySelector(e.target.value);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      sectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
      if (select) select.value = `#${id}`;
    }, { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.4, 0.6] });
    menuContent.querySelectorAll('.food-section').forEach(section => observer.observe(section));
    sectionLinks.forEach(link => link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }
  function openMenu(type){currentMenu=type;currentCategory='';document.querySelectorAll('.menu-tabs button').forEach(b=>{const active=b.dataset.menu===type;b.classList.toggle('active',active);b.setAttribute('aria-selected',active)});if(type==='drinks'){const url=new URL(location.href);url.searchParams.set('type','drinks');history.replaceState(null,'',url);fetch('data/drinks-menu.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(renderDrinksMenu).catch(()=>menuContent.innerHTML='<p>Our drinks menu is temporarily unavailable. Please call <a href="tel:+441964535507">+44 1964 535507</a>.</p>');return;}const url=new URL(location.href);url.searchParams.set('type','food');history.replaceState(null,'',url);fetch('data/food-menu.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(renderFoodMenu).catch(()=>menuContent.innerHTML='<p>Our food menu is temporarily unavailable. Please call <a href="tel:+441964535507">+44 1964 535507</a>.</p>');}
  document.querySelectorAll('.menu-tabs button').forEach(b=>b.addEventListener('click',()=>openMenu(b.dataset.menu)));
  fetch(currentMenu==='drinks'?'data/drinks-menu.json':'data/food-menu.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(json=>{data=json;document.querySelectorAll('.menu-tabs button').forEach(b=>{const active=b.dataset.menu===currentMenu;b.classList.toggle('active',active);b.setAttribute('aria-selected',active)});if(currentMenu==='drinks'){renderDrinksMenu(json);return;}renderFoodMenu(json);}).catch(()=>menuContent.innerHTML='<p>Our menu is temporarily unavailable. Please call <a href="tel:+441964535507">+44 1964 535507</a>.</p>');
}

const form=document.querySelector('#booking-form');if(form){form.querySelector('[name=date]').min=new Date().toISOString().split('T')[0];form.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(form),subject=encodeURIComponent('Table request — '+f.get('date')),body=encodeURIComponent(`Name: ${f.get('name')}\nEmail: ${f.get('email')}\nPhone: ${f.get('phone')}\nDate: ${f.get('date')}\nPreferred time: ${f.get('time')}\nGuests: ${f.get('guests')}\nNotes: ${f.get('message')||'None'}`);form.querySelector('.form-status').textContent='Opening your email app — our team will confirm availability with you.';location.href=`mailto:lucieneid@hotmail.com?subject=${subject}&body=${body}`})}
const modal=document.querySelector('#lightbox');if(modal){document.querySelectorAll('.gallery-item').forEach(item=>{item.addEventListener('click',()=>{const type=item.dataset.type||'image';if(type==='video'){const videoPath=item.dataset.video||'assets/luciens-gallery-video-01.mp4';modal.querySelector('div').style.backgroundImage='none';modal.querySelector('div').innerHTML=`<video style="width:100%;height:100%;object-fit:contain" controls autoplay muted><source src="${videoPath}" type="video/mp4">Your browser does not support the video tag.</video>`;modal.querySelector('p').textContent=item.textContent}else{modal.querySelector('div').innerHTML='';modal.querySelector('div').style.backgroundImage=getComputedStyle(item).backgroundImage;modal.querySelector('p').textContent=item.textContent}modal.showModal()})});modal.querySelector('button').addEventListener('click',()=>modal.close());modal.addEventListener('click',e=>{if(e.target===modal)modal.close()})}
const sections=[...document.querySelectorAll('main section[id]')];if(sections.length)addEventListener('scroll',()=>{let current='home';sections.forEach(s=>{if(scrollY>=s.offsetTop-180)current=s.id});document.querySelectorAll('.nav nav a[href^="#"]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current))},{passive:true});
