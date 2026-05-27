import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
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
`
