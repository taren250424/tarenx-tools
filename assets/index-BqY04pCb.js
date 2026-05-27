(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),document.querySelector(`#app`).innerHTML=`
  <div style="font-family: Inter, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; text-align: center;">
    <h1 style="color: #333; font-size: 3rem; margin-bottom: 2rem;">Tarenx Tools</h1>
    <p style="color: #666; font-size: 1.2rem; margin-bottom: 3rem;">A collection of useful utilities.</p>
    
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <a href="/symbol-picker/" style="display: block; padding: 1.5rem; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #1f2937; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1)';">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #2563eb;">Symbol Picker</h2>
        <p style="margin: 0; color: #4b5563;">Go to Symbol Picker application</p>
      </a>
    </div>
  </div>
`;