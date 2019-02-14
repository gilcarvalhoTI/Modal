'use strict';

/*
FUTUROS UPGRADES:
- Usar <dialog> na tag do modal-content

FAZER:
- Sizes (medium, normal, small...)
- Eventos para show/hide
*/

const Modal = function( el, options ) {
	this.init.apply( this, arguments );
};

Modal.prototype = {
	constructor: Modal,
	_instances: [],
	_options: { title: false, buttons: [], close: true, closeLabel: 'Close', overlay: true, keyboard: true, show: true },

	init( el, options ) {
		const self = this;

		self.build( el );
		self.setEvents();
		self.setOptions( options );

		if ( self.options.show ) {
			const prevShow = self.options.show;
			self.options.show = false;
			self.show( prevShow );
		}

		return self;
	},

	build( el ) {
		const self = this;

		const htmlEl = document.createElement('div');
			  htmlEl.innerHTML =
			  '<div class="modal" role="dialog" tabindex="-1">' +
				'<div class="modal-content" role="document">' +
					'<header class="modal-header">' +
						'<h2 class="modal-title"></h2>' +
						'<button class="modal-close"><span aria-hidden="true">&times;</span></button>' +
					'</header>' +
					'<div class="modal-body"></div>' +
					'<footer class="modal-footer">' +
						'<div class="secondary-buttons"></div>' +
						'<div class="primary-buttons"></div>' +
					'</footer>' +
				'</div>' +
			  '</div>' +
			  '<div class="modal-overlay"></div>';

		self.el = el;
		self.structure = {
			modalEl: htmlEl.querySelector('.modal'),
			contentEl: htmlEl.querySelector('.modal-content'),
			headerEl: htmlEl.querySelector('.modal-header'),
			titleEl: htmlEl.querySelector('.modal-title'),
			closeEl: htmlEl.querySelector('.modal-close'),
			bodyEl: htmlEl.querySelector('.modal-body'),
			footerEl: htmlEl.querySelector('.modal-footer'),
			overlayEl: htmlEl.querySelector('.modal-overlay')
		};

		const { modalEl, closeEl, bodyEl, overlayEl } = self.structure;

		document.body.classList.add('has-modal');

		if ( el.parentNode ) {
			modalEl.classList.add('has-modal-dom-content');
			el.parentNode.insertBefore( modalEl, el );
		} else {
			document.body.appendChild( modalEl );
		}

		if ( el.tagName ) {
			bodyEl.appendChild( el );
		} else {
			bodyEl.innerHTML = el;
		}

		modalEl.addEventListener( 'keydown', function( event ) {
			if ( self.options.keyboard && event.which == 27 ) { // ESC = 27
				self.hide();
			}
		});

		closeEl.addEventListener( 'click', function( event ) {
			self.hide();
		});

		overlayEl.addEventListener( 'click', function( event ) {
			if ( self.options.overlay != 'static' ) {
				self.hide();
			}
		});

		return self;
	},

	destroy() {
		const self = this;

		const el = self.el,
			  modalEl = self.structure.modalEl;

		self.set( { show: false } );

		if ( self._instances.length == 1 ) {
			document.body.classList.remove('has-modal');
		}

		if ( modalEl.classList.contains('has-modal-dom-content') ) {
			modalEl.parentNode.insertBefore( el, modalEl );
		}

		modalEl.parentNode.removeChild( modalEl );

		self._instances.splice( self._instances.indexOf( self ), 1 );

		for ( const key in self ) {
			delete self[key];
		}
		self.__proto__ = null;

		return self;
	},

	setEvents() {
		const self = this;

		self.events = {
			target: self.structure.modalEl,
			handlers: {}
		};

		return self;
	},

	setOptions( options = {} ) {
		const self = this;

		self.options = self.options || {};

		for ( const key in self._options ) {
			const value = ( options[key] == null ) ? self._options[key] : options[key];
			self.set( key, value );
		}

		return self;
	},

	toggle() {
		const self = this;
		self.setShow( ! self.options.show );
		return self;
	},

	show() {
		const self = this;

		if ( self.options.show ) { return self; }

		self.showOverlay();

		const contentEl = self.structure.contentEl;
			  contentEl.classList.add('modal-content-show');

		self.structure.modalEl.focus();

		self.options.show = true;

		return self;
	},

	hide() {
		const self = this;

		if ( ! self.options.show ) { return self; }

		self.hideOverlay();

		const contentEl = self.structure.contentEl;
			  contentEl.classList.remove('modal-content-show');

		self.options.show = false;

		return self;
	},

	showOverlay() {
		const self = this;

		const docBodyEl = document.body;

		if ( ! docBodyEl.classList.contains('has-modal-overlay') ) {

			const overlayEl = self.structure.overlayEl;

			const prevBodyWidth = docBodyEl.clientWidth;
			docBodyEl.classList.add('has-modal-overlay');
			docBodyEl.style.paddingRight = ( docBodyEl.clientWidth - prevBodyWidth ) + 'px';

			docBodyEl.appendChild( overlayEl );
		}

		return self;
	},

	hideOverlay() {
		const self = this;

		const docBodyEl = document.body;

		if ( docBodyEl.classList.contains('has-modal-overlay') ) {

			const overlayEl = self.structure.overlayEl;

			docBodyEl.classList.remove('has-modal-overlay');
			docBodyEl.style.paddingRight = '';

			overlayEl.parentNode.removeChild( overlayEl );
		}

		return self;
	},

	setButtons: function( arr ) {
		const self = this;

		if ( arr == null ) { return self; }

		const { contentEl, footerEl } = self.structure;

		const primaryEl = footerEl.querySelector('.primary-buttons'),
			  secondaryEl = footerEl.querySelector('.secondary-buttons');

		primaryEl.innerHTML = '';
		secondaryEl.innerHTML = '';

		if ( arr && arr.length ) {

			for ( let i = 0, len = arr.length; i < len; i++ ) {
				const item = arr[i];

				const buttonEl = document.createElement('button');
					  buttonEl.className = item.class || '';
					  buttonEl.innerHTML = item.text || '';

				if ( item.click ) {
					buttonEl.addEventListener( 'click', item.click );
				}

				if ( item.position == 'secondary' ) {
					secondaryEl.appendChild( buttonEl );
				} else {
					primaryEl.appendChild( buttonEl );
				}
			}

			contentEl.appendChild( footerEl );

		} else {

			if ( contentEl.contains( footerEl ) ) {
				contentEl.removeChild( footerEl );
			}
		}

		self.options.buttons = arr;

		return self;
	},

	setClose( bool ) {
		const self = this;

		if ( bool == null ) { return self; }

		const { contentEl, headerEl, closeEl, bodyEl } = self.structure;

		if ( bool ) {
			headerEl.appendChild( closeEl );
			contentEl.insertBefore( headerEl, bodyEl );

		} else {

			if ( headerEl.contains( closeEl ) ) {
				headerEl.removeChild( closeEl );
			}

			if ( contentEl.contains( headerEl ) && ! headerEl.hasChildNodes() ) {
				contentEl.removeChild( headerEl );
			}
		}

		self.options.close = bool;

		return self;
	},

	setCloseLabel( str ) {
		const self = this;

		if ( str == null ) { return self; }

		const closeEl = self.structure.closeEl;

		if ( str ) {
			closeEl.setAttribute( 'title', str );
			closeEl.setAttribute( 'aria-label', str );
		} else {
			closeEl.removeAttribute('title');
			closeEl.removeAttribute('aria-label');
		}

		self.options.closeLabel = str;

		return self;
	},

	setKeyboard( bool ) {
		const self = this;

		if ( bool == null ) { return self; }

		self.options.keyboard = bool;

		return self;
	},

	setOverlay( bool_str ) {
		const self = this;

		if ( bool_str == null ) { return self; }

		if ( bool_str ) {
			if ( self.options.show ) {
				self.showOverlay();
			}
		} else {
			if ( self.options.show ) {
				self.hideOverlay();
			}
		}

		self.options.overlay = bool_str;

		return self;
	},

	setShow( bool ) {
		const self = this;

		if ( bool == null ) { return self; }

		if ( bool ) {
			self.show();
		} else {
			self.hide();
		}

		return self;
	},

	setTitle( str ) {
		const self = this;

		if ( str == null ) { return self; }

		const { contentEl, headerEl, titleEl, bodyEl } = self.structure;

		if ( str === false ) {

			titleEl.innerHTML = '';

			if ( headerEl.contains( titleEl ) ) {
				headerEl.removeChild( titleEl );
			}

			if ( contentEl.contains( headerEl ) && ! headerEl.hasChildNodes() ) {
				contentEl.removeChild( headerEl );
			}

		} else {

			titleEl.innerHTML = str;
			headerEl.appendChild( titleEl );
			contentEl.insertBefore( headerEl, bodyEl );
		}

		self.options.title = str;

		return self;
	},

	getButtons() {
		return this.options.buttons;
	},

	getClose() {
		return this.options.close;
	},

	getCloseLabel() {
		return this.options.closeLabel;
	},

	getContent() {
		return this.options.el;
	},

	getKeyboard() {
		return this.options.keyboard;
	},

	getOverlay() {
		return this.options.overlay;
	},

	getShow() {
		return this.options.show;
	},

	getTitle() {
		return this.options.title;
	},

	get( str ) {
		return this[ 'get' + str.charAt(0).toUpperCase() + str.slice(1) ]();
	},

	set( obj_str, val ) {
		const self = this;

		if ( obj_str == null ) { return self; }

		if ( typeof( obj_str ) == 'object' ) {

			for ( const key in obj_str ) {
				const functionName = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
				self[ functionName ]( obj_str[ key ] );
			}

		} else {

			const functionName = 'set' + obj_str.charAt(0).toUpperCase() + obj_str.slice(1);
			self[ functionName ]( val );
		}

		return self;
	},

	addEventListener() {
		const events = this.events;
		return events.target.addEventListener.apply( events.target, arguments );
	},

	removeEventListener() {
		const events = this.events;
		return events.target.removeEventListener.apply( events.target, arguments );
	},

	dispatchEvent() {
		const events = this.events;
		return events.target.dispatchEvent.apply( events.target, arguments );
	}
};

export default Modal;