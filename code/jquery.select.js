/**
 * jquery.select.js 1.1
 * http://jquerywidget.com
 */
;(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd) && typeof jQuery == 'undefined'){
        // AMD或CMD
        define(['jquery'],function(){
            factory(jQuery);
            return jQuery;
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        //Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.fn.select = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
			getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
			selectCls:'select',
			boxCls:'box',
			hasTrigger:false,
			triggerCls:'trigger',
			innerCls:'inner',
			listCls:'list',
			activeCls:'active',
			format:function(item){
				return '<span>'+item['name']+'</span>';
			},
			onSelect:function(){}
        };
		var options = $.extend({},defaults,parameter);
		var $window = $(window);
		var $document = $(document);
        return this.each(function(i) {
            //对象定义
			var _self = this;
            var $this = $(this);
            if($this.data('widget-type')=='select'){ //如果已调用过，则不进行初始化
            	return false;
            }else{
            	$this.data('widget-type','select');
            }
			var $inner = $("<div class='"+options.innerCls+"'></div>");
			var $list = $("<ul class='"+options.listCls+"'></ul>");
			var $box = $("<div class='"+options.boxCls+"'></div>");
			var $select = $("<div class='"+options.selectCls+"'></div>");
			$inner.append($list);
			$select.append($box).append($inner);
			$this.hide().after($select);
			var $trigger = $box;
			if(options.hasTrigger){
				$trigger = $("<div class='"+options.triggerCls+"'></div>");
				$select.append($trigger);
			}
			var $options = $this.find('option');
			$options.each(function(){
				var $this = $(this);
				var item = {
					'value':$this.val(),
					'name':$this.text()
				};
				$list.append('<li data-value="'+item['value']+'">'+options.format(item)+'</li>');
			});
			var $items = $list.find('li');
			var _api = {};
			var _index = 0;
			var isShow = false;
			var _target = false; //触发标记，不论有多少个select实例，只展开一个
			//样式修改
			$select.css({
				'position':'relative'
			});
			$inner.css({
				'display':'none',
				'position':'absolute',
				'width':'100%'
			});
			//私有方法
        	//按键按下
        	var down = function(e){
        		if(isShow){
	        		e.isPropagationStopped();
	        		switch(e.keyCode){
	        			case 13:
							_api.setValue($options.eq(_index).val());
							isShow = false;
	        			break;
	        			case 38:
	        				if(_index>0){
	        					_index--;
	        					$items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
	        				}
	        				e.preventDefault();
	        			break;
	        			case 40:
	        				if(_index<$items.length-1){
	        					_index++;
	        					$items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
	        				}
	        				e.preventDefault();
	        			break;
	        		}
        		}
        	};
			//公有方法
			_api.setValue = function(value){
				$this.val(value);
				var $selected_option = $options.filter(':selected');
				var name = $selected_option.text();
				_index = $selected_option.index();
				var $item = $items.eq(_index);
				$box.html($item.html());
				$item.addClass(options.activeCls).siblings().removeClass(options.activeCls);
				$inner.hide();
				var item = {
					'name':name,
					'value':value
				};
				options.onSelect(item);
			};
			//事件绑定
			$trigger.click(function(){
				if(isShow){
					$inner.hide();
				}else{
					$inner.show();
					$items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
				}
				isShow = !isShow;
				_target = true;
			});
			$items.on({
				'mouseenter':function(){
					$(this).addClass(options.activeCls).siblings().removeClass(options.activeCls);
				},
				'click':function(){
					_index = $(this).index();
					var $option = $options.eq(_index);
					_api.setValue($option.val());
				}
			});
			$document.click(function(){
				if(isShow&&!_target){
					$inner.hide();
					isShow = false;
				}
				_target = false;
			});
			$window.on({
				'keydown':down
			});
			//初始化
			_api.setValue($this.val());
			getApi(_api);
		});
    };
}));