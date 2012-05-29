var sankoreLang = {
    display: "Показать", 
    edit: "Изменить", 
    short_desc: "Выберите животных из следующего списка:", 
    add: "Новый блок",
    enter: "Введите текст ...",
    cat: "кот",
    ball: "мяч",
    shovel: "лопата",
    dog: "собака",
    tree: "дерево",
    wgt_name: "Выбрать верное",
    reload: "Обновить",
    slate: "Узор",
    pad: "Планшет"
};

//main function
function start(){
    
    $("#wgt_display").text(sankoreLang.display);
    $("#wgt_edit").text(sankoreLang.edit);
    $("#wgt_name").text(sankoreLang.wgt_name);
    $("#wgt_reload").text(sankoreLang.reload);
    $(".style_select option[value='1']").text(sankoreLang.slate);
    $(".style_select option[value='2']").text(sankoreLang.pad);
    
    if(window.sankore){
        if(sankore.preference("selectionner","")){
            var data = jQuery.parseJSON(sankore.preference("selectionner",""));
            importData(data);
        } else 
            showExample();
        if(sankore.preference("sel_style","")){
            changeStyle(sankore.preference("sel_style",""));
            $(".style_select").val(sankore.preference("sel_style",""));
        } else
            changeStyle(1)
    } 
    else 
        showExample();
    
    //events
    if (window.widget) {
        window.widget.onleave = function(){
            exportData();
            sankore.setPreference("sel_style", $(".style_select").find("option:selected").val());
        }
    }
    
    $("#wgt_reload").click(function(){
        window.location.reload();
    });
    
    $(".style_select").change(function (event){
        changeStyle($(this).find("option:selected").val());
    })
    
    $("#wgt_display, #wgt_edit").click(function(event){
        if(this.id == "wgt_display"){
            if(!$(this).hasClass("selected")){
                if(window.sankore)
                    sankore.enableDropOnWidget(false);
                $(this).addClass("selected");
                $("#wgt_edit").removeClass("selected");
                $(".style_select").css("display","none");
                $(".add_block").remove();
                $(".cont").each(function(){
                    var container = $(this);
                    
                    container.find(".text_cont").removeAttr("contenteditable");
                    container.find(".add_img").remove();
                    container.find(".close_cont").remove();
                    container.find(".imgs_cont").removeAttr("ondragenter")
                    .removeAttr("ondragleave")
                    .removeAttr("ondragover")
                    .removeAttr("ondrop");
                    container.find(".img_block, .text_block").each(function(){
                        $(this).find(".close_img").remove();  
                        $(this).find(".text_subblock").removeAttr("contenteditable");
                        $(this).find("input:checkbox").removeAttr("checked")
                    });                    
                
                });
                $(this).css("display", "none");
                $("#wgt_edit").css("display", "block");
            }
        } else {            
            if(!$(this).hasClass("selected")){
                if(window.sankore)
                    sankore.enableDropOnWidget(true);
                $(this).addClass("selected");
                $("#wgt_display").removeClass("selected");
                $(".style_select").css("display","block");
                
                $(".cont").each(function(){
                    var container = $(this);
                    
                    $("<div class='close_cont'>").appendTo(container);
                    container.find(".text_cont").attr("contenteditable","true");
                    container.find(".imgs_cont").removeClass("right")
                    .attr("ondragenter", "return false;")
                    .attr("ondragleave", "$(this).removeClass('over'); return false;")
                    .attr("ondragover", "$(this).addClass('over'); return false;")
                    .attr("ondrop", "$(this).removeClass('over'); return onDropTarget(this,event);");
                    
                    var add_img = $("<div class='add_img'>");
                    container.find(".img_block, .text_block").each(function(){
                        $("<div class='close_img'>").appendTo($(this));
                        if($(this).find("input:hidden").val() == 0)
                            $(this).find("input:checkbox").attr('checked', false);
                        else
                            $(this).find("input:checkbox").attr('checked', true);
                        $(this).find(".text_subblock").attr("contenteditable","true");                        
                    });
                    add_img.insertBefore(container.find(".clear"));
                });
                
                $("<div class='add_block'>" + sankoreLang.add + "</div>").appendTo("#data");
                $(this).css("display", "none");
                $("#wgt_display").css("display", "block");
            }
        }
    });
    
    //add new block
    $(".add_block").live("click", function(){
        addContainer();
    });
    
    //checkbox events
    $("input:checkbox").live("click", function(){
        if($("#wgt_display").hasClass("selected")){
            var flag = true;
            var block = $(this).parent().parent();
            block.find(".text_block, .img_block, .audio_block").each(function(){
                if($(this).find("input:checkbox").is(':checked') && $(this).find("input:hidden").val() == 0)                    
                    flag = false;                
                else if(!$(this).find("input:checkbox").is(':checked') && $(this).find("input:hidden").val() == 1)
                    flag = false;          
            });
            if(flag)
                block.addClass("right");
            else
                block.removeClass("right");
        } else {
            if($(this).is(":checked"))
                $(this).parent().find("input:hidden").val(1);
            else
                $(this).parent().find("input:hidden").val(0);
        }
    });
    
    //play/pause event
    $(".play, .stop").live("click", function(){
        var tmp_audio = $(this);
        var audio = tmp_audio.parent().find("audio").get(0);
        if($(this).hasClass("play")){            
            if(tmp_audio.parent().find("source").attr("src")){
                tmp_audio.removeClass("play").addClass("stop");
                var id = setInterval(function(){
                    if(audio.currentTime == audio.duration){
                        clearInterval(id);
                        tmp_audio.removeClass("stop").addClass("play");
                    }
                }, 10);
                tmp_audio.parent().find("input").val(id);
                audio.play();
            }
        } else {
            $(this).removeClass("stop").addClass("play");
            clearInterval( tmp_audio.parent().find("input").val())
            audio.pause();
        }
    });
    
    $(".replay").live("click", function(){
        var tmp_audio = $(this).prev();
        var audio = $(this).parent().find("audio").get(0); 
        if(tmp_audio.parent().find("source").attr("src")){
            $(this).prev().removeClass("play").addClass("stop");
            clearInterval($(this).parent().find("input").val());
            var id = setInterval(function(){
                if(audio.currentTime == audio.duration){
                    clearInterval(id);
                    tmp_audio.removeClass("stop").addClass("play");
                }
            }, 10);
            tmp_audio.parent().find("input").val(id);
            audio.currentTime = 0;
            audio.play();
        }
    });
    
    //adding new img
    $(".add_img").live("click", function(){
        addTextBlock($(this));
    });
    
    //deleting a block
    $(".close_cont").live("click",function(){
        $(this).parent().remove();
        refreshBlockNumbers();
    });
    
    //deleting the img block
    $(".close_img").live("click", function(){
        $(this).parent().remove();
    });
}

//export
function exportData(){
    var array_to_export = [];
    $(".cont").each(function(){
        var cont_obj = new Object();
        cont_obj.text = $(this).find(".text_cont").text();
        cont_obj.blocks = [];
        $(this).find(".img_block, .audio_block, .text_block").each(function(){
            var tmp_block = new Object();
            if($(this).hasClass("img_block")){
                if($(this).find(".audio_block").size() == 0){
                    tmp_block.src = $(this).find("img").attr("src").replace("../../","");
                    tmp_block.hidden = $(this).find("input:hidden").val();
                    tmp_block.h = $(this).find("img").height();
                    tmp_block.w = $(this).find("img").width(); 
                    tmp_block.type = "img";
                }
            }
            if($(this).hasClass("audio_block")){
                tmp_block.src = $(this).find("source").attr("src").replace("../../","");
                tmp_block.hidden = $(this).parent().find("input:hidden").val();
                tmp_block.type = "audio";
            }
            if($(this).hasClass("text_block")){
                tmp_block.text = $(this).find(".text_subblock").text();
                tmp_block.hidden = $(this).find("input:hidden").val();
                tmp_block.type = "text";
            }           
            cont_obj.blocks.push(tmp_block);
        });
        array_to_export.push(cont_obj);
    });
    
    sankore.setPreference("selectionner", JSON.stringify(array_to_export));
}

//import
function importData(data){
    
    var tmp = 0;    
    for(var i in data){
        
        var container = $("<div class='cont'>").appendTo("#data");
        var sub_container = $("<div class='sub_cont'>").appendTo(container);
        var imgs_container = $("<div class='imgs_cont'>").appendTo(container); 
        $("<div class='clear'>").appendTo(imgs_container);
        
        $("<div class='number_cont'>" + (++tmp) + "</div>").appendTo(sub_container);
        $("<div class='text_cont'>" + data[i].text + "</div>").appendTo(sub_container);
        
        for(var j in data[i].blocks){
            switch(data[i].blocks[j].type){
                case "text":
                    var text_block = $("<div class='text_block'>").insertBefore(imgs_container.find(".clear"));
                    $("<div class='text_subblock'>" + data[i].blocks[j].text + "</div>").appendTo(text_block); 
                    $("<input type='hidden' value='" + data[i].blocks[j].hidden + "'/>").appendTo(text_block); 
                    $("<input type='checkbox' class='ch_box'/>").appendTo(text_block);
                    break;
                case "img":
                    var img_block = $("<div class='img_block' style='text-align: center;'></div>").insertBefore(imgs_container.find(".clear"));
                    $("<input type='hidden' value='" + data[i].blocks[j].hidden + "'/>").appendTo(img_block); 
                    $("<input type='checkbox' class='ch_box'/>").appendTo(img_block)
                    $("<img src=\"../../" + data[i].blocks[j].src + "\" width='" + data[i].blocks[j].w + "' height='" + data[i].blocks[j].h + "' style=\"display: inline;\"/>").appendTo(img_block);
                    break;
                case "audio":
                    var img_tmp = $("<div class='img_block'>").insertBefore(imgs_container.find(".clear"));
                    var audio_block = $("<div class='audio_block'>").appendTo(img_tmp);
                    $("<div class='close_img'>").appendTo(img_tmp);
                    $("<div class='play'>").appendTo(audio_block);
                    $("<div class='replay'>").appendTo(audio_block);
                    var source = $("<source/>").attr("src", "../../" + data[i].blocks[j].src);
                    var audio = $("<audio>").appendTo(audio_block);
                    audio.append(source);
                    $("<input type='hidden' value='" + data[i].blocks[j].hidden + "'/>").appendTo(img_tmp); 
                    $("<input type='checkbox' class='ch_box'/>").appendTo(img_tmp)
                    break;
            }
        }
    }
}

//example
function showExample(){
    
    var container = $("<div class='cont'>");
    var sub_container = $("<div class='sub_cont'>").appendTo(container);
    var imgs_container = $("<div class='imgs_cont'>").appendTo(container);
    
    $("<div class='number_cont'>1</div>").appendTo(sub_container);
    $("<div class='text_cont'>" + sankoreLang.short_desc + "</div>").appendTo(sub_container);
    
    var tmp1 = $("<div class='text_block'>").appendTo(imgs_container); 
    $("<div class='text_subblock'>" + sankoreLang.cat + "</div>").appendTo(tmp1); 
    $("<input type='hidden' value='1'/>").appendTo(tmp1); 
    $("<input type='checkbox' class='ch_box'/>").appendTo(tmp1)
    var tmp2 = $("<div class='text_block'>").appendTo(imgs_container); 
    $("<div class='text_subblock'>" + sankoreLang.ball + "</div>").appendTo(tmp2); 
    $("<input type='hidden' value='0'/>").appendTo(tmp2); 
    $("<input type='checkbox' class='ch_box'/>").appendTo(tmp2)
    var tmp3 = $("<div class='text_block'>").appendTo(imgs_container); 
    $("<div class='text_subblock'>" + sankoreLang.shovel + "</div>").appendTo(tmp3); 
    $("<input type='hidden' value='0'/>").appendTo(tmp3); 
    $("<input type='checkbox' class='ch_box'/>").appendTo(tmp3)
    var tmp4 = $("<div class='text_block'>").appendTo(imgs_container); 
    $("<div class='text_subblock'>" + sankoreLang.dog + "</div>").appendTo(tmp4); 
    $("<input type='hidden' value='1'/>").appendTo(tmp4); 
    $("<input type='checkbox' class='ch_box'/>").appendTo(tmp4)
    var tmp5 = $("<div class='text_block'>").appendTo(imgs_container); 
    $("<div class='text_subblock'>" + sankoreLang.tree + "</div>").appendTo(tmp5); 
    $("<input type='hidden' value='0'/>").appendTo(tmp5); 
    $("<input type='checkbox' class='ch_box'/>").appendTo(tmp5)
    $("<div class='clear'>").appendTo(imgs_container);
    
    container.appendTo("#data")
}

//add new container
function addContainer(){
    var container = $("<div class='cont'>");
    var sub_container = $("<div class='sub_cont'>").appendTo(container);
    var imgs_container = $("<div class='imgs_cont'>").appendTo(container);
    imgs_container.attr("ondragenter", "return false;")
    .attr("ondragleave", "$(this).removeClass('over'); return false;")
    .attr("ondragover", "$(this).addClass('over'); return false;")
    .attr("ondrop", "$(this).removeClass('over'); return onDropTarget(this,event);");
    
    $("<div class='close_cont'>").appendTo(container);
    $("<div class='number_cont'>"+ ($(".cont").size() + 1) +"</div>").appendTo(sub_container);
    var text = $("<div class='text_cont' contenteditable>" + sankoreLang.enter + "</div>").appendTo(sub_container);
    
    $("<div class='add_img'>").appendTo(imgs_container);
    $("<div class='clear'>").appendTo(imgs_container);
    container.insertBefore($(".add_block"));
}

//add new img block
function addTextBlock(dest){
    var tmp = $("<div class='text_block'>").insertBefore(dest)
    $("<div class='text_subblock' contenteditable='true'>" + sankoreLang.enter + "</div>").appendTo(tmp); 
    $("<input type='hidden' value='0'/>").appendTo(tmp); 
    $("<input type='checkbox' class='ch_box'/>").appendTo(tmp);
    $("<div class='close_img'>").appendTo(tmp);
}

function refreshBlockNumbers(){
    var i = 0;
    $(".cont").each(function(){
        $(this).find(".number_cont").text(++i);
    })
}

function stringToXML(text){
    if (window.ActiveXObject){
        var doc=new ActiveXObject('Microsoft.XMLDOM');
        doc.async='false';
        doc.loadXML(text);
    } else {
        var parser=new DOMParser();
        doc=parser.parseFromString(text,'text/xml');
    }
    return doc;
}


//changing the style
function changeStyle(val){
    if(val == 1){
        $(".b_top_left").removeClass("btl_pad");
        $(".b_top_center").removeClass("btc_pad");
        $(".b_top_right").removeClass("btr_pad");
        $(".b_center_left").removeClass("bcl_pad");
        $(".b_center_right").removeClass("bcr_pad");
        $(".b_bottom_right").removeClass("bbr_pad");
        $(".b_bottom_left").removeClass("bbl_pad");
        $(".b_bottom_center").removeClass("bbc_pad");
        $("#wgt_reload").removeClass("pad_color").removeClass("pad_reload");
        $("#wgt_edit").removeClass("pad_color").removeClass("pad_edit");
        $("#wgt_display").removeClass("pad_color").removeClass("pad_edit");
        $("#wgt_name").removeClass("pad_color");
        $(".style_select").removeClass("pad_select");
    } else {
        $(".b_top_left").addClass("btl_pad");
        $(".b_top_center").addClass("btc_pad");
        $(".b_top_right").addClass("btr_pad");
        $(".b_center_left").addClass("bcl_pad");
        $(".b_center_right").addClass("bcr_pad");
        $(".b_bottom_right").addClass("bbr_pad");
        $(".b_bottom_left").addClass("bbl_pad");
        $(".b_bottom_center").addClass("bbc_pad");
        $("#wgt_reload").addClass("pad_color").addClass("pad_reload");
        $("#wgt_edit").addClass("pad_color").addClass("pad_edit");
        $("#wgt_display").addClass("pad_color").addClass("pad_edit");
        $("#wgt_name").addClass("pad_color");
        $(".style_select").addClass("pad_select");
    }
}

function onDropTarget(obj, event) {
    if (event.dataTransfer) {
        var format = "text/plain";
        var textData = event.dataTransfer.getData(format);
        if (!textData) {
            alert(":(");
        }
        textData = stringToXML(textData);
        var tmp = textData.getElementsByTagName("path")[0].firstChild.textContent;
        var tmp_type = textData.getElementsByTagName("type")[0].firstChild.textContent;
        if(tmp_type.substr(0, 5) == "audio"){  
            var img_tmp = $("<div class='img_block'>").insertBefore($(obj).find(".add_img"));
            var audio_block = $("<div class='audio_block'>").appendTo(img_tmp)
            $("<div class='close_img'>").appendTo(img_tmp);
            $("<div class='play'>").appendTo(audio_block);
            $("<div class='replay'>").appendTo(audio_block);
            var source = $("<source/>").attr("src",tmp);
            var audio = $("<audio>").appendTo(audio_block);
            audio.append(source);
            $("<input type='hidden' value='0'/>").appendTo(img_tmp); 
            $("<input type='checkbox' class='ch_box'/>").appendTo(img_tmp)
        } else {
            var img_block = $("<div class='img_block' style='text-align: center;'></div>").insertBefore($(obj).find(".add_img"));
            $("<div class='close_img'>").appendTo(img_block);
            $("<input type='hidden' value='0'/>").appendTo(img_block); 
            $("<input type='checkbox' class='ch_box'/>").appendTo(img_block)
            var tmp_img = $("<img src=\"" + tmp + "\" style=\"display: inline;\"/>").appendTo(img_block);
            setTimeout(function(){
                if(tmp_img.height() >= tmp_img.width())
                    tmp_img.attr("height", "120");
                else{
                    tmp_img.attr("width","120");
                    tmp_img.css("margin",(120 - tmp_img.height())/2 + "px 0");
                }
            }, 6);
        }
    }
    else {
        alert ("Your browser does not support the dataTransfer object.");
    }
    
    if (event.stopPropagation) {
        event.stopPropagation ();
    }
    else {
        event.cancelBubble = true;
    }
    return false;
}
