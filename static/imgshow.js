// composer add on
$('document').ready(function() {
	
	// TODO: implement nconf url into plugin/help url
	require(['composer', 'composer/controls'], function(composer, controls) {
		
		imgshow_services_ready(function(data) {
			
			composer.addButton('fa fa-video-camera', function(textarea, selectionStart, selectionEnd) {
				var openedModals = [];
				var showEmbedMenu = function(item) {
					return function(e) {
						var validateQuery = function(e, fn) {
							var formControls = e.formControls;
							var query = 'q:';
							query += 'name=' + item.name;
							if(item.params && item.params.length) {
								for(var i = 0; i < item.params.length; i++) {
									var param = item.params[i];
									var val = formControls[param.name].val().trim();
									if(val == '') {
										if(param.required && param.required == '1') {
											
											warning(param.label + ' is required');
											
											return;
										}
										else {
											continue;
										}
									} 
									query += ',' + param.name + '=' + val;
								}
							}
							fn(query);
						} // end of validateQuery
						var options = {};
						options.headerTitle = item.name;
						if(item.description && item.description.trim().length) {
							options.headerTitle += ' - ' + item.description;
						}
						options.formControls = [];
						if(item.params && item.params.length) {
							for(var i = 0; i < item.params.length; i++) {
								var param = item.params[i];
								var label = param.label;
								if(param.required && param.required == '1') {
									label += ' (*)';
								}
								var formControl = {id:param.name,label:label,type:'text'};
								options.formControls.push(formControl);
							}
						}
						options.buttons = [];
						if(navigator.geolocation && typeof(item['geo']) != 'undefined' && item.geo == '1') {
							options.buttons.push(
								{
									id : 'btn-geo', title : 'Geolocation', func : function(e) {
										var formControls = e.formControls;
										var showPosition = function(position) {
											var lat = position.coords.latitude;
											var lng = position.coords.longitude;
											formControls['lat'].val(lat);
											formControls['lng'].val(lng);
										}
										if (navigator.geolocation) {
        									navigator.geolocation.getCurrentPosition(showPosition);
        								}
									}
								}
							);
						}
						if(typeof(item.help) != 'undefined') {
							options.buttons.push(
								{
									id : 'btn-help', title : 'Help(FAQ)', func : function(e) {
										// open in new tab or window
										var arr = item.help.split(",");
										var url = '/plugin/imgshow/help?';
										var url_params = {};
										if(arr.length > 0) {
											url_params['topic'] = arr[0];
										}
										if(arr.length > 1) {
											url_params['page'] = arr[1];
										}
										var splitter = '';
										for(var k in url_params) {
											var v = url_params[k];
											url += splitter;
											url += k + '=' + v;
											splitter = '&';
										}
										
										var win = window.open(url, '_blank');
  										win.focus();
									}
								}
							);
						}
						options.buttons.push(
							{
								id : 'btn-preview', title : 'Preview', func : function(e) {
									validateQuery(e, function(query) {
										if(confirm('Confirm preview [imgshow ' + query + ']?')) {
											imgshow_render_query(query, function(renderJSON) {
												if(renderJSON.status == 0) {
													var previewBox = createModal({
														headerTitle:'',
														customBody:renderJSON.content,
														buttons : []
													});
													$(previewBox).modal();
													openedModals.push(previewBox);
												}
												else {
													warning('invalid query');
												}
											})
										}
									});
									
								}
							}
						);
						options.buttons.push(
							{
								id : 'btn-insert', title : 'Insert', func : function(e) {
									validateQuery(e, function(query) {
										if(confirm('Confirm insert [imgshow ' + query + ']?')) {
											controls.insertIntoTextarea(textarea, "[imgshow " + query + "]");
											if(openedModals.length) {
												for(var i in openedModals) {
													$(openedModals[i]).modal('hide');
												}
											}
										}
									});
									
								}
							}
						);
						var itemMenu = createModal(options);
						$(itemMenu).modal();
						openedModals.push(itemMenu);
					}
				} // end of showEmbedMenu
				
				var showEmbedGroup = function(group) {
					return function(e) {
						// create new data.results filter by group
						var results = [];
						if(data.results && data.results.length) {
							for(var i = 0; i < data.results.length; i++) {
								var item = data.results[i];
								if(typeof item['group'] != 'undefined' && item.group == group) {
									results.push(item);
								}
							}
						}
						var options = {};
						options.headerTitle = group + ' (' + results.length + ')';
						
						if(results && results.length) {
							options.buttons = [];
							
							for(var i = 0; i < results.length; i++) {
								var item = results[i];
								var button = {id:'btn-' + item.name,title:item.name,func:showEmbedMenu(item)};
								options.buttons.push(button);
							}
							options.buttons.push({id:'btn-ok',title:'OK', func:function() {
								$(mainMenu).modal('hide');
							}});
						}
						var mainMenu = createModal(options);
						$(mainMenu).modal();
						openedModals.push(mainMenu);
					}
				} // end of showEmbedGroup
				
				var options = {};
				options.headerTitle = 'Imgshow Media Embed Menu (' + data.results.length + ')';
				
				// scan groups
				var groups = [];
				if(data.results && data.results.length) {
					for(var i = 0; i < data.results.length; i++) {
						var item = data.results[i];
						if(typeof item['group'] != 'undefined' && groups.indexOf(item['group']) == -1) {
							groups.push(item['group']);
						}
					}
				}
				
				if(data.results && data.results.length) {
					options.buttons = [];
					
					// display group
					if(groups && groups.length) {
						for(var i = 0; i < groups.length; i++) {
							var group = groups[i];
							var button = {id:'btn-' + group,title:'[' + group + ']',func:showEmbedGroup(group)};
							options.buttons.push(button);
						}
					}
					
					// display other items without group
					for(var i = 0; i < data.results.length; i++) {
						var item = data.results[i];
						if(typeof item['group'] != 'undefined') continue; // now no need whichever got group
						var button = {id:'btn-' + item.name,title:item.name,func:showEmbedMenu(item)};
						options.buttons.push(button);
					}
					options.buttons.push({id:'btn-ok',title:'OK', func:function() {
						$(mainMenu).modal('hide');
					}});
				}
				var mainMenu = createModal(options);
				$(mainMenu).modal();
				openedModals.push(mainMenu);
			});
			
			
		})
		
		var warning = function(message) {
			alert(message);
		}
		
	});
	
	
	var imgshow_services_ready = function(callback) {
		
		$.getJSON('/plugin/imgshow/getservices', callback);
	}
	var imgshow_render_query = function(query,callback) {
		$.getJSON('/plugin/imgshow/renderquery?query=' + encodeURIComponent(query), callback);
	}
	
	var createModal = function(opts) {
		var zIndex = 20000; // must be higer than composer 10000 as of 1.0.3 version
		if(typeof opts == 'undefined') opts = {};
		
		if(typeof opts.headerTitle == 'undefined') opts.headerTitle = 'Heading Title';
		if(typeof opts.formControls == 'undefined') opts.formControls = [];
		if(typeof opts.buttons == 'undefined') opts.buttons = [
			{
				id : 'create-button', title : 'Create', func : function(e) {
					
				}
			}
		];
		if(typeof opts.customBody == 'undefined') opts.customBody = null;
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
		
		if(opts.customBody != null) {
			$(opts.customBody).appendTo(modalBody);
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
		
		var modalContainer = $('<div />').addClass('modal').css('z-index',zIndex).attr({
			role : 'dialog',
			'aria-labelledby' : 'modal',
			'aria-hidden' : 'true'
		}).append(modalDialog);
		return modalContainer;
	};
});