"use strict";//厳格モードで実装

/** 
 * id=your_containerに対してチャットUIを組み込む 
 **/
$(document).ready(function() {
    var chatDom = [];
    var p = function(dom) {
        chatDom.push(dom);
    };

    p('<div id="bms_messages_container">');
    p('<div id="bms_chat_header">');
    p('<div id="bms_chat_user_status">');
    p('<div id="bms_status_icon">●</div>');
    p('<div id="bms_chat_user_name">ユーザー</div>');
    p('</div>');
    p('</div>');
    p('<div id="bms_messages">');
    p('</div>');
    p('<div id="bms_send">');
    p('<textarea id="bms_send_message"></textarea>');
    p('<div id="bms_send_btn">送信</div>');
    p('</div>');

    $('#your_container').append(chatDom.join(''));

    $('#bms_send_btn').click(function() {
        var message = $('#bms_send_message').val();
        if (message.trim() !== '') {
            $('#bms_messages').append('<div class="bms_message bms_right"><div class="bms_message_box"><div class="bms_message_content"><div class="bms_message_text">' + message + '</div></div></div></div><div class="bms_clear"></div>');
            $('#bms_send_message').val('');
            $('#bms_messages').scrollTop($('#bms_messages')[0].scrollHeight);
        }
    });
});
$('#bms_send_btn').click(function() {
    var message = $('#bms_send_message').val();
    if (message.trim() !== '') {
        var userName = $('#me').text();
        $('#bms_messages').append('<div class="bms_message bms_right"><div class="bms_message_box"><div class="bms_message_content"><div class="bms_message_text"><strong>' + userName + ':</strong> ' + message + '</div></div></div></div><div class="bms_clear"></div>');
        $('#bms_send_message').val('');
        $('#bms_messages').scrollTop($('#bms_messages')[0].scrollHeight);
    }
});
