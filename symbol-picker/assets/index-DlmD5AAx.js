(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={arrows:[[8592,8703]],math:[[8704,8959]],shapes:[[9632,9727]],dingbats:[[9984,10175]],currency:[[8352,8399]],letterlike:[[8448,8527]],punctuation:[[8208,8231],[8240,8286]],fractions:[[8528,8591]],superscript:[[8304,8351]],braille:[[10240,10495]],enclosed:[[9312,9471]],boxdrawing:[[9472,9599]],emoji_misc:[[9728,9983]]};function t(e,t){return Array.from({length:t-e+1},(t,n)=>{let r=e+n;return{char:String.fromCodePoint(r),code:`U+`+r.toString(16).toUpperCase()}})}var n=class extends HTMLElement{shadow;constructor(e){super();let t=document.createElement(`template`);t.innerHTML=e,this.shadow=this.attachShadow({mode:`open`}),this.shadow.appendChild(t.content.cloneNode(!0))}query(e){return this.shadow.querySelector(e)}queryOptional(e){return this.shadow.querySelector(e)}applyStyles(e,t=`component-styles`){let n=this.shadow.querySelector(`#${t}`);n||(n=document.createElement(`style`),n.id=t,this.shadow.appendChild(n)),n.textContent=e}forwardNativeEvent(e){this.dispatchEvent(new Event(e,{bubbles:!0,composed:!0}))}forwardCustomEvent(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t?.detail,bubbles:!0,composed:!0}))}addEventListener(e,t,n){super.addEventListener(e,t,n)}removeEventListener(e,t,n){super.removeEventListener(e,t,n)}},r=class extends n{_boundDispatchInputEvent=this._dispatchInputEvent.bind(this);_boundDispatchChangeEvent=this._dispatchChangeEvent.bind(this);_boundDispatchFocusinEvent=this._dispatchFocusinEvent.bind(this);_boundDispatchFocusoutEvent=this._dispatchFocusoutEvent.bind(this);_$input;constructor(e){super(e),this._initializeInput(),this._syncUI(this.getAttribute(`value`))}_initializeInput(){this._$input=this.query(this.getInputSelector())}getValidateValue(e){let t=isNaN(e)?this.min:e,n=Math.max(this.min,Math.min(this.max,t))-this.min,r=Math.round(n/this.step)*this.step,i=this.min+r;return i>this.max&&(i-=this.step),Number(i.toFixed(this.decimalPlaces))}connectedCallback(){this._$input.addEventListener(`input`,this._boundDispatchInputEvent),this._$input.addEventListener(`change`,this._boundDispatchChangeEvent),this._$input.addEventListener(`focusin`,this._boundDispatchFocusinEvent),this._$input.addEventListener(`focusout`,this._boundDispatchFocusoutEvent)}disconnectedCallback(){this._$input.removeEventListener(`input`,this._boundDispatchInputEvent),this._$input.removeEventListener(`change`,this._boundDispatchChangeEvent),this._$input.removeEventListener(`focusin`,this._boundDispatchFocusinEvent),this._$input.removeEventListener(`focusout`,this._boundDispatchFocusoutEvent)}_dispatchInputEvent(e){e.stopImmediatePropagation(),this.forwardNativeEvent(`input`)}_dispatchChangeEvent(e){e.stopImmediatePropagation();let t=this.getValidateValue(this._$input.valueAsNumber);this.value=t,this.forwardNativeEvent(`change`)}_dispatchFocusinEvent(e){e.stopImmediatePropagation(),this.forwardNativeEvent(`focusin`)}_dispatchFocusoutEvent(e){e.stopImmediatePropagation();let t=this.getValidateValue(this._$input.valueAsNumber);this.value=t,this.forwardNativeEvent(`focusout`)}static get observedAttributes(){return[`value`,`min`,`max`,`step`]}attributeChangedCallback(e,t,n){this._baseAeroNumericInputAttributeHandlers[e]?.(n)}_baseAeroNumericInputAttributeHandlers={value:e=>{this._syncUI(e)},min:()=>{this.value=this.value},max:()=>{this.value=this.value},step:()=>{this.value=this.value}};_syncUI(e){e&&(this._$input.value=e)}get input(){return this._$input}get value(){let e=this.getAttribute(`value`);return e===null?this.min:Number(e)}set value(e){let t=this.getValidateValue(e);this.setAttribute(`value`,String(t))}get min(){let e=this.getAttribute(`min`);return e===null||isNaN(Number(e))?0:Number(e)}set min(e){this.setAttribute(`min`,String(e))}get max(){let e=this.getAttribute(`max`);return e===null||isNaN(Number(e))?100:Number(e)}set max(e){this.setAttribute(`max`,String(e))}get step(){let e=this.getAttribute(`step`),t=Number(e);return e===null||isNaN(t)||t<=0?1:t}set step(e){this.setAttribute(`step`,String(e))}get decimalPlaces(){let e=this.getAttribute(`step`);if(!e||isNaN(Number(e)))return 0;let t=e?.split(`.`);return t?.length>1?t[1].length:0}},i=`<style>\r
	:host {\r
		border: 1px solid #ccc;\r
		display: block;\r
\r
		width: 100px;\r
		height: 30px;\r
	}\r
\r
	#input {\r
		width: 100%;\r
		height: 100%;\r
		padding: 0;\r
		border: none;\r
\r
		text-align: inherit;\r
		font-size: inherit;\r
		color: inherit;\r
	}\r
\r
	#input:focus {\r
		outline: none;\r
	}\r
	#input::-webkit-inner-spin-button {\r
		appearance: none;\r
	}\r
</style>\r
\r
<input id="input" type="number" />\r
`,a=class extends r{constructor(){super(i)}getInputSelector(){return`#input`}},o=`<style>\r
	:host {\r
		border: 1px solid #ccc;\r
		display: block;\r
\r
		width: 130px;\r
		height: 30px;\r
	}\r
\r
	#spinbox {\r
		display: grid;\r
	}\r
\r
	#spinbox,\r
	#spinbox > * {\r
		width: 100%;\r
		height: 100%;\r
		border: none;\r
		font-size: inherit;\r
		color: inherit;\r
	}\r
\r
	#spinbox > button {\r
		cursor: pointer;\r
		background-color: var(--aero-spinbox-button-background, lightgrey);\r
	}\r
\r
	#input {\r
		padding: 0;\r
		text-align: center;\r
	}\r
\r
	#input:focus {\r
		outline: none;\r
	}\r
	#input::-webkit-inner-spin-button {\r
		appearance: none;\r
	}\r
</style>\r
\r
<div id="spinbox">\r
	<button id="minus">-</button>\r
	<input id="input" type="number" />\r
	<button id="plus">+</button>\r
</div>\r
`,s=class extends r{_boundDecrement=this.decrement.bind(this);_boundIncrement=this.increment.bind(this);_$minus;_$plus;_resizeObserver;constructor(){super(o),this._$minus=this.query(`#minus`),this._$plus=this.query(`#plus`),this._updateMinuxText(this.getAttribute(`minus-text`)),this._updatePlusText(this.getAttribute(`plus-text`)),this._updateHeight(parseInt(getComputedStyle(this).height)),this._resizeObserver=new ResizeObserver(e=>{for(let t of e){let e=t.contentRect.height;this.applyStyles(`#spinbox {
						grid-template-columns: ${e}px 1fr ${e}px;
					}`)}})}getInputSelector(){return`#input`}connectedCallback(){this._$minus.addEventListener(`click`,this._boundDecrement),this._$plus.addEventListener(`click`,this._boundIncrement),this._resizeObserver.observe(this)}disconnectedCallback(){this._$minus.removeEventListener(`click`,this._boundDecrement),this._$plus.removeEventListener(`click`,this._boundIncrement),this._resizeObserver.disconnect()}static get observedAttributes(){return[...super.observedAttributes,`minus-text`,`plus-text`]}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),this._aeroSpinboxAttributeHandlers[e]?.(n)}_aeroSpinboxAttributeHandlers={"minus-text":e=>{this._updateMinuxText(e)},"plus-text":e=>{this._updatePlusText(e)}};_updateMinuxText(e){this._$minus.textContent=e||`-`}_updatePlusText(e){this._$plus.textContent=e||`+`}_updateHeight(e){e||=30,this.applyStyles(`#spinbox {
				grid-template-columns: ${e}px 1fr ${e}px;
			}`)}set minusText(e){this.setAttribute(`minus-text`,e)}set plusText(e){this.setAttribute(`plus-text`,e)}decrement(){let e=this.value-this.step;this.value=this.getValidateValue(e)}increment(){let e=this.value+this.step;this.value=this.getValidateValue(e)}},c=`<style>\r
	:host {\r
		display: block;\r
	}\r
</style>\r
`,l=class extends n{_size;_thickness;_radius;_circumference;_trackColor;_arcColor;_cycle;_arcRatio;_$svg;_$track;_$arc;constructor(){super(c),this._syncHostAttributes(),this._buildSvg(),this._syncSvgAttributes(),this._syncStyles()}_buildSvg(){let e=`http://www.w3.org/2000/svg`;this._$svg=document.createElementNS(e,`svg`),this._$track=document.createElementNS(e,`circle`),this._$arc=document.createElementNS(e,`circle`),this._$track.classList.add(`track`),this._$arc.classList.add(`arc`),this._$svg.appendChild(this._$track),this._$svg.appendChild(this._$arc),this.shadow.appendChild(this._$svg)}static get observedAttributes(){return[`size`,`thickness`,`track-color`,`arc-color`,`cycle`,`arc-ratio`]}attributeChangedCallback(e,t,n){this._syncHostAttributes(),this._syncSvgAttributes(),this._syncStyles()}_syncHostAttributes(){this._size=parseInt(this.getAttribute(`size`)||`50`),this._thickness=parseInt(this.getAttribute(`thickness`)||`4`),this._radius=this._size/2-this._thickness-1,this._circumference=2*Math.PI*this._radius,this._trackColor=this.getAttribute(`track-color`)||`transparent`,this._arcColor=this.getAttribute(`arc-color`)||`black`,this._cycle=parseInt(this.getAttribute(`cycle`)||`2`),this._arcRatio=parseFloat(this.getAttribute(`arc-ratio`)||`90`)/100}_syncSvgAttributes(){this._$svg.setAttribute(`viewBox`,`0 0 ${this._size} ${this._size}`),this._$svg.setAttribute(`width`,String(this._size)),this._$svg.setAttribute(`height`,String(this._size)),this._$track.setAttribute(`cx`,String(this._size/2)),this._$track.setAttribute(`cy`,String(this._size/2)),this._$track.setAttribute(`r`,String(this._radius)),this._$arc.setAttribute(`cx`,String(this._size/2)),this._$arc.setAttribute(`cy`,String(this._size/2)),this._$arc.setAttribute(`r`,String(this._radius))}_syncStyles(){this.applyStyles(`
			:host {
				width: ${this._size}px;
				height: ${this._size}px;
			}

			.track {
				fill: none;
				stroke: ${this._trackColor};
				stroke-width: ${this._thickness};
			}

			.arc {
				fill: none;
				stroke: ${this._arcColor};
				stroke-width: ${this._thickness};

				stroke-dasharray: ${this._circumference};
				stroke-dashoffset: ${this._circumference};

				transform-origin: center;

				animation:
					spin ${this._cycle}s linear infinite,
					arc ${this._cycle}s ease-in-out infinite;
			}

			@keyframes spin {
				to {
					transform: rotate(360deg);
				}
			}

			@keyframes arc {
				0% {
					stroke-dasharray: 10 ${this._circumference-10};
					stroke-dashoffset: 0;
				}
				50% {
					stroke-dasharray: ${this._circumference*this._arcRatio} ${this._circumference-this._circumference*this._arcRatio};
					stroke-dashoffset: 0;
				}
				100% {
					stroke-dasharray: 10 ${this._circumference-10};
					stroke-dashoffset: ${this._circumference*-1};
				}
			}
		`)}},u=`<style>\r
	:host {\r
		position: relative;\r
		display: block;\r
		width: 300px;\r
		height: 300px;\r
		border: 1px solid lightgray;\r
		box-sizing: border-box;\r
	}\r
\r
	.resizer {\r
		position: absolute;\r
		background-color: transparent;\r
		transition: background-color 0.3s ease;\r
	}\r
\r
	.resizer:hover {\r
		background-color: var(--aero-resizable-box-resizer-color, grey);\r
	}\r
\r
	.horizontal {\r
		width: 3px;\r
		height: 100%;\r
		cursor: ew-resize;\r
	}\r
\r
	.vertical {\r
		width: 100%;\r
		height: 3px;\r
		cursor: ns-resize;\r
	}\r
\r
	#top {\r
		left: 0;\r
		top: 0;\r
		transform: translateY(-50%);\r
	}\r
\r
	#bottom {\r
		left: 0;\r
		bottom: 0;\r
		transform: translateY(50%);\r
	}\r
\r
	#left {\r
		top: 0;\r
		left: 0;\r
		transform: translateX(-50%);\r
	}\r
\r
	#right {\r
		top: 0;\r
		right: 0;\r
		transform: translateX(50%);\r
	}\r
</style>\r
\r
<slot></slot>\r
<div id="top" class="resizer vertical"></div>\r
<div id="bottom" class="resizer vertical"></div>\r
<div id="left" class="resizer horizontal"></div>\r
<div id="right" class="resizer horizontal"></div>\r
`,d=class e extends n{_$topResizer;_$bottomResizer;_$leftResizer;_$rightResizer;_nMinWidth;_nMaxWidth;_nMinHeight;_nMaxHeight;_isTopDragging=!1;_isBottomDragging=!1;_isLeftDragging=!1;_isRightDragging=!1;_isDragging=!1;_animationFrameId=null;_resizerHandlers={top:e=>this._processMousedownEvent(e,`top`),bottom:e=>this._processMousedownEvent(e,`bottom`),left:e=>this._processMousedownEvent(e,`left`),right:e=>this._processMousedownEvent(e,`right`)};constructor(){super(u),this._$topResizer=this.query(`#top`),this._$bottomResizer=this.query(`#bottom`),this._$leftResizer=this.query(`#left`),this._$rightResizer=this.query(`#right`),this._updateMinWidthValue(this.getAttribute(`min-width`)),this._updateMaxWidthValue(this.getAttribute(`max-width`)),this._updateMinHeightValue(this.getAttribute(`min-height`)),this._updateMaxHeightValue(this.getAttribute(`max-height`)),this._initializeAttributes()}_initializeAttributes(){e.observedAttributes.forEach(e=>{let t=this.getAttribute(e);this._baseAeroResizeBoxAttributeHandlers[e]?.(t)})}connectedCallback(){this._updateResizeState(`top`,this.hasAttribute(`resize-top`)),this._updateResizeState(`bottom`,this.hasAttribute(`resize-bottom`)),this._updateResizeState(`left`,this.hasAttribute(`resize-left`)),this._updateResizeState(`right`,this.hasAttribute(`resize-right`)),window.addEventListener(`mousemove`,this._handleMousemove),window.addEventListener(`mouseup`,this._handleMouseup)}disconnectedCallback(){this._updateResizeState(`top`,!1),this._updateResizeState(`bottom`,!1),this._updateResizeState(`left`,!1),this._updateResizeState(`right`,!1),window.removeEventListener(`mousemove`,this._handleMousemove),window.removeEventListener(`mouseup`,this._handleMouseup)}_handleMousemove=e=>{this._isDragging&&(this._animationFrameId&&cancelAnimationFrame(this._animationFrameId),this._animationFrameId=requestAnimationFrame(()=>{let t=this.getBoundingClientRect();if(this._isTopDragging){let n=t.bottom-e.clientY,r=Math.min(Math.max(n,this._nMinHeight),this._nMaxHeight);this.style.height=`${r}px`,this._emitResize(null,r)}else if(this._isBottomDragging){let n=e.clientY-t.top,r=Math.min(Math.max(n,this._nMinHeight),this._nMaxHeight);this.style.height=`${r}px`,this._emitResize(null,r)}else if(this._isLeftDragging){let n=t.right-e.clientX,r=Math.min(Math.max(n,this._nMinWidth),this._nMaxWidth);this.style.width=`${r}px`,this._emitResize(r,null)}else if(this._isRightDragging){let n=e.clientX-t.left,r=Math.min(Math.max(n,this._nMinWidth),this._nMaxWidth);this.style.width=`${r}px`,this._emitResize(r,null)}}))};_handleMouseup=e=>{this._isDragging&&(this.forwardCustomEvent(`aero-resize-end`,{detail:{width:this.offsetWidth,height:this.offsetHeight}}),this._animationFrameId&&=(cancelAnimationFrame(this._animationFrameId),null),document.body.style.cursor=``,document.body.style.userSelect=``,this._isDragging=!1,this._isTopDragging=!1,this._isBottomDragging=!1,this._isLeftDragging=!1,this._isRightDragging=!1)};_processMousedownEvent=(e,t)=>{switch(e.preventDefault(),document.body.style.userSelect=`none`,this._isDragging=!0,this.forwardCustomEvent(`aero-resize-start`,{detail:{width:this.offsetWidth,height:this.offsetHeight,edge:t}}),t){case`top`:this._isTopDragging=!0,document.body.style.cursor=`ns-resize`;break;case`bottom`:this._isBottomDragging=!0,document.body.style.cursor=`ns-resize`;break;case`left`:this._isLeftDragging=!0,document.body.style.cursor=`ew-resize`;break;case`right`:this._isRightDragging=!0,document.body.style.cursor=`ew-resize`;break}};_emitResize(e,t){this.forwardCustomEvent(`aero-resize`,{detail:{width:e,height:t}})}static get observedAttributes(){return[`min-width`,`max-width`,`min-height`,`max-height`,`resize-top`,`resize-bottom`,`resize-left`,`resize-right`]}attributeChangedCallback(e,t,n){this._baseAeroResizeBoxAttributeHandlers[e]?.(n)}_baseAeroResizeBoxAttributeHandlers={"min-width":e=>{this._updateMinWidthValue(e)},"max-width":e=>{this._updateMaxWidthValue(e)},"min-height":e=>{this._updateMinHeightValue(e)},"max-height":e=>{this._updateMaxHeightValue(e)},"resize-top":e=>{this._updateResizeState(`top`,e!==null)},"resize-bottom":e=>{this._updateResizeState(`bottom`,e!==null)},"resize-left":e=>{this._updateResizeState(`left`,e!==null)},"resize-right":e=>{this._updateResizeState(`right`,e!==null)}};_updateResizeState(e,t){let n,r;switch(e){case`top`:n=this._$topResizer,r=this._resizerHandlers.top;break;case`bottom`:n=this._$bottomResizer,r=this._resizerHandlers.bottom;break;case`left`:n=this._$leftResizer,r=this._resizerHandlers.left;break;case`right`:n=this._$rightResizer,r=this._resizerHandlers.right;break}n.hidden=!t,t?n.addEventListener(`mousedown`,r):n.removeEventListener(`mousedown`,r)}_updateMinWidthValue(e){this._nMinWidth=e?Number(e):0}_updateMaxWidthValue(e){this._nMaxWidth=e?Number(e):2e3}_updateMinHeightValue(e){this._nMinHeight=e?Number(e):0}_updateMaxHeightValue(e){this._nMaxHeight=e?Number(e):2e3}get minWidth(){return this._nMinWidth.toString()}set minWidth(e){this.setAttribute(`min-width`,e)}get maxWidth(){return this._nMaxWidth.toString()}set maxWidth(e){this.setAttribute(`max-width`,e)}get minHeight(){return this._nMinHeight.toString()}set minHeight(e){this.setAttribute(`min-height`,e)}get maxHeight(){return this._nMaxHeight.toString()}set maxHeight(e){this.setAttribute(`max-height`,e)}addTopResizer(){this.setAttribute(`resize-top`,``)}removeTopResizer(){this.removeAttribute(`resize-top`)}addBottomResizer(){this.setAttribute(`resize-bottom`,``)}removeBottomResizer(){this.removeAttribute(`resize-bottom`)}addLeftResizer(){this.setAttribute(`resize-left`,``)}removeLeftResizer(){this.removeAttribute(`resize-left`)}addRightResizer(){this.setAttribute(`resize-right`,``)}removeRightResizer(){this.removeAttribute(`resize-right`)}},f=`<style>\r
	:host {\r
		--aero-select-width: 100%;\r
		--aero-select-height: 36px;\r
\r
		--aero-select-font-size: 16px;\r
		--aero-select-font-family: san-serif;\r
\r
		--aero-select-border: 1px solid #000;\r
\r
		--aero-select-dropdown-border: 1px solid #000;\r
		--aero-select-dropdown-z-index: 100;\r
		--aero-select-dropdown-item-border: 1px solid grey;\r
		--aero-select-dropdown-item-background: #fff;\r
		--aero-select-dropdown-item-color: #000;\r
\r
		--aero-select-dropdown-hover-item-border: 1px solid grey;\r
		--aero-select-dropdown-hover-item-background: #000;\r
		--aero-select-dropdown-hover-item-color: white;\r
		--aero-select-dropdown-hover-item-cursor: pointer;\r
\r
		--aero-select-span-background: transparent;\r
		--aero-select-span-border: 1px solid transparent;\r
\r
		--aero-select-button-border: 1px solid #000;\r
		--aero-select-button-background: lightgrey;\r
		--aero-select-button-color: #000;\r
\r
		--aero-select-button-hover-border: 1px solid #000;\r
		--aero-select-button-hover-background: grey;\r
		--aero-select-button-hover-color: #000;\r
		--aero-select-button-hover-cursor: pointer;\r
\r
		display: block;\r
\r
		width: var(--aero-select-width, 100%);\r
		height: var(--aero-select-height, 36px);\r
\r
		font-size: var(--aero-select-font-size);\r
		font-family: var(--aero-select-font-family);\r
	}\r
\r
	::slotted(*) {\r
    display: grid;\r
    grid-template-columns: 1fr var(--aero-select-height, 36px);\r
		height: var(--aero-select-height, 36px);\r
\r
    text-align: center;\r
		line-height: var(--aero-select-height);\r
\r
		border-bottom: var(--aero-select-dropdown-item-border);\r
		background-color: var(--aero-select-dropdown-item-background);\r
		color: var(--aero-select-dropdown-item-color);\r
	}\r
\r
	::slotted(*.highlight),\r
	::slotted(*:hover) {\r
		border-bottom: var(--aero-select-dropdown-hover-item-border);\r
		background-color: var(--aero-select-dropdown-hover-item-background);\r
		color: var(--aero-select-dropdown-hover-item-color);\r
		cursor: var(--aero-select-dropdown-hover-item-cursor);\r
	}\r
\r
	::slotted(*:last-child) {\r
		border-bottom: none;\r
	}\r
\r
	::slotted(*)::after {\r
		content: '';\r
	}\r
\r
	#overlay {\r
		position: relative;\r
\r
		width: 100%;\r
    height: 100%;\r
	}\r
\r
	#container {\r
		width: 100%;\r
		height: 100%;\r
\r
		display: grid;\r
		grid-template-columns: 1fr auto;\r
\r
		border: var(--aero-select-border);\r
		box-sizing: border-box;\r
	}\r
\r
	#span,\r
	#button {\r
		padding: 0;\r
		margin: 0;\r
	}\r
\r
	#span {\r
		display: flex;\r
		justify-content: center;\r
		align-items: center;\r
\r
		background-color: var(--aero-select-span-background);\r
\r
		border: var(--aero-select-span-border);\r
		box-sizing: border-box;\r
	}\r
\r
	#span:hover {\r
		cursor: default;\r
	}\r
\r
	#button {\r
    aspect-ratio: 1 / 1;\r
\r
		border: var(--aero-select-button-border);\r
		background-color: var(--aero-select-button-background);\r
		color: var(--aero-select-button-color);\r
	}\r
\r
	#button:hover {\r
		border: var(--aero-select-button-hover-border);\r
		background-color: var(--aero-select-button-hover-background);\r
		color: var(--aero-select-button-hover-color);\r
		cursor: var(--aero-select-button-hover-cursor);\r
	}\r
\r
	#dropdown {\r
		position: fixed;\r
		z-index: var(--aero-select-dropdown-z-index);\r
\r
		max-height: calc(var(--aero-select-height, 36px) * 6.5);\r
		overflow-y: auto;\r
\r
		display: none;\r
\r
		border: var(--aero-select-dropdown-border);\r
		box-sizing: border-box;\r
\r
		scrollbar-width: thin;\r
	}\r
\r
	#dropdown.open {\r
		display: block;\r
	}\r
</style>\r
\r
<div id="overlay">\r
	<div id="container">\r
		<span id="span"></span>\r
		<button id="button"></button>\r
	</div>\r
	<div id="dropdown">\r
		<slot></slot>\r
	</div>\r
</div>\r
`,p=class extends n{_handlers={documentClick:this._handleDocumentClick.bind(this),buttonClick:this._handleButtonClick.bind(this),dropdownClick:this._handleDropdownClick.bind(this),slotChange:this._handleSlotChange.bind(this),keydown:this._handleKeydown.bind(this)};_$span;_$button;_$dropdown;_$options=[];_optionIndex=-1;_dropdown_open=!1;_$slot;_highlightIndex=-1;_pendingOptionIndex;constructor(){super(f),this._$span=this.query(`#span`),this._$button=this.query(`#button`),this._$dropdown=this.query(`#dropdown`),this._$slot=this.query(`slot`),this._$options=(this._$slot?.assignedElements()??[]).filter(e=>e instanceof HTMLElement),this._$button.textContent=this.getAttribute(`button-text`)??`▽`,this._updateOptionIndex(this._getValidateOptionIndexByStr(this.getAttribute(`option-index`)??`-1`))}connectedCallback(){document.addEventListener(`click`,this._handlers.documentClick),this._$button.addEventListener(`click`,this._handlers.buttonClick),this._$dropdown.addEventListener(`click`,this._handlers.dropdownClick),this._$slot?.addEventListener(`slotchange`,this._handlers.slotChange),this.addEventListener(`keydown`,this._handlers.keydown)}disconnectedCallback(){document.removeEventListener(`click`,this._handlers.documentClick),this._$button.removeEventListener(`click`,this._handlers.buttonClick),this._$dropdown.removeEventListener(`click`,this._handlers.dropdownClick),this._$slot?.removeEventListener(`slotchange`,this._handlers.slotChange),this.removeEventListener(`keydown`,this._handlers.keydown)}_handleDocumentClick(e){this._dropdown_open&&=(this._closeDropdown(),!1)}_handleButtonClick(e){e.stopPropagation(),this._dropdown_open=!this._dropdown_open,this._dropdown_open?this._openDropdown():this._closeDropdown()}_openDropdown(){let e=this.getBoundingClientRect(),t=this._$dropdown.offsetHeight||parseInt(getComputedStyle(this).getPropertyValue(`--aero-select-height`))*6.5,n=window.innerHeight-e.bottom,r=e.top,i=!1;n<t&&r>n&&(i=!0),this._$dropdown.style.left=`${e.left}px`,this._$dropdown.style.width=`${e.width}px`,i?(this._$dropdown.style.top=`${e.top-t}px`,this._$dropdown.classList.add(`open-up`),this._$dropdown.classList.remove(`open-down`)):(this._$dropdown.style.top=`${e.bottom}px`,this._$dropdown.classList.add(`open-down`),this._$dropdown.classList.remove(`open-up`)),this._$dropdown.classList.add(`open`),window.addEventListener(`scroll`,this._handlers.documentClick,{capture:!0,passive:!0}),window.addEventListener(`resize`,this._handlers.documentClick)}_closeDropdown(){this._$dropdown.classList.remove(`open`,`open-up`,`open-down`),window.removeEventListener(`scroll`,this._handlers.documentClick,{capture:!0}),window.removeEventListener(`resize`,this._handlers.documentClick)}_handleDropdownClick(e){let t=e.composedPath().find(e=>e instanceof HTMLElement&&this._$options.includes(e));if(!t)return;let n=this._$options.indexOf(t);this.optionIndex=n,this._closeDropdown(),this._dropdown_open=!1}_handleSlotChange(){let e=this._$options[this._optionIndex];if(this._$options=this._$slot.assignedElements().filter(e=>e instanceof HTMLElement),this._pendingOptionIndex!==void 0){let e=this._pendingOptionIndex;this._pendingOptionIndex=void 0,this.optionIndex=e}else this.optionIndex=this._$options.findIndex(t=>t===e)}_handleKeydown(e){if(e.key===`Enter`||e.key===` `)if(e.preventDefault(),!this._dropdown_open)this._$button.click();else{let e=this._$options[this._highlightIndex];e&&(e.classList.remove(`highlight`),this.optionIndex=this._highlightIndex),this._highlightIndex=-1,this._$button.click()}if(e.key===`ArrowDown`||e.key===`ArrowUp`){if(e.preventDefault(),!this._dropdown_open||e.key===`ArrowDown`&&this._highlightIndex+1===this._$options.length||e.key===`ArrowUp`&&this._highlightIndex===-1)return;this._$options[this._highlightIndex]?.classList.remove(`highlight`),this._highlightIndex=e.key===`ArrowDown`?this._highlightIndex+1:this._highlightIndex-1,this._$options[this._highlightIndex]?.classList.add(`highlight`),this._$options[this._highlightIndex]?.scrollIntoView({block:`nearest`})}e.key===`Escape`&&this._dropdown_open&&(this._$button.click(),this._highlightIndex=-1)}static get observedAttributes(){return[`option-index`]}attributeChangedCallback(e,t,n){this._aeroSelectAttributeHandlers[e]?.(n)}_aeroSelectAttributeHandlers={"option-index":e=>{this._updateOptionIndex(this._getValidateOptionIndexByStr(e??``))}};get optionIndex(){return this._optionIndex}set optionIndex(e){this.setAttribute(`option-index`,e.toString())}_updateOptionIndex(e){if(this._optionIndex===e)return;if(e<0){this._unsetOption();return}let t=this._$options[e];if(!t){this._pendingOptionIndex=e;return}this._optionIndex=e,this._$span.textContent=t.textContent,this.forwardCustomEvent(`aero-select-changed`,{detail:{option:t,index:e}}),this._pendingOptionIndex=void 0}_getValidateOptionIndexByStr(e){if(e===``)return-1;let t=Number(e);return Number.isNaN(t)?-1:t}_unsetOption(){this._optionIndex=-1,this._$span.textContent=``}},m=class extends HTMLElement{constructor(){super()}get value(){return this.getAttribute(`value`)??``}set value(e){this.setAttribute(`value`,e)}get label(){return this.textContent??``}},h=`<style>\r
	:host {\r
		position: fixed;\r
\r
		top: 90%;\r
		left: 50%;\r
\r
		transform: translate(-50%, 10px);\r
		opacity: 0;\r
\r
		animation: toast-fade linear forwards;\r
\r
		border-radius: 5px;\r
	}\r
\r
	#box {\r
		padding: 5px 10px;\r
	}\r
\r
	@keyframes toast-fade {\r
		0% {\r
			transform: translate(-50%, 10px);\r
			opacity: 0;\r
		}\r
		10% {\r
			transform: translate(-50%, 0);\r
			opacity: 1;\r
		}\r
		90% {\r
			transform: translate(-50%, 0);\r
			opacity: 1;\r
		}\r
		100% {\r
			transform: translate(-50%, 10px);\r
			opacity: 0;\r
		}\r
	}\r
</style>\r
\r
<div id="box">\r
	<span id="text"></span>\r
</div>\r
`,g={top:`90%`,left:`50%`,ms:3e3,background:`black`,color:`white`},_=class e extends n{_$text;constructor(e,t){super(h);let{top:n,left:r,ms:i,background:a,color:o}=t;this._$text=this.query(`#text`),this._$text.textContent=e,this.applyStyles(`
			:host {
				top: ${n};
				left: ${r};
				animation-duration: ${i}ms;
				background: ${a};
				color: ${o};
			}
		`),document.body.appendChild(this),this.addEventListener(`animationend`,()=>{this.remove()},{once:!0})}static show(t,n={}){new e(t,{...g,...n})}},v=`<style>\r
	:host {\r
		position: fixed;\r
		top: 0;\r
		left: 0;\r
		width: 100%;\r
		height: 100%;\r
	}\r
\r
	#overlay {\r
		position: relative;\r
		width: 100%;\r
		height: 100%;\r
	}\r
\r
	#container {\r
		position: absolute;\r
		top: 50%;\r
		left: 50%;\r
		transform: translate(-50%, -50%);\r
\r
		min-width: 300px;\r
		min-height: 200px;\r
\r
		display: grid;\r
		grid-template-rows: 1fr 4fr;\r
		grid-template-columns: 1fr;\r
	}\r
\r
	#head {\r
		display: grid;\r
		place-items: center;\r
		font-weight: bold;\r
	}\r
\r
	#body {\r
		display: grid;\r
		grid-template-rows: 1fr auto;\r
		grid-template-columns: 1fr;\r
\r
		place-items: center;\r
	}\r
\r
	#button-box {\r
		padding: 10px;\r
	}\r
\r
	button {\r
		min-width: 70px;\r
		min-height: 30px;\r
		border: none;\r
	}\r
\r
	button:hover {\r
		cursor: pointer;\r
		filter: brightness(0.9);\r
	}\r
\r
	button:active {\r
		scale: 0.99;\r
	}\r
</style>\r
\r
<div id="overlay">\r
	<div id="container">\r
		<div id="head">\r
			<span id="title"></span>\r
		</div>\r
		<div id="body">\r
			<span id="message"></span>\r
			<div id="button-box">\r
				<button id="ok">ok</button>\r
			</div>\r
		</div>\r
	</div>\r
</div>\r
`,y=`<style>\r
	:host {\r
		position: fixed;\r
		top: 0;\r
		left: 0;\r
		width: 100%;\r
		height: 100%;\r
	}\r
\r
	#overlay {\r
		position: relative;\r
		width: 100%;\r
		height: 100%;\r
	}\r
\r
	#container {\r
		position: absolute;\r
		top: 50%;\r
		left: 50%;\r
		transform: translate(-50%, -50%);\r
\r
		min-width: 300px;\r
		min-height: 200px;\r
\r
		display: grid;\r
		grid-template-rows: 1fr 4fr;\r
		grid-template-columns: 1fr;\r
	}\r
\r
	#head {\r
\r
	}\r
\r
	#body {\r
		display: grid;\r
		grid-template-rows: 1fr auto;\r
		grid-template-columns: 1fr;\r
\r
		place-items: center;\r
	}\r
\r
	#button-box {\r
		display: flex;\r
		gap: 10px;\r
		padding: 10px;\r
	}\r
\r
	button {\r
		min-width: 70px;\r
		min-height: 30px;\r
		border: none;\r
	}\r
\r
	button:hover {\r
		cursor: pointer;\r
		filter: brightness(0.9);\r
	}\r
\r
	button:active {\r
		scale: 0.99;\r
	}\r
</style>\r
\r
<div id="overlay">\r
	<div id="container">\r
		<div id="head"></div>\r
		<div id="body">\r
			<span id="message"></span>\r
			<div id="button-box">\r
				<button id="ok">ok</button>\r
				<button id="cancel">cancel</button>\r
			</div>\r
		</div>\r
	</div>\r
</div>\r
`,b={fontSize:`1rem`,containerBorder:`1px solid lightgrey`,containerBoxShadow:`0 4px 8px rgba(0, 0, 0, 0.2)`,primaryBackgroundColor:`${{blue_5:`#2563eb`}.blue_5}`,primaryColor:`white`,secondaryBackgroundColor:`grey`,secondaryColor:`white`,buttonBorderRadius:`0`},x=class e extends n{_$message;_$ok;_$cancel;_resolve;_handleKeyDown;constructor(e,t,n){super(e);let{fontSize:r,containerBorder:i,containerBoxShadow:a,primaryBackgroundColor:o,primaryColor:s,secondaryBackgroundColor:c,secondaryColor:l,buttonBorderRadius:u}=n;this._$message=this.query(`#message`),this._$message.textContent=t,this._$ok=this.query(`#ok`),this._$cancel=this.queryOptional(`#cancel`),this.applyStyles(`
			#container {
				font-size: ${r};
				border: ${i};
				box-shadow: ${a};
			}

			#head {
				background: ${o};
			}

			button {
				font-size: ${r};
				border-radius: ${u}
			}

			#ok {
				background-color: ${o};
				color: ${s};
			}

			#cancel {
				background-color: ${c};
				color: ${l};
			}
		`),this._$ok.onclick=()=>{this.remove(),this._resolve?.(!0),this._resolve=void 0},this._$cancel&&(this._$cancel.onclick=()=>{this.remove(),this._resolve?.(!1),this._resolve=void 0}),this._handleKeyDown=e=>{e.key===`Enter`?this._$ok.click():e.key===`Escape`&&(this._$cancel?this._$cancel.click():this._$ok.click())},window.addEventListener(`keydown`,this._handleKeyDown),document.body.appendChild(this)}static alert(e,t={}){return this._create(v,e,t)}static confirm(e,t={}){return this._create(y,e,t)}static _create(t,n,r){let i={...b,...r};return new Promise(r=>{let a=new e(t,n,i);a._resolve=r})}},S=`<style>\r
\r
</style>\r
\r
<div id="list"></div>\r
<div class="highlight"></div>\r
`,C=class extends n{_items=[];_$list;_itemHeight=0;_visibleCount=5;_maxHeight=0;_index=0;_y=0;_startY=0;_isDown=!1;_onPointerDown=e=>{this._isDown=!0,this._startY=e.pageY,this._$list.style.transition=`none`,window.addEventListener(`pointermove`,this._onPointerMove),window.addEventListener(`pointerup`,this._onPointerUp)};_onPointerMove=e=>{if(!this._isDown)return;let t=e.pageY-this._startY;this._startY=e.pageY;let n=this._y+t,r=Math.max(this._maxHeight,Math.min(0,n));this._move(r)};_onPointerUp=()=>{this._isDown&&(this._isDown=!1,window.removeEventListener(`pointermove`,this._onPointerMove),window.removeEventListener(`pointerup`,this._onPointerUp),this._end())};_wheelTimer;_onWheel=e=>{e.preventDefault();let t=this._y-e.deltaY,n=Math.max(this._maxHeight,Math.min(0,t));this._move(n),clearTimeout(this._wheelTimer),this._wheelTimer=window.setTimeout(()=>{this._end()},100)};constructor(){super(S),this._$list=this.query(`#list`),this._itemHeight=parseInt(this.getAttribute(`item-height`)??`30`),this._visibleCount=parseInt(this.getAttribute(`visible-count`)??`5`),this._syncStyles()}connectedCallback(){this.addEventListener(`pointerdown`,this._onPointerDown),this.addEventListener(`wheel`,this._onWheel,{passive:!1})}disconnectedCallback(){this.removeEventListener(`pointerdown`,this._onPointerDown),this.removeEventListener(`wheel`,this._onWheel)}static get observedAttributes(){return[`item-height`,`visible-count`]}attributeChangedCallback(e,t,n){this._aeroRollerAttributeHandlers[e]?.(n)}_aeroRollerAttributeHandlers={"item-height":e=>{this._updateItemHeight(parseInt(e??`30`))},"visible-count":e=>{this._updateVisibleCount(parseInt(e??`5`))}};setItems(e){this._items=e,this._updateMaxHeight(),this._render(),this._reset()}_updateItemHeight(e){this._itemHeight=e,this._updateMaxHeight(),this._syncStyles(),this.scrollToIndex(this._index)}_updateVisibleCount(e){e<0&&(this._visibleCount=0),this._visibleCount=e%2==0?e+1:e,this._syncStyles(),this._render(),this.scrollToIndex(this._index)}_updateMaxHeight(){let e=Math.max(0,this._items.length-1);this._maxHeight=-e*this._itemHeight}_syncStyles(){this.applyStyles(`
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}

			:host {
				position: relative;
				display: block;
				height: ${this._itemHeight*this._visibleCount}px;
				overflow: hidden;
			}

			#list {
      }

			.item {
        height: ${this._itemHeight}px;

				text-align: center;
				line-height: ${this._itemHeight}px;

				user-select: none;
				cursor: var(--aero-roller-item-cursor);
      }

			.highlight {
				position: absolute;
				top: 50%;
				left: 0;

				width: 100%;
				height: ${this._itemHeight}px;
				transform: translateY(-50%);

				pointer-events: none;

				border-top: var(--aero-roller-highlight-border-top, var(--aero-roller-highlight-border, none));
				border-bottom: var(--aero-roller-highlight-border-bottom, var(--aero-roller-highlight-border, none));
				border-left: var(--aero-roller-highlight-border-left, var(--aero-roller-highlight-border, none));
				border-right: var(--aero-roller-highlight-border-right, var(--aero-roller-highlight-border, none));

				background: var(--aero-roller-highlight-bg, none);
			}
		`)}_render(){let e=Math.floor(this._visibleCount/2),t=Array(e).fill(`<div class="item"></div>`).join(``);this._$list.innerHTML=t+this._items.map(e=>`<div class="item">${e}</div>`).join(``)+t}_reset(){this._index=0,this._move(0,!0)}get index(){return this._index}scrollToIndex(e){let t=Math.max(0,this._items.length-1),n=Math.max(0,Math.min(e,t));this._index=n;let r=-(n*this._itemHeight);this._$list.style.transition=`transform 0.2s ease-out`,this._move(r,!0),setTimeout(()=>{this._$list.style.transition=`none`},200)}get current(){return this._items[this._index]}_move(e,t=!1){this._y=e,t?this._$list.style.transition=`none`:this._$list.style.transition=`transform 0.2s ease-out`,this._$list.style.transform=`translateY(${this._y}px)`}_end(){let e=Math.round(Math.abs(this._y/this._itemHeight));this.scrollToIndex(e),this.dispatchEvent(new CustomEvent(`change`,{detail:{index:e,value:this._items[e]}}))}};customElements.define(`aero-numeric-input`,a),customElements.define(`aero-spinbox`,s),customElements.define(`aero-indeterminate-spinner`,l),customElements.define(`aero-resizable-box`,d),customElements.define(`aero-select`,p),customElements.define(`aero-option`,m),customElements.define(`aero-toast`,_),customElements.define(`aero-popup`,x),customElements.define(`aero-roller`,C);function w(){let t=document.getElementById(`nav-container`),n=document.getElementById(`unicode-container`);t.addEventListener(`click`,e=>{let t=e.target;if(!t||!t.classList.contains(`nav-item`))return;let r=t.dataset.key;E(r),D(n,r)}),n.addEventListener(`click`,e=>{let t=e.target;if(t.classList.contains(`unicode-item`)){let e=t.dataset.char;e&&(navigator.clipboard.writeText(e),_.show(`Copied!`))}}),window.addEventListener(`popstate`,()=>{D(n,T())}),Object.keys(e).map(e=>{let n=document.createElement(`div`);n.dataset.key=e,n.textContent=e,n.classList.add(`nav-item`),t.appendChild(n)}),D(n,T())}function T(){let t=new URLSearchParams(window.location.search).get(`unicode_type`);return t&&t in e?t:`arrows`}function E(e){let t=new URL(window.location.href);t.searchParams.set(`unicode_type`,e),window.history.pushState({},``,t.toString())}function D(n,r){n.innerHTML=e[r].flatMap(([e,n])=>t(e,n)).map(e=>`<button class="unicode-item" title="${e.code}" data-char="${e.char}">${e.char}</button>`).join(``)}function O(){w()}function k(){O()}document.addEventListener(`DOMContentLoaded`,k);