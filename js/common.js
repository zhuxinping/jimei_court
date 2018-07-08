$(function () {
    //导航栏样式切换
    $('.nav-link li a:not(.slide-down .slide-down-list a)').click(function () {
        $(this).addClass('current').parent('li').siblings().find('a:not(.slide-down .slide-down-list a)').removeClass('current');
    });
    jQuery(".slideBox").slide({mainCell:".bd1 ul",autoPlay:true,effect:"left"});
});
