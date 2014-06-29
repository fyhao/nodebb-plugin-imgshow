// composer add on
$('document').ready(function() {
	// TODO: create custom button
	
	require(['composer', 'composer/controls'], function(composer, controls) {
		imgshow_services_ready(function(data) {
			composer.addButton('fa fa-video-camera', function(textarea, selectionStart, selectionEnd) {
				
				var showEmbedMenu = function(item) {
					return function(e) {
						var options = {};
						options.headerTitle = item.name;
						if(item.description && item.description.trim().length) {
							options.headerTitle += ' - ' + item.description;
						}
						options.formControls = [];
						if(item.params && item.params.length) {
							for(var i = 0; i < item.params.length; i++) {
								var param = item.params[i];
								var formControl = {id:param.name,label:param.label,type:'text'};
								options.formControls.push(formControl);
							}
						}
						options.buttons = [];
						options.buttons.push(
							{
								id : 'btn-insert', title : 'Insert', func : function(e) {
									var formControls = e.formControls;
									var query = 'q:';
									query += 'name=' + item.name;
									if(item.params && item.params.length) {
										for(var i = 0; i < item.params.length; i++) {
											var param = item.params[i];
											query += ',' + param.name + '=' + formControls[param.name].val();
										}
									}
									if(confirm('Confirm insert [imgshow ' + query + ']?')) {
										controls.insertIntoTextarea(textarea, "[imgshow " + query + "]");
										$(itemMenu).modal('hide');
									}
								}
							}
						);
						var itemMenu = createModal(options);
						$(itemMenu).modal();
					}
				}	
				
				var options = {};
				options.headerTitle = 'Embed Menu 4 (' + data.results.length + ')';
				
				if(data.results && data.results.length) {
					options.buttons = [];
					for(var i = 0; i < data.results.length; i++) {
						var item = data.results[i];
						var button = {id:'btn-' + item.name,title:item.name,func:showEmbedMenu(item)};
						options.buttons.push(button);
					}
					options.buttons.push({id:'btn-ok',title:'OK', func:function() {
						$(mainMenu).modal('hide');
					}});
				}
				var mainMenu = createModal(options);
				$(mainMenu).modal();
			});
			
			
		})
		
		/*
		var modalForm = createModal({
			headerTitle : 'Youtube',
			formControls : [
				{
					id : 'k', label : 'Keyword', type : 'text'
				}
			],
			buttons : [
				{
					id : 'close-button', title : 'Close', dismiss:true, func : function(e) {
						var item = e.item;
						var formControls = e.formControls;
						alert(formControls['k'].val())
					}
				}
				,
				{
					id : 'create-button2', title : 'Add2', func : function(e) {
						var item = e.item;
						var formControls = e.formControls;
						//alert(formControls['k'].val())
					}
				}
			]
		});
		
		$(modalForm).modal();
		*/
		//$('<div><p>test</p></div>').modal();
		/*
		composer.addButton('fa fa-video-camera', function(textarea, selectionStart, selectionEnd) {
			var a = prompt('Select youtube video');
			controls.insertIntoTextarea(textarea, "[youtube " + a + "]")
			
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, ">! Spoiler");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 12);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '>! ', '');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
			
		});
		*/
	});
	
	
	var imgshow_services_ready = function(callback) {
		$.getJSON('/plugins/imgshow/getservices', callback);
	}
	
	var createModal = function(opts) {
		if(typeof opts == 'undefined') opts = {};
		
		if(typeof opts.headerTitle == 'undefined') opts.headerTitle = 'Heading Title';
		if(typeof opts.formControls == 'undefined') opts.formControls = [];
		if(typeof opts.buttons == 'undefined') opts.buttons = [
			{
				id : 'create-button', title : 'Create', func : function(e) {
					
				}
			}
		];
		
		// modalHeader
		var modalHeader = $('<div />').addClass('modal-header');
		var dismissBtn = $('<button />').addClass('close')
					.attr({
						'data-dismiss' : 'model',
						'type' : 'button',
						'aria-hidden' : 'true'
					})
					.html('&times;')
					.appendTo(modalHeader)
					.click(function() {
						$(modalContainer).modal('hide')
					});
		
		var headerTitle = $('<h3 />').html(opts.headerTitle).appendTo(modalHeader);
		
		// modalBody
		var modalBody = $('<div />').addClass('modal-body');
		
		// custom form
		var formControls = {};
		if(opts.formControls && opts.formControls.length) {
			var form = $('<form />').addClass('form-horizontal').appendTo(modalBody);
			for(var i = 0; i < opts.formControls.length; i++) {
				var item = opts.formControls[i];
				var controlGroup = $('<div />').addClass('control-group').appendTo(form);
				var controlLabel = $('<label />').addClass('control-label')
												 .attr('for', item.id)
												 .html(item.label)
												 .appendTo(controlGroup);
				var controls = $('<div />').addClass('controls').appendTo(controlGroup);
				if(item.type == 'text') {
					var formControl = $('<input />').addClass('form-control')
								.attr('type', item.type)
								.attr('id', item.id)
								.attr('placeholder', item.label)
								.val(item.value ? item.value : '');
					$(formControl).appendTo(controls);
					formControls[item.id] = formControl;
				}
				else if(item.type == 'icon') {
					var iconContainer = $('<div />').addClass('icon').appendTo(controls);
					var icon = $('<i />').addClass('fa fa-2x ' + item.iconStyle)
										 .attr('data-name', 'icon')
										 .val(item.iconStyle)
										 .appendTo(iconContainer);
				}
			}
		}
		
		// modalFooter
		var modalFooter = $('<div />').addClass('modal-footer');
		if(opts.buttons && opts.buttons.length) {
			
			for(var i = 0; i < opts.buttons.length; i++) {
				var item = opts.buttons[i];
				var buttonStyle = 'btn-default';
				if(i == opts.buttons.length - 1) buttonStyle = 'btn-primary';
				var button = $('<div />')
									.addClass('btn').addClass(buttonStyle)
									.attr({type:'button', href:'#', id : item.id})
									.html(item.title);
				if(item.dismiss) {
					$(button).attr('data-dismiss','modal')
				}
				item.button = button;
				$(button).data('item', item);
				$(modalFooter).append(button);
				$(button).click(function() {
					var item = $(this).data('item');
					if(typeof(item.func) != 'undefined')
						item.func({item:item,formControls:formControls})
				});
			}
		}
		
		var modalContent = $('<div />').addClass('modal-content')
									   .append(modalHeader)
									   .append(modalBody)
									   .append(modalFooter);
									   
		var modalDialog = $('<div />').addClass('modal-dialog').append(modalContent);
		
		var modalContainer = $('<div />').addClass('modal').attr({
			role : 'dialog',
			'aria-labelledby' : 'modal',
			'aria-hidden' : 'true'
		}).append(modalDialog);
		return modalContainer;
	};
});