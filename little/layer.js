;!function($,win){
    "use strict";

    var config = {//默认配置
        type: 0,
        shade: true,
        fixed: true,
        anim: true
    };

    //缓存常用字符
    var doms = ['layer-title','layermbtn','layermcont'];

    var ready = {
        extend: function(obj){
            var newobj = JSON.parse(JSON.stringify(config));
            for(var i in obj){
                newobj[i] = obj[i];
            }
            return newobj;
        },
        timer: {}, end: {}
    };

    ready.touch = function(elem, fn){//点击事件
        return $(elem).click(function(e){
            fn.call(this, e);
        });
    };

    var index = 0, classs = ['layermbox'], Layer = function(options){
        var that = this;
        that.config = ready.extend(options);
        that.view();
    };

    Layer.prototype.view = function(){
        var that = this, config = that.config, layerbox = document.createElement('div'),content = config.content;

        that.id = layerbox.id = classs[0] + index;
        layerbox.setAttribute('class', classs[0] + ' ' + classs[0]+(config.type || 0));
        layerbox.setAttribute('index', index);

        var title = (function(){
            var titype = typeof config.title === 'object';
            return config.title
                ? '<h3 class="' + doms[0] + '" style="'+ (titype ? config.title[1] : '') +'">'+ (titype ? config.title[0] : config.title)  +'</h3><i class="layermend">X</i>'
                : '';
        }());

        var button = (function(){
            var btns = (config.btn || []).length, btndom;
            if(btns === 0 || !config.btn){
                return '';
            }
            btndom = '<span class="layer-btn-1" type="1">'+ config.btn[0] +'</span>';
            if(btns === 2){
                btndom = '<span class="layer-btn-0" type="0">'+ config.btn[1] +'</span>' + btndom;
            }
            return '<div class="' + doms[1] + '">'+ btndom + '</div>';
        }());

        if(!config.fixed){
            config.top = config.hasOwnProperty('top') ?  config.top : 100;
            config.style = config.style || '';
            config.style += ' top:'+ ( document.body.scrollTop + config.top) + 'px';
        }

        layerbox.innerHTML = (config.shade ? '<div '+ (typeof config.shade === 'string' ? 'style="'+ config.shade +'"' : '') +' class="laymshade"></div>' : '')
            +'<div class="layermmain" '+ (!config.fixed ? 'style="position:static;"' : '') +'>'
            +'<div class="layer-cen"></div><div class="section">'
            +'<div class="layermchild '+ (config.className ? config.className : '') +' '+ ((!config.type && !config.shade) ? 'layermborder ' : '') + (config.anim ? 'layermanim' : '') +'" style="width:' + (config.width ? config.width + 'px' : '') + ';height:' + (config.height ? config.height + 'px' : '') + '">'
            + title
            +'<div class="' + doms[2] + '">'
            +'<div class="layer-con">'
            + (config.type === 2 ? '<img src="./img/loading-0.gif" alt=""/>' : typeof content === 'object' ? '' : content)
            +'</div>'
            +'</div>'
            + button
            +'</div>'
            +'</div>'
            +'</div>';

        if(!config.type || config.type === 2){
            var dialogs = $("." + classs[0] + config.type), dialen = dialogs.length;
            if(dialen >= 1){
                layer.close(dialogs[0].getAttribute('index'))
            }
        }

        $("body").append(layerbox);
        typeof content === 'object' && $(".layer-con").replaceWith(content.addClass("layer-dom").show());
        config.height && that.auto();

        var elem = that.elem = $('#'+that.id)[0];
        config.success && config.success(elem);

        that.index = index++;
        that.action(config, elem);
    };

    Layer.prototype.action = function(config){
        var that = this;

        //自动关闭
        if(config.time){
            ready.timer[that.index] = setTimeout(function(){
                layer.close(that.index);
            }, config.time*1000);
        }

        //关闭按钮
        if(config.title){
            var end = $('.layermend')[0], endfn = function(){
                config.cancel && config.cancel();
                layer.close(that.index);
            };
            ready.touch(end, endfn);
        }

        //确认取消
        var btn = function(){
            var type = this.getAttribute('type');
            if(type == 0){
                config.no && config.no();
                layer.close(that.index);
            } else {
                config.yes ? config.yes(that.index) : layer.close(that.index);
            }
        };
        if(config.btn){
            var btns = $('.' + doms[1])[0].children, btnlen = btns.length;
            for(var ii = 0; ii < btnlen; ii++){
                ready.touch(btns[ii], btn);
            }
        }

        config.end && (ready.end[that.index] = config.end);
    };

    //内容高度自适应
    Layer.prototype.auto = function(){
        var config = this.config;
        var titHeight = $("." + doms[0]).outerHeight() || 0,
            btnHeight = $("." + doms[1]).outerHeight() || 0;
        var $con = $("." + doms[2]);
        $con.height(config.height - titHeight - btnHeight - parseFloat($con.css('padding-top')) - parseFloat($con.css('padding-bottom')));
    };

    win.layer = {
        v: '1.8',
        index: index,

        //核心方法
        open: function(options){
            var o = new Layer(options || {});
            return o.index;
        },

        close: function(index){
            var ibox = $('#'+classs[0]+index)[0];
            if(!ibox) return;
            $("body").append($(ibox).find(".layer-dom").hide());
            ibox.innerHTML = '';
            document.body.removeChild(ibox);
            clearTimeout(ready.timer[index]);
            delete ready.timer[index];
            typeof ready.end[index] === 'function' && ready.end[index]();
            delete ready.end[index];
        },

        //关闭所有layer层
        closeAll: function(){
            var boxs = $("." + classs[0]);
            for(var i = 0, len = boxs.length; i < len; i++){
                layer.close((boxs[0].getAttribute('index')|0));
            }
        }
    };

    'function' == typeof define ? define(function() {
        return layer;
    }) : function(){

        var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
        var path = jsPath.substring(0, jsPath.lastIndexOf("/") + 1);

        //如果合并方式，则需要单独引入layer.css
        if(script.getAttribute('merge')) return;

        $("head").append(function(){
            var link = document.createElement('link');
            link.href = path + './layer.css';
            link.type = 'text/css';
            link.rel = 'styleSheet';
            link.id = 'layermcss';
            return link;
        }());

    }();

}(jQuery,window);