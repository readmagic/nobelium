$(function () {
    var days = Math.abs(moment("20230125", "YYYYMMDD").diff(moment(new Date()), 'days'));
    $('.days').text(days);

    var events = '';
    $.getJSON('/love/js/data.json', function (datas) {
        datas.forEach(function (data, index) {
            if (data.done) {
                events += renderDone(index + 1, data.event, data.pic, data.desc);
            } else {
                events += renderDoing(index + 1, data.event, data.pic);
            }
        });
        $('.event-list').html(events);
        $('.event').click(function (e) {
            if ($(this).hasClass('show')) {
                $(this).removeClass('show');
            } else {
                $(this).addClass('show').siblings().removeClass('show');
                $('.input-title input', this).removeAttr('disabled');
                $(this).siblings().find('.input-title input').attr('disabled', 'disabled')
            }
        })
    })
})


function renderDone(i, event, pic, desc) {
    return '<div class="event done"><span class="event-order" ><span class="order-txt">第</span><span class="order-num">' + i + '</span><span class="order-txt">件事</span></span><span class="event-state"><span class="txt">已达成</span></span> <h2 class="event-title">' + event + '</h2> <div class="event-detail"><p class="event-image"><span class="img" style="background-image:url(' + pic + ');"></span> </p><p class="event-remark">' + desc + '</p></div></div>';
}

function renderDoing(i, event, pic) {
    return '<div class="event doing"><span class="event-order" ><span class="order-txt">第</span><span class="order-num">' + i + '</span><span class="order-txt">件事</span></span><span class="event-state"><span class="txt">进行中</span></span> <h2 class="event-title">' + event + '</h2><div class="event-detail"><p class="event-image"><span class="img"  style="background-image:url(' + pic + ');"></span></p><p class="event-remark">事件完成的时间、地点以及心情描述。</p></div></div>';
}