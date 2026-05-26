var $=Object.defineProperty;var k=(a,n,t)=>n in a?$(a,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[n]=t;var r=(a,n,t)=>k(a,typeof n!="symbol"?n+"":n,t);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))e(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&e(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function e(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();const _={arrows:[8592,8703],math:[8704,8959],shapes:[9632,9727],dingbats:[9984,10175],currency:[8352,8399],letterlike:[8448,8527],punctuation:[8192,8303],fractions:[8528,8591],superscript:[8304,8351],braille:[10240,10495],enclosed:[9312,9471],boxdrawing:[9472,9599],emoji_misc:[9728,9983]};function z(a,n){return Array.from({length:n-a+1},(t,e)=>{const i=a+e;return{char:String.fromCodePoint(i),code:"U+"+i.toString(16).toUpperCase()}})}class d extends HTMLElement{constructor(t){super();r(this,"shadow");const e=document.createElement("template");e.innerHTML=t,this.shadow=this.attachShadow({mode:"open"}),this.shadow.appendChild(e.content.cloneNode(!0))}query(t){return this.shadow.querySelector(t)}queryOptional(t){return this.shadow.querySelector(t)}applyStyles(t,e="component-styles"){let i=this.shadow.querySelector(`#${e}`);i||(i=document.createElement("style"),i.id=e,this.shadow.appendChild(i)),i.textContent=t}forwardNativeEvent(t){this.dispatchEvent(new Event(t,{bubbles:!0,composed:!0}))}forwardCustomEvent(t,e){this.dispatchEvent(new CustomEvent(t,{detail:e==null?void 0:e.detail,bubbles:!0,composed:!0}))}addEventListener(t,e,i){super.addEventListener(t,e,i)}removeEventListener(t,e,i){super.removeEventListener(t,e,i)}}class v extends d{constructor(t){super(t);r(this,"_boundDispatchInputEvent",this._dispatchInputEvent.bind(this));r(this,"_boundDispatchChangeEvent",this._dispatchChangeEvent.bind(this));r(this,"_boundDispatchFocusinEvent",this._dispatchFocusinEvent.bind(this));r(this,"_boundDispatchFocusoutEvent",this._dispatchFocusoutEvent.bind(this));r(this,"_$input");r(this,"_baseAeroNumericInputAttributeHandlers",{value:t=>{this._syncUI(t)},min:()=>{this.value=this.value},max:()=>{this.value=this.value},step:()=>{this.value=this.value}});this._initializeInput(),this._syncUI(this.getAttribute("value"))}_initializeInput(){this._$input=this.query(this.getInputSelector())}getValidateValue(t){const e=isNaN(t)?this.min:t,i=Math.max(this.min,Math.min(this.max,e))-this.min,s=Math.round(i/this.step)*this.step;let o=this.min+s;return o>this.max&&(o=o-this.step),Number(o.toFixed(this.decimalPlaces))}connectedCallback(){this._$input.addEventListener("input",this._boundDispatchInputEvent),this._$input.addEventListener("change",this._boundDispatchChangeEvent),this._$input.addEventListener("focusin",this._boundDispatchFocusinEvent),this._$input.addEventListener("focusout",this._boundDispatchFocusoutEvent)}disconnectedCallback(){this._$input.removeEventListener("input",this._boundDispatchInputEvent),this._$input.removeEventListener("change",this._boundDispatchChangeEvent),this._$input.removeEventListener("focusin",this._boundDispatchFocusinEvent),this._$input.removeEventListener("focusout",this._boundDispatchFocusoutEvent)}_dispatchInputEvent(t){t.stopImmediatePropagation(),this.forwardNativeEvent("input")}_dispatchChangeEvent(t){t.stopImmediatePropagation();const e=this.getValidateValue(this._$input.valueAsNumber);this.value=e,this.forwardNativeEvent("change")}_dispatchFocusinEvent(t){t.stopImmediatePropagation(),this.forwardNativeEvent("focusin")}_dispatchFocusoutEvent(t){t.stopImmediatePropagation();const e=this.getValidateValue(this._$input.valueAsNumber);this.value=e,this.forwardNativeEvent("focusout")}static get observedAttributes(){return["value","min","max","step"]}attributeChangedCallback(t,e,i){var s,o;(o=(s=this._baseAeroNumericInputAttributeHandlers)[t])==null||o.call(s,i)}_syncUI(t){t&&(this._$input.value=t)}get input(){return this._$input}get value(){const t=this.getAttribute("value");return t===null?this.min:Number(t)}set value(t){const e=this.getValidateValue(t);this.setAttribute("value",String(e))}get min(){const t=this.getAttribute("min");return t===null||isNaN(Number(t))?0:Number(t)}set min(t){this.setAttribute("min",String(t))}get max(){const t=this.getAttribute("max");return t===null||isNaN(Number(t))?100:Number(t)}set max(t){this.setAttribute("max",String(t))}get step(){const t=this.getAttribute("step"),e=Number(t);return t===null||isNaN(e)||e<=0?1:e}set step(t){this.setAttribute("step",String(t))}get decimalPlaces(){const t=this.getAttribute("step");if(!t||isNaN(Number(t)))return 0;const e=t==null?void 0:t.split(".");return(e==null?void 0:e.length)>1?e[1].length:0}}const E=`<style>\r
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
`;class C extends v{constructor(){super(E)}getInputSelector(){return"#input"}}const A=`<style>\r
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
`;class I extends v{constructor(){super(A);r(this,"_boundDecrement",this.decrement.bind(this));r(this,"_boundIncrement",this.increment.bind(this));r(this,"_$minus");r(this,"_$plus");r(this,"_resizeObserver");r(this,"_aeroSpinboxAttributeHandlers",{"minus-text":t=>{this._updateMinuxText(t)},"plus-text":t=>{this._updatePlusText(t)}});this._$minus=this.query("#minus"),this._$plus=this.query("#plus"),this._updateMinuxText(this.getAttribute("minus-text")),this._updatePlusText(this.getAttribute("plus-text")),this._updateHeight(parseInt(getComputedStyle(this).height)),this._resizeObserver=new ResizeObserver(t=>{for(const e of t){const i=e.contentRect.height;this.applyStyles(`#spinbox {
						grid-template-columns: ${i}px 1fr ${i}px;
					}`)}})}getInputSelector(){return"#input"}connectedCallback(){this._$minus.addEventListener("click",this._boundDecrement),this._$plus.addEventListener("click",this._boundIncrement),this._resizeObserver.observe(this)}disconnectedCallback(){this._$minus.removeEventListener("click",this._boundDecrement),this._$plus.removeEventListener("click",this._boundIncrement),this._resizeObserver.disconnect()}static get observedAttributes(){return[...super.observedAttributes,"minus-text","plus-text"]}attributeChangedCallback(t,e,i){var s,o;super.attributeChangedCallback(t,e,i),(o=(s=this._aeroSpinboxAttributeHandlers)[t])==null||o.call(s,i)}_updateMinuxText(t){this._$minus.textContent=t||"-"}_updatePlusText(t){this._$plus.textContent=t||"+"}_updateHeight(t){t=t||30,this.applyStyles(`#spinbox {
				grid-template-columns: ${t}px 1fr ${t}px;
			}`)}set minusText(t){this.setAttribute("minus-text",t)}set plusText(t){this.setAttribute("plus-text",t)}decrement(){const t=this.value-this.step;this.value=this.getValidateValue(t)}increment(){const t=this.value+this.step;this.value=this.getValidateValue(t)}}const L=`<style>\r
	:host {\r
		display: block;\r
	}\r
</style>\r
`;class M extends d{constructor(){super(L);r(this,"_size");r(this,"_thickness");r(this,"_radius");r(this,"_circumference");r(this,"_trackColor");r(this,"_arcColor");r(this,"_cycle");r(this,"_arcRatio");r(this,"_$svg");r(this,"_$track");r(this,"_$arc");this._syncHostAttributes(),this._buildSvg(),this._syncSvgAttributes(),this._syncStyles()}_buildSvg(){const t="http://www.w3.org/2000/svg";this._$svg=document.createElementNS(t,"svg"),this._$track=document.createElementNS(t,"circle"),this._$arc=document.createElementNS(t,"circle"),this._$track.classList.add("track"),this._$arc.classList.add("arc"),this._$svg.appendChild(this._$track),this._$svg.appendChild(this._$arc),this.shadow.appendChild(this._$svg)}static get observedAttributes(){return["size","thickness","track-color","arc-color","cycle","arc-ratio"]}attributeChangedCallback(t,e,i){this._syncHostAttributes(),this._syncSvgAttributes(),this._syncStyles()}_syncHostAttributes(){this._size=parseInt(this.getAttribute("size")||"50"),this._thickness=parseInt(this.getAttribute("thickness")||"4"),this._radius=this._size/2-this._thickness-1,this._circumference=2*Math.PI*this._radius,this._trackColor=this.getAttribute("track-color")||"transparent",this._arcColor=this.getAttribute("arc-color")||"black",this._cycle=parseInt(this.getAttribute("cycle")||"2"),this._arcRatio=parseFloat(this.getAttribute("arc-ratio")||"90")/100}_syncSvgAttributes(){this._$svg.setAttribute("viewBox",`0 0 ${this._size} ${this._size}`),this._$svg.setAttribute("width",String(this._size)),this._$svg.setAttribute("height",String(this._size)),this._$track.setAttribute("cx",String(this._size/2)),this._$track.setAttribute("cy",String(this._size/2)),this._$track.setAttribute("r",String(this._radius)),this._$arc.setAttribute("cx",String(this._size/2)),this._$arc.setAttribute("cy",String(this._size/2)),this._$arc.setAttribute("r",String(this._radius))}_syncStyles(){this.applyStyles(`
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
		`)}}const S=`<style>\r
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
`;class g extends d{constructor(){super(S);r(this,"_$topResizer");r(this,"_$bottomResizer");r(this,"_$leftResizer");r(this,"_$rightResizer");r(this,"_nMinWidth");r(this,"_nMaxWidth");r(this,"_nMinHeight");r(this,"_nMaxHeight");r(this,"_isTopDragging",!1);r(this,"_isBottomDragging",!1);r(this,"_isLeftDragging",!1);r(this,"_isRightDragging",!1);r(this,"_isDragging",!1);r(this,"_animationFrameId",null);r(this,"_resizerHandlers",{top:t=>this._processMousedownEvent(t,"top"),bottom:t=>this._processMousedownEvent(t,"bottom"),left:t=>this._processMousedownEvent(t,"left"),right:t=>this._processMousedownEvent(t,"right")});r(this,"_handleMousemove",t=>{this._isDragging&&(this._animationFrameId&&cancelAnimationFrame(this._animationFrameId),this._animationFrameId=requestAnimationFrame(()=>{const e=this.getBoundingClientRect();if(this._isTopDragging){const i=e.bottom-t.clientY,s=Math.min(Math.max(i,this._nMinHeight),this._nMaxHeight);this.style.height=`${s}px`,this._emitResize(null,s)}else if(this._isBottomDragging){const i=t.clientY-e.top,s=Math.min(Math.max(i,this._nMinHeight),this._nMaxHeight);this.style.height=`${s}px`,this._emitResize(null,s)}else if(this._isLeftDragging){const i=e.right-t.clientX,s=Math.min(Math.max(i,this._nMinWidth),this._nMaxWidth);this.style.width=`${s}px`,this._emitResize(s,null)}else if(this._isRightDragging){const i=t.clientX-e.left,s=Math.min(Math.max(i,this._nMinWidth),this._nMaxWidth);this.style.width=`${s}px`,this._emitResize(s,null)}}))});r(this,"_handleMouseup",t=>{this._isDragging&&(this.forwardCustomEvent("aero-resize-end",{detail:{width:this.offsetWidth,height:this.offsetHeight}}),this._animationFrameId&&(cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null),document.body.style.cursor="",document.body.style.userSelect="",this._isDragging=!1,this._isTopDragging=!1,this._isBottomDragging=!1,this._isLeftDragging=!1,this._isRightDragging=!1)});r(this,"_processMousedownEvent",(t,e)=>{switch(t.preventDefault(),document.body.style.userSelect="none",this._isDragging=!0,this.forwardCustomEvent("aero-resize-start",{detail:{width:this.offsetWidth,height:this.offsetHeight,edge:e}}),e){case"top":this._isTopDragging=!0,document.body.style.cursor="ns-resize";break;case"bottom":this._isBottomDragging=!0,document.body.style.cursor="ns-resize";break;case"left":this._isLeftDragging=!0,document.body.style.cursor="ew-resize";break;case"right":this._isRightDragging=!0,document.body.style.cursor="ew-resize";break}});r(this,"_baseAeroResizeBoxAttributeHandlers",{"min-width":t=>{this._updateMinWidthValue(t)},"max-width":t=>{this._updateMaxWidthValue(t)},"min-height":t=>{this._updateMinHeightValue(t)},"max-height":t=>{this._updateMaxHeightValue(t)},"resize-top":t=>{this._updateResizeState("top",t!==null)},"resize-bottom":t=>{this._updateResizeState("bottom",t!==null)},"resize-left":t=>{this._updateResizeState("left",t!==null)},"resize-right":t=>{this._updateResizeState("right",t!==null)}});this._$topResizer=this.query("#top"),this._$bottomResizer=this.query("#bottom"),this._$leftResizer=this.query("#left"),this._$rightResizer=this.query("#right"),this._updateMinWidthValue(this.getAttribute("min-width")),this._updateMaxWidthValue(this.getAttribute("max-width")),this._updateMinHeightValue(this.getAttribute("min-height")),this._updateMaxHeightValue(this.getAttribute("max-height")),this._initializeAttributes()}_initializeAttributes(){g.observedAttributes.forEach(t=>{var i,s;const e=this.getAttribute(t);(s=(i=this._baseAeroResizeBoxAttributeHandlers)[t])==null||s.call(i,e)})}connectedCallback(){this._updateResizeState("top",this.hasAttribute("resize-top")),this._updateResizeState("bottom",this.hasAttribute("resize-bottom")),this._updateResizeState("left",this.hasAttribute("resize-left")),this._updateResizeState("right",this.hasAttribute("resize-right")),window.addEventListener("mousemove",this._handleMousemove),window.addEventListener("mouseup",this._handleMouseup)}disconnectedCallback(){this._updateResizeState("top",!1),this._updateResizeState("bottom",!1),this._updateResizeState("left",!1),this._updateResizeState("right",!1),window.removeEventListener("mousemove",this._handleMousemove),window.removeEventListener("mouseup",this._handleMouseup)}_emitResize(t,e){this.forwardCustomEvent("aero-resize",{detail:{width:t,height:e}})}static get observedAttributes(){return["min-width","max-width","min-height","max-height","resize-top","resize-bottom","resize-left","resize-right"]}attributeChangedCallback(t,e,i){var s,o;(o=(s=this._baseAeroResizeBoxAttributeHandlers)[t])==null||o.call(s,i)}_updateResizeState(t,e){let i,s;switch(t){case"top":i=this._$topResizer,s=this._resizerHandlers.top;break;case"bottom":i=this._$bottomResizer,s=this._resizerHandlers.bottom;break;case"left":i=this._$leftResizer,s=this._resizerHandlers.left;break;case"right":i=this._$rightResizer,s=this._resizerHandlers.right;break}i.hidden=!e,e?i.addEventListener("mousedown",s):i.removeEventListener("mousedown",s)}_updateMinWidthValue(t){this._nMinWidth=t?Number(t):0}_updateMaxWidthValue(t){this._nMaxWidth=t?Number(t):2e3}_updateMinHeightValue(t){this._nMinHeight=t?Number(t):0}_updateMaxHeightValue(t){this._nMaxHeight=t?Number(t):2e3}get minWidth(){return this._nMinWidth.toString()}set minWidth(t){this.setAttribute("min-width",t)}get maxWidth(){return this._nMaxWidth.toString()}set maxWidth(t){this.setAttribute("max-width",t)}get minHeight(){return this._nMinHeight.toString()}set minHeight(t){this.setAttribute("min-height",t)}get maxHeight(){return this._nMaxHeight.toString()}set maxHeight(t){this.setAttribute("max-height",t)}addTopResizer(){this.setAttribute("resize-top","")}removeTopResizer(){this.removeAttribute("resize-top")}addBottomResizer(){this.setAttribute("resize-bottom","")}removeBottomResizer(){this.removeAttribute("resize-bottom")}addLeftResizer(){this.setAttribute("resize-left","")}removeLeftResizer(){this.removeAttribute("resize-left")}addRightResizer(){this.setAttribute("resize-right","")}removeRightResizer(){this.removeAttribute("resize-right")}}const H=`<style>\r
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
`;class D extends d{constructor(){var t;super(H);r(this,"_handlers",{documentClick:this._handleDocumentClick.bind(this),buttonClick:this._handleButtonClick.bind(this),dropdownClick:this._handleDropdownClick.bind(this),slotChange:this._handleSlotChange.bind(this),keydown:this._handleKeydown.bind(this)});r(this,"_$span");r(this,"_$button");r(this,"_$dropdown");r(this,"_$options",[]);r(this,"_optionIndex",-1);r(this,"_dropdown_open",!1);r(this,"_$slot");r(this,"_highlightIndex",-1);r(this,"_pendingOptionIndex");r(this,"_aeroSelectAttributeHandlers",{"option-index":t=>{this._updateOptionIndex(this._getValidateOptionIndexByStr(t??""))}});this._$span=this.query("#span"),this._$button=this.query("#button"),this._$dropdown=this.query("#dropdown"),this._$slot=this.query("slot"),this._$options=(((t=this._$slot)==null?void 0:t.assignedElements())??[]).filter(e=>e instanceof HTMLElement),this._$button.textContent=this.getAttribute("button-text")??"▽",this._updateOptionIndex(this._getValidateOptionIndexByStr(this.getAttribute("option-index")??"-1"))}connectedCallback(){var t;document.addEventListener("click",this._handlers.documentClick),this._$button.addEventListener("click",this._handlers.buttonClick),this._$dropdown.addEventListener("click",this._handlers.dropdownClick),(t=this._$slot)==null||t.addEventListener("slotchange",this._handlers.slotChange),this.addEventListener("keydown",this._handlers.keydown)}disconnectedCallback(){var t;document.removeEventListener("click",this._handlers.documentClick),this._$button.removeEventListener("click",this._handlers.buttonClick),this._$dropdown.removeEventListener("click",this._handlers.dropdownClick),(t=this._$slot)==null||t.removeEventListener("slotchange",this._handlers.slotChange),this.removeEventListener("keydown",this._handlers.keydown)}_handleDocumentClick(t){this._dropdown_open&&(this._closeDropdown(),this._dropdown_open=!1)}_handleButtonClick(t){t.stopPropagation(),this._dropdown_open=!this._dropdown_open,this._dropdown_open?this._openDropdown():this._closeDropdown()}_openDropdown(){const t=this.getBoundingClientRect(),e=this._$dropdown.offsetHeight||parseInt(getComputedStyle(this).getPropertyValue("--aero-select-height"))*6.5,i=window.innerHeight-t.bottom,s=t.top;let o=!1;i<e&&s>i&&(o=!0),this._$dropdown.style.left=`${t.left}px`,this._$dropdown.style.width=`${t.width}px`,o?(this._$dropdown.style.top=`${t.top-e}px`,this._$dropdown.classList.add("open-up"),this._$dropdown.classList.remove("open-down")):(this._$dropdown.style.top=`${t.bottom}px`,this._$dropdown.classList.add("open-down"),this._$dropdown.classList.remove("open-up")),this._$dropdown.classList.add("open"),window.addEventListener("scroll",this._handlers.documentClick,{capture:!0,passive:!0}),window.addEventListener("resize",this._handlers.documentClick)}_closeDropdown(){this._$dropdown.classList.remove("open","open-up","open-down"),window.removeEventListener("scroll",this._handlers.documentClick,{capture:!0}),window.removeEventListener("resize",this._handlers.documentClick)}_handleDropdownClick(t){const e=t.composedPath().find(s=>s instanceof HTMLElement&&this._$options.includes(s));if(!e)return;const i=this._$options.indexOf(e);this.optionIndex=i,this._closeDropdown(),this._dropdown_open=!1}_handleSlotChange(){const t=this._$options[this._optionIndex];if(this._$options=this._$slot.assignedElements().filter(e=>e instanceof HTMLElement),this._pendingOptionIndex!==void 0){const e=this._pendingOptionIndex;this._pendingOptionIndex=void 0,this.optionIndex=e}else this.optionIndex=this._$options.findIndex(e=>e===t)}_handleKeydown(t){var e,i,s;if(t.key==="Enter"||t.key===" ")if(t.preventDefault(),!this._dropdown_open)this._$button.click();else{const o=this._$options[this._highlightIndex];o&&(o.classList.remove("highlight"),this.optionIndex=this._highlightIndex),this._highlightIndex=-1,this._$button.click()}if(t.key==="ArrowDown"||t.key==="ArrowUp"){if(t.preventDefault(),!this._dropdown_open||t.key==="ArrowDown"&&this._highlightIndex+1===this._$options.length||t.key==="ArrowUp"&&this._highlightIndex===-1)return;(e=this._$options[this._highlightIndex])==null||e.classList.remove("highlight"),this._highlightIndex=t.key==="ArrowDown"?this._highlightIndex+1:this._highlightIndex-1,(i=this._$options[this._highlightIndex])==null||i.classList.add("highlight"),(s=this._$options[this._highlightIndex])==null||s.scrollIntoView({block:"nearest"})}t.key==="Escape"&&this._dropdown_open&&(this._$button.click(),this._highlightIndex=-1)}static get observedAttributes(){return["option-index"]}attributeChangedCallback(t,e,i){var s,o;(o=(s=this._aeroSelectAttributeHandlers)[t])==null||o.call(s,i)}get optionIndex(){return this._optionIndex}set optionIndex(t){this.setAttribute("option-index",t.toString())}_updateOptionIndex(t){if(this._optionIndex===t)return;if(t<0){this._unsetOption();return}const e=this._$options[t];if(!e){this._pendingOptionIndex=t;return}this._optionIndex=t,this._$span.textContent=e.textContent,this.forwardCustomEvent("aero-select-changed",{detail:{option:e,index:t}}),this._pendingOptionIndex=void 0}_getValidateOptionIndexByStr(t){if(t==="")return-1;const e=Number(t);return Number.isNaN(e)?-1:e}_unsetOption(){this._optionIndex=-1,this._$span.textContent=""}}class R extends HTMLElement{constructor(){super()}get value(){return this.getAttribute("value")??""}set value(n){this.setAttribute("value",n)}get label(){return this.textContent??""}}const N=`<style>\r
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
`,T={top:"90%",left:"50%",ms:3e3,background:"black",color:"white"};class u extends d{constructor(t,e){super(N);r(this,"_$text");const{top:i,left:s,ms:o,background:l,color:c}=e;this._$text=this.query("#text"),this._$text.textContent=t,this.applyStyles(`
			:host {
				top: ${i};
				left: ${s};
				animation-duration: ${o}ms;
				background: ${l};
				color: ${c};
			}
		`),document.body.appendChild(this),this.addEventListener("animationend",()=>{this.remove()},{once:!0})}static show(t,e={}){const i={...T,...e};new u(t,i)}}const V=`<style>\r
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
`,O=`<style>\r
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
`,P={blue_5:"#2563eb"},B={fontSize:"1rem",containerBorder:"1px solid lightgrey",containerBoxShadow:"0 4px 8px rgba(0, 0, 0, 0.2)",primaryBackgroundColor:`${P.blue_5}`,primaryColor:"white",secondaryBackgroundColor:"grey",secondaryColor:"white",buttonBorderRadius:"0"};class m extends d{constructor(t,e,i){super(t);r(this,"_$message");r(this,"_$ok");r(this,"_$cancel");r(this,"_resolve");r(this,"_handleKeyDown");const{fontSize:s,containerBorder:o,containerBoxShadow:l,primaryBackgroundColor:c,primaryColor:x,secondaryBackgroundColor:f,secondaryColor:w,buttonBorderRadius:y}=i;this._$message=this.query("#message"),this._$message.textContent=e,this._$ok=this.query("#ok"),this._$cancel=this.queryOptional("#cancel"),this.applyStyles(`
			#container {
				font-size: ${s};
				border: ${o};
				box-shadow: ${l};
			}

			#head {
				background: ${c};
			}

			button {
				font-size: ${s};
				border-radius: ${y}
			}

			#ok {
				background-color: ${c};
				color: ${x};
			}

			#cancel {
				background-color: ${f};
				color: ${w};
			}
		`),this._$ok.onclick=()=>{var h;this.remove(),(h=this._resolve)==null||h.call(this,!0),this._resolve=void 0},this._$cancel&&(this._$cancel.onclick=()=>{var h;this.remove(),(h=this._resolve)==null||h.call(this,!1),this._resolve=void 0}),this._handleKeyDown=h=>{h.key==="Enter"?this._$ok.click():h.key==="Escape"&&(this._$cancel?this._$cancel.click():this._$ok.click())},window.addEventListener("keydown",this._handleKeyDown),document.body.appendChild(this)}static alert(t,e={}){return this._create(V,t,e)}static confirm(t,e={}){return this._create(O,t,e)}static _create(t,e,i){const s={...B,...i};return new Promise(o=>{const l=new m(t,e,s);l._resolve=o})}}const W=`<style>\r
\r
</style>\r
\r
<div id="list"></div>\r
<div class="highlight"></div>\r
`;class F extends d{constructor(){super(W);r(this,"_items",[]);r(this,"_$list");r(this,"_itemHeight",0);r(this,"_visibleCount",5);r(this,"_maxHeight",0);r(this,"_index",0);r(this,"_y",0);r(this,"_startY",0);r(this,"_isDown",!1);r(this,"_onPointerDown",t=>{this._isDown=!0,this._startY=t.pageY,this._$list.style.transition="none",window.addEventListener("pointermove",this._onPointerMove),window.addEventListener("pointerup",this._onPointerUp)});r(this,"_onPointerMove",t=>{if(!this._isDown)return;const e=t.pageY-this._startY;this._startY=t.pageY;const i=this._y+e,s=Math.max(this._maxHeight,Math.min(0,i));this._move(s)});r(this,"_onPointerUp",()=>{this._isDown&&(this._isDown=!1,window.removeEventListener("pointermove",this._onPointerMove),window.removeEventListener("pointerup",this._onPointerUp),this._end())});r(this,"_wheelTimer");r(this,"_onWheel",t=>{t.preventDefault();const e=this._y-t.deltaY,i=Math.max(this._maxHeight,Math.min(0,e));this._move(i),clearTimeout(this._wheelTimer),this._wheelTimer=window.setTimeout(()=>{this._end()},100)});r(this,"_aeroRollerAttributeHandlers",{"item-height":t=>{this._updateItemHeight(parseInt(t??"30"))},"visible-count":t=>{this._updateVisibleCount(parseInt(t??"5"))}});this._$list=this.query("#list"),this._itemHeight=parseInt(this.getAttribute("item-height")??"30"),this._visibleCount=parseInt(this.getAttribute("visible-count")??"5"),this._syncStyles()}connectedCallback(){this.addEventListener("pointerdown",this._onPointerDown),this.addEventListener("wheel",this._onWheel,{passive:!1})}disconnectedCallback(){this.removeEventListener("pointerdown",this._onPointerDown),this.removeEventListener("wheel",this._onWheel)}static get observedAttributes(){return["item-height","visible-count"]}attributeChangedCallback(t,e,i){var s,o;(o=(s=this._aeroRollerAttributeHandlers)[t])==null||o.call(s,i)}setItems(t){this._items=t,this._updateMaxHeight(),this._render(),this._reset()}_updateItemHeight(t){this._itemHeight=t,this._updateMaxHeight(),this._syncStyles(),this.scrollToIndex(this._index)}_updateVisibleCount(t){t<0&&(this._visibleCount=0),this._visibleCount=t%2===0?t+1:t,this._syncStyles(),this._render(),this.scrollToIndex(this._index)}_updateMaxHeight(){const t=Math.max(0,this._items.length-1);this._maxHeight=-t*this._itemHeight}_syncStyles(){this.applyStyles(`
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
		`)}_render(){const t=Math.floor(this._visibleCount/2),e=Array(t).fill('<div class="item"></div>').join("");this._$list.innerHTML=e+this._items.map(i=>`<div class="item">${i}</div>`).join("")+e}_reset(){this._index=0,this._move(0,!0)}get index(){return this._index}scrollToIndex(t){const e=Math.max(0,this._items.length-1),i=Math.max(0,Math.min(t,e));this._index=i;const s=-(i*this._itemHeight);this._$list.style.transition="transform 0.2s ease-out",this._move(s,!0),setTimeout(()=>{this._$list.style.transition="none"},200)}get current(){return this._items[this._index]}_move(t,e=!1){this._y=t,e?this._$list.style.transition="none":this._$list.style.transition="transform 0.2s ease-out",this._$list.style.transform=`translateY(${this._y}px)`}_end(){const t=Math.round(Math.abs(this._y/this._itemHeight));this.scrollToIndex(t),this.dispatchEvent(new CustomEvent("change",{detail:{index:t,value:this._items[t]}}))}}customElements.define("aero-numeric-input",C);customElements.define("aero-spinbox",I);customElements.define("aero-indeterminate-spinner",M);customElements.define("aero-resizable-box",g);customElements.define("aero-select",D);customElements.define("aero-option",R);customElements.define("aero-toast",u);customElements.define("aero-popup",m);customElements.define("aero-roller",F);function q(){const a=document.getElementById("nav-container"),n=document.getElementById("unicode-container");a.addEventListener("click",t=>{const e=t.target;if(!e||!e.classList.contains("nav-item"))return;const i=e.dataset.key;U(i),p(n,i)}),n.addEventListener("click",t=>{const e=t.target;if(e.classList.contains("unicode-item")){const i=e.dataset.char;i&&(navigator.clipboard.writeText(i),u.show("Copied!"))}}),window.addEventListener("popstate",()=>{const t=b();p(n,t)}),Object.keys(_).map(t=>{const e=document.createElement("div");e.dataset.key=t,e.textContent=t,e.classList.add("nav-item"),a.appendChild(e)}),p(n,b())}function b(){const n=new URLSearchParams(window.location.search).get("unicode_type");return n&&n in _?n:"arrows"}function U(a){const n=new URL(window.location.href);n.searchParams.set("unicode_type",a),window.history.pushState({},"",n.toString())}function p(a,n){const t=z(..._[n]);a.innerHTML=t.map(e=>`<button class="unicode-item" title="${e.code}" data-char="${e.char}">${e.char}</button>`).join("")}function Y(){q()}function j(){Y()}document.addEventListener("DOMContentLoaded",j);
